import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function createWildlifeMotion(root: HTMLElement) {
  const cleanups: Array<() => void> = [];
  const items = Array.from(root.querySelectorAll<HTMLElement>(".wildlife-stack-item"));
  // Reference SectionStickyScroll: each new panel leaves a 55px chapter header visible.
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
  }

  const orbit = root.querySelector<HTMLElement>(".wildlife-orbit")!;
  const stage = orbit.querySelector<HTMLElement>(".wildlife-orbit-stage")!;
  const photos = Array.from(orbit.querySelectorAll<HTMLElement>(".wildlife-orbit-photo"));
  const pause = orbit.querySelector<HTMLButtonElement>(".wildlife-orbit-pause")!;
  let inView = false;
  let paused = false;
  let rotation = 0;
  let radius = 0;
  // Same flat cos/sin orbit as Tengile's SectionImagesCloud; no camera or WebGL.
  const draw = () => photos.forEach((photo, index) => {
    const angle = index / photos.length * Math.PI * 2 + rotation;
    gsap.set(photo, { xPercent: -50, yPercent: -50, rotation: 0,
      x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
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
