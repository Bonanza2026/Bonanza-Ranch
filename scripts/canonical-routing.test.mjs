import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { load } from 'cheerio';
import { languagePages, siteUrl } from '../site.config.mjs';

const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const pathRedirects = config.redirects.filter(rule => !rule.has && !rule.missing);

// These rules intentionally use literal paths. Vercel's sourceToRegex uses
// strict:true and sensitive:true; @vercel/routing-utils 6.5.0 was checked
// against every rule and compiled /de/ as ^\/de\/$, not an optional slash.
// Keep this focused check dependency-free and reject broader path patterns.
const redirectFor = pathname => {
  for (const rule of pathRedirects) {
    assert.match(rule.source, /^\/[a-z/]+$/, 'canonical rules must remain literal paths');
  }
  const matches = pathRedirects.filter(rule => rule.source === pathname);
  assert.ok(matches.length <= 1, `ambiguous path redirect: ${pathname}`);
  return matches[0];
};

test('slash variants reach each declared canonical page without redirecting the destination again', () => {
  for (const pathname of languagePages.flatMap(Object.values)) {
    const rule = redirectFor(pathname + '/');
    assert.ok(rule, `missing slash redirect for ${pathname}`);
    assert.equal(rule.permanent, true);
    assert.equal(rule.destination, pathname);
    assert.equal(redirectFor(pathname), undefined, 'canonical HTML must not redirect to itself');

    const filename = pathname.slice(1) + '/index.html';
    const $ = load(readFileSync(new URL('../dist/' + filename, import.meta.url), 'utf8'));
    assert.equal($('link[rel=canonical]').attr('href'), siteUrl + rule.destination);
  }
});

test('both legacy alias spellings reach existing chapter anchors on the correct language page', () => {
  for (const [alias, page, anchor] of [
    ['/freizeit', '/de', 'freizeit'], ['/sicherheit', '/de', 'sicherheit'],
    ['/en/leisure', '/en', 'freizeit'], ['/en/security', '/en', 'sicherheit'],
  ]) {
    for (const source of [alias, alias + '/']) {
      const rule = redirectFor(source);
      assert.ok(rule, `missing chapter redirect for ${source}`);
      assert.equal(rule.permanent, true);
      assert.equal(rule.destination, page + '#' + anchor);
      assert.equal(redirectFor(new URL(rule.destination, siteUrl).pathname), undefined);
      const filename = page.slice(1) + '/index.html';
      const $ = load(readFileSync(new URL('../dist/' + filename, import.meta.url), 'utf8'));
      assert.equal($('[id]').filter((i, element) => $(element).attr('id') === anchor).length, 1);
    }
  }
});

test('path cleanup leaves the entry, machine-readable resources and unrelated URLs untouched', () => {
  for (const pathname of [
    '/', '/de', '/en', '/sitemap.xml', '/robots.txt', '/llms.txt', '/llms-full.txt',
    '/_agent-markdown/de.md', '/_agent-markdown/en/legal.md', '/api/content/de.json',
    '/api/content/index.json', '/.well-known/api-catalog', '/.well-known/ard.json',
    '/openapi.json', '/media/hero-mobile-v7.webm', '/fonts/Inter-Regular.woff2',
    '/freizeit-more', '/de/extra', '/en/legal/extra', '/DE/',
  ]) {
    assert.equal(redirectFor(pathname), undefined, `unexpected path cleanup for ${pathname}`);
  }
});
