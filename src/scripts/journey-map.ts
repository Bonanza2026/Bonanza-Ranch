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
  const flights = Array.from(root.querySelectorAll<SVGPathElement>("[data-flight-route]")).map(route => ({
    route,
    length: route.getTotalLength(),
    traveller: root.querySelector<SVGGElement>(`[data-traveller="${route.dataset.flightRoute}"]`)!,
  }));
  const onward = root.querySelector<SVGPathElement>("[data-onward-route]")!;
  const onwardLength = onward.getTotalLength();
  const small = innerWidth < 768;
  svg.setAttribute("viewBox", small ? "820 120 1040 1140" : "0 0 1800 2150");
  const state = { progress: 0 };
  for (const {route, length} of flights) route.style.strokeDasharray = String(length);
  onward.style.strokeDasharray = String(onwardLength);
  const paint = () => {
    // Both flights reach Cape Town together, then share the short George leg.
    const flightProgress = Math.min(1, state.progress / 0.88);
    const onwardProgress = Math.max(0, (state.progress - 0.88) / 0.12);
    onward.style.strokeDashoffset = String(onwardLength * (1 - onwardProgress));
    flights.forEach(({route, length, traveller}, index) => {
      route.style.strokeDashoffset = String(length * (1 - flightProgress));
      const point = onwardProgress > 0
        ? onward.getPointAtLength(onwardLength * onwardProgress)
        : route.getPointAtLength(length * flightProgress);
      traveller.setAttribute("transform", `translate(${point.x} ${point.y})`);
      traveller.style.visibility = index > 0 && flightProgress === 1 ? "hidden" : "visible";
    });
  };
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    state.progress = 1;
    paint();
    return () => resetRoutes();
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
    resetRoutes();
  };
  function resetRoutes() {
    for (const route of [...flights.map(flight => flight.route), onward]) {
      route.style.removeProperty("stroke-dasharray");
      route.style.removeProperty("stroke-dashoffset");
    }
    for (const {traveller} of flights) {
      traveller.removeAttribute("transform");
      traveller.style.removeProperty("visibility");
    }
  }
}
