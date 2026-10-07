import { siteUrl } from './site.config.mjs';
import { apiCatalog, openApiDocument } from './agent-api.mjs';

const service = apiCatalog.linkset[0];
const descriptor = service['service-desc'][0];
const operations = Object.values(openApiDocument.paths).map((path) => path.get.operationId);

// ARD proposal: https://agenticresourcediscovery.org/spec/#51-discovery-mechanisms
// The predecessor catalog envelope remains readable by Lighthouse 13.5. Its
// media-type shortlist warns about OpenAPI; keep the real type nevertheless.
export const agentDiscovery = {
  specVersion: '1.0',
  host: {
    displayName: 'Bonanza Ranch',
    documentationUrl: service['service-doc'][0].href,
  },
  entries: [{
    identifier: `urn:air:${new URL(siteUrl).hostname}:api:public-content`,
    displayName: openApiDocument.info.title,
    type: descriptor.type,
    url: descriptor.href,
    description: openApiDocument.info.description,
    capabilities: operations,
    representativeQueries: [
      'Read the published German information about Bonanza Ranch in South Africa.',
      'Read the published English information about Bonanza Ranch in South Africa.',
      'Read the published legal notice or privacy policy for Bonanza Ranch.',
    ],
    version: openApiDocument.info.version,
  }],
};

export const agentDiscoveryPaths = ['/.well-known/ard.json', '/.well-known/ai-catalog.json'];
