import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createWildlifeMotion } from "./wildlife-motion";

export function createBonanzaStoryMotion(root: HTMLElement) {
  const h = () => innerHeight,
    w = () => innerWidth,
    small = innerWidth < 768;
  const cleanups: Array<() => void> = [];
  cleanups.push(createWildlifeMotion(root));
  // The side frames separate as the central wildlife portrait opens.
  const intro = root.querySelector<HTMLElement>(".reserve-introduction")!;
  const wrapper = intro.querySelector<HTMLElement>(
    ".reserve-parallax-wrapper",
  )!;
  const entrance = {
    trigger: intro,
    start: "top bottom",
    end: "top top",
    scrub: true,
  };
  if (!small) {
    gsap.fromTo(
      ".reserve-opening-title",
      { y: -100 },
      { y: 0, ease: "power1.out", scrollTrigger: entrance },
    );
    gsap.fromTo(
      ".reserve-side>div",
      { y: -200 },
      { y: 0, ease: "none", scrollTrigger: entrance },
    );
  }
  // A shared, gently scrubbed timeline keeps the three frames in step. On
  // mobile the zoom continues into the sticky phase instead of finishing on entry.
  const opening = gsap.timeline({
    defaults: { duration: 1, ease: "none" },
    scrollTrigger: {
      trigger: small ? ".reserve-triptych-sticky" : wrapper,
      start: small ? "top 45%" : "top 65%",
      end: small ? "top -35%" : "bottom top",
      scrub: small ? 0.45 : 0.55,
      invalidateOnRefresh: true,
    },
  });
  opening.fromTo(
    ".reserve-center",
    { scale: 1, clipPath: "inset(0% 0% 0% 0%)" },
    {
      scale: small ? 360 / 220 : 1.4,
      clipPath: small ? "inset(0% 0% 0% 0%)" : "inset(10% 0% 10% 0%)",
    },
    0,
  );
  opening.fromTo(
    ".reserve-side-left",
    { x: 0 },
    {
      x: () => -w() * (small ? 0.19444444 : 1 / 12),
    },
    0,
  );
  opening.fromTo(
    ".reserve-side-right",
    { x: 0 },
    {
      x: () => w() * (small ? 0.19444444 : 1 / 12),
    },
    0,
  );
  // The overscan covers the frame throughout the vertical parallax movement.
  root.querySelectorAll<HTMLElement>(".reserve-editorial-image").forEach((frame) => {
    const target = frame.querySelector<HTMLElement>("img")!;
    gsap.fromTo(target, { scale: 1.12, yPercent: -6 }, {
      scale: 1.12, yPercent: 6, ease: "none",
      scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true },
    });
  });
  const film = root.querySelector<HTMLElement>(".life-film")!,
    track = root.querySelector<HTMLElement>(".life-track")!;
  if (small) {
    const photos = root.querySelectorAll<HTMLElement>(
      ".life-chapter:not(.life-finale) .story-photo",
    );
    photos.forEach((photo) => {
      const image = photo.querySelector("img");
      if (image) gsap.fromTo(image, { scale: 1.12, yPercent: -6 }, {
        scale: 1.12, yPercent: 6, ease: "none",
        scrollTrigger: { trigger: photo, start: "top bottom", end: "bottom top", scrub: true },
      });
    });
  } else {
    const travel = () => track.scrollWidth - w();
    const measure = () => {
      film.style.height = `${travel() + h()}px`;
    };
    measure();
    ScrollTrigger.addEventListener("refreshInit", measure);
    cleanups.push(() => {
      ScrollTrigger.removeEventListener("refreshInit", measure);
      film.style.removeProperty("height");
    });
    const slider = gsap.to(track, {
      x: () => -travel(),
      ease: "none",
      scrollTrigger: {
        id: "bonanza-life",
        trigger: film,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    track.querySelectorAll<HTMLElement>(".story-photo").forEach((figure) => {
      if (figure.closest(".life-intro"))
        return;
      const img = figure.querySelector("img")!;
      gsap.fromTo(
        img,
        { scale: 1.12, xPercent: -6 },
        {
          scale: 1.12,
          xPercent: 6,
          ease: "none",
          scrollTrigger: {
            trigger: figure,
            containerAnimation: slider,
            start: "left right",
            end: "right left",
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    });
    track
      .querySelectorAll<HTMLElement>("article:not(.life-intro) h3")
      .forEach((title) => {
        // Heading lines enter together with the chapter's text column.
        gsap.fromTo(
          title.children,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.1,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: title,
              containerAnimation: slider,
              start: "left 98%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
  }
  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
}
