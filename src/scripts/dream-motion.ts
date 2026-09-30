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
    const arrivalWindow = root.querySelector<HTMLElement>(".flight-arrival-window")!;
    const stage = root.querySelector<HTMLElement>(".flight-stage")!;
    const mobile = innerWidth < 768;
    const video = root.querySelector<HTMLVideoElement>(".hero-banner_video");
    const coverFilm = (covered: boolean) => {
      if (!video || video.dataset.scrollCovered === String(covered)) return;
      video.dataset.scrollCovered = String(covered);
      video.dispatchEvent(new Event("bonanza:hero-visibility"));
    };
    // Freeze the mobile scene while browser chrome changes the visible height.
    // Only a real width/orientation change rebuilds these measurements.
    if (mobile) {
      const opening = root.querySelector<HTMLElement>(".flight-opening")!;
      gsap.set(flight, {
        "--flight-height": `${stage.clientHeight}px`,
        "--flight-opening-height": `${opening.clientHeight}px`,
      });
    }
    const width = stage.clientWidth,
      height = stage.clientHeight,
      baseImageWidth = planeInner.querySelector<HTMLImageElement>(".flight-plane-image")!.clientWidth;
    gsap.set(planeInner, { rotation: mobile ? -90 : 0 });
    const mobileTravel = height / 2 + baseImageWidth * 0.62;
    const movePlane = gsap.quickSetter(plane, "y", "px");
    const moveWindow = gsap.quickSetter(arrivalWindow, "y", "px");
    const holdLandscape = gsap.quickSetter(arrival, "y", "px");
    if (mobile) {
      // The wing outline is fixed. Translate its layer and counter-translate the
      // landscape, rather than rebuilding a large polygon on every scroll frame.
      const imageHeight = baseImageWidth * 1024 / 1536;
      const edge = Array.from({ length: 17 }, (_, i) => {
        const x = width * i / 16;
        const imageY = 0.5 + (x - width / 2) / imageHeight;
        const wingX = 0.61 - 0.57 * Math.max(0, Math.abs(imageY - 0.49) - 0.075);
        return `${x}px ${height / 2 - (wingX - 0.5) * baseImageWidth}px`;
      });
      gsap.set(arrivalWindow, {
        height: height + mobileTravel,
        clipPath: `polygon(0 100%,${edge.join(",")},100% 100%)`,
        force3D: true,
      });
      gsap.set(arrival, { visibility: "visible", force3D: true });
      gsap.set(plane, { autoAlpha: 1, force3D: true });
    }
    let arrived = false;
    const paintPlane = () => {
      const p = state.progress;
      if (arrived !== (p > 0.59)) {
        arrived = p > 0.59;
        document.body.classList.toggle("flight-arrived", arrived);
      }
      if (mobile) {
        const y = (1 - 2 * p) * mobileTravel;
        movePlane(y);
        moveWindow(y);
        holdLandscape(-y);
        return;
      }
      const scale = 1 + 0.1 * p;
      const imageWidth = baseImageWidth * scale;
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
        `top+=${(flight.offsetHeight - stage.clientHeight) * (mobile ? 0.12 : 0.19)} top`,
      end: "bottom 80px",
      toggleClass: { targets: document.body, className: "flight-is-cloudy" },
      invalidateOnRefresh: true,
    });
    const flightTimeline: gsap.core.Timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: flight,
        start: "top top",
        end: () => `+=${flight.offsetHeight - height}`,
        // A short catch-up softens coarse input without the long delayed exit.
        scrub: mobile ? 0.12 : 0.35,
        invalidateOnRefresh: true,
      },
      onUpdate: mobile ? () => coverFilm(flightTimeline.progress() >= 0.18) : undefined,
    });
    if (mobile) {
      // First gesture: the question. Second gesture: the flyover and arrival.
      flightTimeline
        .to(".flight-opening", { opacity: 0, duration: 0.12 }, 0.01)
        .to(".flight-cloud-world", { autoAlpha: 1, duration: 0.16 }, 0)
        .to(".flight-cloud-base", { opacity: 1, duration: 0.16 }, 0)
        .fromTo(".flight-cloud-back", { scale: 1.08, yPercent: 2 }, { scale: 1.08, yPercent: -2, duration: 1 }, 0)
        .fromTo(".flight-thought", { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.08 }, 0.1)
        .to(".flight-thought", { autoAlpha: 0, y: -12, duration: 0.1 }, 0.4)
        .to(state, { progress: 1, duration: 0.54, onUpdate: paintPlane }, 0.34);
    } else {
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
    }
    const cleanupStory = createBonanzaStoryMotion(root);
    return () => {
      cleanupStory();
      coverFilm(false);
    };
  }, root);
  return () => {
    context.revert();
    document.body.classList.remove("flight-is-cloudy", "flight-arrived");
  };
}
