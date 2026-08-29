import { describe, expect, it } from 'vitest';
import countriesFixture from '../../content/puzzles/en/countries-continent-2026-09-01-en.json';
import { onRequest as health } from '../../functions/api/health';
import { onRequest as check } from '../../functions/api/v1/puzzles/[puzzleId]/check';
import { onRequest as hint } from '../../functions/api/v1/puzzles/[puzzleId]/hint';
import { onRequest as reveal } from '../../functions/api/v1/puzzles/[puzzleId]/reveal';
import { onRequest as today } from '../../functions/api/v1/puzzles/today';
import type { AuthoringPuzzleRecord } from '../../src/domain/puzzle/authoring';
import type { D1Database, D1PreparedStatement, PagesFunctionContext, TensiftEnvironment } from '../../functions/types';

const fixture = countriesFixture as unknown as AuthoringPuzzleRecord;
const publishedPuzzle: AuthoringPuzzleRecord = {
  ...fixture,
  publishDate: new Date().toISOString().slice(0, 10),
  status: 'published',
};

describe('Pages Function API contracts', () => {
  it('returns only the safe puzzle projection for today', async () => {
    const response = await today(context({
      request: new Request(`https://tensift.test/api/v1/puzzles/today?locale=en`),
      env: { DB: new FakeD1Database(publishedPuzzle) },
    }));
    const body = await response.json() as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      puzzleId: publishedPuzzle.puzzleId,
      locale: 'en',
      theme: 'Countries',
    });
    expect(body).not.toHaveProperty('solution');
    expect(body).not.toHaveProperty('hiddenDimension');
    expect(body).not.toHaveProperty('explanation');
    expect(body).not.toHaveProperty('sources');
    expect(JSON.stringify(body)).not.toContain('Oceania');
    expect(response.headers.get('cache-control')).toContain('s-maxage=300');
    expect(response.headers.get('x-request-id')).toBeTruthy();
  });

  it('rejects unsupported locales and returns a safe error body', async () => {
    const response = await today(context({
      request: new Request('https://tensift.test/api/v1/puzzles/today?locale=fr'),
      env: { DB: new FakeD1Database(publishedPuzzle) },
    }));
    const body = await response.json() as Record<string, unknown>;

    expect(response.status).toBe(400);
    expect(body).toMatchObject({ code: 'LOCALE_NOT_AVAILABLE' });
    expect(typeof body.requestId).toBe('string');
  });

  it('counts a complete check without identifying incorrect items', async () => {
    const response = await check(context({
      request: jsonRequest({
        clientSessionId: 'session-check',
        placements: [
          { itemId: 'country-brazil', rowId: 'row-1' },
          { itemId: 'country-australia', rowId: 'row-2' },
          { itemId: 'country-argentina', rowId: 'row-2' },
          { itemId: 'country-canada', rowId: 'row-3' },
          { itemId: 'country-mexico', rowId: 'row-3' },
          { itemId: 'country-united-states', rowId: 'row-3' },
          { itemId: 'country-france', rowId: 'row-4' },
          { itemId: 'country-germany', rowId: 'row-4' },
          { itemId: 'country-italy', rowId: 'row-4' },
          { itemId: 'country-spain', rowId: 'row-4' },
        ],
      }),
      env: { DB: new FakeD1Database(publishedPuzzle) },
      params: { puzzleId: publishedPuzzle.puzzleId },
    }));
    const body = await response.json() as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(body).toEqual({ correctCount: 8, solved: false, attemptAccepted: true });
    expect(body).not.toHaveProperty('itemId');
    expect(body).not.toHaveProperty('groupId');
  });

  it('rejects an incomplete or duplicate board before checking', async () => {
    const database = new FakeD1Database(publishedPuzzle);
    const incomplete = await check(context({
      request: jsonRequest({
        clientSessionId: 'session-incomplete',
        placements: [{ itemId: 'country-australia', rowId: 'row-1' }],
      }),
      env: { DB: database },
      params: { puzzleId: publishedPuzzle.puzzleId },
    }));
    expect(incomplete.status).toBe(400);
    expect(await incomplete.json()).toMatchObject({ code: 'BOARD_INCOMPLETE' });

    const duplicate = await check(context({
      request: jsonRequest({
        clientSessionId: 'session-duplicate',
        placements: [
          ...publishedPuzzle.items.map((item) => ({ itemId: item.itemId, rowId: 'row-4' })),
        ],
      }),
      env: { DB: database },
      params: { puzzleId: publishedPuzzle.puzzleId },
    }));
    expect(duplicate.status).toBe(400);
    expect(await duplicate.json()).toMatchObject({ code: 'INVALID_PLACEMENT' });
  });

  it('returns one idempotent hint and never includes solution fields', async () => {
    const database = new FakeD1Database(publishedPuzzle);
    const requestBody = {
      clientSessionId: 'session-hint',
      idempotencyKey: 'hint-attempt-1',
      placements: [],
      lockedItemIds: [],
    };
    const first = await hint(context({
      request: jsonRequest(requestBody),
      env: { DB: database },
      params: { puzzleId: publishedPuzzle.puzzleId },
    }));
    const firstBody = await first.json() as Record<string, unknown>;
    const second = await hint(context({
      request: jsonRequest({ ...requestBody, idempotencyKey: 'retry-with-new-key' }),
      env: { DB: database },
      params: { puzzleId: publishedPuzzle.puzzleId },
    }));
    const secondBody = await second.json();

    expect(first.status).toBe(200);
    expect(firstBody).toMatchObject({ hintAccepted: true });
    expect(second.status).toBe(409);
    expect(secondBody).toMatchObject({ code: 'HINT_ALREADY_USED' });
    expect(firstBody).not.toHaveProperty('hiddenDimension');
    expect(firstBody).not.toHaveProperty('groupId');
  });

  it('keeps reveal behind an explicit POST and exposes the answer only there', async () => {
    const response = await reveal(context({
      request: jsonRequest({ clientSessionId: 'session-reveal' }),
      env: { DB: new FakeD1Database(publishedPuzzle) },
      params: { puzzleId: publishedPuzzle.puzzleId },
    }));
    const body = await response.json() as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ hiddenDimension: 'Continent' });
    expect(body).toHaveProperty('groups');
    expect(JSON.stringify(body)).toContain('Oceania');
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('reports D1 connectivity through health without returning puzzle data', async () => {
    const response = await health(context({ env: { DB: new FakeD1Database(publishedPuzzle) } }));
    const body = await response.json() as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ status: 'ok', puzzleCatalogVersion: 'd1' });
    expect(body).not.toHaveProperty('puzzleId');
  });
});

