import {
  SUPPORTED_LOCALES,
  type CheckResponse,
  type HintResponse,
  type Locale,
  type RevealResponse,
  type RowCapacity,
  type RowId,
  type SafePuzzleDto,
  type SafePuzzleItem,
} from './contracts';

export class ApiProtocolError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'ApiProtocolError';
  }
}

export function parseSafePuzzleDto(value: unknown): SafePuzzleDto {
  const record = requireRecord(value, 'safe puzzle');
  assertOnlyKeys(record, ['puzzleId', 'publishDate', 'locale', 'theme', 'items', 'rows', 'policy']);

  const puzzleId = requireText(record.puzzleId, 'puzzleId');
  const publishDate = requireText(record.publishDate, 'publishDate');
  const locale = parseLocale(record.locale);
  const theme = requireText(record.theme, 'theme');
  const items = parseItems(record.items);
  const rows = parseRows(record.rows);
  const policy = requireRecord(record.policy, 'policy');

  if (policy.maxHints !== 1 || policy.checks !== 'unlimited') {
    throw invalidResponse('policy does not match the public contract.');
  }

  return { puzzleId, publishDate, locale, theme, items, rows, policy: { maxHints: 1, checks: 'unlimited' } };
}

export function parseCheckResponse(value: unknown): CheckResponse {
  const record = requireRecord(value, 'check response');
  assertOnlyKeys(record, ['correctCount', 'solved', 'attemptAccepted']);

  const correctCount = record.correctCount;
  if (typeof correctCount !== 'number' || !Number.isInteger(correctCount) || correctCount < 0 || correctCount > 10) {
    throw invalidResponse('correctCount must be an integer from 0 to 10.');
  }
  if (typeof record.solved !== 'boolean' || record.attemptAccepted !== true) {
    throw invalidResponse('check response flags are invalid.');
  }

  return {
    correctCount,
    solved: record.solved,
    attemptAccepted: true,
  };
}

export function parseHintResponse(value: unknown): HintResponse {
  const record = requireRecord(value, 'hint response');
  assertOnlyKeys(record, ['itemId', 'rowId', 'hintAccepted']);

  if (typeof record.itemId !== 'string' || !isRowId(record.rowId) || record.hintAccepted !== true) {
    throw invalidResponse('hint response fields are invalid.');
  }

  return { itemId: record.itemId, rowId: record.rowId, hintAccepted: true };
}

export function parseRevealResponse(value: unknown): RevealResponse {
  const record = requireRecord(value, 'reveal response');
  assertOnlyKeys(record, ['hiddenDimension', 'groups', 'explanation', 'sources']);

  const hiddenDimension = requireText(record.hiddenDimension, 'hiddenDimension');
  const explanation = requireText(record.explanation, 'explanation');
  if (!Array.isArray(record.groups) || record.groups.length !== 4) {
    throw invalidResponse('reveal groups must contain exactly four records.');
  }
  const groups = record.groups.map((value, index) => {
    const group = requireRecord(value, `reveal group ${index + 1}`);
    assertOnlyKeys(group, ['label', 'capacity', 'itemIds']);
    if (!isRowCapacity(group.capacity) || typeof group.label !== 'string' || !Array.isArray(group.itemIds)) {
      throw invalidResponse('reveal group fields are invalid.');
    }
    if (group.itemIds.some((itemId) => typeof itemId !== 'string')) {
      throw invalidResponse('reveal group item IDs are invalid.');
    }
    return {
      label: group.label,
      capacity: group.capacity,
      itemIds: group.itemIds as string[],
    };
  });

  if (!Array.isArray(record.sources)) {
    throw invalidResponse('reveal sources must be an array.');
  }
  const sources = record.sources.map((value) => {
    const source = requireRecord(value, 'reveal source');
    assertOnlyKeys(source, ['title', 'url']);
    const url = requireText(source.url, 'source URL');
    if (!isHttpUrl(url)) {
      throw invalidResponse('source URL must use HTTP or HTTPS.');
    }
    return {
      title: requireText(source.title, 'source title'),
      url,
    };
  });

  return { hiddenDimension, groups, explanation, sources };
}

function parseItems(value: unknown): readonly SafePuzzleItem[] {
  if (!Array.isArray(value) || value.length !== 10) {
    throw invalidResponse('items must contain exactly ten records.');
  }

  const itemIds = new Set<string>();
  return value.map((value, index) => {
    const item = requireRecord(value, `item ${index + 1}`);
    assertOnlyKeys(item, ['itemId', 'label', 'visual']);
    const itemId = requireText(item.itemId, 'itemId');
    if (itemIds.has(itemId)) {
      throw invalidResponse('item IDs must be unique.');
    }
    itemIds.add(itemId);

    const parsed: SafePuzzleItem = { itemId, label: requireText(item.label, 'item label') };
    if (item.visual !== undefined) {
      const visual = requireRecord(item.visual, 'visual');
      assertOnlyKeys(visual, ['type', 'src', 'altText']);
      if ((visual.type !== 'emoji' && visual.type !== 'image')
        || typeof visual.src !== 'string'
        || typeof visual.altText !== 'string'
        || visual.src.trim().length === 0
        || visual.altText.trim().length === 0) {
        throw invalidResponse('visual does not match the public contract.');
      }
      return {
        ...parsed,
        visual: { type: visual.type, src: visual.src, altText: visual.altText },
      };
    }
    return parsed;
  });
}

function parseRows(value: unknown): readonly { readonly rowId: RowId; readonly capacity: RowCapacity }[] {
  if (!Array.isArray(value) || value.length !== 4) {
    throw invalidResponse('rows must contain exactly four records.');
  }

  const rowIds = new Set<RowId>();
  const capacities = new Set<RowCapacity>();
  const rows = value.map((value, index) => {
    const row = requireRecord(value, `row ${index + 1}`);
    assertOnlyKeys(row, ['rowId', 'capacity']);
    if (!isRowId(row.rowId) || !isRowCapacity(row.capacity)) {
      throw invalidResponse('row fields are invalid.');
    }
    if (rowIds.has(row.rowId) || capacities.has(row.capacity)) {
      throw invalidResponse('row IDs and capacities must be unique.');
    }
    rowIds.add(row.rowId);
    capacities.add(row.capacity);
    return { rowId: row.rowId, capacity: row.capacity };
  });

  if (JSON.stringify([...capacities].sort()) !== JSON.stringify([1, 2, 3, 4])) {
    throw invalidResponse('rows must have capacities 1 / 2 / 3 / 4.');
  }
  return rows;
}

function parseLocale(value: unknown): Locale {
  if (typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value)) {
    return value as Locale;
  }
  throw invalidResponse('locale is not supported.');
}

function isRowId(value: unknown): value is RowId {
  return value === 'row-1' || value === 'row-2' || value === 'row-3' || value === 'row-4';
}

function isRowCapacity(value: unknown): value is RowCapacity {
  return value === 1 || value === 2 || value === 3 || value === 4;
}

function requireRecord(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw invalidResponse(`${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function requireText(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw invalidResponse(`${label} must be a non-empty string.`);
  }
  return value;
}

function assertOnlyKeys(record: Record<string, unknown>, allowedKeys: readonly string[]): void {
  const allowed = new Set(allowedKeys);
  if (Object.keys(record).some((key) => !allowed.has(key))) {
    throw invalidResponse('response contains fields outside the public contract.');
  }
}

function invalidResponse(message: string): ApiProtocolError {
  return new ApiProtocolError(message);
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
