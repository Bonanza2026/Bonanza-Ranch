import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { createNavigationMotion } from "./navigation-motion";
import { initializeBonanzaUI } from "./bonanza-ui";
import { bindJourneyMap } from "./journey-map";
import { createDreamMotion } from "./dream-motion";
import { sectionScrollPosition } from "./section-navigation";
import { createStoryImageLoader } from "./story-images.mjs";
gsap.registerPlugin(ScrollTrigger);
// Height-only resizes from mobile browser bars must not refresh scrubbed scenes.
// Width/orientation changes are handled explicitly below.
ScrollTrigger.config({
  ignoreMobileResize: true,
  autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
});
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const nativeScroll = new URLSearchParams(location.search).get("scroll") === "native";
const lenis = new Lenis({
  autoRaf: false,
  // Wheel easing uses the same frame clock as the scroll scenes.
  duration: 1.2,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: !reduced.matches && !nativeScroll,
  syncTouch: false,
  touchMultiplier: 2,
  prevent: (element) => element.closest(".no-lenis") !== null,
});
lenis.on("scroll", ScrollTrigger.update);
const tick = (t: number) => lenis.raf(t * 1000);
gsap.ticker.add(tick);
gsap.ticker.lagSmoothing(0);
const disposeUI = initializeBonanzaUI(lenis);
let cleanups: Array<() => void> = [];
function setupMotion() {
  cleanups.forEach((fn) => fn());
  cleanups = [];
  cleanups.push(createNavigationMotion(lenis), bindJourneyMap({ gsap }));
  if (reduced.matches) {
    document
      .querySelectorAll<HTMLVideoElement>(".hero-banner_video")
      .forEach((v) => v.pause());
    return;
  }
  cleanups.push(createDreamMotion());
  const context = gsap.context(() => {
    document.querySelectorAll(".has-inset-effect").forEach((el) =>
      gsap.fromTo(
        el,
        { clipPath: "inset(0 1.25rem round .375rem)" },
        {
          clipPath: "inset(0 0rem round 0rem)",
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            end: "top 50%",
            scrub: true,
          },
        },
      ),
    );
  });
  cleanups.push(() => context.revert());
  ScrollTrigger.refresh();
}
// Start the journey immediately. Slow font downloads must not leave the hero
// pinned without its flight timeline; only measurements need a later refresh.
setupMotion();
// Warm only nearby photos after motion measurements, including reduced motion.
const storyImages = createStoryImageLoader(document.querySelector('.life-film'));
lenis.on('scroll', storyImages.update);
ScrollTrigger.addEventListener('refresh', storyImages.update);
// Resolve incoming chapter links after scene measurements, and once more when
// fonts settle. Never pull a visitor back after they have started interacting.
const entryChapter = Array.from(document.querySelectorAll<HTMLElement>("[data-life-chapter]"))
  .find(element => `#${element.id}` === location.hash);
let entryInterrupted = false;
const interruptEntry = () => { entryInterrupted = true; };
if (entryChapter) {
  ["wheel", "touchstart", "pointerdown", "keydown"].forEach(type =>
    addEventListener(type, interruptEntry, { once: true, passive: true }),
  );
}
const alignEntryChapter = () => {
  if (entryChapter && !entryInterrupted) lenis.scrollTo(sectionScrollPosition(entryChapter), { immediate: true });
};
requestAnimationFrame(alignEntryChapter);
addEventListener("hashchange", () => {
  const target = document.getElementById(location.hash.slice(1));
  if (target) lenis.scrollTo(sectionScrollPosition(target), { immediate: true });
});
if (document.readyState !== "complete") addEventListener("load", () => {
  ScrollTrigger.refresh();
  alignEntryChapter();
}, { once: true });
document.fonts.ready.then(() => {
  const refreshFonts = () => {
    ScrollTrigger.removeEventListener("scrollEnd", refreshFonts);
    lenis.resize();
    ScrollTrigger.refresh();
    alignEntryChapter();
  };
  // A late font must not reset the flight while a finger is moving the page.
  if (ScrollTrigger.isScrolling()) ScrollTrigger.addEventListener("scrollEnd", refreshFonts);
  else refreshFonts();
});
let width = innerWidth,
  resizeTimer: ReturnType<typeof setTimeout>;
addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (width !== innerWidth) {
      width = innerWidth;
      lenis.resize();
      setupMotion();
    } else if (innerWidth >= 768) {
      lenis.resize();
      ScrollTrigger.refresh();
    }
  }, 220);
});
reduced.addEventListener("change", setupMotion);
addEventListener("pagehide", (event) => {
  // Safari can retain this document in its back/forward cache. Its JS does not
  // run again on restore, so keep the scroll instance and animations alive.
  if (event.persisted) return;
  lenis.destroy();
  disposeUI();
  storyImages.destroy();
  ScrollTrigger.removeEventListener('refresh', storyImages.update);
  gsap.ticker.remove(tick);
  cleanups.forEach((fn) => fn());
});
addEventListener("pageshow", (event) => {
  if (!event.persisted) return;
  lenis.resize();
  if (document.body.dataset.menuOpen !== "true" && !document.querySelector("dialog[open]")) {
    lenis.start();
  }
  ScrollTrigger.refresh();
});
