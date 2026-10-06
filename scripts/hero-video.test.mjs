import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { heroSources } from '../src/scripts/hero-video.mjs';

test('the corrected mobile film keeps the existing desktop film and MP4 fallback', () => {
  assert.deepEqual(heroSources(true, true), ['/media/hero-mobile-v5.webm', '/media/hero-mobile-v5.mp4']);
  assert.deepEqual(heroSources(true, false), ['/media/hero-mobile-v5.mp4']);
  assert.deepEqual(heroSources(false, true), ['/media/hero-desktop-v3.webm', '/media/hero-desktop-v3.mp4']);
  assert.deepEqual(heroSources(false, false), ['/media/hero-desktop-v3.mp4']);

  for (const path of heroSources(true, true)) {
    const asset = readFileSync(new URL('../public' + path, import.meta.url));
    if (path.endsWith('.webm')) {
      assert.equal(asset.readUInt32BE(0), 0x1a45dfa3, 'WebM must start with an EBML header');
    } else {
      assert.equal(asset.toString('ascii', 4, 8), 'ftyp', 'MP4 must contain its file-type box');
    }
  }
});
