import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";

export function createNavigationMotion(lenis: Lenis) {
  const navigation = document.querySelector<HTMLElement>("nav");
  if (!navigation) return () => {};
  const context = gsap.context(() => {
    gsap.set(navigation, { yPercent: 0 });
  }, navigation);
  const hide = gsap.to(navigation, {
    yPercent: -100,
    duration: 0.3,
    ease: "sine.inOut",
    paused: true,
  });
  const updateVisibility = () => {
    if (document.body.dataset.menuOpen === "true") return;
    if (lenis.scroll <= 10 || lenis.direction < 0) hide.reverse();
    else if (lenis.direction > 0) hide.play();
  };
  const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-nav-theme]:not(body)"));
  const regions = sections.map(section => ({
    theme: section.dataset.navTheme!,
    top: ScrollTrigger.create({ trigger: section, start: "clamp(top 40px)", end: "bottom 40px" }),
    bottom: ScrollTrigger.create({ trigger: section, start: "top+=40px bottom", end: "bottom bottom+=40px" }),
  }));
  const updateTheme = () => {
    for (const [attribute, edge] of [["data-nav-theme", "top"], ["data-alt-nav", "bottom"]] as const) {
      const active = regions.filter(region => lenis.scroll >= region[edge].start && lenis.scroll < region[edge].end)
        .sort((a, b) => b[edge].start - a[edge].start)[0];
      if (active) document.body.setAttribute(attribute, active.theme);
      else document.body.removeAttribute(attribute);
    }
  };
  lenis.on("scroll", updateVisibility);
  lenis.on("scroll", updateTheme);
  ScrollTrigger.addEventListener("refresh", updateTheme);
  updateTheme();
  return () => {
    lenis.off("scroll", updateVisibility);
    lenis.off("scroll", updateTheme);
    ScrollTrigger.removeEventListener("refresh", updateTheme);
    regions.forEach(region => { region.top.kill(); region.bottom.kill(); });
    hide.revert();
    context.revert();
    document.body.removeAttribute("data-nav-theme");
    document.body.removeAttribute("data-alt-nav");
  };
}
