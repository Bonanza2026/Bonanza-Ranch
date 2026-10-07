import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { load } from 'cheerio';
import { languagePages, siteUrl } from '../site.config.mjs';
import { acceptsMarkdown, markdownPath } from '../agent-content.mjs';
import { pageToMarkdown } from './generate-agent-content.mjs';

const read = (path) => readFileSync(new URL('../dist/' + path, import.meta.url), 'utf8');
const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const markdownRedirects = config.redirects.filter(rule => rule.has?.some(condition => condition.type === 'header' && condition.key === 'accept'));

test('Markdown negotiation accepts explicit positive media ranges, not browser defaults or q=0', () => {
  const examples = [
    ['text/markdown', true], ['TEXT/MARKDOWN;Q=1.000', true],
    ['text/html, text/markdown;q=0.8, */*;q=0.1', true],
    ['text/markdown;q=0.001', true], ['text/markdown;q=0.01', true],
    [undefined, false], ['text/html,application/xhtml+xml,*/*;q=0.8', false],
    ['text/markdown;q=0', false], ['text/markdown;q=0.000', false],
    ['text/markdown;q=1.1', false], ['application/text/markdown', false],
    ['text/markdown-extra', false], ['text/markdown;q=0, text/html', false],
  ];
  for (const [accept, expected] of examples) {
    assert.equal(acceptsMarkdown(accept), expected, accept);
    for (const rule of markdownRedirects) {
      assert.equal(new RegExp(rule.has[0].value).test(accept || ''), expected, accept);
    }
  }
});

test('alternative documents keep content, readable headings and public links without interface or executable code', () => {
  const html = `<html lang="en"><head><title>Test Ranch</title></head><body>
    <nav>Navigation controls</nav><main><h1>Test Ranch</h1>
    <h2><em>Long</em><span>EVENINGS</span></h2>
    <p>Wine from our own vineyard. <a href="/en#contact">Contact us</a>.</p>
    <ul><li>First experience</li><li>Second experience</li></ul>
    <img src="/photo.webp" alt="Ranch landscape"><img src="/cloud.webp" alt="">
    <img data-src="/wildlife.webp" alt="Wildlife portrait"><noscript><img src="/wildlife.webp" alt="Wildlife portrait"></noscript>
    <button>Player controls</button><div aria-hidden="true">Decorative duplicate</div>
    <script>alert('not content')</script><aside>Duplicate contents</aside>
    </main><footer><a href="mailto:info@bonanza-ranch.com">Email</a></footer></body></html>`;
  const markdown = pageToMarkdown(html, '/en');
  assert.match(markdown, /^# Test Ranch\n/);
  assert.ok(markdown.includes('## Long EVENINGS'));
  assert.ok(markdown.includes(`Wine from our own vineyard. [Contact us](<${siteUrl}/en#contact>).`));
  assert.ok(markdown.includes('- First experience\n- Second experience'));
  assert.ok(markdown.includes(`![Ranch landscape](<${siteUrl}/photo.webp>)`));
  assert.equal(markdown.split(`![Wildlife portrait](<${siteUrl}/wildlife.webp>)`).length - 1, 1);
  assert.ok(markdown.includes('[Email](<mailto:info@bonanza-ranch.com>)'));
  assert.doesNotMatch(markdown, /Navigation controls|Player controls|Decorative duplicate|alert\(|Duplicate contents|cloud.webp/);
});

test('all canonical Markdown pages and full content reflect the same built German and English documents', () => {
  const full = read('llms-full.txt');
  for (const path of languagePages.flatMap(Object.values)) {
    const html = read(path.slice(1) + '/index.html');
    const markdown = read(markdownPath(path).slice(1));
    const $ = load(html);
    assert.equal(markdown, pageToMarkdown(html, path));
    assert.ok(full.includes(markdown));
    assert.ok(markdown.includes(siteUrl + path));
    assert.ok(markdown.includes($('main h1').first().text().trim()));
    assert.doesNotMatch(markdown, /<script|<style|data-nav-theme|custom-cursor/);
    assert.equal($('link[rel="alternate"][type="text/markdown"]').attr('href'), siteUrl + markdownPath(path));
  }
  assert.match(read('_agent-markdown/de.md'), /6\.300[\s\S]*36\.000/);
  assert.match(read('_agent-markdown/en.md'), /6,300[\s\S]*36,000/);
  assert.match(read('_agent-markdown/de.md'), /Lange ABENDE/);
  assert.match(read('_agent-markdown/en.md'), /Long EVENINGS/);
});

test('Vercel exposes real Markdown targets and discovery links while preserving public HTML indexation', () => {
  const paths = languagePages.flatMap(Object.values);
  assert.deepEqual(markdownRedirects.map(rule => rule.source).sort(), [...paths].sort());
  for (const rule of markdownRedirects) {
    assert.equal(rule.permanent, false);
    assert.equal(rule.destination, markdownPath(rule.source));
    assert.ok(read(rule.destination.slice(1)).length);
  }
  const markdownHeaders = config.headers.find(rule => rule.source === '/_agent-markdown/(.*)').headers;
  assert.equal(markdownHeaders.find(header => header.key === 'Content-Type').value, 'text/markdown; charset=utf-8');
  assert.equal(markdownHeaders.find(header => header.key === 'X-Robots-Tag').value, 'noindex, follow');
  assert.ok(!config.headers.find(rule => rule.source === '/(.*)').headers.some(header => header.key === 'X-Robots-Tag'));
  const link = config.headers.flatMap(rule => rule.headers).find(header => header.key === 'Link').value;
  for (const resource of ['llms.txt', 'llms-full.txt']) {
    assert.ok(link.includes(`</${resource}>; rel="describedby"; type="text/plain"`));
    assert.ok(read(resource).length);
  }
  const robots = read('robots.txt');
  for (const agent of ['OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'GPTBot', 'ClaudeBot']) {
    assert.ok(robots.includes(`User-agent: ${agent}\nAllow: /\nContent-Signal: ai-train=yes, search=yes, ai-input=yes`));
  }
  assert.doesNotMatch(robots, /^Disallow:\s*\/\s*$/m);
});
