import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Bring a chapter's text into view, including chapters with several preceding photos. */
export function sectionScrollPosition(target: HTMLElement) {
  const copy = target.hasAttribute("data-life-chapter")
    ? target.querySelector<HTMLElement>(".chapter-copy") || target
    : target;
  const track = target.closest<HTMLElement>(".life-track");
  const scene = ScrollTrigger.getById("bonanza-life");
  if (track && scene) {
    // Older browsers can natively scroll an overflow-hidden ancestor to a hash
    // before our horizontal animation is ready. Keep only the animated offset.
    if (track.parentElement) track.parentElement.scrollLeft = 0;
    const viewport = document.documentElement.clientWidth;
    const copyRect = copy.getBoundingClientRect();
    const copyLeft = copyRect.left - track.getBoundingClientRect().left;
    const inset = Math.max(viewport * 0.05, viewport * 0.95 - copyRect.width);
    const travel = Math.max(1, track.scrollWidth - innerWidth);
    const progress = Math.max(0, Math.min(1, (copyLeft - inset) / travel));
    return scene.start + (scene.end - scene.start) * progress;
  }
  const inset = copy !== target ? 96 : target.id === "freizeit" && innerWidth < 768 ? 90 : 0;
  return Math.max(0, copy.getBoundingClientRect().top + scrollY - inset);
}
