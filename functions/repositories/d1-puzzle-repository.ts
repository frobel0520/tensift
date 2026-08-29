import { assertValidAuthoringPuzzle } from '../../src/domain/puzzle/validator';
import type {
  AuthoringPuzzleItem,
  AuthoringPuzzleRecord,
  AuthoringPuzzleRow,
  AuthoringSolutionGroup,
  AuthoringSource,
  DifficultyBand,
  PuzzleStatus,
} from '../../src/domain/puzzle/authoring';
import type { Locale, RowCapacity, RowId } from '../../shared/contracts';
import type { D1Database } from '../types';

/**
 * The repository is the only module that knows the normalized D1 schema.
 * It deliberately returns the complete internal puzzle because callers must
 * choose an explicit public projection before serializing a response.
 */
export interface PuzzleRepository {
  findReleasedPuzzle(locale: Locale, publishDate: string): Promise<AuthoringPuzzleRecord | null>;
  findPuzzleById(puzzleId: string): Promise<AuthoringPuzzleRecord | null>;
  findActionReceipt(
    puzzleId: string,
    clientSessionId: string,
    action: 'hint' | 'reveal',
    now: string,
  ): Promise<ActionReceipt | null>;
  insertActionReceipt(
    puzzleId: string,
    clientSessionId: string,
    action: 'hint' | 'reveal',
    idempotencyKey: string,
    responseJson: string,
    expiresAt: string,
    now: string,
  ): Promise<void>;
}

export interface ActionReceipt {
  readonly idempotencyKey: string;
  readonly responseJson: string;
  readonly expiresAt: string;
}

interface PuzzleRowRecord {
  readonly puzzle_id: string;
  readonly puzzle_family_id: string;
  readonly locale: string;
  readonly publish_date: string;
  readonly timezone: string;
  readonly status: string;
  readonly theme: string;
  readonly hidden_dimension: string;
  readonly explanation: string;
  readonly difficulty_band: string;
  readonly difficulty_score: number;
  readonly hint_policy: string;
  readonly max_hints: number;
  readonly created_at: string;
  readonly updated_at: string;
}

interface PuzzleItemRow {
  readonly puzzle_id: string;
  readonly item_id: string;
  readonly label: string;
  readonly visual_json: string | null;
  readonly rights_note: string | null;
  readonly display_order: number;
}

interface PuzzleRowRow {
  readonly puzzle_id: string;
  readonly row_id: string;
  readonly capacity: number;
}

interface SolutionGroupRow {
  readonly puzzle_id: string;
  readonly group_id: string;
  readonly label: string;
  readonly capacity: number;
  readonly display_order: number;
}

interface SolutionGroupItemRow {
  readonly puzzle_id: string;
  readonly group_id: string;
  readonly item_id: string;
}

interface PuzzleSourceRow {
  readonly puzzle_id: string;
  readonly source_id: string;
  readonly title: string;
  readonly url: string;
  readonly retrieved_at: string;
}

interface ActionReceiptRow {
  readonly idempotency_key: string;
  readonly response_json: string;
  readonly expires_at: string;
}

const SELECT_PUZZLE_COLUMNS = `
  puzzle_id,
  puzzle_family_id,
  locale,
  publish_date,
  timezone,
  status,
  theme,
  hidden_dimension,
  explanation,
  difficulty_band,
  difficulty_score,
  hint_policy,
  max_hints,
  created_at,
  updated_at`;

const FIND_RELEASED_PUZZLE_SQL = `
SELECT${SELECT_PUZZLE_COLUMNS}
FROM puzzles
WHERE locale = ?
  AND publish_date = ?
  AND status IN ('scheduled', 'published')
LIMIT 1`;

const FIND_PUZZLE_BY_ID_SQL = `
SELECT${SELECT_PUZZLE_COLUMNS}
FROM puzzles
WHERE puzzle_id = ?
LIMIT 1`;

