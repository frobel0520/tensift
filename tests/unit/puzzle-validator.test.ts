import { describe, expect, it } from 'vitest';
import validPuzzle from '../../content/puzzles/en/countries-continent-2026-09-01-en.json';
import invalidPuzzle from '../fixtures/puzzles/invalid-capacity.json';
import { validateAuthoringPuzzle } from '../../src/domain/puzzle/validator';

describe('authoring puzzle validator', () => {
  it('accepts the first country puzzle fixture', () => {
    const result = validateAuthoringPuzzle(validPuzzle);

    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it('rejects duplicate membership in a solution partition fixture', () => {
    const result = validateAuthoringPuzzle(invalidPuzzle);

    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain('duplicate-group-item');
  });
});
