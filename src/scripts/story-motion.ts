import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function createBonanzaStoryMotion(root: HTMLElement) {
  const h = () => innerHeight,
    w = () => innerWidth,
    small = innerWidth < 768;
  const cleanups: Array<() => void> = [];
  let disposed = false;
  // WebGL is only fetched as the first gallery approaches; the hero stays lightweight.
  for (const [selector, mount] of [
    [".wild-worlds", "mountWildWorlds"],
    [".bonanza-ring", "mountImageRing"],
  ] as const) {
    const section = root.querySelector<HTMLElement>(selector)!;
    const observer = new IntersectionObserver(
      async (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        try {
          if (mount === "mountImageRing") {
            const night = root.querySelector<HTMLImageElement>(".life-finale img");
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
    observer.observe(mount === "mountImageRing" ? root.querySelector<HTMLElement>(".life-film")! : section);
    cleanups.push(() => observer.disconnect());
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
  gsap.fromTo(
    ".reserve-editorial-image img",
    { yPercent: -8 },
    {
      yPercent: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".reserve-editorial",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    },
  );
  const film = root.querySelector<HTMLElement>(".life-film")!,
    track = root.querySelector<HTMLElement>(".life-track")!;
  if (!small) {
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
    // Original expansive card: 480/1440 -> 1 over exactly one viewport of scroll.
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
      .fromTo(".life-card", { scale: 480 / 1440 }, { scale: 1, duration: 1 }, 0)
      .fromTo(
        ".life-card-title",
        { opacity: 1 },
        { opacity: 0, duration: 0.4, ease: "none" },
        0,
      )
      .fromTo(
        ".life-card-picture>.story-photo",
        { x: () => w() * 0.205625, scale: 1.5 },
        { x: 0, scale: 1, duration: 1 },
        0,
      )
      .fromTo(
        ".life-card-picture>h3,.life-card-picture>p",
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "none" },
        0.35,
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
    track.querySelectorAll<HTMLElement>(".story-photo").forEach((figure) => {
      if (figure.closest(".life-intro, .life-editorial--landscape-pair")) return;
      const img = figure.querySelector("img")!;
      gsap.fromTo(
        img,
        { xPercent: -100 / 6 },
        {
          xPercent: 0,
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
