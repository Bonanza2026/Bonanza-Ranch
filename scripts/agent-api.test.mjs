import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { load } from 'cheerio';
import { apiDocumentId, apiCatalog, openApiDocument, apiDocsHtml } from '../agent-api.mjs';
import { languagePages, siteUrl } from '../site.config.mjs';
import { markdownPath } from '../agent-content.mjs';

const read = (path) => readFileSync(new URL('../dist/' + path, import.meta.url), 'utf8');
const documents = languagePages.flatMap((pair) => Object.entries(pair).map(([lang, path]) => ({ lang, path, documentId: apiDocumentId(path) })));

test('API catalog and OpenAPI describe only the bounded public read API', () => {
  assert.deepEqual(documents.map(({ documentId }) => documentId), ['de', 'en', 'impressum', 'en-legal', 'datenschutz', 'en-privacy']);
  assert.equal(new Set(documents.map(({ documentId }) => documentId)).size, documents.length);
  assert.equal(apiCatalog.linkset.length, 1);
  const entry = apiCatalog.linkset[0];
  assert.equal(entry.anchor, siteUrl + '/api/content/index.json');
  assert.equal(entry.item[0].href, entry.anchor);
  assert.equal(entry['service-desc'][0].href, siteUrl + '/openapi.json');
  assert.equal(entry['service-doc'][0].href, siteUrl + '/api/docs.html');
  assert.match(openApiDocument.openapi, /^3\.1\./);
  assert.deepEqual(openApiDocument.security, []);
  assert.deepEqual(Object.keys(openApiDocument.paths), ['/api/content/index.json', '/api/content/{documentId}.json']);
  for (const path of Object.values(openApiDocument.paths)) assert.deepEqual(Object.keys(path), ['get']);
  const parameter = openApiDocument.paths['/api/content/{documentId}.json'].get.parameters[0];
  assert.equal(parameter.in, 'path');
  assert.equal(parameter.required, true);
  assert.deepEqual(parameter.schema.enum, documents.map(({ documentId }) => documentId));
});

test('API documentation links each supported document and has no executing interface', () => {
  const html = load(apiDocsHtml);
  assert.equal(html('script,form,button').length, 0);
  assert.equal(html('main table tbody tr').length, documents.length);
  for (const { documentId, path } of documents) {
    const hrefs = html('a').map((_, link) => link.attribs.href).get();
    assert.ok(hrefs.includes(siteUrl + path));
    assert.ok(hrefs.includes(siteUrl + '/api/content/' + documentId + '.json'));
  }
  assert.ok(html('pre').first().text().includes("curl -H 'Accept: application/json'"));
  assert.ok(html('main').text().includes('It cannot send enquiries'));
});

test('built API responses preserve canonical metadata and the exact published Markdown', () => {
  assert.deepEqual(JSON.parse(read('api-catalog.json')), apiCatalog);
  assert.deepEqual(JSON.parse(read('.well-known/api-catalog')), apiCatalog);
  assert.deepEqual(JSON.parse(read('openapi.json')), openApiDocument);
  assert.equal(read('api/docs.html'), apiDocsHtml);
  const index = JSON.parse(read('api/content/index.json'));
  assert.deepEqual(Object.keys(index), ['documents']);
  assert.equal(index.documents.length, documents.length);
  const ids = new Set();
  for (const { documentId, path, lang } of documents) {
    const html = load(read(path.slice(1) + '/index.html'));
    const data = JSON.parse(read('api/content/' + documentId + '.json'));
    assert.equal(data.documentId, documentId);
    assert.equal(data.lang, lang);
    assert.equal(data.url, html('link[rel=canonical]').attr('href'));
    assert.equal(data.description, html('meta[name=description]').attr('content'));
    assert.ok(data.title.trim().length > 0);
    assert.equal(data.markdownUrl, siteUrl + markdownPath(path));
    assert.equal(data.markdown, read(markdownPath(path).slice(1)));
    assert.deepEqual(Object.keys(data).sort(), openApiDocument.components.schemas.ContentDocument.required.slice().sort());
    const { markdown, ...summary } = data;
    const listed = index.documents.find((item) => item.documentId === documentId);
    assert.deepEqual(listed, summary);
    assert.ok(!('markdown' in listed));
    ids.add(documentId);
  }
  assert.equal(ids.size, documents.length);
});
