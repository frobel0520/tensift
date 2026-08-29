import { describe, expect, it } from 'vitest';
import countriesFixture from '../../content/puzzles/en/countries-continent-2026-09-01-en.json';
import type { Locale, RowId, SafePuzzleDto } from '../../src/api/contracts';
import {
  loadSession,
  parseSession,
  saveSession,
  serializeSession,
  sessionStorageKey,
} from '../../src/domain/game/session';

const puzzle = countriesFixture as unknown as SafePuzzleDto;

describe('game session persistence', () => {
  it('round-trips only public gameplay state', () => {
    const placements = new Map<RowId, readonly string[]>([
      ['row-1', ['country-australia']],
      ['row-2', ['country-brazil']],
    ]);
    const raw = serializeSession({
      puzzle,
      placements,
      lockedItemIds: new Set(['country-australia']),
      attempts: 2,
      hintUsed: true,
      solved: false,
    }, '2026-08-29T00:00:00.000Z');

    const parsed = parseSession(raw, puzzle);
    expect(parsed).toMatchObject({
      schemaVersion: 1,
      puzzleId: puzzle.puzzleId,
      locale: 'en',
      attempts: 2,
      hintUsed: true,
      solved: false,
      updatedAt: '2026-08-29T00:00:00.000Z',
    });
    expect(parsed?.placements).toEqual({
      'row-1': ['country-australia'],
      'row-2': ['country-brazil'],
    });
    expect(JSON.stringify(parsed)).not.toContain('solution');
  });

  it('rejects answer-shaped, unknown, duplicate, and over-capacity data', () => {
    const base = {
      schemaVersion: 1,
      puzzleId: puzzle.puzzleId,
      locale: puzzle.locale,
      placements: { 'row-1': ['country-australia'] },
      lockedItemIds: [],
      attempts: 0,
      hintUsed: false,
      solved: false,
      updatedAt: '2026-08-29T00:00:00.000Z',
    };

    expect(parseSession(JSON.stringify({ ...base, solution: {} }), puzzle)).toBeNull();
    expect(parseSession(JSON.stringify({ ...base, placements: { 'row-1': ['not-an-item'] } }), puzzle)).toBeNull();
    expect(parseSession(JSON.stringify({ ...base, placements: { 'row-1': ['country-australia'], 'row-2': ['country-australia'] } }), puzzle)).toBeNull();
    expect(parseSession(JSON.stringify({
      ...base,
      placements: {
        'row-1': ['country-australia', 'country-brazil'],
      },
    }), puzzle)).toBeNull();
    expect(parseSession(JSON.stringify({ ...base, lockedItemIds: ['country-france'] }), puzzle)).toBeNull();
    expect(parseSession(JSON.stringify({ ...base, solved: true }), puzzle)).toBeNull();
  });

  it('uses a locale and puzzle-specific storage key', () => {
    const storage = new MemoryStorage();
    const input = {
      puzzle,
      placements: new Map<RowId, readonly string[]>(),
      lockedItemIds: new Set<string>(),
      attempts: 0,
      hintUsed: false,
      solved: false,
    };

    expect(sessionStorageKey('en', puzzle.puzzleId)).toContain(`:en:${puzzle.puzzleId}`);
    expect(saveSession(storage, input)).toBe(true);
    expect(loadSession(storage, puzzle)?.locale).toBe('en' satisfies Locale);
  });
});

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  public get length(): number {
    return this.values.size;
  }

  public clear(): void {
    this.values.clear();
  }

  public getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  public key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }

  public removeItem(key: string): void {
    this.values.delete(key);
  }

  public setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}
