import { afterEach, describe, expect, it } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { collectCoverage, measureRunway } from '../../scripts/check-content-runway.mjs';

const roots: string[] = [];
afterEach(async () => { await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true }))); });
async function fixture(records: unknown[]) {
  const root = await mkdtemp(join(tmpdir(), 'tensift-runway-')); roots.push(root);
  await Promise.all(records.map((record, index) => writeFile(join(root, `${index}.json`), JSON.stringify(record))));
  return root;
}
const locales = ['en', 'zh-Hant', 'es-419'];
const date = '2026-11-22';

describe('publishable content runway', () => {
  it.each(['draft', 'reviewed', 'retired'])('does not count %s content as a ready day', async status => {
    const root = await fixture(locales.map(locale => ({ locale, publishDate: date, status })));
    expect(measureRunway(await collectCoverage(root), date)).toEqual({ days: 0, lastCoveredDate: null, gapDate: date });
  });
  it('counts scheduled/published locales, stops at a gap and ignores later complete dates', async () => {
    const root = await fixture([date, '2026-11-24'].flatMap(publishDate => locales.map((locale, index) => ({ locale, publishDate, status: index ? 'scheduled' : 'published' }))));
    expect(measureRunway(await collectCoverage(root), date)).toEqual({ days: 1, lastCoveredDate: date, gapDate: '2026-11-23' });
  });
  it('does not let two ready locales and one draft disguise a missing locale', async () => {
    const root = await fixture(locales.map((locale, index) => ({ locale, publishDate: date, status: index === 2 ? 'draft' : 'scheduled' })));
    expect(measureRunway(await collectCoverage(root), date).days).toBe(0);
  });
  it.each([{ locale: 'xx', publishDate: date, status: 'scheduled' }, { locale: 'en', publishDate: '2026-02-30', status: 'scheduled' },
    { locale: 'en', publishDate: date, status: 'unknown' }])('rejects malformed authored coverage %j', async row => {
    await expect(collectCoverage(await fixture([row]))).rejects.toThrow('invalid');
  });
  it.each(['2026-02-30', 'not-a-date', '2026-1-01'])('rejects invalid start date %s', value => {
    expect(() => measureRunway(new Map(), value)).toThrow('real YYYY-MM-DD');
  });
});
