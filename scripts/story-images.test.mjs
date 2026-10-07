import test from 'node:test';
import assert from 'node:assert/strict';
import { createStoryImageLoader, initializeJourneyImageLoading } from '../src/scripts/story-images.mjs';

function scene(positions, width = 1000, height = 800) {
  let serial = 0;
  const frames = new Map();
  const view = {
    innerWidth: width, innerHeight: height,
    requestAnimationFrame(fn) { frames.set(++serial, fn); return serial; },
    cancelAnimationFrame(id) { frames.delete(id); },
  };
  const images = positions.map(([left, top], i) => {
    const image = {
      src: `/photo-${i}.webp`, srcset: `/photo-${i}-640.webp 640w, /photo-${i}.webp 1672w`,
      sizes: '100vw', loading: 'lazy', complete: false, naturalWidth: 0,
      rect: { left, right: left + 600, top, bottom: top + 400, width: 600, height: 400 },
      calls: 0,
      closest() { return { getBoundingClientRect: () => image.rect }; },
      decode() {
        image.calls++;
        return new Promise((resolve, reject) => {
          image.finish = () => { image.complete = true; image.naturalWidth = 1672; resolve(); };
          image.fail = () => reject(new Error('Network failed'));
        });
      },
    };
    return image;
  });
  const film = {
    ownerDocument: { defaultView: view },
    top: 0,
    querySelectorAll: () => images,
    getBoundingClientRect() { return { top: film.top, bottom: film.top + 20000 }; },
  };
  return { film, images, frames, view, async tick() {
    const work = [...frames.values()]; frames.clear();
    work.forEach(fn => fn());
    // Let decode/catch/finally settle before checking the next scheduled frame.
    await new Promise(resolve => setImmediate(resolve));
  } };
}

test('story preloading waits for the section, looks past horizontal clipping and preserves quality', async () => {
  const s = scene([[2200, 100], [1100, 100], [2800, 100], [9000, 100]]);
  const sources = s.images.map(({ src, srcset, sizes }) => ({ src, srcset, sizes }));
  s.film.top = 6000;
  const loader = createStoryImageLoader(s.film);
  await s.tick();
  assert.ok(s.images.every(img => img.loading === 'lazy'), 'Hero must not compete with the story');
  s.film.top = 1000;
  loader.update();
  await s.tick();
  assert.deepEqual(s.images.map(img => img.loading), ['eager', 'eager', 'lazy', 'lazy']);
  s.images[1].finish();
  await s.tick(); await s.tick();
  assert.equal(s.images[2].loading, 'eager', 'Next nearby photo takes the freed slot');
  assert.equal(s.images[3].loading, 'lazy', 'Distant chapters stay lazy');
  assert.deepEqual(s.images.map(({ src, srcset, sizes }) => ({ src, srcset, sizes })), sources);
  loader.destroy();
});

test('vertical mobile photos and a direct chapter jump get the same bounded loading window', async () => {
  const s = scene([[12, -4000], [12, 100], [12, 1500], [12, 2200], [12, 5000]], 390, 844);
  const loader = createStoryImageLoader(s.film);
  await s.tick();
  assert.deepEqual(s.images.map(img => img.loading), ['lazy', 'eager', 'eager', 'lazy', 'lazy']);
  s.images[2].fail();
  await s.tick(); await s.tick();
  assert.equal(s.images[3].loading, 'eager', 'An error must not stall later photos');
  assert.equal(s.images[2].calls, 1, 'A failed image must not cause a retry loop');
  loader.destroy();
});

test('already loaded photos are reused and cleanup stops queued work', async () => {
  const s = scene([[100, 100], [1200, 100], [2100, 100], [2800, 100]]);
  s.images[0].complete = true; s.images[0].naturalWidth = 1672;
  const loader = createStoryImageLoader(s.film);
  await s.tick();
  assert.equal(s.images[0].calls, 0);
  loader.update(); loader.update();
  assert.equal(s.frames.size, 1, 'Repeated scroll events share one frame');
  loader.destroy();
  s.images[1].finish();
  await s.tick();
  assert.equal(s.frames.size, 0);
  assert.equal(s.images[3].loading, 'lazy');
});

function deferredJourney({ reduced = false, observersSupported = true } = {}) {
  const observers = [];
  const motion = Object.assign(new EventTarget(), { matches: reduced });
  const view = Object.assign(new EventTarget(), { innerHeight: 844, matchMedia: () => motion });
  if (observersSupported) view.IntersectionObserver = class {
    constructor(callback, options) { this.callback = callback; this.options = options; this.targets = new Set(); observers.push(this); }
    observe(target) { this.targets.add(target); }
    disconnect() { this.targets.clear(); }
    deliver(isIntersecting, intersectionRatio = 1) { this.callback([{ isIntersecting, intersectionRatio }]); }
  };
  const image = (name, responsive = false) => {
    const writes = [];
    const attributes = { src: undefined, srcset: undefined };
    return {
      dataset: { src: `/full/${name}.webp`, ...(responsive ? { srcset: `/full/${name}-640.webp 640w, /full/${name}.webp 1672w` } : {}) },
      sizes: responsive ? '(max-width: 767px) 150vw, 100vw' : undefined,
      width: 1672, height: 941, loading: 'lazy', writes,
      set src(value) { attributes.src = value; writes.push(['src', value]); },
      get src() { return attributes.src; },
      set srcset(value) { attributes.srcset = value; writes.push(['srcset', value]); },
      get srcset() { return attributes.srcset; },
    };
  };
  const arrival = image('sunset', true);
  const portraits = ['leopard-portrait', 'lioness-portrait', 'springbok-leap'].map((name) => image(name));
  const trigger = {};
  const reserve = {};
  const root = {
    ownerDocument: { defaultView: view },
    querySelectorAll(selector) { return selector.includes('arrival') ? [arrival] : portraits; },
    querySelector(selector) { return selector === '[data-flight-image-trigger]' ? trigger : reserve; },
  };
  return { root, view, motion, arrival, portraits, trigger, reserve, observers };
}

