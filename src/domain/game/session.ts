import type { Locale, RowId, SafePuzzleDto } from '../../api/contracts';

export const SESSION_SCHEMA_VERSION = 1 as const;
export const SESSION_KEY_PREFIX = 'tensift:v1:session';

export interface SessionStateInput {
  readonly puzzle: SafePuzzleDto;
  readonly placements: ReadonlyMap<RowId, readonly string[]>;
  readonly lockedItemIds: ReadonlySet<string>;
  readonly attempts: number;
  readonly hintUsed: boolean;
  readonly solved: boolean;
}

export interface PersistedGameSession {
  readonly schemaVersion: 1;
  readonly puzzleId: string;
  readonly locale: Locale;
  readonly placements: Readonly<Record<RowId, readonly string[]>>;
  readonly lockedItemIds: readonly string[];
  readonly attempts: number;
  readonly hintUsed: boolean;
  readonly solved: boolean;
  readonly updatedAt: string;
}

export function sessionStorageKey(locale: Locale, puzzleId: string): string {
  return `${SESSION_KEY_PREFIX}:${locale}:${puzzleId}`;
}

export function serializeSession(input: SessionStateInput, updatedAt = new Date().toISOString()): string {
  const session: PersistedGameSession = {
    schemaVersion: SESSION_SCHEMA_VERSION,
    puzzleId: input.puzzle.puzzleId,
    locale: input.puzzle.locale,
    placements: createPlacementRecord(input.placements),
    lockedItemIds: [...input.lockedItemIds],
    attempts: input.attempts,
    hintUsed: input.hintUsed,
    solved: input.solved,
    updatedAt,
  };

  return JSON.stringify(session);
}

export function parseSession(raw: string, puzzle: SafePuzzleDto): PersistedGameSession | null {
  let value: unknown;
  try {
    value = JSON.parse(raw) as unknown;
  } catch {
    return null;
  }

  if (!isRecord(value)
    || !hasOnlyKeys(value, [
      'schemaVersion',
      'puzzleId',
      'locale',
      'placements',
      'lockedItemIds',
      'attempts',
      'hintUsed',
      'solved',
      'updatedAt',
    ])
    || value.schemaVersion !== SESSION_SCHEMA_VERSION
    || value.puzzleId !== puzzle.puzzleId
    || value.locale !== puzzle.locale
    || typeof value.attempts !== 'number'
    || !Number.isInteger(value.attempts)
    || value.attempts < 0
    || value.attempts > 1_000_000
    || typeof value.hintUsed !== 'boolean'
    || typeof value.solved !== 'boolean'
    || typeof value.updatedAt !== 'string') {
    return null;
  }

  const placements = parsePlacements(value.placements, puzzle);
  const lockedItemIds = parseLockedItemIds(value.lockedItemIds, puzzle, placements);
  if (!placements || !lockedItemIds || (value.solved && !isCompletePlacements(placements, puzzle))) {
    return null;
  }

  return {
    schemaVersion: SESSION_SCHEMA_VERSION,
    puzzleId: puzzle.puzzleId,
    locale: puzzle.locale,
    placements,
    lockedItemIds,
    attempts: value.attempts,
    hintUsed: value.hintUsed,
    solved: value.solved,
    updatedAt: value.updatedAt,
  };
}

export function loadSession(storage: Storage, puzzle: SafePuzzleDto): PersistedGameSession | null {
  try {
    const raw = storage.getItem(sessionStorageKey(puzzle.locale, puzzle.puzzleId));
    return raw ? parseSession(raw, puzzle) : null;
  } catch {
    return null;
  }
}

export function saveSession(storage: Storage, input: SessionStateInput): boolean {
  try {
    storage.setItem(sessionStorageKey(input.puzzle.locale, input.puzzle.puzzleId), serializeSession(input));
    return true;
  } catch {
    return false;
  }
}

function createPlacementRecord(
  placements: ReadonlyMap<RowId, readonly string[]>,
): Readonly<Record<RowId, readonly string[]>> {
  const record: Partial<Record<RowId, readonly string[]>> = {};
  for (const [rowId, itemIds] of placements) {
    record[rowId] = [...itemIds];
  }
  return record as Readonly<Record<RowId, readonly string[]>>;
}

function parsePlacements(
  value: unknown,
  puzzle: SafePuzzleDto,
): Readonly<Record<RowId, readonly string[]>> | null {
  if (!isRecord(value)) {
    return null;
  }

  const knownItems = new Set(puzzle.items.map((item) => item.itemId));
  const rowById = new Map(puzzle.rows.map((row) => [row.rowId, row]));
  const seenItems = new Set<string>();
  const placements: Partial<Record<RowId, readonly string[]>> = {};

  for (const [key, itemIdsValue] of Object.entries(value)) {
    if (!isRowId(key) || !Array.isArray(itemIdsValue)) {
      return null;
    }
    const row = rowById.get(key);
    if (!row || itemIdsValue.length > row.capacity) {
      return null;
    }
    const itemIds: string[] = [];
    for (const itemId of itemIdsValue) {
      if (typeof itemId !== 'string' || !knownItems.has(itemId) || seenItems.has(itemId)) {
        return null;
      }
      seenItems.add(itemId);
      itemIds.push(itemId);
    }
    placements[key] = itemIds;
  }

  return placements as Readonly<Record<RowId, readonly string[]>>;
}

function parseLockedItemIds(
  value: unknown,
  puzzle: SafePuzzleDto,
  placements: Readonly<Record<RowId, readonly string[]>> | null,
): readonly string[] | null {
  if (!Array.isArray(value) || !placements) {
    return null;
  }

  const placedItemIds = new Set(Object.values(placements).flat());
  const knownItemIds = new Set(puzzle.items.map((item) => item.itemId));
  const lockedItemIds = new Set<string>();
  for (const itemId of value) {
    if (typeof itemId !== 'string'
      || !knownItemIds.has(itemId)
      || !placedItemIds.has(itemId)
      || lockedItemIds.has(itemId)) {
      return null;
    }
    lockedItemIds.add(itemId);
  }

  return [...lockedItemIds];
}

function isCompletePlacements(
  placements: Readonly<Record<RowId, readonly string[]>>,
  puzzle: SafePuzzleDto,
): boolean {
  const placedItemIds = Object.values(placements).flat();
  return puzzle.rows.every((row) => placements[row.rowId]?.length === row.capacity)
    && placedItemIds.length === puzzle.items.length
    && new Set(placedItemIds).size === puzzle.items.length;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(record: Record<string, unknown>, keys: readonly string[]): boolean {
  const allowed = new Set(keys);
  return Object.keys(record).every((key) => allowed.has(key));
}

function isRowId(value: string): value is RowId {
  return value === 'row-1' || value === 'row-2' || value === 'row-3' || value === 'row-4';
}
