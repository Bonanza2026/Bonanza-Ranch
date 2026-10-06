import { gsap } from "gsap";

export function createPointerCursor() {
  const cursor = document.querySelector<HTMLElement>(".custom-cursor");
  if (!cursor) return () => {};
  const media = gsap.matchMedia();
  media.add("(hover: hover) and (pointer: fine)", () => {
    const dot = cursor.querySelector<HTMLElement>(".custom-cursor_dot")!;
    const vertical = cursor.querySelector<HTMLElement>(".custom-cursor_line-vertical")!;
    const horizontal = cursor.querySelector<HTMLElement>(".custom-cursor_line-horizontal")!;
    const label = cursor.querySelector<HTMLElement>(".custom-cursor_label")!;
    const text = cursor.querySelector<HTMLElement>(".custom-cursor_label-text")!;
    gsap.set(cursor, { xPercent: -150, yPercent: -150 });
    const moveX = gsap.quickTo(cursor, "x", { duration: 0.3, ease: "power3.out" });
    const moveY = gsap.quickTo(cursor, "y", { duration: 0.3, ease: "power3.out" });
    const events = new AbortController();
    let point = { x: 0, y: 0 };
    let state = "";
    const inspect = (target: Element | null) => {
      const caption = target?.closest<HTMLElement>("[data-cursor-text]");
      const content = caption?.dataset.cursorText || "";
      const interactive = Boolean(content || target?.closest("a,button,[role=button]"));
      const glass = Boolean(target?.closest("[data-cursor-glass]"));
      const next = `${interactive}:${glass}:${content}`;
      if (next === state) return;
      state = next;
      text.textContent = content;
      label.classList.toggle("is-glass", glass);
      gsap.to(dot, { rotation: interactive ? 45 : 0, duration: 0.3, ease: "power2.out", overwrite: true });
      gsap.to(vertical, { height: interactive ? 12 : 0, opacity: Number(interactive), duration: 0.3, overwrite: true });
      gsap.to(horizontal, { width: interactive ? 12 : 0, opacity: Number(interactive), duration: 0.3, overwrite: true });
      gsap.to(label, { opacity: Number(Boolean(content)), duration: 0.3, overwrite: true });
    };
    document.addEventListener("pointermove", event => {
      if (event.pointerType !== "mouse") return;
      point = { x: event.clientX, y: event.clientY };
      moveX(point.x); moveY(point.y);
      inspect(event.target instanceof Element ? event.target : null);
    }, { signal: events.signal, passive: true });
    document.addEventListener("pointerout", event => {
      if (!event.relatedTarget) inspect(null);
    }, { signal: events.signal });
    window.addEventListener("scroll", () => inspect(document.elementFromPoint(point.x, point.y)), {
      signal: events.signal, passive: true,
    });
    return () => { events.abort(); moveX.tween.kill(); moveY.tween.kill(); };
  });
  return () => media.revert();
}