test('deferred journey images leave the hero alone and restore their exact sources only near each reveal', () => {
  const f = deferredJourney();
  const loader = initializeJourneyImageLoading(f.root);
  const [flightObserver, reserveObserver] = f.observers;
  assert.equal(f.arrival.src, undefined);
  assert.ok(f.portraits.every((image) => image.src === undefined));
  assert.equal(flightObserver.options.rootMargin, '0px', 'Opening viewport must not be expanded into the arrival trigger');
  assert.equal(reserveObserver.options.rootMargin, '844px 0px', 'Portraits get one viewport of lead time');
  assert.deepEqual([...flightObserver.targets], [f.trigger]);
  assert.deepEqual([...reserveObserver.targets], [f.reserve]);

  flightObserver.deliver(false, 0);
  flightObserver.deliver(true, 0);
  assert.equal(f.arrival.src, undefined, 'Touching the viewport boundary is not yet a reveal');
  flightObserver.deliver(true, .2);
  assert.equal(f.arrival.src, '/full/sunset.webp');
  assert.equal(f.arrival.srcset, f.arrival.dataset.srcset);
  assert.equal(f.arrival.sizes, '(max-width: 767px) 150vw, 100vw');
  assert.deepEqual(f.arrival.writes, [['srcset', f.arrival.dataset.srcset], ['src', f.arrival.dataset.src]], 'Candidate list is ready before the fallback source');
  assert.equal(flightObserver.targets.size, 0);
  assert.ok(f.portraits.every((image) => image.src === undefined));
  reserveObserver.deliver(true);
  assert.deepEqual(f.portraits.map((image) => image.src), f.portraits.map((image) => image.dataset.src));
  assert.equal(reserveObserver.targets.size, 0);
  flightObserver.deliver(true);
  reserveObserver.deliver(true);
  assert.equal(f.arrival.writes.length, 2, 'Repeat intersections must not reassign image sources');
  assert.ok(f.portraits.every((image) => image.writes.length === 1));
  loader.destroy();
});

test('initial intersections from restored scroll or fast chapter jumps need no gesture listener', () => {
  const f = deferredJourney();
  const loader = initializeJourneyImageLoading(f.root);
  // Native observer initial delivery uses the current position, whether the user
  // scrolled, pressed a chapter link, or returned to a saved browser position.
  f.observers[1].deliver(true);
  assert.ok(f.portraits.every((image) => image.src === image.dataset.src));
  f.observers[0].deliver(true, .4);
  assert.equal(f.arrival.src, f.arrival.dataset.src);
  loader.destroy();
});

test('reduced motion keeps unused arrival art dormant while the visible portraits still load', () => {
  const f = deferredJourney({ reduced: true });
  const loader = initializeJourneyImageLoading(f.root);
  assert.equal(f.observers[0].targets.size, 0);
  f.observers[0].deliver(true);
  f.observers[1].deliver(true);
  assert.equal(f.arrival.src, undefined);
  assert.ok(f.portraits.every((image) => image.src === image.dataset.src));
  f.motion.matches = false;
  f.motion.dispatchEvent(new Event('change'));
  assert.deepEqual([...f.observers[0].targets], [f.trigger]);
  f.observers[0].deliver(true);
  assert.equal(f.arrival.src, f.arrival.dataset.src);
  loader.destroy();
});

test('browsers without observers receive the full images rather than empty frames', () => {
  for (const reduced of [false, true]) {
    const f = deferredJourney({ observersSupported: false, reduced });
    const loader = initializeJourneyImageLoading(f.root);
    assert.ok(f.portraits.every((image) => image.src === image.dataset.src));
    assert.equal(f.arrival.src, reduced ? undefined : f.arrival.dataset.src);
    if (!reduced) assert.equal(f.arrival.srcset, f.arrival.dataset.srcset);
    loader.destroy();
  }
  initializeJourneyImageLoading(null).destroy();
});

test('back/forward cache retains deferred work while final teardown stops late observer callbacks', () => {
  const f = deferredJourney();
  const loader = initializeJourneyImageLoading(f.root);
  f.view.dispatchEvent(Object.assign(new Event('pagehide'), { persisted: true }));
  assert.equal(f.observers[1].targets.size, 1);
  f.observers[1].deliver(true);
  assert.ok(f.portraits.every((image) => image.src === image.dataset.src));
  f.view.dispatchEvent(Object.assign(new Event('pagehide'), { persisted: false }));
  assert.ok(f.observers.every((observer) => observer.targets.size === 0));
  f.observers[0].deliver(true);
  assert.equal(f.arrival.src, undefined, 'A late callback must not start a request after teardown');
  loader.destroy();
});