const FIND_ITEMS_SQL = `
SELECT puzzle_id, item_id, label, visual_json, rights_note, display_order
FROM puzzle_items
WHERE puzzle_id = ?
ORDER BY display_order ASC, item_id ASC`;

const FIND_ROWS_SQL = `
SELECT puzzle_id, row_id, capacity
FROM puzzle_rows
WHERE puzzle_id = ?
ORDER BY capacity ASC, row_id ASC`;

const FIND_GROUPS_SQL = `
SELECT puzzle_id, group_id, label, capacity, display_order
FROM solution_groups
WHERE puzzle_id = ?
ORDER BY display_order ASC, capacity ASC, group_id ASC`;

const FIND_GROUP_ITEMS_SQL = `
SELECT puzzle_id, group_id, item_id
FROM solution_group_items
WHERE puzzle_id = ?
ORDER BY group_id ASC, item_id ASC`;

const FIND_SOURCES_SQL = `
SELECT puzzle_id, source_id, title, url, retrieved_at
FROM puzzle_sources
WHERE puzzle_id = ?
ORDER BY source_id ASC`;

export class PuzzleDataIntegrityError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'PuzzleDataIntegrityError';
  }
}

export class D1PuzzleRepository implements PuzzleRepository {
  public constructor(private readonly db: D1Database) {}

  public async findReleasedPuzzle(locale: Locale, publishDate: string): Promise<AuthoringPuzzleRecord | null> {
    const row = await this.db
      .prepare(FIND_RELEASED_PUZZLE_SQL)
      .bind(locale, publishDate)
      .first<PuzzleRowRecord>();

    return row ? this.loadBundle(row) : null;
  }

  public async findPuzzleById(puzzleId: string): Promise<AuthoringPuzzleRecord | null> {
    const row = await this.db
      .prepare(FIND_PUZZLE_BY_ID_SQL)
      .bind(puzzleId)
      .first<PuzzleRowRecord>();

    return row ? this.loadBundle(row) : null;
  }

  public async findActionReceipt(
    puzzleId: string,
    clientSessionId: string,
    action: 'hint' | 'reveal',
    now: string,
  ): Promise<ActionReceipt | null> {
    const row = await this.db
      .prepare(`
        SELECT idempotency_key, response_json, expires_at
        FROM action_receipts
        WHERE puzzle_id = ?
          AND client_session_id = ?
          AND action = ?
          AND expires_at > ?
        LIMIT 1`)
      .bind(puzzleId, clientSessionId, action, now)
      .first<ActionReceiptRow>();

    return row
      ? {
        idempotencyKey: row.idempotency_key,
        responseJson: row.response_json,
        expiresAt: row.expires_at,
      }
      : null;
  }

  public async insertActionReceipt(
    puzzleId: string,
    clientSessionId: string,
    action: 'hint' | 'reveal',
    idempotencyKey: string,
    responseJson: string,
    expiresAt: string,
    now: string,
  ): Promise<void> {
    await this.db
      .prepare(`
        INSERT INTO action_receipts
          (puzzle_id, client_session_id, action, idempotency_key, response_json, expires_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT (puzzle_id, client_session_id, action) DO UPDATE SET
          idempotency_key = excluded.idempotency_key,
          response_json = excluded.response_json,
          expires_at = excluded.expires_at
        WHERE action_receipts.expires_at <= ?`)
      .bind(puzzleId, clientSessionId, action, idempotencyKey, responseJson, expiresAt, now)
      .run();
  }

