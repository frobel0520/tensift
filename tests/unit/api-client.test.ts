import { describe, expect, it } from 'vitest';
import { createApiClient } from '../../src/api/client';

const safePuzzle = {
  puzzleId: 'countries-continent-2026-09-01-en',
  publishDate: '2026-09-01',
  locale: 'en',
  theme: 'Countries',
  items: [
    { itemId: 'a', label: 'Australia' },
    { itemId: 'b', label: 'Brazil' },
    { itemId: 'c', label: 'Argentina' },
    { itemId: 'd', label: 'Canada' },
    { itemId: 'e', label: 'Mexico' },
    { itemId: 'f', label: 'United States' },
    { itemId: 'g', label: 'France' },
    { itemId: 'h', label: 'Germany' },
    { itemId: 'i', label: 'Italy' },
    { itemId: 'j', label: 'Spain' },
  ],
  rows: [
    { rowId: 'row-1', capacity: 1 },
    { rowId: 'row-2', capacity: 2 },
    { rowId: 'row-3', capacity: 3 },
    { rowId: 'row-4', capacity: 4 },
  ],
  policy: { maxHints: 1, checks: 'unlimited' },
} as const;

describe('browser API client', () => {
  it('validates a safe puzzle response before returning it', async () => {
    const requests: string[] = [];
    const client = createApiClient('https://tensift.test', async (input) => {
      requests.push(String(input));
      return response(200, safePuzzle);
    });

    await expect(client.getToday('en')).resolves.toMatchObject({ puzzleId: safePuzzle.puzzleId });
    expect(requests[0]).toContain('/api/v1/puzzles/today?locale=en');
  });

  it('turns answer leakage into a protocol error', async () => {
    const client = createApiClient('', async () => response(200, { ...safePuzzle, solution: {} }));

    await expect(client.getToday('en')).rejects.toMatchObject({
      status: 502,
      body: expect.objectContaining({ code: 'INVALID_API_RESPONSE' }),
    });
  });

  it('preserves structured server errors and classifies network failures', async () => {
    const serverClient = createApiClient('', async () => response(409, {
      code: 'HINT_ALREADY_USED',
      message: 'Already used',
      requestId: 'req-1',
    }));
    await expect(serverClient.hint('puzzle', {
      clientSessionId: 'session',
      idempotencyKey: 'key',
    })).rejects.toMatchObject({ status: 409, body: { code: 'HINT_ALREADY_USED', requestId: 'req-1' } });

    const networkClient = createApiClient('', async () => {
      throw new Error('offline');
    });
    await expect(networkClient.getToday('en')).rejects.toMatchObject({
      status: 0,
      body: expect.objectContaining({ code: 'NETWORK_ERROR' }),
    });
  });
});

function response(status: number, body: unknown): { readonly ok: boolean; readonly status: number; json: () => Promise<unknown> } {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}
