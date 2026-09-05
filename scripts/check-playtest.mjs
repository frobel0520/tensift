/**
 * Ambiguity guard for authored puzzles.
 *
 * A Tensift puzzle only works if its intended grouping is the *dominant*
 * reading of the ten items. Nothing in the schema can prove that, so the guard
 * is procedural: every family carries a review ledger under `content/playtest/`
 * that records which items were checked against which rival group, and how the
 * ambiguity was resolved.
 *
 * Two gates, deliberately at different strengths:
 *
 *   1. Author review (hard fail). Any family publishing on or after
 *      `--author-review-from` must have a ledger whose `authorReview.verdict`
 *      is `pass`, whose ids all resolve against the English puzzle, and whose
 *      `checkedAlternates` is non-empty. Families before that date are the
 *      pre-existing backlog: reported, not enforced, so the guard can land
 *      without rewriting history.
 *
 *   2. Blind playtest (reported; fails only with `--strict-blind`). Author
 *      review is the author grading their own homework — it catches the
 *      alternates you can see, not the ones a fresh player finds. The real
 *      signal is a blind tester, and no family has one yet. Reporting keeps
 *      the debt visible on every run; flip `--strict-blind` on once blind
 *      testing is actually running.
 *
 * Usage:
 *   node scripts/check-playtest.mjs [--date <YYYY-MM-DD>]
 *                                   [--author-review-from <YYYY-MM-DD>]
 *                                   [--blind-lead-days <n>] [--strict-blind]
 */

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_AUTHOR_REVIEW_FROM = '2026-09-28';
const DEFAULT_BLIND_LEAD_DAYS = 7;
const VERDICTS = ['pass', 'fail'];
const BLIND_STATUSES = ['pending', 'pass', 'fail'];

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const puzzleRoot = join(projectRoot, 'content', 'puzzles', 'en');
const ledgerRoot = join(projectRoot, 'content', 'playtest');

const options = parseArgs(process.argv.slice(2));
const today = options.date ?? currentUtcDate();

const families = await collectFamilies();
const ledgers = await collectLedgers();

const failures = [];
const warnings = [];

for (const [familyId] of ledgers) {
  if (!families.has(familyId)) {
    failures.push(`${familyId}: ledger has no matching puzzle in content/puzzles/en.`);
  }
}

const enforced = [];
const backlog = [];
const blindDebt = [];

for (const family of [...families.values()].sort((a, b) => a.publishDate.localeCompare(b.publishDate))) {
  const ledger = ledgers.get(family.puzzleFamilyId);
  const enforceAuthorReview = family.publishDate >= options.authorReviewFrom;

  if (enforceAuthorReview) {
    enforced.push(family);
    checkAuthorReview(family, ledger, failures);
  } else if (!ledger || ledger.authorReview?.verdict !== 'pass') {
    backlog.push(family);
  }

  const blindStatus = ledger?.blindPlaytest?.status ?? 'pending';
  if (blindStatus === 'fail') {
    failures.push(`${family.puzzleFamilyId}: blind playtest verdict is "fail"; the puzzle must be reworked or rescheduled.`);
  } else if (blindStatus !== 'pass') {
    const leadDays = daysBetween(today, family.publishDate);
    if (leadDays >= 0 && leadDays <= options.blindLeadDays) {
      blindDebt.push({ family, leadDays });
    }
  }
}

console.log(`Playtest ledger check for ${today}.`);
console.log(`Families: ${families.size}. Ledgers: ${ledgers.size}.`);
console.log(`Author review enforced from ${options.authorReviewFrom} (${enforced.length} famil${enforced.length === 1 ? 'y' : 'ies'}).`);

if (backlog.length > 0) {
  console.log(`\nAuthor-review backlog (published before the enforcement date, not blocking): ${backlog.length}`);
  for (const family of backlog) {
    console.log(`  - ${family.puzzleFamilyId} (${family.publishDate}, ${family.theme})`);
  }
}

if (blindDebt.length > 0) {
  const lines = blindDebt.map(
    ({ family, leadDays }) =>
      `  - ${family.puzzleFamilyId} (${family.theme}) publishes ${family.publishDate}, in ${leadDays} day(s)`,
  );
  const header = `Blind playtest missing within ${options.blindLeadDays} day(s) of release: ${blindDebt.length}`;
  if (options.strictBlind) {
    failures.push(`${header}\n${lines.join('\n')}`);
  } else {
    warnings.push(`${header}\n${lines.join('\n')}`);
  }
}

for (const warning of warnings) {
  console.warn(`\nWARNING: ${warning}`);
}

if (failures.length > 0) {
  console.error(`\n${failures.length} problem(s):`);
  for (const failure of failures) {
    console.error(`  ! ${failure}`);
  }
  process.exit(1);
}

console.log('\nPlaytest ledger check passed.');

