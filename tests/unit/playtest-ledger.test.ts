import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { AuthoringPuzzleRecord } from '../../src/domain/puzzle/authoring';

const projectRoot = new URL('../../', import.meta.url).pathname;
const puzzleRoot = join(projectRoot, 'content', 'puzzles', 'en');
const ledgerRoot = join(projectRoot, 'content', 'playtest');

/** Families before this date predate the guard and are tracked as backlog. */
const AUTHOR_REVIEW_FROM = '2026-09-28';

interface CheckedAlternate {
  readonly itemId: string;
  readonly rivalGroupId: string;
  readonly risk: string;
  readonly resolution: string;
}

interface PlaytestLedger {
  readonly schemaVersion: number;
  readonly puzzleFamilyId: string;
  readonly publishDate: string;
  readonly authorReview: {
    readonly reviewedAt: string;
    readonly verdict: string;
    readonly checkedAlternates: readonly CheckedAlternate[];
  };
  readonly blindPlaytest: { readonly status: string; readonly testers: number };
}

const puzzles = await loadJson<AuthoringPuzzleRecord>(puzzleRoot);
const ledgers = await loadJson<PlaytestLedger>(ledgerRoot);
const puzzleByFamily = new Map(puzzles.map((puzzle) => [puzzle.puzzleFamilyId, puzzle]));

describe('playtest ledgers', () => {
  it('covers every family scheduled from the enforcement date onward', () => {
    const covered = new Set(ledgers.map((ledger) => ledger.puzzleFamilyId));
    const uncovered = puzzles
      .filter((puzzle) => puzzle.publishDate >= AUTHOR_REVIEW_FROM)
      .filter((puzzle) => !covered.has(puzzle.puzzleFamilyId))
      .map((puzzle) => puzzle.puzzleFamilyId);

    expect(uncovered).toEqual([]);
  });

  it('records a passing author review with resolved alternates', () => {
    for (const ledger of ledgers) {
      expect(ledger.schemaVersion).toBe(1);
      expect(ledger.authorReview.verdict).toBe('pass');
      expect(ledger.authorReview.checkedAlternates.length).toBeGreaterThan(0);
      expect(['pending', 'pass', 'fail']).toContain(ledger.blindPlaytest.status);
    }
  });

  it('references items and rival groups that exist in the puzzle', () => {
    for (const ledger of ledgers) {
      const puzzle = puzzleByFamily.get(ledger.puzzleFamilyId);
      expect(puzzle, `no puzzle for ${ledger.puzzleFamilyId}`).toBeDefined();
      if (!puzzle) {
        continue;
      }

      expect(ledger.publishDate).toBe(puzzle.publishDate);

      const itemIds = new Set(puzzle.items.map((item) => item.itemId));
      const groupIds = new Set(puzzle.solution.groups.map((group) => group.groupId));
      const groupOfItem = new Map(
        puzzle.solution.groups.flatMap((group) => group.itemIds.map((itemId) => [itemId, group.groupId] as const)),
      );

      for (const alternate of ledger.authorReview.checkedAlternates) {
        expect(itemIds).toContain(alternate.itemId);
        expect(groupIds).toContain(alternate.rivalGroupId);
        // A rival that is the item's own group tests nothing.
        expect(groupOfItem.get(alternate.itemId)).not.toBe(alternate.rivalGroupId);
        expect(alternate.resolution.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

async function loadJson<T>(directory: string): Promise<T[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const records: T[] = [];

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.json')) {
      records.push(JSON.parse(await readFile(join(directory, entry.name), 'utf8')) as T);
    }
  }

  return records;
}
