import test from 'node:test';
import assert from 'node:assert/strict';
import { createStoryImageLoader } from '../src/scripts/story-images.mjs';

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