function checkAuthorReview(family, ledger, sink) {
  const id = family.puzzleFamilyId;

  if (!ledger) {
    sink.push(`${id} (${family.publishDate}): no ledger at content/playtest/${id}.json.`);
    return;
  }

  if (ledger.publishDate !== family.publishDate) {
    sink.push(`${id}: ledger publishDate ${ledger.publishDate} does not match the puzzle's ${family.publishDate}.`);
  }

  const review = ledger.authorReview;
  if (!isRecord(review)) {
    sink.push(`${id}: ledger is missing authorReview.`);
    return;
  }

  if (!VERDICTS.includes(review.verdict)) {
    sink.push(`${id}: authorReview.verdict must be one of ${VERDICTS.join(', ')}.`);
  } else if (review.verdict !== 'pass') {
    sink.push(`${id}: authorReview.verdict is "${review.verdict}"; the puzzle is not releasable.`);
  }

  if (!isIsoDate(review.reviewedAt)) {
    sink.push(`${id}: authorReview.reviewedAt must use YYYY-MM-DD.`);
  }

  if (!Array.isArray(review.checkedAlternates) || review.checkedAlternates.length === 0) {
    sink.push(`${id}: authorReview.checkedAlternates must list at least one item that was tested against a rival group.`);
    return;
  }

  review.checkedAlternates.forEach((entry, index) => {
    const path = `${id}.authorReview.checkedAlternates[${index}]`;
    if (!isRecord(entry)) {
      sink.push(`${path}: must be an object.`);
      return;
    }
    if (!family.itemIds.has(entry.itemId)) {
      sink.push(`${path}: itemId "${entry.itemId}" is not in the puzzle.`);
    }
    if (!family.groupIds.has(entry.rivalGroupId)) {
      sink.push(`${path}: rivalGroupId "${entry.rivalGroupId}" is not a group in the puzzle.`);
    }
    if (family.groupOfItem.get(entry.itemId) === entry.rivalGroupId) {
      sink.push(`${path}: rivalGroupId is the item's own group, so nothing was actually tested.`);
    }
    if (!isNonEmptyString(entry.resolution)) {
      sink.push(`${path}: resolution must say why the intended group wins.`);
    }
  });

  const blind = ledger.blindPlaytest;
  if (!isRecord(blind) || !BLIND_STATUSES.includes(blind.status)) {
    sink.push(`${id}: blindPlaytest.status must be one of ${BLIND_STATUSES.join(', ')}.`);
  } else if (blind.status === 'pass' && !(Number.isInteger(blind.testers) && blind.testers >= 2)) {
    sink.push(`${id}: a blind playtest pass needs at least 2 testers.`);
  }
}

async function collectFamilies() {
  const byFamily = new Map();
  const entries = await readdir(puzzleRoot, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) {
      continue;
    }

    const puzzle = JSON.parse(await readFile(join(puzzleRoot, entry.name), 'utf8'));
    const groupOfItem = new Map();
    for (const group of puzzle.solution.groups) {
      for (const itemId of group.itemIds) {
        groupOfItem.set(itemId, group.groupId);
      }
    }

    byFamily.set(puzzle.puzzleFamilyId, {
      puzzleFamilyId: puzzle.puzzleFamilyId,
      publishDate: puzzle.publishDate,
      theme: puzzle.theme,
      itemIds: new Set(puzzle.items.map((item) => item.itemId)),
      groupIds: new Set(puzzle.solution.groups.map((group) => group.groupId)),
      groupOfItem,
    });
  }

  return byFamily;
}

async function collectLedgers() {
  const byFamily = new Map();
  let entries;

  try {
    entries = await readdir(ledgerRoot, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return byFamily;
    }
    throw error;
  }

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) {
      continue;
    }

    const filePath = join(ledgerRoot, entry.name);
    const ledger = JSON.parse(await readFile(filePath, 'utf8'));
    const expectedName = `${ledger.puzzleFamilyId}.json`;
    if (entry.name !== expectedName) {
      throw new Error(`content/playtest/${entry.name} declares ${ledger.puzzleFamilyId}; rename it to ${expectedName}.`);
    }
    byFamily.set(ledger.puzzleFamilyId, ledger);
  }

  return byFamily;
}

function daysBetween(fromIsoDate, toIsoDate) {
  const from = Date.parse(`${fromIsoDate}T00:00:00Z`);
  const to = Date.parse(`${toIsoDate}T00:00:00Z`);
  return Math.round((to - from) / 86_400_000);
}

function currentUtcDate() {
  return new Date().toISOString().slice(0, 10);
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isIsoDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function parseArgs(argv) {
  let date;
  let authorReviewFrom = process.env.PLAYTEST_AUTHOR_REVIEW_FROM ?? DEFAULT_AUTHOR_REVIEW_FROM;
  let blindLeadDays = Number(process.env.PLAYTEST_BLIND_LEAD_DAYS ?? DEFAULT_BLIND_LEAD_DAYS);
  let strictBlind = false;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--date') {
      date = requireValue(argv, index, '--date');
      index += 1;
    } else if (argument === '--author-review-from') {
      authorReviewFrom = requireValue(argv, index, '--author-review-from');
      index += 1;
    } else if (argument === '--blind-lead-days') {
      blindLeadDays = Number(requireValue(argv, index, '--blind-lead-days'));
      index += 1;
    } else if (argument === '--strict-blind') {
      strictBlind = true;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  if (date !== undefined && !isIsoDate(date)) {
    throw new Error('--date requires YYYY-MM-DD.');
  }

  if (!isIsoDate(authorReviewFrom)) {
    throw new Error('--author-review-from requires YYYY-MM-DD.');
  }

  if (!Number.isInteger(blindLeadDays) || blindLeadDays < 0) {
    throw new Error('--blind-lead-days requires a non-negative integer.');
  }

  return { date, authorReviewFrom, blindLeadDays, strictBlind };
}

function requireValue(argv, index, flag) {
  const value = argv[index + 1];
  if (value === undefined) {
    throw new Error(`${flag} requires a value.`);
  }
  return value;
}
