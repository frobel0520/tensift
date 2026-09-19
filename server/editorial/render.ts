import { SUPPORTED_LOCALES, type Locale } from '../../shared/contracts';
import { editorialReferences, releasedArticles } from './catalog';
import { editorialCopy, type Section } from './copy';

const ORIGIN = 'https://tensift.pages.dev';
const PAGE_SLUGS = ['how-to-play', 'archive', 'about', 'privacy'] as const;
const LANGUAGE_NAMES = ['English', '简体中文', 'Español'];

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]!);
}

function renderSections(sections: readonly Section[]): string {
  return sections.map((section) => `<section><h2>${escapeHtml(section.heading)}</h2>${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</section>`).join('');
}

function pageHtml(locale: Locale, slug: string, title: string, description: string, body: string, notFound = false): string {
  const copy = editorialCopy[locale];
  const path = `/learn/${locale}/${slug}`;
  const links = PAGE_SLUGS.map((page, index) => `<a href="/learn/${locale}/${page}"${page === slug ? ' aria-current="page"' : ''}>${escapeHtml(copy.navigation[index + 1])}</a>`).join('');
  const languages = SUPPORTED_LOCALES.map((language, index) => `<a href="/learn/${language}/${notFound ? 'how-to-play' : slug}" lang="${language}" hreflang="${language}">${LANGUAGE_NAMES[index]}</a>`).join('');
  const alternates = notFound ? '' : SUPPORTED_LOCALES.map((language) => `<link rel="alternate" hreflang="${language}" href="${ORIGIN}/learn/${language}/${slug}">`).join('');
  return `<!doctype html>
<html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} · Tensift</title><meta name="description" content="${escapeHtml(description)}">
${notFound ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${ORIGIN}${path}">${alternates}`}
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/learn.css"></head>
<body><a class="skip" href="#content">${copy.skip}</a><div class="shell">
<header><a class="wordmark" href="/?lang=${locale}">Tensift</a><nav aria-label="Tensift"><a href="/?lang=${locale}">${copy.navigation[0]}</a>${links}</nav></header>
<main id="content"><p class="eyebrow">Tensift · ${copy.intro}</p><h1>${escapeHtml(title)}</h1>${body}</main>
<footer><nav class="languages" aria-label="Language">${languages}</nav><nav aria-label="${escapeHtml(copy.related)}">${links}</nav></footer>
</div></body></html>`;
}

function htmlResponse(html: string, status = 200): Response {
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      // Pages _headers applies to static assets, not Function responses.
      'Content-Security-Policy': "default-src 'none'; style-src 'self'; img-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
    },
  });
}

export function renderEditorial(request: Request, now = new Date()): Response {
  const pathname = new URL(request.url).pathname;
  const parts = pathname.split('/').filter(Boolean);
  const requestedLocale = parts[1];
  const locale: Locale = SUPPORTED_LOCALES.find((value) => value === requestedLocale) ?? 'en';
  const copy = editorialCopy[locale];
  const slug = parts.slice(2).join('/');
  const validLocale = locale === requestedLocale;
  const articles = releasedArticles(locale, now);
  let title = '';
  let body = '';
  if (validLocale && slug === 'how-to-play') {
    title = copy.navigation[1];
    body = renderSections(copy.howTo);
  } else if (validLocale && slug === 'about') {
    title = copy.navigation[3];
    body = renderSections(copy.about) + `<p><a href="https://github.com/frobel0520/tensift/issues">${copy.contact}</a></p>`;
  } else if (validLocale && slug === 'privacy') {
    title = copy.navigation[4];
    body = renderSections(copy.privacy) + `<ul><li><a href="https://www.cloudflare.com/privacypolicy/">Cloudflare — Privacy Policy</a></li><li><a href="https://policies.google.com/technologies/partner-sites">Google — Partner sites &amp; privacy</a></li><li><a href="https://github.com/frobel0520/tensift/issues">${copy.contact}</a></li></ul>`;
  } else if (validLocale && slug === 'archive') {
    title = copy.navigation[2];
    body = `<p>${copy.archiveIntro}</p><ul class="archive-list">${articles.map(([articleSlug, puzzle]) => `<li><time class="date" datetime="${puzzle.publishDate}">${puzzle.publishDate} · UTC</time><br><a href="/learn/${locale}/archive/${articleSlug}">${escapeHtml(puzzle.theme)}</a><p>${escapeHtml(copy.articles[articleSlug][0].heading)}</p></li>`).join('')}</ul>`;
  } else if (validLocale && slug.startsWith('archive/')) {
    const articleSlug = slug.slice('archive/'.length);
    const entry = articles.find(([candidate]) => candidate === articleSlug);
    if (entry) {
      const puzzle = entry[1];
      title = puzzle.theme;
      const itemLabels = new Map(puzzle.items.map((item) => [item.itemId, item.label]));
      const groups = puzzle.solution.groups.map((group) => `<li><strong>${group.capacity} · ${escapeHtml(group.label)}</strong><p>${group.itemIds.map((id) => escapeHtml(itemLabels.get(id)!)).join(' · ')}</p></li>`).join('');
      body = `<p class="date"><time datetime="${puzzle.publishDate}">${puzzle.publishDate}</time> · UTC</p><p>${copy.spoiler}</p><p>${puzzle.items.map((item) => escapeHtml(item.label)).join(' · ')}</p>
${renderSections(copy.articles[articleSlug])}<h2>${copy.answer}</h2><p>${escapeHtml(puzzle.explanation)}</p><ol class="groups">${groups}</ol>
<h2>${copy.references}</h2><ul>${[...puzzle.sources, ...editorialReferences[articleSlug]].map((source) => `<li><a href="${escapeHtml(source.url)}">${escapeHtml(source.title)}</a></li>`).join('')}</ul><p><a href="/learn/${locale}/archive">${copy.navigation[2]}</a></p>`;
    }
  }
  if (!title) {
    return htmlResponse(pageHtml(locale, 'how-to-play', copy.notFound, copy.notFound, `<p><a href="/learn/${locale}/archive">${copy.navigation[2]}</a></p>`, true), 404);
  }
  // One canonical spelling prevents slash variants from creating duplicate URLs.
  const canonicalPath = `/learn/${locale}/${slug}`;
  if (pathname !== canonicalPath) {
    return new Response(null, { status: 308, headers: { Location: canonicalPath } });
  }
  return htmlResponse(pageHtml(locale, slug, title, `${title}. ${copy.intro}`, body));
}

export function renderSitemap(now = new Date()): Response {
  const paths = ['/', ...SUPPORTED_LOCALES.flatMap((locale) => [
    ...PAGE_SLUGS.map((page) => `/learn/${locale}/${page}`),
    ...releasedArticles(locale, now).map(([slug]) => `/learn/${locale}/archive/${slug}`),
  ])];
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${ORIGIN}${path}</loc></url>`).join('')}</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
