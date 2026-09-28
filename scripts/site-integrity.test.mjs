import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { load } from 'cheerio';
import { languagePages, siteUrl } from '../site.config.mjs';
import { heroSources } from '../src/scripts/hero-video.mjs';

const read = (path) => readFileSync(new URL('../dist/' + path, import.meta.url), 'utf8');
const page = (path) => load(read(path.replace(/^\//, '') + '/index.html'));
const paths = languagePages.flatMap(Object.values);

test('crawler files expose the real sitemap and resolvable public content', () => {
  const robots = read('robots.txt');
  assert.match(robots, /^User-agent: \*\nAllow: \/\n/m);
  assert.ok(robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`));
  const llms = read('llms.txt');
  assert.match(llms, /^# Bonanza Ranch Eco Wildlife Estate\n/);
  assert.match(llms, /6\.300/);
  assert.match(llms, /36\.000/);
  for (const [, href] of llms.matchAll(/\]\((https:[^)]+)\)/g)) {
    const url = new URL(href);
    assert.equal(url.origin, siteUrl);
    if (/\.(txt|xml)$/.test(url.pathname)) {
      assert.ok(read(url.pathname.slice(1)).length);
    } else {
      assert.ok(paths.includes(url.pathname), `Not a canonical page: ${href}`);
      if (url.hash) assert.equal(page(url.pathname)(`[id="${url.hash.slice(1)}"]`).length, 1, href);
    }
  }
});

test('sitemap and HTML canonicals agree; language alternates are reciprocal', () => {
  const xml = load(read('sitemap.xml'), { xmlMode: true });
  const locations = xml('url > loc').map((_, el) => xml(el).text()).get();
  assert.deepEqual(locations.sort(), paths.map((path) => siteUrl + path).sort());
  for (const pair of languagePages) {
    for (const [lang, path] of Object.entries(pair)) {
      const html = page(path);
      assert.equal(html('html').attr('lang'), lang);
      assert.equal(html('link[rel="canonical"]').attr('href'), siteUrl + path);
      for (const [alternateLang, alternate] of Object.entries(pair)) {
        assert.equal(html(`link[hreflang="${alternateLang}"]`).attr('href'), siteUrl + alternate);
      }
    }
  }
  const root = load(read('index.html'));
  assert.equal(root('link[rel="canonical"]').attr('href'), siteUrl + '/de');
});

test('built pages can run with self-only scripts and contain no inline event handlers', () => {
  const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  const headers = config.headers[0].headers;
  const csp = headers.find(({ key }) => key === 'Content-Security-Policy').value;
  assert.ok(csp.includes("script-src 'self';"));
  assert.ok(csp.includes("frame-ancestors 'none';"));
  assert.ok(csp.includes("object-src 'none';"));
  for (const path of paths) {
    const html = page(path);
    html('script').each((_, el) => {
      if (['application/json', 'application/ld+json'].includes(el.attribs.type)) return;
      assert.ok(el.attribs.src?.startsWith('/_astro/'), `Inline or external script on ${path}`);
      assert.ok(existsSync(new URL('../dist' + el.attribs.src, import.meta.url)), el.attribs.src);
    });
    html('*').each((_, el) => {
      for (const attr of Object.keys(el.attribs)) assert.ok(!/^on/i.test(attr), `Inline handler: ${attr}`);
    });
  }
});

test('responsive hero posters match their preloads and language choices are stable', () => {
  for (const path of ['/de', '/en']) {
    const html = page(path);
    const mobilePoster = html('.hero-poster source').attr('srcset');
    const desktopPoster = html('.hero-poster img').attr('src');
    assert.equal(html('link[rel="preload"][as="image"][media="(max-width: 767px)"]').attr('href'), mobilePoster);
    assert.equal(html('link[rel="preload"][as="image"][media="(min-width: 768px)"]').attr('href'), desktopPoster);
    for (const poster of [mobilePoster, desktopPoster]) assert.ok(existsSync(new URL('../dist' + poster, import.meta.url)));
    assert.equal(html('.language-switch a[lang="de"]').attr('href'), '/de');
    assert.equal(html('.language-switch a[lang="en"]').attr('href'), '/en');
  }
});

test('HTML does not eagerly load several video formats or the unopened film', () => {
  for (const path of ['/de', '/en']) {
    const html = page(path);
    assert.equal(html('video[src], video source[src]').length, 0);
    assert.equal(html('.ranch-film source[data-src]').length, 2);
    assert.equal(html('.hero-poster img').attr('fetchpriority'), 'high');
    assert.equal(html('link[rel="stylesheet"]').length, 0, 'Production CSS should not add render-blocking round trips');
  }
});

test('video selection stays at the selected viewport size, with a compatible fallback', () => {
  for (const mobile of [true, false]) {
    const selected = heroSources(mobile, true);
    assert.equal(selected.length, 2);
    assert.ok(selected[0].endsWith('.webm'));
    assert.ok(selected[1].endsWith('.mp4'));
    assert.deepEqual(heroSources(mobile, false), [selected[1]]);
    for (const path of selected) {
      assert.ok(path.includes(mobile ? 'mobile' : 'desktop'));
      assert.ok(existsSync(new URL('../public' + path, import.meta.url)));
    }
  }
});
