import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Locale } from '../shared/contracts.js';
import type { AuthoringPuzzleRecord } from '../src/domain/puzzle/authoring.js';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const contentRoot = join(projectRoot, 'content', 'puzzles');
const outputDir = join(projectRoot, 'src', 'data');
const LOCALES: readonly Locale[] = ['en', 'zh-Hant', 'es-419'];

export interface StandaloneLevelEntry {
  readonly level: number;
  readonly puzzle: AuthoringPuzzleRecord;
}

function loadLocalePuzzles(locale: Locale): AuthoringPuzzleRecord[] {
  const dir = join(contentRoot, locale);
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
  return files.map((file) => JSON.parse(readFileSync(join(dir, file), 'utf8')) as AuthoringPuzzleRecord);
}

// Sort deterministically: original 81+ early levels (<= 2026-11-21) first by publishDate,
// then curated expansion levels by difficulty score ascending and publishDate.
const enPuzzles = loadLocalePuzzles('en');
enPuzzles.sort((a, b) => {
  const aOrig = a.publishDate <= '2026-11-21' ? 0 : 1;
  const bOrig = b.publishDate <= '2026-11-21' ? 0 : 1;
  if (aOrig !== bOrig) return aOrig - bOrig;
  if (aOrig === 0) return a.publishDate.localeCompare(b.publishDate);
  return (a.difficulty.score - b.difficulty.score) || a.publishDate.localeCompare(b.publishDate);
});

const levelByFamilyId = new Map<string, number>();
enPuzzles.forEach((puzzle, idx) => {
  levelByFamilyId.set(puzzle.puzzleFamilyId, idx + 1);
});

mkdirSync(outputDir, { recursive: true });

for (const locale of LOCALES) {
  const puzzles = loadLocalePuzzles(locale);
  const entries: StandaloneLevelEntry[] = puzzles
    .map((puzzle) => {
      const level = levelByFamilyId.get(puzzle.puzzleFamilyId);
      if (level === undefined) {
        throw new Error(`Missing level mapping for ${puzzle.puzzleFamilyId} (${locale})`);
      }
      return { level, puzzle };
    })
    .sort((a, b) => a.level - b.level);

  const outPath = join(outputDir, `catalog-${locale}.json`);
  writeFileSync(outPath, JSON.stringify(entries), 'utf8');
  console.log(`Generated ${outPath} (${entries.length} levels)`);
}
