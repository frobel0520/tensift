/**
 * Production smoke check for the deployed daily release.
 *
 * The `today` endpoint selects purely by `publish_date = <current UTC date>`,
 * so a missing record for one locale is invisible until a player hits it. This
 * script is the daily guard: it runs after the UTC date rolls over and fails
 * loudly if any locale has no playable puzzle, or if the safe DTO ever starts
 * carrying answer fields.
 *
 * Usage: node scripts/smoke-production.mjs [--base-url <origin>] [--date <YYYY-MM-DD>]
 */

const LOCALES = ['en', 'zh-Hans', 'es-419'];
const DEFAULT_BASE_URL = 'https://tensift.pages.dev';
const REQUEST_TIMEOUT_MS = 15_000;

const options = parseArgs(process.argv.slice(2));
const baseUrl = options.baseUrl.replace(/\/+$/, '');
const expectedDate = options.date ?? currentUtcDate();
const failures = [];

console.log(`Smoke checking ${baseUrl} for UTC date ${expectedDate}.`);

await checkHealth();
for (const locale of LOCALES) {
  await checkToday(locale);
}

if (failures.length > 0) {
  console.error(`\n${failures.length} smoke check failure(s):`);
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log('\nAll smoke checks passed.');

async function checkHealth() {
  const url = `${baseUrl}/api/health`;
  const response = await request(url);
  if (!response) {
    return;
  }

  if (response.status !== 200) {
    failures.push(`${url} returned HTTP ${response.status}, expected 200.`);
    return;
  }

  const body = response.body;
  if (body?.status !== 'ok') {
    failures.push(`${url} reported status "${body?.status}", expected "ok".`);
  }
  if (body?.puzzleCatalogVersion !== 'd1') {
    failures.push(
      `${url} reported puzzleCatalogVersion "${body?.puzzleCatalogVersion}", expected "d1". ` +
        'An "empty" value means the D1 catalog has no puzzles at all.',
    );
  }
  if (failures.length === 0) {
    console.log(`  ok  ${url}`);
  }
}

async function checkToday(locale) {
  const url = `${baseUrl}/api/v1/puzzles/today?locale=${encodeURIComponent(locale)}`;
  const before = failures.length;
  const response = await request(url);
  if (!response) {
    return;
  }

  if (response.status !== 200) {
    failures.push(
      `${url} returned HTTP ${response.status}, expected 200. ` +
        `There is probably no ${locale} record scheduled for ${expectedDate}.`,
    );
    return;
  }

  const puzzle = response.body;

  if (puzzle?.publishDate !== expectedDate) {
    failures.push(
      `${url} served publishDate "${puzzle?.publishDate}", expected "${expectedDate}".`,
    );
  }
  if (puzzle?.locale !== locale) {
    failures.push(`${url} served locale "${puzzle?.locale}", expected "${locale}".`);
  }
  if (!Array.isArray(puzzle?.items) || puzzle.items.length !== 10) {
    failures.push(`${url} served ${puzzle?.items?.length} items, expected 10.`);
  }
  if (!Array.isArray(puzzle?.rows) || puzzle.rows.length !== 4) {
    failures.push(`${url} served ${puzzle?.rows?.length} rows, expected 4.`);
  }

  // The safe DTO is the answer-leakage boundary. Assert it directly rather
  // than trusting the projection to stay correct.
  for (const forbidden of ['solution', 'hiddenDimension', 'explanation']) {
    if (puzzle !== null && typeof puzzle === 'object' && forbidden in puzzle) {
      failures.push(`${url} leaked answer field "${forbidden}" in the safe DTO.`);
    }
  }

  if (failures.length === before) {
    console.log(`  ok  ${url} (${puzzle.theme})`);
  }
}

async function request(url) {
  try {
    const response = await fetch(url, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const text = await response.text();
    let body = null;
    try {
      body = JSON.parse(text);
    } catch {
      failures.push(`${url} returned a non-JSON body: ${text.slice(0, 200)}`);
      return null;
    }
    return { status: response.status, body };
  } catch (error) {
    failures.push(`${url} could not be reached: ${error.message}`);
    return null;
  }
}

function currentUtcDate() {
  return new Date().toISOString().slice(0, 10);
}

function parseArgs(argv) {
  let baseUrl = process.env.SMOKE_BASE_URL ?? DEFAULT_BASE_URL;
  let date;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--base-url') {
      baseUrl = requireValue(argv, index, '--base-url');
      index += 1;
    } else if (argument === '--date') {
      date = requireValue(argv, index, '--date');
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  return { baseUrl, date };
}

function requireValue(argv, index, flag) {
  const value = argv[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`${flag} requires a value.`);
  }
  return value;
}
