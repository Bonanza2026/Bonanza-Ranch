import { languagePages, siteUrl } from './site.config.mjs';
import { operator } from './src/content/operator.mjs';

export const apiDocumentId = (path) => path.replace(/^\//, '').replaceAll('/', '-');

const documents = languagePages.flatMap((pair) =>
  Object.entries(pair).map(([lang, path]) => ({ documentId: apiDocumentId(path), lang, path })),
);
const documentIds = documents.map(({ documentId }) => documentId);
const indexUrl = siteUrl + '/api/content/index.json';
const docsUrl = siteUrl + '/api/docs.html';

export const apiCatalog = {
  linkset: [{
    anchor: indexUrl,
    item: [{ href: indexUrl, title: 'Bonanza public content', type: 'application/json' }],
    'service-desc': [{ href: siteUrl + '/openapi.json', type: 'application/vnd.oai.openapi+json' }],
    'service-doc': [{ href: docsUrl, type: 'text/html' }],
  }],
};

const summaryProperties = {
  documentId: { type: 'string', enum: documentIds },
  lang: { type: 'string', enum: ['de', 'en'] },
  title: { type: 'string', minLength: 1 },
  description: { type: 'string' },
  url: { type: 'string', format: 'uri', description: 'Canonical HTML page URL.' },
  markdownUrl: { type: 'string', format: 'uri', description: 'Public Markdown representation URL.' },
};
const summaryFields = Object.keys(summaryProperties);

export const openApiDocument = {
  openapi: '3.1.1',
  info: {
    title: 'Bonanza Ranch public content API',
    version: '1.0.0',
    description: 'Read the published German and English pages as JSON. Responses are generated from the same built HTML and Markdown as the website. No authentication, booking, payment or write operations are provided.',
    contact: { name: operator.company, email: operator.email, url: siteUrl + '/en/legal' },
  },
  servers: [{ url: siteUrl }],
  security: [],
  externalDocs: { description: 'Usage and document IDs', url: docsUrl },
  paths: {
    '/api/content/index.json': {
      get: {
        operationId: 'listPublicContent',
        summary: 'List the published content documents',
        responses: {
          200: {
            description: 'Document metadata for the public German and English pages.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ContentIndex' } } },
          },
        },
      },
    },
    '/api/content/{documentId}.json': {
      get: {
        operationId: 'readPublicContent',
        summary: 'Read one published content document',
        parameters: [{
          name: 'documentId', in: 'path', required: true,
          description: 'Use one of the IDs returned by the content index.',
          schema: { type: 'string', enum: documentIds },
        }],
        responses: {
          200: {
            description: 'The document metadata and complete Markdown representation.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ContentDocument' } } },
          },
          404: { description: 'No static content document exists for this ID.' },
        },
      },
    },
  },
  components: {
    schemas: {
      ContentSummary: {
        type: 'object', additionalProperties: false,
        required: summaryFields,
        properties: summaryProperties,
      },
      ContentDocument: {
        type: 'object', additionalProperties: false,
        required: [...summaryFields, 'markdown'],
        properties: {
          ...summaryProperties,
          markdown: { type: 'string', minLength: 1, description: 'The published page content as Markdown, including public links and image descriptions.' },
        },
      },
      ContentIndex: {
        type: 'object', additionalProperties: false,
        required: ['documents'],
        properties: {
          documents: {
            type: 'array', minItems: documents.length, maxItems: documents.length,
            items: { $ref: '#/components/schemas/ContentSummary' },
          },
        },
      },
    },
  },
};

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

export const apiDocsHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Public content API · Bonanza Ranch</title>
  <meta name="description" content="Read the published German and English Bonanza Ranch pages through the public JSON content API.">
  <style>body{max-width:850px;margin:3rem auto;padding:0 1.5rem;font:17px/1.65 system-ui,sans-serif;color:#1e211c;background:#f5eee9}a{color:#52631e}code,pre{font:0.9em/1.5 monospace}pre{overflow:auto;padding:1rem;background:#fff9}table{border-collapse:collapse;width:100%}th,td{text-align:left;padding:.6rem;border-bottom:1px solid #1e211c33}h1,h2{line-height:1.2}a:focus-visible{outline:2px solid currentColor;outline-offset:4px}</style>
</head>
<body>
<main>
  <h1>Bonanza Ranch public content API</h1>
  <p>This read-only API exposes the same public German and English content as the website. It is generated during the website build and served as static JSON. No account or API key is required.</p>
  <p><a href="${escapeHtml(siteUrl + '/openapi.json')}">OpenAPI description</a> · <a href="${escapeHtml(siteUrl + '/.well-known/api-catalog')}">API catalog</a> · <a href="${escapeHtml(siteUrl + '/en')}">Website</a></p>
  <h2>List documents</h2>
  <p><code>GET /api/content/index.json</code> returns <code>{ "documents": [...] }</code>. Each item contains <code>documentId</code>, <code>lang</code>, <code>title</code>, <code>description</code>, the canonical page <code>url</code> and its <code>markdownUrl</code>.</p>
  <pre>${escapeHtml(`curl -H 'Accept: application/json' '${indexUrl}'`)}</pre>
  <h2>Read a document</h2>
  <p><code>GET /api/content/{documentId}.json</code> returns the same metadata and a <code>markdown</code> string containing the full published page representation. Use one of these document IDs:</p>
  <table><thead><tr><th>ID</th><th>Language</th><th>Page</th><th>JSON</th></tr></thead><tbody>
${documents.map(({ documentId, lang, path }) => `    <tr><td><code>${escapeHtml(documentId)}</code></td><td>${escapeHtml(lang)}</td><td><a href="${escapeHtml(siteUrl + path)}">${escapeHtml(path)}</a></td><td><a href="${escapeHtml(siteUrl + '/api/content/' + documentId + '.json')}">Read JSON</a></td></tr>`).join('\n')}
  </tbody></table>
  <pre>${escapeHtml(`curl -H 'Accept: application/json' '${siteUrl}/api/content/en.json'`)}</pre>
  <h2>Scope and use</h2>
  <p>The API only reads published content. It cannot send enquiries, create bookings, make payments or modify records. Unsupported document IDs return HTTP 404. Responses use <code>application/json</code>; they do not translate text on request.</p>
  <p>HTML, Markdown and JSON are representations of the same pages. Keep the canonical <code>url</code> when citing a page, preserve concept labels and legal notices, and do not treat planned services as a booking offer. Publication through the API does not grant additional rights to images, fonts or other materials.</p>
  <p>Provider: ${escapeHtml(operator.company)}. Contact: <a href="${escapeHtml('mailto:' + operator.email)}">${escapeHtml(operator.email)}</a>. <a href="${escapeHtml(siteUrl + '/en/legal')}">Legal notice</a> · <a href="${escapeHtml(siteUrl + '/en/privacy')}">Privacy policy</a>.</p>
</main>
</body>
</html>
`;
