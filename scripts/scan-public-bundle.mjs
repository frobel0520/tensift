import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const distRoot = join(projectRoot, 'dist');
const contentRoot = join(projectRoot, 'content', 'puzzles');
// Reveal DTO field names are part of the typed client contract. The scanner
// guards the actual authored answer values instead of treating protocol names
// as leaks, so a reveal request can be implemented without shipping answers.
//
// Answer values are matched on word boundaries, not as bare substrings. Short
// group labels are ordinary words — the label "Sour" is a substring of the UI
// string "Sources" — and a substring scan turns every such collision into a
// build failure that is fixed by contorting the content. A real leak ships the
// value as its own string literal, so the quotes around it provide the
// boundaries this still catches.
const forbiddenTokens = new Set([
  'solution_group_items',
  ...(await collectAnswerValues(contentRoot)),
]);

const matchers = [...forbiddenTokens].map((token) => ({ token, pattern: wordBoundaryPattern(token) }));
const files = await collectFiles(distRoot);
const findings = [];

for (const filePath of files) {
  const contents = await readFile(filePath, 'utf8');
  for (const { token, pattern } of matchers) {
    if (pattern.test(contents)) {
      findings.push(`${filePath}: ${token}`);
    }
  }
}

/** Matches the token only when it is not glued to another letter or digit. */
function wordBoundaryPattern(token) {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, 'u');
}

async function collectAnswerValues(directory) {
  const files = await collectFiles(directory);
  const values = new Set();

  for (const filePath of files) {
    if (!filePath.endsWith('.json')) {
      continue;
    }
    const puzzle = JSON.parse(await readFile(filePath, 'utf8'));
    values.add(puzzle.solution.hiddenDimension);
    for (const group of puzzle.solution.groups) {
      values.add(group.label);
    }
    values.add(puzzle.explanation);
    for (const source of puzzle.sources) {
      values.add(source.title);
    }
  }

  return [...values].filter((value) => typeof value === 'string' && value.length >= 4);
}

if (findings.length > 0) {
  console.error('Public bundle leak scan failed:');
  console.error(findings.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Public bundle leak scan passed (${files.length} file${files.length === 1 ? '' : 's'}).`);
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(entryPath));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}
