import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { load } from 'cheerio';
import { languagePages, siteUrl } from '../site.config.mjs';
import { markdownPath } from '../agent-content.mjs';
import { apiDocumentId, apiCatalog, openApiDocument, apiDocsHtml } from '../agent-api.mjs';
import { agentDiscovery, agentDiscoveryPaths } from '../agent-discovery.mjs';

const compact = (text) => text.replace(/\s+/g, ' ').trim();
const escape = (text) => text.replace(/[\\`*_[\]<>]/g, '\\$&');
const blocks = new Set(['p', 'div', 'section', 'article', 'header', 'footer', 'main', 'figure', 'figcaption', 'dl', 'dt', 'dd', 'address']);

// Read the final, server-rendered content. Motion, navigation controls and
// decorative images do not belong in the alternative document representation.
export function pageToMarkdown(html, path) {
  const $ = load(html);
  const language = $('html').attr('lang');
  const title = compact($('main h1').first().text() || $('title').text());
  const canonical = new URL(path, siteUrl).href;
  const content = $('main, footer').clone();
  content.find('script, style, template, noscript, svg, video, source, nav, aside, button, dialog, [hidden], [aria-hidden="true"], .sr-only, .visually-hidden').remove();
  content.find('h1').remove();

  function url(value) {
    if (!value) return '';
    const parsed = new URL(value, canonical);
    return ['https:', 'http:', 'mailto:', 'tel:'].includes(parsed.protocol) ? parsed.href : '';
  }

  function render(node, listDepth = 0) {
    if (node.type === 'text') return node.data.replace(/\s+/g, ' ');
    if (node.type !== 'tag') return '';
    const tag = node.name;
    const children = () => (node.children || []).map((child) => render(child, listDepth)).join('');
    if (/^h[2-6]$/.test(tag)) {
      const words = [];
      function headingText(child) {
        if (child.type === 'text' && compact(child.data)) words.push(compact(child.data));
        else for (const nested of child.children || []) headingText(nested);
      }
      headingText(node);
      return `\n\n${'#'.repeat(Number(tag[1]))} ${escape(words.join(' '))}\n\n`;
    }
    if (tag === 'br') return '\n';
    if (tag === 'hr') return '\n\n---\n\n';
    if (tag === 'a') {
      const label = compact(children());
      const href = url(node.attribs.href);
      const link = href && label ? `[${escape(label)}](<${href}>)` : label;
      return $(node).closest('footer').length ? `\n\n${link}\n\n` : link;
    }
    if (tag === 'img') {
      const alt = compact(node.attribs.alt || '');
      const src = url(node.attribs.src);
      return alt && src ? `\n\n![${escape(alt)}](<${src}>)\n\n` : '';
    }
    if (tag === 'strong' || tag === 'b') return `**${compact(children())}**`;
    if (tag === 'em' || tag === 'i') return `*${compact(children())}*`;
    if (tag === 'span') return ` ${children()} `;
    if (tag === 'ul' || tag === 'ol') {
      const lines = (node.children || []).filter((child) => child.name === 'li').map((child, index) => {
        const prefix = tag === 'ol' ? `${index + 1}. ` : '- ';
        const body = (child.children || []).map((nested) => render(nested, listDepth + 1)).join('').trim();
        return `${'  '.repeat(listDepth)}${prefix}${body.replace(/\n{2,}/g, '\n')}`;
      });
      return `\n\n${lines.join('\n')}\n\n`;
    }
    if (tag === 'tr') return `${(node.children || []).filter((child) => ['td', 'th'].includes(child.name)).map((child) => compact(render(child))).join(' | ')}\n`;
    const text = children();
    return blocks.has(tag) ? `\n\n${text.trim()}\n\n` : text;
  }

  const body = content.toArray().map((node) => render(node)).join('\n\n')
    .replace(/[ \t]{2,}/g, ' ').replace(/[ \t]+\n/g, '\n').replace(/\n[ \t]+/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (!title || !body) throw new Error(`Missing page content: ${path}`);
  const source = language === 'en' ? 'Source' : 'Quelle';
  return `# ${escape(title)}\n\n${source}: [${escape($('title').text())}](<${canonical}>)\n\n${body}\n`;
}

async function generate() {
  const documents = [];
  const summaries = [];
  const writeOutput = async (path, content) => {
    const output = new URL(`../dist${path}`, import.meta.url);
    await mkdir(dirname(fileURLToPath(output)), { recursive: true });
    await writeFile(output, content, 'utf8');
  };
  for (const pair of languagePages) {
    for (const path of Object.values(pair)) {
      const html = await readFile(new URL(`../dist${path}/index.html`, import.meta.url), 'utf8');
      const markdown = pageToMarkdown(html, path);
      const output = new URL(`../dist${markdownPath(path)}`, import.meta.url);
      await mkdir(dirname(fileURLToPath(output)), { recursive: true });
      await writeFile(output, markdown, 'utf8');
      documents.push(markdown);
      const $ = load(html);
      const summary = {
        documentId: apiDocumentId(path),
        lang: $('html').attr('lang'),
        title: compact($('title').text()),
        description: $('meta[name="description"]').attr('content'),
        url: new URL(path, siteUrl).href,
        markdownUrl: new URL(markdownPath(path), siteUrl).href,
      };
      summaries.push(summary);
      await writeOutput(`/api/content/${summary.documentId}.json`, JSON.stringify({ ...summary, markdown }));
    }
  }
  const full = `# Bonanza Ranch Eco Wildlife Estate\n\n> Vollständige deutsche und englische Seiteninhalte / Complete German and English page content.\n> Automatisch aus den HTML-Seiten dieses Builds erzeugt / Generated from the HTML pages of this build.\n\n${documents.join('\n---\n\n')}`;
  await writeFile(new URL('../dist/llms-full.txt', import.meta.url), full, 'utf8');
  await writeOutput('/api/content/index.json', JSON.stringify({ documents: summaries }));
  await writeOutput('/api-catalog.json', JSON.stringify(apiCatalog));
  await writeOutput('/.well-known/api-catalog', JSON.stringify(apiCatalog));
  await writeOutput('/openapi.json', JSON.stringify(openApiDocument));
  await writeOutput('/api/docs.html', apiDocsHtml);
  for (const path of agentDiscoveryPaths) await writeOutput(path, JSON.stringify(agentDiscovery));
  console.log(`Generated ${documents.length} Markdown pages, content API documents, llms-full.txt, API catalog and OpenAPI schema from the built HTML.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await generate();
