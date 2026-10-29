import { describe, expect, it } from 'vitest';
import { checkCandidateBatch } from '../../scripts/check-candidate-batch.mjs';

describe('isolated next-batch candidates', () => {
  it('keeps all 21 puzzles structurally aligned, draft-only and blind-unverified', async () => {
    expect(await checkCandidateBatch()).toEqual({ families: 7, puzzles: 21, status: 'draft', blindPlaytest: 'pending' });
  });
});
