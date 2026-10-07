import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { load } from 'cheerio';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url));
const css = read('src/styles/bonanza-type.css').toString();
const faces = [...css.matchAll(/@font-face\s*\{([^}]+)\}/g)].map((match) => {
  const declarations = Object.fromEntries(match[1].split(';').map((line) => {
    const colon = line.indexOf(':');
    return [line.slice(0, colon).trim(), line.slice(colon + 1).trim()];
  }).filter(([property]) => property));
  return { ...declarations, path: declarations.src.match(/url\("([^"]+)"\)/)[1] };
});
const unicodeRanges = (face) => face['unicode-range'].split(',').map((range) => {
  const [start, end = start] = range.trim().slice(2).split('-').map((value) => parseInt(value, 16));
  return [start, end];
});

test('font preloads match active WOFF2 sources and the display font is byte-identical', () => {
  const links = [...read('src/layouts/SiteLayout.astro').toString().matchAll(/<link\b[^>]+>/g)].map(([link]) => link).join('');
  const html = load(links);
  const preloads = html('link[rel="preload"][as="font"]').toArray();
  assert.equal(preloads.length, 3);
  for (const link of preloads) {
    assert.equal(link.attribs.type, 'font/woff2');
    assert.ok('crossorigin' in link.attribs);
    assert.ok(faces.some((face) => face.path === link.attribs.href));
    assert.equal(read('public' + link.attribs.href).subarray(0, 4).toString(), 'wOF2');
    assert.ok(!/Inter-(?:Regular|Medium)\.woff2$/.test(link.attribs.href), 'Full fallback fonts must not be preloaded');
  }
  assert.deepEqual(read('public/fonts/PPFragment-GlareVariable-v1.woff2'), read('public/fonts/PPFragment-GlareVariable.woff'));
  assert.equal(faces.find((face) => face['font-family'] === '"PP Fragment"')['font-weight'], '100 900');
});

test('Latin subsets and original Inter fallbacks preserve disjoint complete Unicode coverage', () => {
  for (const [weight, name] of [['400', 'Regular'], ['500', 'Medium']]) {
    const pair = faces.filter((face) => face['font-family'] === '"Inter"' && face['font-weight'] === weight);
    assert.equal(pair.length, 2);
    const subset = pair.find((face) => face.path.includes('-latin-ext-v1'));
    const original = pair.find((face) => face.path === `/fonts/Inter-${name}.woff2`);
    assert.ok(subset && original);
    assert.equal(subset['font-style'], original['font-style']);
    assert.equal(subset['font-display'], original['font-display']);
    assert.equal(read('public' + subset.path).subarray(0, 4).toString(), 'wOF2');
    assert.ok(read('public' + subset.path).length < read('public' + original.path).length);
    const latin = unicodeRanges(subset);
    const rest = unicodeRanges(original);
    const combined = [...latin, ...rest].sort(([a], [b]) => a - b);
    let next = 0;
    for (const [start, end] of combined) {
      assert.equal(start, next, 'Unicode coverage has a gap or overlap');
      assert.ok(end >= start);
      next = end + 1;
    }
    assert.equal(next, 0x110000);
    const includes = (ranges, cp) => ranges.some(([start, end]) => start <= cp && cp <= end);
    for (const character of 'ÄÖÜäöüßéÅŁŒ©€—“”↗▷') assert.ok(includes(latin, character.codePointAt(0)));
    for (const character of 'ΩД') assert.ok(includes(rest, character.codePointAt(0)));
  }
});
