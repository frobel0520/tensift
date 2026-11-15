import { describe, expect, it } from 'vitest';
import { checkCandidateBatch } from '../../scripts/check-candidate-batch.mjs';

describe('promoted batch-7 records', () => {
  it('keeps all 21 puzzles structurally aligned, scheduled, and blind-unverified', async () => {
    expect(await checkCandidateBatch()).toEqual({ families: 7, puzzles: 21, status: 'scheduled', blindPlaytest: 'pending' });
  });
});