  private async loadBundle(row: PuzzleRowRecord): Promise<AuthoringPuzzleRecord> {
    const puzzleId = requireText(row.puzzle_id, 'puzzles.puzzle_id');
    const [itemsResult, rowsResult, groupsResult, groupItemsResult, sourcesResult] = await Promise.all([
      this.db.prepare(FIND_ITEMS_SQL).bind(puzzleId).all<PuzzleItemRow>(),
      this.db.prepare(FIND_ROWS_SQL).bind(puzzleId).all<PuzzleRowRow>(),
      this.db.prepare(FIND_GROUPS_SQL).bind(puzzleId).all<SolutionGroupRow>(),
      this.db.prepare(FIND_GROUP_ITEMS_SQL).bind(puzzleId).all<SolutionGroupItemRow>(),
      this.db.prepare(FIND_SOURCES_SQL).bind(puzzleId).all<PuzzleSourceRow>(),
    ]);

    const groups = createSolutionGroups(groupsResult.results, groupItemsResult.results);
    const record: AuthoringPuzzleRecord = {
      schemaVersion: 1,
      puzzleId,
      puzzleFamilyId: requireText(row.puzzle_family_id, 'puzzles.puzzle_family_id'),
      locale: parseLocale(row.locale),
      publishDate: requireText(row.publish_date, 'puzzles.publish_date'),
      timezone: parseTimezone(row.timezone),
      theme: requireText(row.theme, 'puzzles.theme'),
      items: itemsResult.results
        .slice()
        .sort(compareDisplayOrder)
        .map(toAuthoringItem),
      rows: rowsResult.results
        .slice()
        .sort(compareCapacity)
        .map(toAuthoringRow),
      solution: {
        hiddenDimension: requireText(row.hidden_dimension, 'puzzles.hidden_dimension'),
        groups,
      },
      hint: {
        maxUses: parseOne(row.max_hints, 'puzzles.max_hints'),
        policy: parseHintPolicy(row.hint_policy),
      },
      explanation: requireText(row.explanation, 'puzzles.explanation'),
      sources: sourcesResult.results
        .slice()
        .sort((left, right) => left.source_id.localeCompare(right.source_id))
        .map(toAuthoringSource),
      difficulty: {
        band: parseDifficultyBand(row.difficulty_band),
        score: parseDifficultyScore(row.difficulty_score),
      },
      status: parsePuzzleStatus(row.status),
    };

    try {
      assertValidAuthoringPuzzle(record, `D1 puzzle ${puzzleId}`);
    } catch (error) {
      throw new PuzzleDataIntegrityError(error instanceof Error ? error.message : String(error));
    }

    return record;
  }
}

function createSolutionGroups(
  groupRows: readonly SolutionGroupRow[],
  itemRows: readonly SolutionGroupItemRow[],
): readonly AuthoringSolutionGroup[] {
  const itemIdsByGroup = new Map<string, string[]>();
  for (const itemRow of itemRows) {
    const itemIds = itemIdsByGroup.get(itemRow.group_id) ?? [];
    itemIds.push(requireText(itemRow.item_id, 'solution_group_items.item_id'));
    itemIdsByGroup.set(itemRow.group_id, itemIds);
  }

  return groupRows
    .slice()
    .sort(compareDisplayOrder)
    .map((groupRow) => ({
      groupId: requireText(groupRow.group_id, 'solution_groups.group_id'),
      label: requireText(groupRow.label, 'solution_groups.label'),
      capacity: parseCapacity(groupRow.capacity, 'solution_groups.capacity'),
      itemIds: itemIdsByGroup.get(groupRow.group_id)?.slice() ?? [],
    }));
}

function toAuthoringItem(row: PuzzleItemRow): AuthoringPuzzleItem {
  const item: AuthoringPuzzleItem = {
    itemId: requireText(row.item_id, 'puzzle_items.item_id'),
    label: requireText(row.label, 'puzzle_items.label'),
  };

  return {
    ...item,
    ...(row.visual_json !== null && row.visual_json !== undefined
      ? { visual: parseVisual(row.visual_json) }
      : {}),
    ...(row.rights_note !== null && row.rights_note !== undefined
      ? { rightsNote: requireText(row.rights_note, 'puzzle_items.rights_note') }
      : {}),
  };
}

