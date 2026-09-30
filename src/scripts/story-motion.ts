import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function createBonanzaStoryMotion(root: HTMLElement) {
  const h = () => innerHeight,
    w = () => innerWidth,
    small = innerWidth < 768;
  const cleanups: Array<() => void> = [];
  let disposed = false;
  // Only the closing ring uses WebGL; the three wildlife photographs stay flat.
  for (const [selector, mount] of small
    ? []
    : ([
        [".bonanza-ring", "mountImageRing"],
      ] as const)) {
    const section = root.querySelector<HTMLElement>(selector)!;
    const observer = new IntersectionObserver(
      async (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        try {
          if (mount === "mountImageRing") {
            const night =
              root.querySelector<HTMLImageElement>(".life-finale img");
            if (night) {
              night.loading = "eager";
              void night.decode().catch(() => {});
            }
          }
          const galleries = await import("./reference-galleries");
          if (!disposed) cleanups.push(galleries[mount](section));
        } catch (error) {
          console.error("Bonanza gallery could not be initialized", error);
        }
      },
      { rootMargin: "1200px" },
    );
    // Prepare the ring during the long experiences sequence, not as the night sky enters.
    observer.observe(
      mount === "mountImageRing"
        ? root.querySelector<HTMLElement>(".life-film")!
        : section,
    );
    cleanups.push(() => observer.disconnect());
  }
  if (!small) {
    const worlds = root.querySelector<HTMLElement>(".wild-worlds")!;
    const photos = Array.from(worlds.querySelectorAll<HTMLElement>(".worlds-photo"));
    const captions = Array.from(worlds.querySelectorAll<HTMLElement>(".worlds-caption"));
    gsap.set(photos.slice(1), { clipPath: "inset(100% 0% 0% 0%)" });
    gsap.set(captions, { autoAlpha: 0 });
    const sequence = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: worlds, start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true },
    });
    sequence
      .fromTo(photos[0], { scale: 0.65, y: () => h() * 0.24 }, { scale: 1, y: 0, duration: 1, ease: "power1.inOut" }, 0)
      .to(captions[0], { autoAlpha: 1, duration: 0.25 }, 0.85);
    for (let index = 1; index < photos.length; index++) {
      const at = index === 1 ? 1.55 : 2.7;
      sequence
        .to(photos[index], { clipPath: "inset(0% 0% 0% 0%)", duration: 0.65, ease: "power1.inOut" }, at)
        .to(captions[index - 1], { autoAlpha: 0, duration: 0.2 }, at)
        .to(captions[index], { autoAlpha: 1, duration: 0.25 }, at + 0.45);
    }
    sequence
      .to(captions[2], { autoAlpha: 0, duration: 0.25 }, 4.1)
      .to({}, { duration: 0.85 }, 4.35);
    // Decode all three before the zoom so a slow connection cannot stall a wipe.
    const prepare = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      prepare.disconnect();
      worlds.querySelectorAll<HTMLImageElement>(".worlds-photo img").forEach(image => {
        image.loading = "eager";
        void image.decode().catch(() => {});
      });
    }, { rootMargin: "1200px" });
    prepare.observe(worlds);
    cleanups.push(() => prepare.disconnect());
  }
  // Sobha landingLuxuryTitle / MoveSide / ScaleCenter and ScaleSide patterns.
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
  const opening = {
    trigger: small ? ".reserve-triptych-sticky" : wrapper,
    start: small ? "top 38.8889%" : "top 65%",
    end: small ? "top top" : "bottom top",
    scrub: true,
    invalidateOnRefresh: true,
  };
  gsap.fromTo(
    ".reserve-center",
    { scale: 1, clipPath: "inset(0% 0% 0% 0%)" },
    {
      scale: small ? 360 / 220 : 1.4,
      clipPath: small ? "inset(0% 0% 0% 0%)" : "inset(10% 0% 10% 0%)",
      ease: "power1.inOut",
      scrollTrigger: opening,
    },
  );
  gsap.fromTo(
    ".reserve-side-left",
    { x: 0 },
    {
      x: () => -w() * (small ? 0.19444444 : 1 / 12),
      ease: "power1.inOut",
      scrollTrigger: opening,
    },
  );
  gsap.fromTo(
    ".reserve-side-right",
    { x: 0 },
    {
      x: () => w() * (small ? 0.19444444 : 1 / 12),
      ease: "power1.inOut",
      scrollTrigger: opening,
    },
  );
  // Tengile useMediaParallax(0.12): scale 1.12, yPercent -6 → +6.
  root.querySelectorAll<HTMLElement>(".reserve-editorial-image").forEach((frame) => {
    const target = frame.querySelector<HTMLElement>("img")!;
    gsap.fromTo(target, { scale: 1.12, yPercent: -6 }, {
      scale: 1.12, yPercent: 6, ease: "none",
      scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true },
    });
  });
  const film = root.querySelector<HTMLElement>(".life-film")!,
    track = root.querySelector<HTMLElement>(".life-track")!;
  const nightScene = root.querySelector<HTMLElement>(".life-finale")!;
  const setNightNavigation = (active: boolean) => document.body.classList.toggle("night-scene", active);
  cleanups.push(() => setNightNavigation(false));
  if (small) {
    ScrollTrigger.create({
      trigger: nightScene,
      start: "top 40px",
      end: "bottom 40px",
      onToggle: self => setNightNavigation(self.isActive),
    });
    const photos = root.querySelectorAll<HTMLElement>(
      ".worlds-mobile-photo, .life-chapter:not(.life-finale) .story-photo",
    );
    photos.forEach((photo, index) => {
      const image = photo.querySelector("img");
      if (image) gsap.fromTo(image, { scale: 1.12, yPercent: -6 }, {
        scale: 1.12, yPercent: 6, ease: "none",
        scrollTrigger: { trigger: photo, start: "top bottom", end: "bottom top", scrub: true },
      });
      gsap.fromTo(
        photo,
        { x: index % 2 ? 28 : -28, y: 36, autoAlpha: 0 },
        {
          x: 0,
          y: 0,
          autoAlpha: 1,
          duration: 0.95,
          ease: "power3.out",
          scrollTrigger: {
            trigger: photo,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        },
      );
    });
    root
      .querySelectorAll<HTMLElement>(
        ".life-chapter h3, .ring-title h2",
      )
      .forEach((title) => {
        gsap.fromTo(
          title,
          { y: 18, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: title,
              start: "top 92%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
  } else {
    const travel = () => track.scrollWidth - w();
    const measure = () => {
      film.style.height = `${travel() + 2 * h()}px`;
    };
    measure();
    ScrollTrigger.addEventListener("refreshInit", measure);
    cleanups.push(() => {
      ScrollTrigger.removeEventListener("refreshInit", measure);
      film.style.removeProperty("height");
    });
    // The original card rises from below and opens into the horizontal chapters.
    const expansion = gsap.timeline({
      defaults: { ease: "power1.inOut" },
      scrollTrigger: {
        trigger: film,
        start: "top top",
        end: "top -100%",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    expansion
      .fromTo(
        ".life-card",
        { y: () => -h(), yPercent: -50, scale: 480 / 1440 },
        { y: 0, yPercent: -50, scale: 1, duration: 1, ease: "none" },
        0,
      )
      .fromTo(
        ".life-card-title",
        { opacity: 1 },
        { opacity: 0, duration: 0.4, ease: "none" },
        0,
      )
      .fromTo(
        ".life-card-picture>.story-photo",
        { x: () => w() * 0.205625, scale: 1.25 },
        { x: 0, scale: 1, duration: 1, ease: "none" },
        0,
      )
      .fromTo(
        ".life-card-picture>h3,.life-card-picture>p",
        { opacity: 0 },
        { opacity: 1, duration: 0.15, ease: "none" },
        0.85,
      );
    const slider = gsap.to(track, {
      x: () => -travel(),
      ease: "none",
      scrollTrigger: {
        id: "bonanza-life",
        trigger: film,
        start: "top -100%",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    ScrollTrigger.create({
      trigger: nightScene,
      containerAnimation: slider,
      start: "left 40px",
      end: "right 40px",
      onToggle: self => setNightNavigation(self.isActive),
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
        // Reference reveals the two text faces together when the column enters.
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
    const destination =
      location.hash === "#sicherheit"
        ? root.querySelector<HTMLElement>("#sicherheit")
        : null;
    if (destination)
      requestAnimationFrame(() => {
        if (disposed) return;
        const st = slider.scrollTrigger!;
        scrollTo({
          top:
            st.start +
            (st.end - st.start) *
              Math.min(1, destination.offsetLeft / travel()),
          behavior: "instant",
        });
      });
  }
  return () => {
    disposed = true;
    cleanups.forEach((cleanup) => cleanup());
  };
}
