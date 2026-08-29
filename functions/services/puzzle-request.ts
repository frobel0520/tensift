import type { AuthoringPuzzleRecord } from '../../src/domain/puzzle/authoring';
import type { CheckRequest, HintRequest, Placement, RowId } from '../../shared/contracts';
import { ApiInputError, isRecord, requireClientSessionId, requireIdempotencyKey } from './api';

export interface PlacementSnapshot {
  readonly placements: readonly Placement[];
  readonly byRow: ReadonlyMap<RowId, readonly string[]>;
  readonly complete: boolean;
}

export interface ParsedCheckRequest {
  readonly request: CheckRequest;
  readonly snapshot: PlacementSnapshot;
}

export interface ParsedHintRequest {
  readonly request: HintRequest;
  readonly snapshot: PlacementSnapshot;
  readonly lockedItemIds: ReadonlySet<string>;
}

export function parseCheckRequest(value: unknown, puzzle: AuthoringPuzzleRecord): ParsedCheckRequest {
  if (!isRecord(value)) {
    throw invalidPlacement('Request body must include placements.');
  }

  const clientSessionId = requireClientSessionId(value.clientSessionId);
  const snapshot = parsePlacementSnapshot(value.placements, puzzle, false);
  if (!snapshot.complete) {
    throw new ApiInputError('BOARD_INCOMPLETE', 'Place every item in a full board before checking.');
  }

  return {
    request: {
      clientSessionId,
      placements: snapshot.placements,
    },
    snapshot,
  };
}

export function parseHintRequest(value: unknown, puzzle: AuthoringPuzzleRecord): ParsedHintRequest {
  if (!isRecord(value)) {
    throw new ApiInputError('INVALID_REQUEST', 'Request body must include clientSessionId and idempotencyKey.');
  }

  const clientSessionId = requireClientSessionId(value.clientSessionId);
  const idempotencyKey = requireIdempotencyKey(value.idempotencyKey);
  const snapshot = value.placements === undefined
    ? emptyPlacementSnapshot(puzzle)
    : parsePlacementSnapshot(value.placements, puzzle, true);
  const lockedItemIds = parseLockedItemIds(value.lockedItemIds, puzzle);

  return {
    request: {
      clientSessionId,
      idempotencyKey,
      placements: value.placements === undefined ? undefined : snapshot.placements,
      lockedItemIds: value.lockedItemIds === undefined ? undefined : [...lockedItemIds],
    },
    snapshot,
    lockedItemIds,
  };
}

export function parseRevealRequest(value: unknown): { readonly clientSessionId: string } {
  if (!isRecord(value)) {
    throw new ApiInputError('INVALID_REQUEST', 'Request body must include clientSessionId.');
  }

  return { clientSessionId: requireClientSessionId(value.clientSessionId) };
}

/** Return an unbiased cryptographic random index for hint selection. */
export function secureRandomIndex(maxExclusive: number): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new RangeError('maxExclusive must be a positive integer.');
  }
  if (maxExclusive === 1) {
    return 0;
  }

  const randomValues = new Uint32Array(1);
  const range = 0x1_0000_0000;
  const limit = range - (range % maxExclusive);
  do {
    globalThis.crypto.getRandomValues(randomValues);
  } while (randomValues[0] >= limit);

  return randomValues[0] % maxExclusive;
}

function parsePlacementSnapshot(
  value: unknown,
  puzzle: AuthoringPuzzleRecord,
  allowIncomplete: boolean,
): PlacementSnapshot {
  if (!Array.isArray(value)) {
    throw invalidPlacement('placements must be an array.');
  }

  const knownItems = new Set(puzzle.items.map((item) => item.itemId));
  const rowById = new Map<RowId, string[]>(puzzle.rows.map((row) => [row.rowId, []]));
  const seenItems = new Set<string>();
  const placements: Placement[] = [];

  if (value.length > puzzle.items.length) {
    throw invalidPlacement('placements contains too many items.');
  }

  for (const candidate of value) {
    if (!isRecord(candidate)
      || typeof candidate.itemId !== 'string'
      || typeof candidate.rowId !== 'string') {
      throw invalidPlacement('Every placement must contain an itemId and rowId.');
    }

    if (!knownItems.has(candidate.itemId)) {
      throw invalidPlacement('placements contains an unknown item.');
    }

    if (!isRowId(candidate.rowId)) {
      throw invalidPlacement('placements contains an unknown row.');
    }

    if (seenItems.has(candidate.itemId)) {
      throw invalidPlacement('Each item may appear only once in placements.');
    }
    seenItems.add(candidate.itemId);

    const rowItems = rowById.get(candidate.rowId);
    if (!rowItems) {
      throw invalidPlacement('placements contains an unknown row.');
    }
    const row = puzzle.rows.find((entry) => entry.rowId === candidate.rowId);
    if (!row || rowItems.length >= row.capacity) {
      throw invalidPlacement('A row cannot contain more items than its capacity.');
    }

    rowItems.push(candidate.itemId);
    placements.push({ itemId: candidate.itemId, rowId: candidate.rowId });
  }

  const complete = placements.length === puzzle.items.length
    && puzzle.rows.every((row) => (rowById.get(row.rowId)?.length ?? 0) === row.capacity);

  if (!allowIncomplete && !complete) {
    return {
      placements,
      byRow: rowById,
      complete: false,
    };
  }

  return {
    placements,
    byRow: rowById,
    complete,
  };
}

function emptyPlacementSnapshot(puzzle: AuthoringPuzzleRecord): PlacementSnapshot {
  return {
    placements: [],
    byRow: new Map(puzzle.rows.map((row) => [row.rowId, [] as string[]])),
    complete: false,
  };
}

function parseLockedItemIds(value: unknown, puzzle: AuthoringPuzzleRecord): ReadonlySet<string> {
  if (value === undefined) {
    return new Set<string>();
  }
  if (!Array.isArray(value)) {
    throw new ApiInputError('INVALID_PLACEMENT', 'lockedItemIds must be an array.');
  }

  const knownItems = new Set(puzzle.items.map((item) => item.itemId));
  const lockedItemIds = new Set<string>();
  for (const itemId of value) {
    if (typeof itemId !== 'string' || !knownItems.has(itemId)) {
      throw new ApiInputError('INVALID_PLACEMENT', 'lockedItemIds contains an unknown item.');
    }
    if (lockedItemIds.has(itemId)) {
      throw new ApiInputError('INVALID_PLACEMENT', 'lockedItemIds must not contain duplicates.');
    }
    lockedItemIds.add(itemId);
  }

  return lockedItemIds;
}

function isRowId(value: string): value is RowId {
  return value === 'row-1' || value === 'row-2' || value === 'row-3' || value === 'row-4';
}

function invalidPlacement(message: string): ApiInputError {
  return new ApiInputError('INVALID_PLACEMENT', message);
}