function toAuthoringRow(row: PuzzleRowRow): AuthoringPuzzleRow {
  const rowId = requireText(row.row_id, 'puzzle_rows.row_id');
  if (!isRowId(rowId)) {
    throw new PuzzleDataIntegrityError(`Invalid puzzle row ID in D1: ${rowId}`);
  }

  return {
    rowId,
    capacity: parseCapacity(row.capacity, 'puzzle_rows.capacity'),
  };
}

function toAuthoringSource(row: PuzzleSourceRow): AuthoringSource {
  return {
    title: requireText(row.title, 'puzzle_sources.title'),
    url: requireText(row.url, 'puzzle_sources.url'),
    retrievedAt: requireText(row.retrieved_at, 'puzzle_sources.retrieved_at'),
  };
}

function parseVisual(value: string): AuthoringPuzzleItem['visual'] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value) as unknown;
  } catch {
    throw new PuzzleDataIntegrityError('puzzle_items.visual_json is not valid JSON.');
  }

  if (!isRecord(parsed)
    || (parsed.type !== 'emoji' && parsed.type !== 'image')
    || typeof parsed.src !== 'string'
    || typeof parsed.altText !== 'string'
    || parsed.src.trim().length === 0
    || parsed.altText.trim().length === 0) {
    throw new PuzzleDataIntegrityError('puzzle_items.visual_json does not match the visual contract.');
  }

  return {
    type: parsed.type,
    src: parsed.src,
    altText: parsed.altText,
  };
}

function parseLocale(value: string): Locale {
  if (value === 'en' || value === 'zh-Hans' || value === 'es-419') {
    return value;
  }
  throw new PuzzleDataIntegrityError(`Unsupported puzzle locale in D1: ${value}`);
}

function parseTimezone(value: string): 'UTC' {
  if (value === 'UTC') {
    return value;
  }
  throw new PuzzleDataIntegrityError(`Unsupported puzzle timezone in D1: ${value}`);
}

function parsePuzzleStatus(value: string): PuzzleStatus {
  if (value === 'draft' || value === 'reviewed' || value === 'scheduled' || value === 'published' || value === 'retired') {
    return value;
  }
  throw new PuzzleDataIntegrityError(`Unsupported puzzle status in D1: ${value}`);
}

function parseDifficultyBand(value: string): DifficultyBand {
  if (value === 'easy' || value === 'medium' || value === 'hard') {
    return value;
  }
  throw new PuzzleDataIntegrityError(`Unsupported difficulty band in D1: ${value}`);
}

function parseHintPolicy(value: string): 'random-unlocked-correct-row' {
  if (value === 'random-unlocked-correct-row') {
    return value;
  }
  throw new PuzzleDataIntegrityError(`Unsupported hint policy in D1: ${value}`);
}

function parseCapacity(value: number, field: string): RowCapacity {
  if (value === 1 || value === 2 || value === 3 || value === 4) {
    return value;
  }
  throw new PuzzleDataIntegrityError(`${field} must be 1, 2, 3, or 4.`);
}

function parseOne(value: number, field: string): 1 {
  if (value === 1) {
    return value;
  }
  throw new PuzzleDataIntegrityError(`${field} must be 1.`);
}

function parseDifficultyScore(value: number): number {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1) {
    return value;
  }
  throw new PuzzleDataIntegrityError('puzzles.difficulty_score must be between 0 and 1.');
}

function requireText(value: string | null | undefined, field: string): string {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }
  throw new PuzzleDataIntegrityError(`${field} must be a non-empty string.`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isRowId(value: string): value is RowId {
  return value === 'row-1' || value === 'row-2' || value === 'row-3' || value === 'row-4';
}

function compareDisplayOrder(left: { readonly display_order: number }, right: { readonly display_order: number }): number {
  return left.display_order - right.display_order;
}

function compareCapacity(left: PuzzleRowRow, right: PuzzleRowRow): number {
  return left.capacity - right.capacity || left.row_id.localeCompare(right.row_id);
}
