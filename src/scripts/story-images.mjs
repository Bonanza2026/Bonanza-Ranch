/** Gate scroll-revealed images whose sticky geometry defeats native lazy loading. */
export function initializeJourneyImageLoading(root) {
  if (!root) return { destroy() {} };
  const view = root.ownerDocument.defaultView;
  const arrival = [...root.querySelectorAll('img[data-journey-image="arrival"]')];
  const portraits = [...root.querySelectorAll('img[data-journey-image="reserve"]')];
  const flight = root.querySelector('[data-flight-image-trigger]');
  const reserve = root.querySelector('.reserve-introduction');
  const reduced = view.matchMedia?.('(prefers-reduced-motion: reduce)');
  const loaded = new WeakSet();
  let destroyed = false;

  const load = (images) => {
    if (destroyed) return;
    for (const image of images) {
      if (loaded.has(image)) continue;
      loaded.add(image);
      image.loading = 'eager';
      // Keep the exact responsive candidates and browser DPR selection. Set the
      // candidate list first so no fallback-only download races the real image.
      if (image.dataset.srcset) image.srcset = image.dataset.srcset;
      if (image.dataset.src) image.src = image.dataset.src;
    }
  };
  if (typeof view.IntersectionObserver !== 'function') {
    load(portraits);
    if (!reduced?.matches) load(arrival);
    return { destroy() { destroyed = true; } };
  }

  const flightObserver = new view.IntersectionObserver((entries) => {
    if (!reduced?.matches && entries.some((entry) => entry.isIntersecting && entry.intersectionRatio > 0)) {
      load(arrival);
      flightObserver.disconnect();
    }
  }, { rootMargin: '0px', threshold: 0.001 });
  const reserveObserver = new view.IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      load(portraits);
      reserveObserver.disconnect();
    }
  }, { rootMargin: `${view.innerHeight}px 0px`, threshold: 0 });
  const observeFlight = () => {
    if (flight && !destroyed && !reduced?.matches && arrival.some((image) => !loaded.has(image))) flightObserver.observe(flight);
    else flightObserver.disconnect();
  };
  const hide = (event) => { if (!event.persisted) destroy(); };
  function destroy() {
    if (destroyed) return;
    destroyed = true;
    flightObserver.disconnect();
    reserveObserver.disconnect();
    reduced?.removeEventListener('change', observeFlight);
    view.removeEventListener('pagehide', hide);
  }
  observeFlight();
  if (reserve && portraits.length) reserveObserver.observe(reserve);
  reduced?.addEventListener('change', observeFlight);
  view.addEventListener('pagehide', hide);
  return { destroy };
}

/** Start nearby story photos early without changing their sources or quality. */
export function createStoryImageLoader(film) {
  if (!film) return { update() {}, destroy() {} };
  const view = film.ownerDocument.defaultView;
  const pending = new Set(film.querySelectorAll('.story-photo img'));
  let active = 0;
  let frame = 0;
  let destroyed = false;

  const update = () => {
    if (!destroyed && pending.size && !frame) frame = view.requestAnimationFrame(warm);
  };

  function warm() {
    frame = 0;
    if (destroyed || active >= 2) return;
    const width = view.innerWidth;
    const height = view.innerHeight;
    const section = film.getBoundingClientRect();
    if (section.top > height * 3 || section.bottom < -height) return;

    // Read the actual transformed positions. IntersectionObserver margins stop
    // at the clipped horizontal stage, where the upcoming photos still sit.
    const nearby = [];
    for (const img of pending) {
      if (img.complete && img.naturalWidth > 0) {
        pending.delete(img);
        continue;
      }
      const rect = img.closest('.story-photo').getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0 || rect.left > width * 3 ||
          rect.right < -width || rect.top > height * 3 || rect.bottom < -height) continue;
      const distance = Math.max(0, rect.left - width, -rect.right) / width +
        Math.max(0, rect.top - height, -rect.bottom) / height;
      nearby.push({ img, distance });
    }
    nearby.sort((a, b) => a.distance - b.distance);

    for (const { img } of nearby.slice(0, 2 - active)) {
      pending.delete(img);
      active++;
      // Reuse the real responsive image: no duplicate fetch or alternate URL.
      img.loading = 'eager';
      img.decode().catch(() => {}).finally(() => {
        active--;
        update();
      });
    }
  }

  update();
  return {
    update,
    destroy() {
      destroyed = true;
      view.cancelAnimationFrame(frame);
      pending.clear();
    },
  };
}
