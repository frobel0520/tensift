import { readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertValidAuthoringPuzzle } from '../src/domain/puzzle/validator.ts';

export async function checkCandidateBatch(root = fileURLToPath(new URL('../content/candidates/batch-7', import.meta.url))) {
  const manifest = JSON.parse(await readFile(join(root, 'manifest.json'), 'utf8'));
  if (manifest.status !== 'draft-candidates-only' || manifest.families.length !== 7) throw Error('INVALID_CANDIDATE_MANIFEST');
  const seen = new Set();
  let previousDate;
  let count = 0;
  for (const family of manifest.families) {
    const locales = new Set();
    let canonical;
    if (family.blindPlaytest.status !== 'pending' || family.blindPlaytest.testers !== 0) throw Error('UNVERIFIED_BLIND_CLAIM');
    for (const file of family.files) {
      if (!/^(en|zh-Hant|es-419)\/[a-zA-Z0-9-]+\.json$/.test(file)) throw Error('INVALID_CANDIDATE_PATH');
      const puzzle = JSON.parse(await readFile(join(root, file), 'utf8'));
      assertValidAuthoringPuzzle(puzzle, file);
      if (puzzle.status !== 'draft' || puzzle.publishDate !== family.proposedDate || puzzle.puzzleFamilyId !== family.puzzleFamilyId) throw Error('INVALID_CANDIDATE_STATE');
      if (!file.startsWith(`${puzzle.locale}/`) || seen.has(puzzle.puzzleId) || locales.has(puzzle.locale)) throw Error('DUPLICATE_CANDIDATE');
      const structure = JSON.stringify({ ids: puzzle.items.map(item => item.itemId).sort(), groups: puzzle.solution.groups.map(group => ({ id: group.groupId, items: [...group.itemIds].sort() })) });
      if (canonical !== undefined && canonical !== structure) throw Error('LOCALE_SOLUTION_MISMATCH');
      canonical = structure; seen.add(puzzle.puzzleId); locales.add(puzzle.locale); count++;
    }
    if (locales.size !== 3) throw Error('MISSING_CANDIDATE_LOCALE');
    if (previousDate) {
      const next = new Date(`${previousDate}T00:00:00Z`); next.setUTCDate(next.getUTCDate() + 1);
      if (next.toISOString().slice(0, 10) !== family.proposedDate) throw Error('CANDIDATE_DATE_GAP');
    }
    previousDate = family.proposedDate;
  }
  return { families: manifest.families.length, puzzles: count, status: 'draft', blindPlaytest: 'pending' };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log('Candidate batch validated: ' + JSON.stringify(await checkCandidateBatch()));
}
