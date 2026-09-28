import { createBonanzaStoryMotion } from "./story-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function createDreamMotion() {
  const root = document.querySelector<HTMLElement>(".dream-home");
  if (!root) return () => {};
  const context = gsap.context(() => {
    const flight = root.querySelector<HTMLElement>(".dream-flight")!;
    const state = { progress: 0 };
    const plane = root.querySelector<HTMLElement>(".flight-plane")!;
    const planeInner = root.querySelector<HTMLElement>(".flight-plane-inner")!;
    const arrival = root.querySelector<HTMLElement>(".flight-arrival")!;
    const stage = root.querySelector<HTMLElement>(".flight-stage")!;
    const paintPlane = () => {
      const p = state.progress,
        width = innerWidth,
        height = stage.clientHeight;
      const scale = 1 + 0.1 * p;
      const imageWidth =
        Math.max(width * (width < 768 ? 2.55 : 1.45), height * 1.7) * scale;
      const imageHeight = (imageWidth * 1024) / 1536;
      const x = (-2.6 + 5.2 * p) * width;
      const edge = Array.from({ length: 17 }, (_, i) => {
        const y = (height * i) / 16;
        const imageY = 0.5 + (y - height / 2) / imageHeight;
        const wingX =
          0.61 - 0.57 * Math.max(0, Math.abs(imageY - 0.49) - 0.075);
        return [width / 2 + x + (wingX - 0.5) * imageWidth, y];
      });
      const leftmost = Math.min(...edge.map(([x]) => x));
      const rightmost = Math.max(...edge.map(([x]) => x));
      document.body.classList.toggle("flight-arrived", p > 0.59);
      gsap.set(plane, { x, autoAlpha: p > 0.001 && p < 0.999 ? 1 : 0 });
      gsap.set(planeInner, { scale });
      gsap.set(arrival, {
        visibility: rightmost > 0 ? "visible" : "hidden",
        clipPath:
          leftmost >= width
            ? "none"
            : `polygon(0 0,${edge.map(([x, y]) => `${x}px ${y}px`).join(",")},0 100%)`,
      });
    };
    paintPlane();
    ScrollTrigger.create({
      trigger: flight,
      start: () =>
        `top+=${(flight.offsetHeight - stage.clientHeight) * 0.19} top`,
      end: "bottom 80px",
      toggleClass: { targets: document.body, className: "flight-is-cloudy" },
      invalidateOnRefresh: true,
    });
    const flightTimeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: flight,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.35,
        invalidateOnRefresh: true,
      },
    });
    flightTimeline
      .to(".flight-film", { scale: 1.08, yPercent: -6, duration: 0.3 }, 0)
      .to(
        ".flight-opening",
        { yPercent: -18, opacity: 0, duration: 0.19 },
        0.06,
      )
      .to(".flight-cloud-world", { autoAlpha: 1, duration: 0.1 }, 0.08)
      .to(".flight-cloud-base", { opacity: 1, duration: 0.2 }, 0.15)
      .fromTo(
        ".flight-cloud-back",
        { yPercent: 48, xPercent: -8, scale: 1 },
        { yPercent: -44, xPercent: 9, scale: 1.16, duration: 0.81 },
        0.08,
      )
      .fromTo(
        ".flight-cloud-side",
        { yPercent: 44, xPercent: 12, scale: 1.15 },
        { yPercent: -63, xPercent: -14, scale: 1, duration: 0.76 },
        0.13,
      )
      .fromTo(
        ".flight-thought",
        { autoAlpha: 0, y: 40 },
        { autoAlpha: 1, y: 0, duration: 0.08 },
        0.25,
      )
      .to(".flight-thought", { autoAlpha: 0, y: -45, duration: 0.09 }, 0.45)
      .fromTo(
        ".flight-cloud-front",
        { autoAlpha: 0, yPercent: 32 },
        { autoAlpha: 0.8, yPercent: -20, duration: 0.25 },
        0.1,
      )
      .to(
        ".flight-cloud-front",
        { yPercent: -75, xPercent: 10, duration: 0.43 },
        0.36,
      )
      .to(".flight-cloud-front", { autoAlpha: 0, duration: 0.17 }, 0.66)
      .to(state, { progress: 1, duration: 0.39, onUpdate: paintPlane }, 0.5);
    return createBonanzaStoryMotion(root);
  }, root);
  return () => {
    context.revert();
    document.body.classList.remove("flight-is-cloudy", "flight-arrived");
  };
}
