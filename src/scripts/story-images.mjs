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
