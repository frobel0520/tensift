import { describe, expect, it } from 'vitest';
import { onRequestGet } from '../../functions/ads.txt';
import type { PagesFunctionContext, TensiftEnvironment } from '../../functions/types';

describe('ads.txt function', () => {
  it('returns 404 until a publisher ID is configured', async () => {
    const response = await onRequestGet(context({ env: {} }));

    expect(response.status).toBe(404);
    expect(response.headers.get('content-type')).toContain('text/plain');
    expect(await response.text()).toContain('not configured');
  });

  it('returns the standard direct-seller line for a valid publisher ID', async () => {
    const response = await onRequestGet(context({ env: { ADSENSE_PUBLISHER_ID: 'pub-1234567890123456' } }));

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('public, max-age=3600');
    expect(await response.text()).toBe('google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n');
  });

  it('fails closed for a malformed publisher ID', async () => {
    const response = await onRequestGet(context({ env: { ADSENSE_PUBLISHER_ID: 'pub-placeholder' } }));

    expect(response.status).toBe(500);
    expect(await response.text()).toContain('invalid');
  });
});

function context(
  overrides: Partial<PagesFunctionContext<TensiftEnvironment>> = {},
): PagesFunctionContext<TensiftEnvironment> {
  return {
    request: new Request('https://tensift.test/ads.txt'),
    env: {},
    params: {},
    next: async () => new Response(null, { status: 404 }),
    ...overrides,
  };
}
