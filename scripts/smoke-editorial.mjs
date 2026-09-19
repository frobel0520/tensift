import assert from 'node:assert/strict';

const baseUrl = process.argv[2] ?? 'http://127.0.0.1:8788';
const origin = new URL(baseUrl).origin;
const canonicalOrigin = 'https://tensift.pages.dev';

async function get(path) {
  return fetch(`${origin}${path}`, { signal: AbortSignal.timeout(15_000) });
}

const sitemap = await get('/sitemap.xml');
assert.equal(sitemap.status, 200, 'sitemap must be available');
const xml = await sitemap.text();
const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => {
  const url = new URL(match[1]);
  assert.equal(url.origin, canonicalOrigin);
  return url.pathname;
});
assert.ok(paths.length >= 13, 'sitemap must contain home and all three locale page sets');

for (const path of paths) {
  const response = await get(path);
  assert.equal(response.status, 200, path);
  assert.match(response.headers.get('content-type') ?? '', /text\/html/, path);
  const html = await response.text();
  assert.ok(html.includes('<h1>'), `${path}: HTML must contain readable content`);
  assert.ok(html.includes('/learn/'), `${path}: HTML must contain navigation`);
  assert.ok(!html.includes('adsbygoogle'), `${path}: no ad units or scripts`);
  if (path.startsWith('/learn/')) {
    assert.ok(!html.includes('<script'), `${path}: editorial content must work without scripts`);
    assert.ok(html.includes(`rel="canonical" href="${canonicalOrigin}${path}"`), path);
  } else {
    for (const match of html.matchAll(/<script[^>]+src="([^\"]+)"/g)) {
      const scriptUrl = new URL(match[1], origin);
      assert.equal(scriptUrl.origin, origin, 'game scripts must be same-origin');
      const script = await get(scriptUrl.pathname);
      assert.equal(script.status, 200);
      assert.ok(!(await script.text()).includes('adsbygoogle'), 'game bundle must not load advertising');
    }
  }
}
for (const path of ['/learn/fr/archive', '/learn/en/archive/not-a-puzzle']) {
  assert.equal((await get(path)).status, 404, path);
}
assert.equal((await get('/learn.css')).status, 200);
assert.ok((await (await get('/robots.txt')).text()).includes(`${canonicalOrigin}/sitemap.xml`));
console.log(`Editorial HTTP smoke passed: ${paths.length} sitemap pages, stylesheet, robots and 404 routes.`);
