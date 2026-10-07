import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { agentDiscovery, agentDiscoveryPaths } from '../agent-discovery.mjs';
import { apiCatalog, openApiDocument } from '../agent-api.mjs';
import { siteUrl } from '../site.config.mjs';

const readBuilt = (path) => JSON.parse(readFileSync(new URL('../dist' + path, import.meta.url), 'utf8'));

test('ARD advertises the actual OpenAPI descriptor and only its public read operations', () => {
  assert.equal(agentDiscovery.specVersion, '1.0');
  assert.equal(agentDiscovery.entries.length, 1);
  const entry = agentDiscovery.entries[0];
  assert.match(entry.identifier, /^urn:air:[a-zA-Z0-9.-]+(:[a-zA-Z0-9._-]+)+$/);
  assert.equal(entry.identifier.split(':')[2], new URL(siteUrl).hostname);
  assert.ok(entry.displayName.trim());
  assert.equal(entry.url, siteUrl + '/openapi.json');
  assert.equal(entry.type, 'application/vnd.oai.openapi+json');
  assert.deepEqual({ href: entry.url, type: entry.type }, apiCatalog.linkset[0]['service-desc'][0]);
  assert.equal(new URL(entry.url).origin, siteUrl);
  assert.equal('data' in entry, false);
  assert.equal('trustManifest' in entry, false);
  assert.deepEqual(openApiDocument.security, []);
  assert.ok(entry.representativeQueries.length >= 2 && entry.representativeQueries.length <= 5);
  assert.ok(entry.representativeQueries.every((query) => typeof query === 'string' && query.trim()));

  const operations = Object.values(openApiDocument.paths).flatMap((path) => {
    assert.deepEqual(Object.keys(path), ['get']);
    return path.get.operationId;
  });
  assert.deepEqual(entry.capabilities, operations);
  assert.deepEqual(entry.capabilities, ['listPublicContent', 'readPublicContent']);
  assert.equal(agentDiscovery.host.documentationUrl, siteUrl + '/api/docs.html');
  assert.equal(entry.description, openApiDocument.info.description);
});

test('built current ARD and predecessor AI catalogs describe the same published API', () => {
  assert.deepEqual(agentDiscoveryPaths, ['/.well-known/ard.json', '/.well-known/ai-catalog.json']);
  for (const path of agentDiscoveryPaths) assert.deepEqual(readBuilt(path), agentDiscovery);
  const entry = agentDiscovery.entries[0];
  const descriptor = readBuilt(new URL(entry.url).pathname);
  assert.deepEqual(descriptor, openApiDocument);
  const parameter = descriptor.paths['/api/content/{documentId}.json'].get.parameters[0];
  const documentIds = parameter.schema.enum;
  assert.equal(documentIds.length, 6);
  const index = readBuilt('/api/content/index.json');
  assert.deepEqual(index.documents.map((document) => document.documentId), documentIds);
  for (const documentId of documentIds) {
    const document = readBuilt('/api/content/' + documentId + '.json');
    assert.equal(document.documentId, documentId);
    assert.ok(typeof document.markdown === 'string' && document.markdown.length > 0);
  }
});
