import { describe, expect, it } from 'vitest';
import countriesFixture from '../../content/puzzles/en/countries-continent-2026-09-01-en.json';
import type { AuthoringPuzzleRecord } from '../../src/domain/puzzle/authoring';
import { chooseHintCandidate, evaluatePlacements } from '../../src/domain/puzzle/engine';

const countries = countriesFixture as unknown as AuthoringPuzzleRecord;

describe('puzzle domain engine', () => {
  it('solves a complete country placement by row capacity', () => {
    const result = evaluatePlacements(countries, new Map([
      ['row-1', ['country-australia']],
      ['row-2', ['country-brazil', 'country-argentina']],
      ['row-3', ['country-canada', 'country-mexico', 'country-united-states']],
      ['row-4', ['country-france', 'country-germany', 'country-italy', 'country-spain']],
    ]));

    expect(result.complete).toBe(true);
    expect(result.correctCount).toBe(10);
    expect(result.solved).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it('counts correct items without revealing which item is wrong', () => {
    const result = evaluatePlacements(countries, new Map([
      ['row-1', ['country-brazil']],
      ['row-2', ['country-australia', 'country-argentina']],
      ['row-3', ['country-canada', 'country-mexico', 'country-united-states']],
      ['row-4', ['country-france', 'country-germany', 'country-italy', 'country-spain']],
    ]));

    expect(result.complete).toBe(true);
    expect(result.correctCount).toBe(8);
    expect(result.solved).toBe(false);
    expect(result.issues).toEqual([]);
  });

  it('returns a deterministic eligible hint candidate', () => {
    const candidate = chooseHintCandidate(
      countries,
      new Map(),
      new Set(),
      () => 0,
    );

    expect(candidate).toEqual({ itemId: 'country-australia', rowId: 'row-1' });
  });

  it('does not hint an item that is already locked', () => {
    const candidate = chooseHintCandidate(
      countries,
      new Map(),
      new Set(['country-australia']),
      () => 0,
    );

    expect(candidate).toEqual({ itemId: 'country-brazil', rowId: 'row-2' });
  });
});
