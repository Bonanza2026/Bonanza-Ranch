import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { createPointerCursor } from "./pointer-cursor";
import { sectionScrollPosition } from "./section-navigation";
export function initializeBonanzaUI(lenis: any) {
  const en = document.documentElement.lang === "en";
  const nav = document.querySelector("nav")!,
    menu = nav.querySelector<HTMLElement>(".menu-component")!,
    panel = menu.querySelector(".menu-el"),
    inner = menu.querySelector(".menu-inner.is-desktop");
  let open = false,
    focus: HTMLElement | null = null;
  gsap.registerPlugin(CustomEase);
  CustomEase.create("menuClip", "0.76,0,0.24,1");
  function setMenu(value: boolean) {
    open = value;
    document.body.dataset.menuOpen = String(open);
    menu.classList.toggle("open", open);
    nav
      .querySelectorAll(".menu-toggle,.btn-tab")
      .forEach((b) => b.setAttribute("aria-expanded", String(open)));
    gsap.killTweensOf([panel, inner]);
    if (open) {
      focus = document.activeElement as HTMLElement;
      lenis.stop();
      gsap.fromTo(
        panel,
        { clipPath: "inset(0 100% 0 0 round .25em)" },
        {
          clipPath: "inset(0 0% 0 0 round .25em)",
          duration: 0.45,
          ease: "menuClip",
        },
      );
      gsap.fromTo(
        inner,
        { opacity: 0, x: "-10rem" },
        { opacity: 1, x: 0, duration: 0.8, ease: "expo.out" },
      );
    } else {
      lenis.start();
      gsap.set(panel, { clipPath: "inset(0 100% 0 0 round .25em)" });
      focus?.focus({ preventScroll: true });
    }
  }
  nav
    .querySelectorAll(".nav-left button,.menu-toggle")
    .forEach((b) => b.addEventListener("click", () => setMenu(!open)));
  menu
    .querySelectorAll(".menu-bg,.menu-close")
    .forEach((b) => b.addEventListener("click", () => setMenu(false)));
  menu
    .querySelectorAll("a")
    .forEach((a) => a.addEventListener("click", () => setMenu(false)));
  const preview = menu.querySelector<HTMLElement>(".menu-img_wrap");
  menu.querySelectorAll<HTMLElement>("[data-preview]").forEach((link) => {
    link.addEventListener("mouseenter", () => {
      if (!preview) return;
      const item = document.createElement('div');
      item.className = 'menu-img_item';
      const image = document.createElement('img');
      image.className = 'img-fill';
      image.src = link.dataset.preview!;
      image.alt = '';
      item.append(image);
      preview.replaceChildren(item);
      gsap.fromTo(
        preview,
        { clipPath: "inset(0 100% 0 0)", opacity: 1 },
        { clipPath: "inset(0 0% 0 0)", duration: 0.45, ease: "menuClip" },
      );
    });
    link.addEventListener("mouseleave", () => {
      if (preview) gsap.to(preview, { opacity: 0, duration: 0.2 });
    });
  });
  const disposeCursor = createPointerCursor();
  const film = document.querySelector<HTMLDialogElement>(".ranch-film")!,
    video = film.querySelector("video")!;
  const closeFilm = () => {
    video.pause();
    film.close();
    lenis.start();
  };
  document.querySelectorAll("[data-film]").forEach((b) =>
    b.addEventListener("click", () => {
      film.showModal();
      lenis.stop();
      if (!video.dataset.loaded) {
        video.querySelectorAll<HTMLSourceElement>('source[data-src]').forEach((source) => {
          source.src = source.dataset.src!;
        });
        video.dataset.loaded = 'true';
        video.load();
      }
      video.currentTime = 0;
      video.play().catch(() => {});
    }),
  );
  film.querySelector("[data-film-close]")?.addEventListener("click", closeFilm);
  film.addEventListener("click", (e) => {
    if (e.target === film) closeFilm();
  });
  film.addEventListener("cancel", closeFilm);
  film.addEventListener("close", () => {
    video.pause();
    if (!open) lenis.start();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (open) setMenu(false);
    }
  });
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element)?.closest<HTMLAnchorElement>("a[href]");
    if (!a || a.hasAttribute("download") || (a.target && a.target !== "_self")) return;
    const url = new URL(a.href);
    // Legal documents always navigate to a page; never enter the scroll journey.
    if (url.origin === location.origin && /^\/(?:impressum|datenschutz|en\/(?:legal|privacy))\/?$/.test(url.pathname) && url.pathname !== location.pathname) {
      e.preventDefault();
      lenis.stop();
      location.assign(url.href);
      return;
    }
    const currentPath = location.pathname.replace(/\/$/, "") || "/";
    const linkPath = url.pathname.replace(/\/$/, "") || "/";
    const samePage = linkPath === currentPath || (currentPath === "/" && linkPath === (en ? "/en" : "/de"));
    if (
      url.origin === location.origin &&
      samePage &&
      url.hash
    ) {
      const target = document.getElementById(
        decodeURIComponent(url.hash.slice(1)),
      );
      if (target) {
        e.preventDefault();
        if (location.hash !== url.hash) history.pushState(null, "", url.hash);
        lenis.scrollTo(sectionScrollPosition(target), {
          duration: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1.2,
        });
      }
    }
  });
  return disposeCursor;
}
