import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertValidAuthoringPuzzle } from '../src/domain/puzzle/validator.ts';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const puzzleRoot = join(projectRoot, 'content', 'puzzles');
const puzzleFiles = await collectJsonFiles(puzzleRoot);

for (const filePath of puzzleFiles) {
  const fileLabel = relative(projectRoot, filePath);
  let puzzle: unknown;

  try {
    puzzle = JSON.parse(await readFile(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`${fileLabel} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }

  assertValidAuthoringPuzzle(puzzle, fileLabel);
}

console.log(`Puzzle validation passed (${puzzleFiles.length} file${puzzleFiles.length === 1 ? '' : 's'}).`);

async function collectJsonFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectJsonFiles(entryPath));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(entryPath);
    }
  }

  return files;
}
