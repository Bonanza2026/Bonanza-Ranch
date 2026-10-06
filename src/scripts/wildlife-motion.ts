import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function createWildlifeMotion(root: HTMLElement) {
  const cleanups: Array<() => void> = [];
  const items = Array.from(root.querySelectorAll<HTMLElement>(".wildlife-stack-item"));
  // Each new panel leaves a 55px chapter header visible.
  // Natural document heights also preserve reading order and give the stack a clean exit.
  if (innerWidth >= 768) {
    const measure = () => items.forEach((item) => {
      item.style.removeProperty("height");
      item.style.height = `${Math.max(item.scrollHeight, item.getBoundingClientRect().height)}px`;
    });
    measure();
    ScrollTrigger.addEventListener("refreshInit", measure);
    cleanups.push(() => {
      ScrollTrigger.removeEventListener("refreshInit", measure);
      items.forEach(item => item.style.removeProperty("height"));
    });
  } else if (items.length) {
    const stack = root.querySelector<HTMLElement>(".wildlife-stack-items")!;
    // Retain the chapter headers and compensate for panels
    // taller than the viewport, so their last lines and images remain reachable.
    const viewportHeight = innerHeight;
    let overflow = 55;
    const measure = () => {
      items.forEach(item => item.style.removeProperty("--item-height"));
      const naturalHeights = items.map(item => item.scrollHeight);
      overflow = naturalHeights.slice(1).reduce((sum, height) => sum + Math.max(0, height - viewportHeight), 55);
      let total = 0;
      items.forEach((item, index) => {
        const offset = 55 * index;
        // The final panel exits straight into the next image; no viewport filler.
        const height = index === items.length - 1
          ? naturalHeights[index]
          : Math.max(viewportHeight - offset, naturalHeights[index]);
        item.style.setProperty("--item-offset", `${offset}px`);
        item.style.setProperty("--item-height", `${height}px`);
        total += height;
      });
      stack.style.setProperty("--stack-height", `${total}px`);
    };
    measure();
    const trigger = ScrollTrigger.create({
      trigger: stack,
      start: "top top",
      end: "bottom bottom",
      onUpdate: self => stack.style.setProperty("--stack-offset", `${-self.progress * overflow}px`),
      onRefresh: self => stack.style.setProperty("--stack-offset", `${-self.progress * overflow}px`),
    });
    ScrollTrigger.addEventListener("refreshInit", measure);
    cleanups.push(() => {
      trigger.kill();
      ScrollTrigger.removeEventListener("refreshInit", measure);
      items.forEach(item => {
        item.style.removeProperty("--item-height");
        item.style.removeProperty("--item-offset");
      });
      stack.style.removeProperty("--stack-height");
      stack.style.removeProperty("--stack-offset");
    });
  }

  const orbit = root.querySelector<HTMLElement>(".wildlife-orbit")!;
  const stage = orbit.querySelector<HTMLElement>(".wildlife-orbit-stage")!;
  const photos = Array.from(orbit.querySelectorAll<HTMLElement>(".wildlife-orbit-photo"));
  const pause = orbit.querySelector<HTMLButtonElement>(".wildlife-orbit-pause")!;
  let inView = false;
  let paused = false;
  let rotation = 0;
  let radius = 0;
  const positions = photos.map((photo, index) => {
    gsap.set(photo, { xPercent: -50, yPercent: -50, rotation: 0 });
    return {
      angle: index / photos.length * Math.PI * 2,
      x: gsap.quickSetter(photo, "x", "px"),
      y: gsap.quickSetter(photo, "y", "px"),
    };
  });
  const draw = () => positions.forEach(position => {
    const angle = position.angle + rotation;
    position.x(Math.cos(angle) * radius);
    position.y(Math.sin(angle) * radius);
  });
  const measureOrbit = () => {
    radius = innerWidth < 768 ? 258 : stage.offsetWidth * 0.39;
    draw();
  };
  measureOrbit();
  const resize = new ResizeObserver(measureOrbit);
  resize.observe(stage);
  const tick = (_time: number, delta: number) => {
    if (!inView || paused || document.hidden) return;
    rotation += Math.min(delta, 50) * 0.000055;
    draw();
  };
  const togglePause = () => {
    paused = !paused;
    pause.setAttribute("aria-pressed", String(paused));
    pause.textContent = paused ? pause.dataset.pausedLabel! : pause.dataset.playingLabel!;
  };
  pause.addEventListener("click", togglePause);
  const visibility = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; }, { rootMargin: "100px" });
  visibility.observe(orbit);
  gsap.ticker.add(tick);
  cleanups.push(() => {
    gsap.ticker.remove(tick);
    resize.disconnect();
    visibility.disconnect();
    pause.removeEventListener("click", togglePause);
    photos.forEach(photo => gsap.set(photo, { clearProps: "transform,translate,rotate,scale" }));
  });
  return () => cleanups.forEach(cleanup => cleanup());
}