function context(
  overrides: Partial<PagesFunctionContext<TensiftEnvironment>> = {},
): PagesFunctionContext<TensiftEnvironment> {
  return {
    request: new Request('https://tensift.test/'),
    env: { DB: new FakeD1Database(publishedPuzzle) },
    params: {},
    next: async () => new Response(null, { status: 404 }),
    ...overrides,
  };
}

function jsonRequest(value: unknown): Request {
  return new Request('https://tensift.test/api', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(value),
  });
}

class FakeD1Database implements D1Database {
  private readonly receipts = new Map<string, { idempotencyKey: string; responseJson: string; expiresAt: string }>();

  public constructor(private readonly puzzle: AuthoringPuzzleRecord) {}

  public prepare(query: string): D1PreparedStatement {
    return new FakePreparedStatement(this, query);
  }

  public execute<T>(query: string, values: readonly unknown[], operation: 'first' | 'all' | 'run'): T | null | { readonly results: readonly T[] } | undefined {
    if (operation === 'first' && query.includes('COUNT(*) AS puzzle_count')) {
      return { puzzle_count: 1 } as T;
    }

    if (operation === 'first' && query.includes('FROM puzzles')) {
      const isReleaseQuery = query.includes('locale = ?');
      const found = isReleaseQuery
        ? values[0] === this.puzzle.locale
          && values[1] === this.puzzle.publishDate
          && (this.puzzle.status === 'published' || this.puzzle.status === 'scheduled')
        : values[0] === this.puzzle.puzzleId;
      return found ? toPuzzleRow(this.puzzle) as T : null;
    }

    if (operation === 'first' && query.includes('FROM action_receipts')) {
      const key = receiptKey(values);
      const receipt = this.receipts.get(key);
      const now = String(values[3]);
      return receipt && receipt.expiresAt > now
        ? {
          idempotency_key: receipt.idempotencyKey,
          response_json: receipt.responseJson,
          expires_at: receipt.expiresAt,
        } as T
        : null;
    }

    if (operation === 'all' && query.includes('FROM puzzle_items')) {
      return {
        results: this.puzzle.items.map((item, index) => ({
          puzzle_id: this.puzzle.puzzleId,
          item_id: item.itemId,
          label: item.label,
          visual_json: item.visual ? JSON.stringify(item.visual) : null,
          rights_note: item.rightsNote ?? null,
          display_order: index + 1,
        })),
      } as unknown as { readonly results: readonly T[] };
    }
    if (operation === 'all' && query.includes('FROM puzzle_rows')) {
      return { results: this.puzzle.rows.map((row) => ({
        puzzle_id: this.puzzle.puzzleId,
        row_id: row.rowId,
        capacity: row.capacity,
      })) } as unknown as { readonly results: readonly T[] };
    }
    if (operation === 'all' && query.includes('FROM solution_groups')) {
      return { results: this.puzzle.solution.groups.map((group, index) => ({
        puzzle_id: this.puzzle.puzzleId,
        group_id: group.groupId,
        label: group.label,
        capacity: group.capacity,
        display_order: index + 1,
      })) } as unknown as { readonly results: readonly T[] };
    }
    if (operation === 'all' && query.includes('FROM solution_group_items')) {
      return {
        results: this.puzzle.solution.groups.flatMap((group) => group.itemIds.map((itemId) => ({
          puzzle_id: this.puzzle.puzzleId,
          group_id: group.groupId,
          item_id: itemId,
        }))),
      } as unknown as { readonly results: readonly T[] };
    }
    if (operation === 'all' && query.includes('FROM puzzle_sources')) {
      return {
        results: this.puzzle.sources.map((source, index) => ({
          puzzle_id: this.puzzle.puzzleId,
          source_id: `source-${index + 1}`,
          title: source.title,
          url: source.url,
          retrieved_at: source.retrievedAt,
        })),
      } as unknown as { readonly results: readonly T[] };
    }

    if (operation === 'run' && query.includes('INSERT INTO action_receipts')) {
      const [puzzleId, clientSessionId, action, idempotencyKey, responseJson, expiresAt, now] = values.map(String);
      const key = `${puzzleId}:${clientSessionId}:${action}`;
      const existing = this.receipts.get(key);
      if (!existing || existing.expiresAt <= now) {
        this.receipts.set(key, { idempotencyKey, responseJson, expiresAt });
      }
      return undefined;
    }

    throw new Error(`Fake D1 does not understand query: ${query}`);
  }
}

