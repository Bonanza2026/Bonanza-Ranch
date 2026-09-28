type JourneyDependencies = {
  gsap: any;
  ScrollTrigger: any;
  MotionPathPlugin?: any;
  DrawSVGPlugin?: any;
};

/** White Desert travel-globe: a normal-flow component with a moving inner plane. */
export function bindJourneyMap({ gsap }: JourneyDependencies) {
  const root = document.querySelector<HTMLElement>("[data-journey-map]");
  if (!root) return () => {};
  const component = root.querySelector<HTMLElement>(".jm-component")!;
  const artwork = root.querySelector<HTMLElement>(".jm-map-art")!;
  const svg = root.querySelector<SVGSVGElement>(".jm-world")!;
  const route = root.querySelector<SVGPathElement>(".jm-route")!;
  const traveller = root.querySelector<SVGGElement>(".jm-traveller")!;
  const small = innerWidth < 768;
  svg.setAttribute("viewBox", small ? "725 100 730 1100" : "0 0 1800 2150");
  const length = route.getTotalLength();
  const state = { progress: 0 };
  route.style.strokeDasharray = String(length);
  const paint = () => {
    route.style.strokeDashoffset = String(length * (1 - state.progress));
    const point = route.getPointAtLength(length * state.progress);
    traveller.setAttribute("transform", `translate(${point.x} ${point.y})`);
  };
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    state.progress = 1;
    paint();
    return () => {};
  }
  const context = gsap.context(() => {
    paint();
    gsap.to(state, {
      progress: 1,
      ease: "none",
      onUpdate: paint,
      scrollTrigger: {
        trigger: component,
        start: small ? "top 70%" : "top 80%",
        end: small ? "top -10%" : "top -65%",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    // On phones, map and explanation occupy separate rows. Only the route moves.
    if (small) return;
    // Original source module 57368. No zoom, map pin or camera tracking.
    gsap.fromTo(
      artwork,
      { yPercent: -5 },
      {
        yPercent: 0,
        ease: "none",
        scrollTrigger: {
          trigger: component,
          start: "top bottom",
          end: "top top",
          scrub: true,
        },
      },
    );
    gsap.to(artwork, {
      y: "55svh",
      ease: "none",
      scrollTrigger: {
        trigger: component,
        start: "top top",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    if (!small)
      gsap.fromTo(
        ".jm-information",
        { y: 0 },
        {
          y: "40svh",
          ease: "none",
          scrollTrigger: {
            trigger: component,
            start: "top bottom",
            end: "bottom bottom",
            scrub: true,
          },
        },
      );
  }, root);
  return () => {
    context.revert();
    route.style.removeProperty("stroke-dasharray");
    route.style.removeProperty("stroke-dashoffset");
  };
}
