import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { createHowItWorks, createCursor } from "./reference-interactions";
import { bindMediaSlider, bindCampActivityHover } from "./reference-subpages";
export function initializeBonanzaUI(lenis: any) {
  const en = document.documentElement.lang === "en";
  const nav = document.querySelector("nav")!,
    menu = nav.querySelector<HTMLElement>(".menu-component")!,
    panel = menu.querySelector(".menu-el"),
    inner = menu.querySelector(".menu-inner.is-desktop");
  let open = false,
    focus: HTMLElement | null = null;
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
      preview.innerHTML = `<div class="menu-img_item"><img class="img-fill" src="${link.dataset.preview}" alt=""></div>`;
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
  createCursor({ gsap });
  const flyouts = Array.from(
    document.querySelectorAll<HTMLElement>(".flyout_container.is-sticky"),
  ).map((el) => createHowItWorks({ gsap, lenis }, el));
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
  const heroVideo =
    document.querySelector<HTMLVideoElement>(".hero-banner_video");
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) heroVideo?.pause();
    else if (!matchMedia("(prefers-reduced-motion: reduce)").matches)
      heroVideo?.play().catch(() => {});
  });
  if (heroVideo) {
    new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          !document.hidden &&
          !matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          heroVideo.play().catch(() => {});
        else heroVideo.pause();
      },
      { threshold: 0 },
    ).observe(heroVideo);
  }
  const page = JSON.parse(
    document.getElementById("bonanza-page-data")?.textContent || "{}",
  );
  document.querySelectorAll(".gallery-slider").forEach((el) =>
    bindMediaSlider(el, {
      gsap,
      slides: (page.galleryItems || []).map((s: any) => ({
        title: s.title,
        description: s.body,
      })),
    }),
  );
  document
    .querySelectorAll(".split-slider")
    .forEach((el) => bindMediaSlider(el, { gsap, variant: "split" }));
  document.querySelectorAll(".camp-activities-component").forEach((el) =>
    bindCampActivityHover(el, {
      gsap,
      activities: page.activitiesScrollItems || [],
    }),
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (open) setMenu(false);
      flyouts.forEach((f) => f?.close());
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
    if (
      url.origin === location.origin &&
      url.pathname === location.pathname &&
      url.hash
    ) {
      const target = document.getElementById(
        decodeURIComponent(url.hash.slice(1)),
      );
      if (target) {
        e.preventDefault();
        const scene = ScrollTrigger.getById("bonanza-life");
        const track = document.querySelector<HTMLElement>(".life-track");
        if (target.hasAttribute("data-life-chapter") && scene && track) {
          const progress = Math.min(
            1,
            target.offsetLeft / Math.max(1, track.scrollWidth - innerWidth),
          );
          lenis.scrollTo(scene.start + (scene.end - scene.start) * progress, {
            duration: 1.5,
          });
        } else
          lenis.scrollTo(target, {
            duration: 1.2,
            offset: innerWidth < 768 && target.id === "freizeit" ? -90 : 0,
          });
      }
    }
  });
}