class FakePreparedStatement implements D1PreparedStatement {
  private values: readonly unknown[] = [];

  public constructor(private readonly database: FakeD1Database, private readonly query: string) {}

  public bind(...values: unknown[]): D1PreparedStatement {
    this.values = values;
    return this;
  }

  public async first<T>(): Promise<T | null> {
    const value = this.database.execute<T>(this.query, this.values, 'first');
    return value === null || value === undefined ? null : value as T;
  }

  public async all<T>(): Promise<{ readonly results: readonly T[] }> {
    return this.database.execute<T>(this.query, this.values, 'all') as { readonly results: readonly T[] };
  }

  public async run(): Promise<unknown> {
    return this.database.execute(this.query, this.values, 'run');
  }
}

function receiptKey(values: readonly unknown[]): string {
  return `${String(values[0])}:${String(values[1])}:${String(values[2])}`;
}

function toPuzzleRow(puzzle: AuthoringPuzzleRecord): Record<string, unknown> {
  return {
    puzzle_id: puzzle.puzzleId,
    puzzle_family_id: puzzle.puzzleFamilyId,
    locale: puzzle.locale,
    publish_date: puzzle.publishDate,
    timezone: puzzle.timezone,
    status: puzzle.status,
    theme: puzzle.theme,
    hidden_dimension: puzzle.solution.hiddenDimension,
    explanation: puzzle.explanation,
    difficulty_band: puzzle.difficulty.band,
    difficulty_score: puzzle.difficulty.score,
    hint_policy: puzzle.hint.policy,
    max_hints: puzzle.hint.maxUses,
    created_at: '2026-08-29T00:00:00.000Z',
    updated_at: '2026-08-29T00:00:00.000Z',
  };
}
