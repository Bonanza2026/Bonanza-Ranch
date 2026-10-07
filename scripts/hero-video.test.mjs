import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { heroSources, initializeHeroVideo } from '../src/scripts/hero-video.mjs';

test('the corrected mobile film keeps the existing desktop film and MP4 fallback', () => {
  assert.deepEqual(heroSources(true, true), ['/media/hero-mobile-v7.webm', '/media/hero-mobile-v7.mp4']);
  assert.deepEqual(heroSources(true, false), ['/media/hero-mobile-v7.mp4']);
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

function heroBrowser({ mobile = true, webm = true, reducedMotion = false, painted = false, paintApi = 'supported', autoplayRejected = false } = {}) {
  const document = new EventTarget();
  document.hidden = false;
  const reduced = new EventTarget();
  reduced.matches = reducedMotion;
  const video = new EventTarget();
  video.dataset = {};
  video.requests = [];
  video.playCount = 0;
  video.pauseCount = 0;
  video.getAttribute = (name) => name === 'src' ? video.src || null : null;
  Object.defineProperty(video, 'src', {
    get: () => video.requests.at(-1),
    set: (value) => video.requests.push(value),
  });
  video.canPlayType = () => webm ? 'probably' : '';
  video.play = () => {
    video.playCount += 1;
    return autoplayRejected ? Promise.reject(new Error('autoplay rejected')) : Promise.resolve();
  };
  video.pause = () => { video.pauseCount += 1; };
  let decodePoster;
  const decoded = new Promise((resolve) => { decodePoster = resolve; });
  const poster = { currentSrc: '/media/poster-mobile.webp', src: '/media/poster.webp', decode: () => decoded };
  document.querySelector = (selector) => selector === '.hero-banner_video' ? video : poster;
  const frames = [];
  let paintObserver;
  class PerformanceObserver {
    static supportedEntryTypes = paintApi === 'unsupported' ? ['mark'] : ['paint'];
    constructor(callback) {
      this.callback = callback;
      paintObserver = this;
    }
    observe(options) {
      this.options = options;
      if (paintApi === 'throws') throw new Error('paint observation unavailable');
    }
    disconnect() { this.disconnected = true; }
  }
  let intersectionObserver;
  class IntersectionObserver {
    constructor(callback) { intersectionObserver = callback; }
    observe(element) { assert.equal(element, video); }
  }
  const browser = {
    document,
    matchMedia: (query) => query.includes('reduced-motion') ? reduced : { matches: mobile },
    performance: { getEntriesByName: (name, type) => {
      assert.equal(name, 'first-contentful-paint');
      assert.equal(type, 'paint');
      return painted ? [{ name: 'first-contentful-paint' }] : [];
    } },
    PerformanceObserver: paintApi === 'missing' ? undefined : PerformanceObserver,
    IntersectionObserver,
    requestAnimationFrame: (callback) => frames.push(callback),
  };
  return {
    browser, document, video, poster, reduced,
    decodePoster: async () => { decodePoster(); await Promise.resolve(); await Promise.resolve(); },
    paint: (name = 'first-contentful-paint') => paintObserver.callback({ getEntries: () => [{ name }] }),
    observer: () => paintObserver,
    frame: () => frames.splice(0).forEach((callback) => callback()),
    visible: (value) => intersectionObserver([{ isIntersecting: value }]),
  };
}

test('early input and animation frames cannot fetch video before actual FCP', async () => {
  const fixture = heroBrowser();
  initializeHeroVideo(fixture.browser);
  await fixture.decodePoster();
  fixture.frame();
  fixture.frame();
  for (const name of ['pointerdown', 'keydown', 'visibilitychange']) fixture.document.dispatchEvent(new Event(name));
  fixture.visible(true);
  fixture.paint('first-paint');
  fixture.video.error = { code: 4 };
  fixture.video.dispatchEvent(new Event('error'));
  assert.deepEqual(fixture.video.requests, []);
  assert.equal(fixture.video.playCount, 0);

  fixture.paint();
  assert.deepEqual(fixture.video.requests, ['/media/hero-mobile-v7.webm']);
  assert.equal(fixture.video.playCount, 1);
  assert.equal(fixture.video.poster, fixture.poster.currentSrc);
  assert.equal(fixture.video.muted, true);
  assert.deepEqual(fixture.observer().options, { type: 'paint', buffered: true });
  assert.equal(fixture.observer().disconnected, true);
});

test('FCP before poster decode and already buffered FCP both wait for the poster', async () => {
  for (const painted of [false, true]) {
    const fixture = heroBrowser({ painted, mobile: false });
    initializeHeroVideo(fixture.browser);
    if (!painted) fixture.paint();
    assert.deepEqual(fixture.video.requests, []);
    await fixture.decodePoster();
    assert.deepEqual(fixture.video.requests, ['/media/hero-desktop-v3.webm']);
    if (painted) assert.equal(fixture.observer(), undefined);
  }
});

test('reduced motion prevents downloading and visibility still pauses after both gates', async () => {
  const fixture = heroBrowser({ reducedMotion: true });
  initializeHeroVideo(fixture.browser);
  await fixture.decodePoster();
  fixture.paint();
  fixture.document.dispatchEvent(new Event('pointerdown'));
  assert.deepEqual(fixture.video.requests, []);
  fixture.reduced.matches = false;
  fixture.reduced.dispatchEvent(new Event('change'));
  assert.deepEqual(fixture.video.requests, ['/media/hero-mobile-v7.webm']);
  const plays = fixture.video.playCount;
  fixture.document.hidden = true;
  fixture.document.dispatchEvent(new Event('visibilitychange'));
  fixture.document.hidden = false;
  fixture.visible(false);
  fixture.video.dataset.scrollCovered = 'true';
  fixture.visible(true);
  assert.equal(fixture.video.playCount, plays);
  assert.ok(fixture.video.pauseCount >= 3);
  fixture.video.dataset.scrollCovered = 'false';
  fixture.video.dispatchEvent(new Event('bonanza:hero-visibility'));
  assert.equal(fixture.video.playCount, plays + 1);
  assert.equal(fixture.video.requests.length, 1);
});

test('unavailable Paint Timing uses two frames after decode without allowing input to skip them', async () => {
  for (const paintApi of ['missing', 'unsupported', 'throws']) {
    const fixture = heroBrowser({ paintApi, webm: false });
    initializeHeroVideo(fixture.browser);
    fixture.frame();
    fixture.frame();
    fixture.document.dispatchEvent(new Event('pointerdown'));
    assert.deepEqual(fixture.video.requests, []);
    await fixture.decodePoster();
    fixture.frame();
    fixture.document.dispatchEvent(new Event('keydown'));
    assert.deepEqual(fixture.video.requests, []);
    fixture.frame();
    assert.deepEqual(fixture.video.requests, ['/media/hero-mobile-v7.mp4']);
  }
});

test('autoplay rejection preserves WebM while a decoder error selects the MP4 fallback', async () => {
  const fixture = heroBrowser({ autoplayRejected: true, painted: true });
  initializeHeroVideo(fixture.browser);
  await fixture.decodePoster();
  await Promise.resolve();
  assert.deepEqual(fixture.video.requests, ['/media/hero-mobile-v7.webm']);
  fixture.video.error = { code: 2 };
  fixture.video.dispatchEvent(new Event('error'));
  assert.equal(fixture.video.requests.length, 1);
  fixture.video.error = { code: 4 };
  fixture.video.dispatchEvent(new Event('error'));
  assert.deepEqual(fixture.video.requests, ['/media/hero-mobile-v7.webm', '/media/hero-mobile-v7.mp4']);
  fixture.video.dispatchEvent(new Event('error'));
  assert.equal(fixture.video.requests.length, 2);
});
