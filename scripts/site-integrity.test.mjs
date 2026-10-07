import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
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
    if (/\.(txt|xml|md)$/.test(url.pathname)) {
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

const analyticsScripts = () => {
  const html = page('/en');
  const scripts = html('script[src]').map((_, element) => read(element.attribs.src.slice(1))).get();
  return {
    privacy: scripts.find((script) => script.includes('template[data-web-analytics]')),
    sdk: scripts.find((script) => script.includes('customElements.define(`vercel-analytics`')),
  };
};

function analyticsBrowser({ doNotTrack, globalPrivacyControl } = {}) {
  const window = {};
  const navigator = { doNotTrack, globalPrivacyControl };
  const requests = [];
  let analyticsElement;
  let connected = false;
  const template = { content: { cloneNode: () => ({}) }, remove: () => {} };
  const browser = {
    window, navigator, URL, location: { origin: siteUrl },
    document: {
      querySelector: () => template,
      createElement: () => ({ dataset: {} }),
      head: { querySelector: () => null, appendChild: (script) => requests.push(script.src) },
      body: { append: () => {
        connected = true;
        if (analyticsElement) new analyticsElement();
      } },
    },
    HTMLElement: class {
      constructor() { this.dataset = { props: '{"mode":"production"}', params: '{}', pathname: '/en' }; }
    },
    customElements: { define: (name, element) => {
      assert.equal(name, 'vercel-analytics');
      analyticsElement = element;
      if (connected) new analyticsElement();
    } },
  };
  return { browser, window, navigator, requests };
}

test('native Vercel analytics registers its privacy filter before the first pageview in either module order', () => {
  for (const path of paths) {
    const html = page(path);
    assert.equal(html('template[data-web-analytics]').length, 1);
    const template = load(html('template[data-web-analytics]').html());
    assert.equal(template('vercel-analytics').length, 1);
    assert.deepEqual(JSON.parse(template('vercel-analytics').attr('data-props')), { mode: 'production' });
    assert.equal(template('vercel-analytics').attr('data-pathname').replace(/\/$/, ''), path);
  }
  const scripts = analyticsScripts();
  assert.ok(scripts.privacy && scripts.sdk);
  for (const order of [['privacy', 'sdk'], ['sdk', 'privacy']]) {
    const fixture = analyticsBrowser();
    for (const name of order) runInNewContext(`(() => { ${scripts[name]} })()`, fixture.browser);
    assert.deepEqual(fixture.requests, ['/_vercel/insights/script.js']);
    assert.equal(fixture.window.vaq[0][0], 'beforeSend');
    assert.equal(fixture.window.vaq[1][0], 'pageview');
    const event = { type: 'pageview', url: siteUrl + '/en?email=private%40example.com#contact' };
    const filtered = fixture.window.webAnalyticsBeforeSend(event);
    assert.equal(filtered.url, siteUrl + '/en');
    assert.equal(event.url, siteUrl + '/en?email=private%40example.com#contact', 'The SDK input is not mutated');
    assert.equal(fixture.window.webAnalyticsBeforeSend({ type: 'event', url: siteUrl + '/en' }), null);
    assert.equal(fixture.window.webAnalyticsBeforeSend({ type: 'pageview', url: 'https://other.example/private' }), null);
    assert.equal(fixture.window.webAnalyticsBeforeSend({ type: 'pageview', url: 'https://[' }), null);
    fixture.navigator.globalPrivacyControl = true;
    assert.equal(fixture.window.webAnalyticsBeforeSend(event), null, 'A changed privacy signal also blocks later events');
  }
});

test('Do Not Track and Global Privacy Control prevent the analytics intake script from loading', () => {
  const scripts = analyticsScripts();
  for (const signals of [{ doNotTrack: '1' }, { globalPrivacyControl: true }]) {
    for (const order of [['privacy', 'sdk'], ['sdk', 'privacy']]) {
      const fixture = analyticsBrowser(signals);
      for (const name of order) runInNewContext(`(() => { ${scripts[name]} })()`, fixture.browser);
      assert.deepEqual(fixture.requests, []);
      assert.equal(fixture.window.vaq, undefined);
    }
  }
  for (const [path, heading] of [['/datenschutz', 'Cookie-freie Besucherstatistik'], ['/en/privacy', 'Cookie-free visitor statistics']]) {
    assert.ok(page(path)('main').text().includes(heading));
    assert.ok(page(path)('main').text().includes('Vercel Web Analytics'));
    assert.ok(page(path)('main').text().includes('Global Privacy Control'));
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
    const flightArt = html('.flight-cloud, .flight-plane img, .flight-cloud-front img');
    assert.equal(flightArt.length, 5);
    flightArt.each((_, image) => assert.equal(image.attribs.fetchpriority, 'low', 'Hidden flight art must not compete with the visible poster and type'));
    assert.equal(html('link[rel="stylesheet"]').length, 0, 'Production CSS should not add render-blocking round trips');
    for (const font of ['/fonts/PPFragment-GlareVariable-v1.woff2', '/fonts/Inter-Regular-latin-ext-v1.woff2', '/fonts/Inter-Medium-latin-ext-v1.woff2']) {
      assert.equal(html(`link[rel="preload"][as="font"][href="${font}"]`).length, 1);
      assert.ok(existsSync(new URL('../dist' + font, import.meta.url)));
    }
    const delayed = html('img[data-journey-image]');
    assert.equal(delayed.length, 4, 'Arrival and triptych pictures wait for their reveal');
    delayed.each((_, image) => {
      assert.equal(image.attribs.src, undefined, 'Clipped sticky pictures must not compete with the hero');
      assert.ok(existsSync(new URL('../dist' + image.attribs['data-src'], import.meta.url)));
    });
    const withoutScripts = load(readFileSync(new URL(`../dist${path}/index.html`, import.meta.url), 'utf8'), { scriptingEnabled: false });
    assert.equal(withoutScripts('noscript img').length, 4, 'All deferred pictures remain available without JavaScript');
  }
});

test('authored languages stay intact and footer chapter links resolve in both languages', () => {
  for (const [lang, menu, evenings, security] of [
    ['de', 'Menü', 'Lange ABENDE', 'Sicherheit'],
    ['en', 'Menu', 'Long EVENINGS', 'Security'],
  ]) {
    const html = page('/' + lang);
    assert.equal(html('html').attr('translate'), 'no');
    assert.equal(html('meta[name="google"]').attr('content'), 'notranslate');
    const menuLabels = html('nav .menu-toggle .btn-text, nav .nav-left .btn-text').map((_, el) => html(el).text().trim()).get();
    assert.ok(menuLabels.length >= 2);
    assert.ok(menuLabels.every(label => label === menu), menuLabels.join(', '));
    assert.equal(html('#geniessen h3').text().replace(/\s+/g, ' ').replace(/(Lange|Long)(ABENDE|EVENINGS)/, '$1 $2').trim(), evenings);
    assert.equal(html(`footer a[href="/${lang}#sicherheit"]`).text().trim(), security);
    html('footer a[href*="#"]').each((_, el) => {
      const url = new URL(html(el).attr('href'), siteUrl);
      assert.equal(url.pathname, '/' + lang);
      assert.equal(html(`[id="${url.hash.slice(1)}"]`).length, 1, url.href);
    });
    assert.equal(html('.language-switch a[lang="de"]').attr('hreflang'), 'de');
    assert.equal(html('.language-switch a[lang="en"]').attr('hreflang'), 'en');
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
