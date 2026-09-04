/**
 * Content runway alarm.
 *
 * Counts how many consecutive UTC dates from today forward have a complete set
 * of authored puzzles (one per locale) under `content/puzzles/`. The runway is
 * the first gap, not the total file count: a locale missing one day ends the
 * runway there, because that is the day the daily release breaks.
 *
 * Filenames are not authoritative for the date. Several files carry a name
 * whose date differs from the `publishDate` field they contain, so this reads
 * the field.
 *
 * Usage: node scripts/check-content-runway.mjs [--min-days <n>] [--date <YYYY-MM-DD>]
 */

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const LOCALES = ['en', 'zh-Hans', 'es-419'];
const DEFAULT_MIN_DAYS = 14;

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const contentRoot = join(projectRoot, 'content', 'puzzles');

const options = parseArgs(process.argv.slice(2));
const today = options.date ?? currentUtcDate();

const coverage = await collectCoverage();
const runway = measureRunway(coverage, today);

console.log(`Content runway from ${today}: ${runway.days} complete day(s).`);
if (runway.days > 0) {
  console.log(`Last fully covered date: ${runway.lastCoveredDate}.`);
}

if (runway.gapDate) {
  const missing = LOCALES.filter((locale) => !coverage.get(runway.gapDate)?.has(locale));
  console.log(
    `First incomplete date: ${runway.gapDate} (missing: ${missing.join(', ') || 'all locales'}).`,
  );
}

if (runway.days < options.minDays) {
  console.error(
    `\nRunway is below the ${options.minDays}-day threshold. ` +
      'Author and review the next content batch before the buffer runs out.',
  );
  process.exit(1);
}

console.log(`\nRunway meets the ${options.minDays}-day threshold.`);

/** Map of publishDate -> set of locales that have an authored puzzle. */
async function collectCoverage() {
  const byDate = new Map();
  const files = await collectJsonFiles(contentRoot);

  for (const filePath of files) {
    const puzzle = JSON.parse(await readFile(filePath, 'utf8'));
    const { publishDate, locale } = puzzle;
    if (typeof publishDate !== 'string' || typeof locale !== 'string') {
      throw new Error(`${filePath} is missing publishDate or locale.`);
    }
    if (!byDate.has(publishDate)) {
      byDate.set(publishDate, new Set());
    }
    byDate.get(publishDate).add(locale);
  }

  return byDate;
}

function measureRunway(coverage, startDate) {
  let days = 0;
  let cursor = startDate;
  let lastCoveredDate = null;

  // Bounded so a malformed date can never spin forever.
  for (let step = 0; step < 3650; step += 1) {
    const locales = coverage.get(cursor);
    const complete = locales && LOCALES.every((locale) => locales.has(locale));
    if (!complete) {
      return { days, lastCoveredDate, gapDate: cursor };
    }
    days += 1;
    lastCoveredDate = cursor;
    cursor = addDays(cursor, 1);
  }

  return { days, lastCoveredDate, gapDate: null };
}

async function collectJsonFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectJsonFiles(entryPath)));
    } else if (entry.name.endsWith('.json')) {
      files.push(entryPath);
    }
  }

  return files;
}

function addDays(isoDate, amount) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

function currentUtcDate() {
  return new Date().toISOString().slice(0, 10);
}

function parseArgs(argv) {
  let minDays = Number(process.env.CONTENT_RUNWAY_MIN_DAYS ?? DEFAULT_MIN_DAYS);
  let date;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--min-days') {
      minDays = Number(requireValue(argv, index, '--min-days'));
      index += 1;
    } else if (argument === '--date') {
      date = requireValue(argv, index, '--date');
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  if (!Number.isInteger(minDays) || minDays < 0) {
    throw new Error('--min-days requires a non-negative integer.');
  }

  return { minDays, date };
}

function requireValue(argv, index, flag) {
  const value = argv[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`${flag} requires a value.`);
  }
  return value;
}
