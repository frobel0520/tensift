import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { SiteNavigation } from '../../src/ui/site-navigation';
import { SUPPORTED_LOCALES } from '../../shared/contracts';
import { archiveCatalog } from '../../server/editorial/catalog';
import { escapeHtml, renderEditorial, renderSitemap } from '../../server/editorial/render';

const now = new Date('2026-09-19T08:00:00Z');
const request = (path: string) => new Request(`https://tensift.pages.dev${path}`);

describe('public editorial pages', () => {
  for (const locale of SUPPORTED_LOCALES) {
    it(`serves readable, localized HTML and navigable links for ${locale}`, async () => {
      const navigation = renderToStaticMarkup(createElement(SiteNavigation, { locale }));
      expect(navigation).toContain(`/learn/${locale}/archive`);
      for (const slug of ['how-to-play', 'archive', 'about', 'privacy', 'archive/countries', 'archive/animals', 'archive/instruments']) {
        const path = `/learn/${locale}/${slug}`;
        const response = renderEditorial(request(path), now);
        const html = await response.text();
        expect(response.status).toBe(200);
        expect(response.headers.get('Content-Type')).toContain('text/html');
        expect(response.headers.get('Content-Security-Policy')).toContain("default-src 'none'");
        expect(html).toContain(`<html lang="${locale}">`);
        expect(html).toContain(`rel="canonical" href="https://tensift.pages.dev${path}"`);
        expect(html).not.toContain('<script');
        expect(html).not.toContain('adsbygoogle');
        // Every internal editorial navigation link resolves without a SPA fallback.
        for (const match of html.matchAll(/href="(\/learn\/[^"#]+)"/g)) {
          expect(renderEditorial(request(match[1]), now).status, match[1]).toBe(200);
        }
      }
    });
  }

  it('does not publish an answer until the day after its UTC play date', async () => {
    const path = '/learn/en/archive/animals';
    for (const instant of ['2026-08-29T23:59:59Z', '2026-08-30T00:00:00Z', '2026-08-30T23:59:59Z']) {
      const at = new Date(instant);
      expect(renderEditorial(request(path), at).status).toBe(404);
      expect(await renderEditorial(request('/learn/en/archive'), at).text()).not.toContain('archive/animals');
      expect(await renderSitemap(at).text()).not.toContain('archive/animals');
    }
    expect(renderEditorial(request(path), new Date('2026-08-31T00:00:00Z')).status).toBe(200);
  });

  it('only publishes explicitly selected historical solutions', async () => {
    expect(Object.keys(archiveCatalog)).toEqual(['countries', 'animals', 'instruments']);
    for (const path of ['/learn/en/archive/animal-covering', '/learn/en/archive/future', '/learn/fr/archive', '/learn/en/unknown', '/learn/en/archive/animals/extra']) {
      const response = renderEditorial(request(path), now);
      expect(response.status).toBe(404);
      expect(await response.text()).toContain('noindex');
    }
    const html = await renderEditorial(request('/learn/en/archive/animals'), now).text();
    for (const item of archiveCatalog.animals.en.items) expect(html).toContain(item.label);
    expect(html).toContain('phylogenetic');
  });

  it('lists only real pages in the sitemap and canonicalizes trailing slashes', async () => {
    const sitemap = await renderSitemap(now).text();
    const urls = [...sitemap.matchAll(/<loc>https:\/\/tensift.pages.dev([^<]+)<\/loc>/g)].map((match) => match[1]);
    expect(urls).toHaveLength(22);
    for (const path of urls.filter((path) => path !== '/')) expect(renderEditorial(request(path), now).status).toBe(200);
    const redirect = renderEditorial(request('/learn/en/archive/'), now);
    expect(redirect.status).toBe(308);
    expect(redirect.headers.get('Location')).toBe('/learn/en/archive');
  });

  it('escapes text rather than interpreting authored markup', () => {
    expect(escapeHtml('<script>"a" & \'b\'</script>')).toBe('&lt;script&gt;&quot;a&quot; &amp; &#39;b&#39;&lt;/script&gt;');
  });
});
