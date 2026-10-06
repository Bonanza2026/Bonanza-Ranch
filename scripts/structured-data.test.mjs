import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { load } from 'cheerio';
import { languagePages, siteUrl } from '../site.config.mjs';
import { operator } from '../src/content/operator.mjs';
import { homeMetadata, legalMetadata } from '../src/content/site-metadata.mjs';
import { createStructuredData, serializeStructuredData } from '../src/content/structured-data.mjs';

const paths = languagePages.flatMap(Object.values);
const htmlAt = (path) => load(readFileSync(new URL('../dist' + path + '/index.html', import.meta.url), 'utf8'));

test('structured data cannot close its containing script element', () => {
  const input = { name: '</script><script>alert(1)</script>' };
  const serialized = serializeStructuredData(input);
  assert.ok(!serialized.includes('<'));
  assert.deepEqual(JSON.parse(serialized), input);
});

test('the ranch and its legal operator remain separate entities', () => {
  const data = createStructuredData({ path: '/de', lang: 'de', ...homeMetadata.de });
  const entity = (type) => data['@graph'].find((entry) => entry['@type'] === type);
  assert.equal(entity('Organization').name, operator.company);
  assert.equal(entity('Organization').email, operator.email);
  assert.deepEqual(entity('Organization').address, { '@type': 'PostalAddress', ...operator.postalAddress });
  assert.equal(entity('Place').name, 'Bonanza Ranch');
  assert.equal(entity('Place').address.addressCountry, 'ZA');
  assert.ok(!entity('Place').address.streetAddress, 'The correspondence address is not the ranch location');
  assert.ok(!entity('Place').geo, 'No precise estate coordinates have been confirmed for publication');
});

test('all canonical pages expose one connected graph matching their visible metadata', () => {
  const expectedIds = new Map();
  for (const path of paths) {
    const html = htmlAt(path);
    const blocks = html('script[type="application/ld+json"]');
    assert.equal(blocks.length, 1, path);
    const data = JSON.parse(blocks.text());
    assert.equal(data['@context'], 'https://schema.org');
    const graph = data['@graph'];
    const ids = new Set(graph.map((entry) => entry['@id']));
    assert.equal(ids.size, graph.length, 'Every graph entity needs a unique ID');
    const page = graph.find((entry) => entry['@type'] === 'WebPage');
    assert.equal(page.url, html('link[rel="canonical"]').attr('href'));
    assert.equal(page.name, html('title').text());
    assert.equal(page.description, html('meta[name="description"]').attr('content'));
    assert.equal(page.inLanguage, html('html').attr('lang'));
    const checkReferences = (value) => {
      if (!value || typeof value !== 'object') return;
      if (value['@id']) {
        assert.equal(new URL(value['@id']).origin, siteUrl);
        assert.ok(ids.has(value['@id']), 'Unresolved graph reference: ' + value['@id']);
      }
      for (const child of Object.values(value)) {
        if (Array.isArray(child)) child.forEach(checkReferences);
        else checkReferences(child);
      }
    };
    graph.forEach(checkReferences);
    for (const entry of graph) {
      if (entry.contentUrl || entry.logo) {
        const media = new URL(entry.contentUrl || entry.logo);
        assert.equal(media.origin, siteUrl);
        assert.ok(existsSync(new URL('../public' + media.pathname, import.meta.url)), media.href);
      }
      if (['Organization', 'Brand', 'Place', 'WebSite'].includes(entry['@type'])) {
        const previous = expectedIds.get(entry['@type']);
        if (previous) assert.equal(entry['@id'], previous);
        expectedIds.set(entry['@type'], entry['@id']);
      }
    }
    const home = ['/de', '/en'].includes(path);
    assert.equal(Boolean(page.mainEntity), home);
    assert.equal(graph.some((entry) => entry['@type'] === 'ImageObject'), home);
    assert.ok(!blocks.text().match(/info@skywind\./i));
  }
});

test('legal pages have descriptions in their own language and one public contact email', () => {
  const descriptions = new Set();
  for (const [type, paths] of [
    ['imprint', languagePages[1]],
    ['privacy', languagePages[2]],
  ]) {
    for (const [lang, path] of Object.entries(paths)) {
      const html = htmlAt(path);
      const description = html('meta[name="description"]').attr('content');
      assert.equal(description, legalMetadata[lang][type]);
      descriptions.add(description);
      assert.equal(html('.legal-intro > a').attr('href'), '/' + lang);
      const emails = html('.legal-copy address a[href^="mailto:"]').map((_, el) => html(el).attr('href')).get();
      assert.deepEqual(emails, ['mailto:' + operator.email]);
      assert.ok(!html('.legal-copy').text().match(/info@skywind\./i));
    }
  }
  assert.equal(descriptions.size, 4);
});
