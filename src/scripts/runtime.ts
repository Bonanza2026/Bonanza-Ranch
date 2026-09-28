import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { CustomEase } from "gsap/CustomEase";
import Lenis from "lenis";
import { createHomepageMotion, createHeaderMotion } from "./reference-motion";
import { initializeBonanzaUI } from "./bonanza-ui";
import {
  bindItineraryScroll,
  bindFixedBanner,
  bindEditorialTrio,
  bindFloatingSectionNavigation,
  bindAboutBanner,
} from "./reference-subpages";
import { bindJourneyMap } from "./journey-map";
import { createDreamMotion } from "./dream-motion";
gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, MotionPathPlugin, CustomEase);
ScrollTrigger.config({ ignoreMobileResize: true });
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const lenis = new Lenis({
  autoRaf: false,
  smoothWheel: !reduced.matches,
  syncTouch: false,
});
lenis.on("scroll", ScrollTrigger.update);
const tick = (t: number) => lenis.raf(t * 1000);
gsap.ticker.add(tick);
gsap.ticker.lagSmoothing(0);
initializeBonanzaUI(lenis);
let cleanups: Array<() => void> = [];
function setupMotion() {
  cleanups.forEach((fn) => fn());
  cleanups = [];
  cleanups.push(
    createHeaderMotion({
      gsap,
      ScrollTrigger,
      lenis,
      isMenuOpen: () => document.body.dataset.menuOpen === "true",
    }),
  );
  cleanups.push(
    bindJourneyMap({ gsap, ScrollTrigger, DrawSVGPlugin, MotionPathPlugin }),
  );
  if (reduced.matches) {
    document
      .querySelectorAll<HTMLVideoElement>(".hero-banner_video")
      .forEach((v) => v.pause());
    return;
  }
  cleanups.push(
    createHomepageMotion({
      gsap,
      ScrollTrigger,
      DrawSVGPlugin,
      MotionPathPlugin,
    }),
  );

  document
    .querySelectorAll(".fixed-banner-loader")
    .forEach((el) =>
      cleanups.push(bindFixedBanner(el, { gsap, scrollSpeed: "65svh" })),
    );
  document
    .querySelectorAll(".about-banner-loader")
    .forEach((el) => cleanups.push(bindAboutBanner(el, { gsap })));
  document
    .querySelectorAll(".itinerary-scrub_component")
    .forEach((el) => cleanups.push(bindItineraryScroll(el, { gsap })));
  document
    .querySelectorAll(".entertainment-intro")
    .forEach((el) =>
      cleanups.push(bindEditorialTrio(el, { gsap, ScrollTrigger })),
    );
  document
    .querySelectorAll(".cta-nav")
    .forEach((el) =>
      cleanups.push(
        bindFloatingSectionNavigation(el, { gsap, ScrollTrigger, lenis }),
      ),
    );
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
document.fonts.ready.then(setupMotion);
let width = innerWidth,
  resizeTimer: ReturnType<typeof setTimeout>;
addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    lenis.resize();
    if (width !== innerWidth) {
      width = innerWidth;
      setupMotion();
    }
  }, 220);
});
reduced.addEventListener("change", setupMotion);
addEventListener("pagehide", (event) => {
  // Safari can retain this document in its back/forward cache. Its JS does not
  // run again on restore, so keep the scroll instance and animations alive.
  if (event.persisted) return;
  lenis.destroy();
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
