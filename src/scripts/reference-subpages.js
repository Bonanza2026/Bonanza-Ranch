/*
 * Newly written research adapters. No React/Next runtime or copied component code.
 * These are integration examples, not a drop-in implementation of the whole site.
 * Pass the application's own GSAP instance and normalized data. No network calls.
 */

const queryAll = (root, selector) => Array.from(root.querySelectorAll(selector));
const wrapIndex = (value, length) => (value + length) % length;
const fullClip = 'polygon(0 0,100% 0,100% 100%,0 100%)';
const leftClip = 'polygon(0 0,0 0,0 100%,0 100%)';
const rightClip = 'polygon(100% 0,100% 0,100% 100%,100% 100%)';

export function bindMediaSlider(root, { gsap, variant = 'gallery', slides = [] }) {
  const stem = variant === 'split' ? 'split-slider' : 'gallery-slider';
  const panels = queryAll(root, `.${stem}_item`);
  const media = panels.map(panel => panel.querySelector(`.${stem}_image,.${stem}_video`));
  const thumbs = queryAll(root, '.gallery-slider_thumb');
  const caption = root.querySelector('.gallery-slider_info-wrap');
  const next = root.querySelector('.gallery-slider_zone--right') || root.querySelectorAll('.split-slider_nav-btn')[1];
  const previous = root.querySelector('.gallery-slider_zone--left') || root.querySelectorAll('.split-slider_nav-btn')[0];
  const controller = new AbortController();
  const listen = (element, event, handler, extra = {}) => element?.addEventListener(event, handler, { signal: controller.signal, ...extra });
  let active = 0;
  let animation;
  let gesture;
  const rootStyles = getComputedStyle(document.documentElement);
  const small = rootStyles.getPropertyValue('--size-25').trim() || '2.5rem';
  const large = rootStyles.getPropertyValue('--size-5').trim() || '5rem';

  function showCaption(index) {
    if (!caption || !slides[index]) return;
    const title = caption.querySelector('.gallery-slider_info-title-text');
    const body = caption.querySelector('.gallery-slider_info-dropdown-content p');
    if (title) title.textContent = slides[index].title || '';
    if (body) body.textContent = slides[index].description || '';
  }

  function go(index, forward = index > active) {
    if (panels.length < 2) return;
    const target = wrapIndex(index, panels.length);
    if (target === active) return;
    animation?.kill();
    const previousIndex = active;
    active = target;
    panels.forEach((panel, i) => {
      gsap.set(panel, { zIndex: i === target ? 2 : i === previousIndex ? 1 : 0 });
    });
    animation = gsap.timeline({ defaults: { duration: 1, ease: 'expo.out' } });
    animation.fromTo(panels[target], { clipPath: forward ? rightClip : leftClip }, { clipPath: fullClip }, 0);
    animation.to(panels[previousIndex], { clipPath: forward ? leftClip : rightClip }, 0);
    if (media[previousIndex]) animation.to(media[previousIndex], { xPercent: forward ? -10 : 10 }, 0);
    if (media[target]) animation.fromTo(media[target], { xPercent: forward ? 10 : -10 }, { xPercent: 0 }, 0);
    thumbs.forEach((thumb, i) => {
      const selected = i === target;
      thumb.classList.toggle('is-active', selected);
      thumb.setAttribute('aria-selected', String(selected));
      animation.to(thumb, { width: selected ? large : small, borderWidth: selected ? 0.5 : 0 }, 0);
      const image = thumb.querySelector('img,video');
      if (image) animation.to(image, { opacity: selected ? 0 : 1 }, 0);
    });
    if (caption && slides[target]) {
      gsap.to(caption, { opacity: 0, duration: 0.25, ease: 'power2.out', onComplete: () => {
        showCaption(target);
        gsap.to(caption, { opacity: 1, duration: 0.25, ease: 'power2.in' });
      } });
    }
  }

  panels.forEach((panel, index) => gsap.set(panel, { clipPath: index ? leftClip : fullClip, zIndex: index ? 0 : 1 }));
  thumbs.forEach((thumb, index) => {
    gsap.set(thumb, { width: index ? small : large, borderWidth: index ? 0 : 0.5 });
    const image = thumb.querySelector('img,video');
    if (image) gsap.set(image, { opacity: index ? 1 : 0 });
    listen(thumb, 'click', () => go(index));
    listen(thumb, 'keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); go(index); }
    });
  });
  listen(next, 'click', () => go(active + 1, true));
  listen(previous, 'click', () => go(active - 1, false));
  // Scope keyboard handling to this gallery, avoiding multiple galleries moving together.
  listen(root, 'keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); go(active - 1, false); }
    if (event.key === 'ArrowRight') { event.preventDefault(); go(active + 1, true); }
  });
  listen(root, 'touchstart', event => {
    gesture = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true });
  listen(root, 'touchend', event => {
    if (!gesture) return;
    const dx = event.changedTouches[0].clientX - gesture.x;
    const dy = event.changedTouches[0].clientY - gesture.y;
    gesture = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(active + (dx < 0 ? 1 : -1), dx < 0);
  }, { passive: true });
  return { go, destroy() { controller.abort(); animation?.kill(); } };
}

export function bindItineraryScroll(root, { gsap }) {
  const mediaQuery = gsap.matchMedia();
  mediaQuery.add('(min-width: 769px) and (prefers-reduced-motion: no-preference)', () => {
    const items = queryAll(root, '.itinerary-scrub_item');
    const panels = queryAll(root, '.itinerary-scrub_media-wrap');
    const column = root.querySelector('.itinerary-scrub_items-wrapper');
    if (!column || !items.length) return;
    const last = items.at(-1);
    const travel = Math.max(0, last.offsetTop + last.offsetHeight - column.parentElement.offsetHeight);
    const timeline = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
      trigger: root, start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true,
    } });
    timeline.to(column, { y: -travel, duration: Math.max(1, items.length - 1) }, 0);
    panels.forEach((panel, index) => {
      gsap.set(panel, { zIndex: panels.length - index });
      if (index === panels.length - 1) return;
      timeline.fromTo(panel, { clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 100% 0)', duration: 1 }, index);
      const image = panel.querySelector('.image-with-overlay');
      const videoShade = panel.querySelector('.itinerary-scrub_media-overlay');
      if (image) timeline.fromTo(image, { '--overlay-opacity': 0 }, { '--overlay-opacity': 0.6, duration: 1 }, index);
      if (videoShade) timeline.fromTo(videoShade, { opacity: 0 }, { opacity: 0.6, duration: 1 }, index);
      if (items[index]) timeline.fromTo(items[index], { opacity: 1 }, { opacity: 0.2, duration: 1 }, index);
    });
  });
  return () => mediaQuery.revert();
}

export function bindCampActivityHover(root, { gsap, activities }) {
  const conditions = gsap.matchMedia();
  conditions.add('(hover: hover) and (pointer: fine)', () => {
    const rows = queryAll(root, '.camp-activities-item');
    const area = root.querySelector('.camp-activities-layout');
    const reference = root.querySelector('.camp-activities-wrap');
    const preview = root.querySelector('.camp-activities-left_wrap');
    const line = root.querySelector('.camp-activities-line_wrap');
    if (!area || !reference || !preview || !line || !rows.length) return;
    const movePreview = gsap.quickTo(preview, 'y', { duration: 0.4, ease: 'sine.out' });
    const moveLine = gsap.quickTo(line, 'y', { duration: 0.4, ease: 'sine.out' });
    const events = new AbortController();
    let pointerY = null;
    let active = -1;
    function update() {
      if (pointerY === null) return;
      const boxes = rows.map(row => row.getBoundingClientRect());
      let nearest = 0;
      for (let i = 1; i < boxes.length; i++) {
        if (Math.abs(pointerY - boxes[i].top - boxes[i].height / 2) < Math.abs(pointerY - boxes[nearest].top - boxes[nearest].height / 2)) nearest = i;
      }
      const y = boxes[nearest].top - reference.getBoundingClientRect().top;
      movePreview(y); moveLine(y);
      rows.forEach((row, i) => row.classList.toggle('is-active', i === nearest));
      if (active === nearest || !activities[nearest]) return;
      active = nearest;
      const item = activities[nearest];
      const image = preview.querySelector('img');
      if (image && item.image) {
        image.src = item.image;
        image.alt = item.name || '';
        image.removeAttribute('srcset');
      }
      const caption = preview.querySelectorAll('.camp-activities-excerpt')[1];
      if (caption) caption.textContent = item.caption || '';
    }
    root.addEventListener('mousemove', event => { pointerY = event.clientY; update(); }, { signal: events.signal });
    window.addEventListener('scroll', update, { signal: events.signal, passive: true });
    area.addEventListener('mouseenter', () => area.classList.add('is-hovering'), { signal: events.signal });
    area.addEventListener('mouseleave', () => {
      area.classList.remove('is-hovering');
      rows.forEach(row => row.classList.remove('is-active'));
    }, { signal: events.signal });
    return () => events.abort();
  });
  return () => conditions.revert();
}

export function selectRateSeason({ seasons, featuredSeason, search = window.location.search }) {
  const requested = new URLSearchParams(search).get('season');
  return seasons.includes(requested) ? requested : seasons.includes(featuredSeason) ? featuredSeason : seasons[0] || '';
}

export function tripsForSeason(trips, season) {
  return trips.filter(trip => (trip.dateRanges || []).some(date => date.seasonName === season));
}

export function itineraryQuerySlug(title) {
  return title.replace(/<[^>]*>/g, '').replace(/&/g, 'and').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function bindEnquiryPreview(form, { onPreview }) {
  const events = new AbortController();
  const submit = form.querySelector('[type="submit"]');
  function valid() {
    const data = new FormData(form);
    const email = String(data.get('email') || '').trim();
    return Boolean(String(data.get('name') || '').trim() && String(data.get('surname') || '').trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  }
  function sync() {
    if (submit) { submit.disabled = !valid(); submit.classList.toggle('ready', valid()); }
  }
  form.addEventListener('input', sync, { signal: events.signal });
  form.addEventListener('change', sync, { signal: events.signal });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!valid()) return;
    const data = new FormData(form);
    const values = Object.fromEntries(data.entries());
    values.interests = data.getAll('interests');
    values.itinerary = new URLSearchParams(window.location.search).get('itinerary') || '';
    // Integration must clearly label this as local preview. No live API/CRM traffic.
    onPreview?.(values, 'Local preview: your enquiry has not been sent.');
  }, { signal: events.signal });
  sync();
  return () => events.abort();
}

export function bindFixedBanner(loader, { gsap, scrollSpeed = '15svh' } = {}) {
  const context = gsap.context(() => {
    const background = loader.querySelector('.fixed-banner_bg');
    const content = loader.querySelector('.fixed-banner');
    const inner = loader.querySelector('.fixed-banner_inner');
    const fade = loader.querySelector('.fixed-banner_fade');
    if (!background || !content) return;
    if (!background.classList.contains('is-true-fixed')) {
      gsap.to(background, { y: '100svh', ease: 'none', scrollTrigger: {
        trigger: background, start: 'top top', end: 'bottom top', scrub: true,
      } });
    }
    if (inner && scrollSpeed) gsap.to(inner, { y: scrollSpeed, ease: 'none', scrollTrigger: {
      trigger: content, start: 'top top', end: 'bottom top', scrub: true,
    } });
    if (fade) gsap.fromTo(fade, { opacity: 0, y: 0 }, { opacity: 0.8, y: '100svh', ease: 'none', scrollTrigger: {
      trigger: background, start: 'top top', end: 'bottom top', scrub: true,
    } });
  }, loader);
  return () => context.revert();
}

export function bindEditorialTrio(intro, { gsap, ScrollTrigger }) {
  // Pass .entertainment-intro, not the surrounding section: the mist marker is inside it.
  const outer = intro.querySelector('.entertainment-imgs_outer');
  const inner = intro.querySelector('.entertainment-imgs_inner');
  const left = intro.querySelector('.entertainment-img.is-left');
  const right = intro.querySelector('.entertainment-img.is-right');
  const center = intro.querySelector('.entertainment-img.entertain-sticky');
  const mist = intro.querySelector('.mist-divider_wrap');
  const headingLayer = queryAll(intro, ':scope > section').find(section => section.querySelector('.section-title'));
  if (!outer || !inner || !center || !mist) return () => {};
  const conditions = gsap.matchMedia();
  const context = gsap.context(() => {
    function pin() {
      ScrollTrigger.create({ trigger: outer, start: 'top top', endTrigger: mist, end: 'bottom top',
        pin: inner, pinSpacing: false, scrub: true, invalidateOnRefresh: true });
    }
    conditions.add('(max-width: 768px)', () => {
      if (!left || !right) return;
      gsap.set([left, right, center], { clearProps: 'opacity' });
      gsap.set(left, { zIndex: 3 }); gsap.set(right, { zIndex: 2 }); gsap.set(center, { zIndex: 1 });
      pin();
      const swaps = gsap.timeline({ scrollTrigger: {
        trigger: outer, start: 'top bottom', end: 'top top', scrub: true, invalidateOnRefresh: true,
      } });
      swaps.set([left, right, center], { opacity: 1 }, 0);
      // Literal timeline positions from source. Total duration is .67; these are not percentages.
      swaps.to(left, { opacity: 0, duration: 0.01, ease: 'none' }, 0.33);
      swaps.to(right, { opacity: 0, duration: 0.01, ease: 'none' }, 0.66);
    });
    conditions.add('(min-width: 769px)', () => {
      const sides = [left, right].filter(Boolean);
      if (sides.length) gsap.fromTo(sides, { y: '10rem' }, { y: '0rem', ease: 'none', scrollTrigger: {
        trigger: outer, start: 'top bottom', end: 'top top', scrub: true, invalidateOnRefresh: true,
      } });
      pin();
      gsap.to(center, { width: '102%', ease: 'none', scrollTrigger: {
        trigger: outer, start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true,
      } });
    });
    if (headingLayer) gsap.fromTo(headingLayer, { y: 0 }, { y: '100svh', ease: 'none', scrollTrigger: {
      trigger: mist, start: 'top center', end: 'bottom top', scrub: true,
    } });
  }, intro);
  return () => { conditions.revert(); context.revert(); };
}

export function bindCampStack(section, { gsap, ScrollTrigger }) {
  // Pin the outer stack items, and clip the inner anchor. These are different elements.
  const context = gsap.context(() => {
    const stacks = queryAll(section, '.large-card_stack-item');
    const last = stacks.at(-1);
    if (!last) return;
    stacks.forEach((stack, index) => {
      if (index === stacks.length - 1) return;
      ScrollTrigger.create({ trigger: stack, start: 'top top', endTrigger: last, end: 'top top', pin: stack, pinSpacing: false });
      const following = stacks[index + 1];
      const image = stack.querySelector('.image-with-overlay');
      const text = stack.querySelector('.camp-card_content');
      const scroll = { trigger: following, start: 'top bottom', end: 'top top', scrub: true };
      if (image) gsap.fromTo(image, { '--overlay-opacity': 0.2 }, { '--overlay-opacity': 0.6, ease: 'none', scrollTrigger: scroll });
      if (text) gsap.fromTo(text, { opacity: 1 }, { opacity: 0, ease: 'none', scrollTrigger: scroll });
    });
    queryAll(section, '.camp-card').forEach(card => gsap.fromTo(card,
      { clipPath: 'inset(0rem 0rem 0rem 0rem round 0rem)' },
      { clipPath: 'inset(0.75rem 0.75rem 0.75rem 0.75rem round 0.375rem)', ease: 'none', scrollTrigger: {
        trigger: card, start: 'top 20%', end: 'top 0%', scrub: true,
      } }));
  }, section);
  return () => context.revert();
}

export function bindFloatingSectionNavigation(nav, { gsap, ScrollTrigger, lenis } = {}) {
  // Expected .cta-nav DOM already exists in the trip detail HTML.
  const label = nav.querySelector('.cta-nav_active-label');
  const items = queryAll(nav, '.cta-nav_item');
  const entries = items.map(item => {
    const anchor = item.querySelector('a[href^="#"]');
    if (!anchor) return null;
    const id = decodeURIComponent(anchor.hash.slice(1));
    return { item, anchor, id, section: document.getElementById(id), text: anchor.textContent.trim() };
  }).filter(entry => entry?.section);
  if (!label || !entries.length) return () => {};
  const events = new AbortController();
  const touch = window.matchMedia('(hover: none) or (pointer: coarse)');
  const triggers = [];
  let active = '';
  let hovering = false;
  let afterLast = false;
  let locked = false;
  let measuredWidth;
  let measuredHeight;
  const initialStyle = nav.getAttribute('style');
  let initTimer;

  function render() {
    if (!measuredWidth || !measuredHeight) return;
    const controls = entries.map(entry => entry.item);
    gsap.killTweensOf([nav, label, ...controls]);
    locked = true;
    const unlocked = () => { locked = false; };
    entries.forEach(entry => entry.anchor.classList.toggle('active', entry.id === active));
    label.textContent = entries.find(entry => entry.id === active)?.text || '';
    const common = { ease: 'power2.inOut' };
    if (afterLast) {
      nav.classList.add('is-active');
      gsap.to(controls, { opacity: 0, pointerEvents: 'none', duration: 0.15, ...common });
      gsap.to(label, { opacity: 0, duration: 0.15, ...common });
      gsap.to(nav, { scaleY: 0, transformOrigin: 'top center', duration: 0.2, onComplete: unlocked, ...common });
    } else if (!active || hovering) {
      nav.classList.remove('is-active');
      gsap.to(label, { opacity: 0, duration: 0.3, ...common });
      gsap.to(nav, { width: `${measuredWidth}em`, height: `${measuredHeight}em`, scaleY: 1, transformOrigin: 'bottom center', duration: 0.3, ...common });
      gsap.to(controls, { opacity: 1, pointerEvents: 'auto', duration: 0.3, delay: 0.1, onComplete: unlocked, ...common });
    } else {
      nav.classList.add('is-active');
      gsap.to(controls, { opacity: 0, pointerEvents: 'none', duration: 0.3, ...common });
      gsap.to(nav, { width: '12.5em', height: `${measuredHeight}em`, scaleY: 1, transformOrigin: 'bottom center', duration: 0.3, delay: 0.1, ...common });
      gsap.to(label, { opacity: 1, duration: 0.3, delay: 0.2, onComplete: unlocked, ...common });
    }
  }

  function enter() { if (!locked) { hovering = true; render(); } }
  function leave() { if (!locked) { hovering = false; render(); } }
  nav.addEventListener('mouseenter', enter, { signal: events.signal });
  nav.addEventListener('mouseleave', leave, { signal: events.signal });
  // Keyboard focus and direct label activation are accessibility additions to the source hover UI.
  nav.addEventListener('focusin', enter, { signal: events.signal });
  label.addEventListener('click', () => { hovering = !hovering; render(); }, { signal: events.signal });
  entries.forEach(entry => entry.anchor.addEventListener('click', event => {
    event.preventDefault();
    if (touch.matches) { hovering = false; render(); }
    if (lenis) lenis.scrollTo(entry.section, { offset: 0, duration: 1.2, easing: t => Math.min(1, 1.001 - 2 ** (-10 * t)) });
    else entry.section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, { signal: events.signal }));

  initTimer = window.setTimeout(() => {
    const box = nav.getBoundingClientRect();
    const em = parseFloat(getComputedStyle(nav).fontSize);
    measuredWidth = box.width / em; measuredHeight = box.height / em;
    gsap.set(nav, { width: `${measuredWidth}em`, height: `${measuredHeight}em` });
    entries.forEach((entry, index) => triggers.push(ScrollTrigger.create({
      trigger: entry.section, start: 'clamp(top center)', end: 'clamp(bottom center)',
      onEnter() { if (!afterLast) { active = entry.id; render(); } },
      onEnterBack() { active = entry.id; afterLast = false; render(); },
      onLeaveBack() { if (index === 0) { active = ''; render(); } },
      onLeave() { if (index === entries.length - 1) { active = ''; afterLast = true; render(); } },
    })));
    ScrollTrigger.refresh();
  }, 100);

  return () => {
    clearTimeout(initTimer); events.abort(); triggers.forEach(trigger => trigger.kill());
    gsap.killTweensOf([nav, label, ...items]);
    initialStyle === null ? nav.removeAttribute('style') : nav.setAttribute('style', initialStyle);
  };
}

export function resolveMediaDescriptor(descriptor, forcedKind) {
  if (!descriptor) return null;
  if (typeof descriptor === 'string') return descriptor;
  const kind = forcedKind || descriptor.mediaType || (descriptor.imageType ? 'image' : descriptor.videoType ? 'video' : null);
  if (kind === 'image') {
    return descriptor.imageType === 'upload' ? descriptor.imageFile?.asset?.url || null : descriptor.imageUrl || null;
  }
  if (kind === 'video') {
    if (descriptor.videoType === 'upload') return descriptor.videoFile?.asset?.url || null;
    if (descriptor.videoType === 'select') return descriptor.videoReference?.asset?.url || null;
    return descriptor.videoUrl || null;
  }
  return descriptor.asset?.url || null;
}

export function normalizeInteractionData(props) {
  const data = props.data || {};
  const settings = props.settings || {};
  const gallery = (data.galleryItems || []).map((item, index) => {
    const source = resolveMediaDescriptor(item.media);
    const isVideo = item.media?.mediaType === 'video' || /\.(mp4|m3u8)(?:[?#]|$)/i.test(source || '');
    return { id: item._key || String(index), title: item.title || '', description: item.body || '', ...(isVideo ? { video: source } : { image: source }) };
  });
  const campActivities = (data.activitiesScrollItems || []).map(item => ({
    image: resolveMediaDescriptor(item.image, 'image'), name: item.title || '', caption: item.caption || '',
  }));
  const rates = (data.tripsItems || []).map((item, index) => ({
    ...item,
    key: `${index}:${item.title || ''}:${item.price || ''}`,
    dateRanges: item.dateRanges || [],
    imageUrl: item.image?.asset?.url || null,
    slides: item.gallery?.length ? item.gallery.map(media => ({
      type: media.mediaType, src: resolveMediaDescriptor(media),
    })) : [{ type: 'image', src: item.image?.asset?.url || null }],
    enquireHref: `/enquire?itinerary=${itineraryQuerySlug(item.title || '')}`,
  }));
  const itinerarySections = [data.section1Name, data.section2Name,
    ...(data.showCamps ? ['Our Camps'] : []), 'Itinerary', data.entertainmentMainTitle || 'Highlights',
  ].filter(Boolean).map(title => ({ title, id: title.toLowerCase().replace(/\s+/g, '-') }));
  return {
    gallery, campActivities, rates, itinerarySections,
    itineraryDays: data.itinerariesItems || [],
    seasons: (settings.seasons || []).map(season => season.name),
    featuredSeason: (settings.seasons || []).find(season => season.featured)?.name || null,
  };
}

// Source family: shared about/region/founders/operations/aviation banner (module 69389).
// CSS supplies the sticky layout. This deliberately animates the loader itself.
export function bindAboutBanner(loader, { gsap }) {
  const banner = loader.querySelector('.about-banner');
  if (!banner) return () => {};
  const context = gsap.context(() => {
    const motion = { trigger: banner, start: 'top top', end: 'bottom top', scrub: true };
    gsap.to(loader, { y: '100svh', ease: 'none', scrollTrigger: { ...motion, trigger: loader } });
    const fade = loader.querySelector('.about-banner_fade');
    if (fade) gsap.fromTo(fade, { opacity: 0 }, { opacity: 0.8, ease: 'none', scrollTrigger: motion });
    queryAll(loader, '.about-banner_inner,.about-banner_button-wrap').forEach(element => {
      gsap.fromTo(element, { y: '0svh' }, { y: '-20svh', ease: 'none', scrollTrigger: motion });
    });
    queryAll(loader, '[data-scroll-speed]').forEach(element => {
      const speed = element.getAttribute('data-scroll-speed') || '0';
      if (speed.startsWith('-')) gsap.to(element, { y: speed, ease: 'none', scrollTrigger: motion });
      else gsap.fromTo(element, { y: speed }, { y: 0, ease: 'none', scrollTrigger: motion });
    });
  }, loader);
  return () => context.revert();
}

// Source module 59106. The CSS already pins .about-scrub_sticky.
export function bindFoundersImageGrid(root, { gsap }) {
  const content = root.querySelector('.about-scrub_content');
  const featured = root.querySelector('.about-scrub_item.is-featured');
  const layout = root.querySelector('.about-scrub_wrap-layout');
  if (!content || !featured || !layout) return () => {};
  const media = gsap.matchMedia();
  media.add('(min-width: 768px)', () => {
    gsap.timeline({ scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: true } })
      .to(content, { opacity: 0, ease: 'power3.out', duration: 0.75 })
      .to(featured, { width: '50%', ease: 'none', duration: 0.75 }, '<')
      .to(layout, { bottom: '0%', y: '0%', ease: 'none', duration: 0.2 });
  });
  return () => media.revert();
}

// Source module 27866. Pass the original otherwise classless helper wrapper.
// Do not bind all data-scroll-scrub markers globally: some are outside this helper.
export function bindScopedParallax(wrapper, {
  gsap, fromY = 10, toY = -10, start = 'top bottom', end = 'bottom top', scrub = true, ease = 'none',
}) {
  const targets = queryAll(wrapper, '[data-scroll-scrub]');
  const trigger = wrapper.querySelector('[data-scroll-start]') || wrapper;
  const endMarker = wrapper.querySelector('[data-scroll-end]');
  const endTrigger = endMarker || trigger;
  const endPosition = endMarker?.getAttribute('data-scroll-end')?.trim() || end;
  const media = gsap.matchMedia();
  media.add('(min-width: 768px)', () => {
    targets.forEach(target => {
      const readNumber = (key, fallback) => {
        const raw = target.getAttribute(key);
        const value = raw === null ? fallback : parseFloat(raw);
        return Number.isFinite(value) ? value : fallback;
      };
      gsap.fromTo(target, { y: `${readNumber('data-from-y', fromY)}em` }, {
        y: `${readNumber('data-to-y', toY)}em`, ease,
        scrollTrigger: { trigger, start, end: endPosition, endTrigger, scrub },
      });
    });
  });
  return () => media.revert();
}

// Source module 34486. Sticky positioning is entirely in the original CSS.
export function bindAviationTitleWindow(root, { gsap }) {
  const title = root.querySelector('.title-reveal_title');
  const sticky = root.querySelector('.title-reveal_scrub-sticky');
  const windowElement = root.querySelector('.title-reveal_media');
  const content = root.querySelector('.title-reveal_content');
  if (!title || !sticky || !windowElement) return () => {};
  const media = gsap.matchMedia();
  media.add('(min-width: 768px)', () => {
    gsap.fromTo(title, { filter: 'blur(0px)', opacity: 1 }, {
      filter: 'blur(10px)', opacity: 0.4, ease: 'none',
      scrollTrigger: { trigger: root, start: 'top top', end: '+=100%', scrub: true },
    });
    gsap.to(windowElement, {
      width: '90vw', height: '58svh', ease: 'none',
      scrollTrigger: { trigger: sticky, start: 'top center', end: 'bottom top', scrub: true },
    });
    if (content) gsap.fromTo(title, { opacity: 0.4 }, {
      opacity: 0, ease: 'none', immediateRender: false,
      scrollTrigger: { trigger: content, start: 'top center', end: 'top top', scrub: true },
    });
  });
  return () => media.revert();
}

export function bindAviationStickyRows(root, { gsap, ScrollTrigger }) {
  const intro = root.querySelector('.sticky-rows_intro');
  const viewport = root.querySelector('.sticky-rows_media');
  const layer = root.querySelector('.sticky-rows_media-layer');
  const body = root.querySelector('.sticky-rows_body');
  const rows = queryAll(root, '.sticky-rows_row');
  const panels = queryAll(root, '.sticky-rows_media-item');
  if (!viewport || !layer || !body || !rows.length) return () => {};
  const hasIntroImage = panels.length > rows.length ? 1 : 0;
  const previousTop = layer.style.top;
  const previousHeight = layer.style.height;
  const media = gsap.matchMedia();
  media.add('(min-width: 768px)', () => {
    if (intro) gsap.fromTo(intro, { yPercent: -20 }, {
      yPercent: 20, ease: 'none',
      scrollTrigger: { trigger: intro, start: 'top bottom', end: 'bottom top', scrub: true },
    });
    function updateGeometry() {
      const vh = window.innerHeight;
      const imageHeight = viewport.offsetHeight;
      const overshoot = (vh + imageHeight) / 2 + 0.08 * vh;
      const distance = rows.at(-1).getBoundingClientRect().top - body.getBoundingClientRect().top;
      layer.style.top = `${-overshoot}px`;
      layer.style.height = `${distance + (vh + imageHeight) / 2 + overshoot}px`;
    }
    updateGeometry();
    ScrollTrigger.addEventListener('refreshInit', updateGeometry);
    rows.forEach((row, index) => {
      const panel = panels[index + hasIntroImage - 1];
      if (!panel) return;
      gsap.fromTo(panel, { clipPath: 'inset(0% 0% 0% 0%)' }, {
        clipPath: 'inset(0% 0% 100% 0%)', ease: 'none',
        scrollTrigger: {
          trigger: row,
          start: () => `top ${(window.innerHeight + viewport.offsetHeight) / 2}px`,
          end: () => `top ${(window.innerHeight - viewport.offsetHeight) / 2}px`,
          scrub: true, invalidateOnRefresh: true,
        },
      });
    });
    return () => {
      ScrollTrigger.removeEventListener('refreshInit', updateGeometry);
      layer.style.top = previousTop;
      layer.style.height = previousHeight;
    };
  });
  return () => media.revert();
}

// Pass aviation's final .t-subtitle-page quote only, not every shared subtitle.
export function bindAviationQuote(quote, { gsap }) {
  const media = gsap.matchMedia();
  media.add('(min-width: 767px)', () => {
    gsap.fromTo(quote, { fontSize: '2.375rem' }, {
      fontSize: '3rem', ease: 'sine.out',
      scrollTrigger: { trigger: quote, start: 'top bottom', end: 'bottom center', scrub: true },
    });
  });
  return () => media.revert();
}

// Source module 63862. Pin the background wrapper, never the content root.
export function bindOperationsBackdrop(root, { gsap }) {
  const background = root.querySelector('.expertise-bg_wrap');
  const image = root.querySelector('.expertise-bg_image');
  const blur = root.querySelector('.expertise-bg_blur');
  const firstCardSection = root.querySelector('.expertise-card_component')?.closest('section');
  if (!background || !image) return () => {};
  const context = gsap.context(() => {
    gsap.timeline({ scrollTrigger: {
      trigger: root, start: 'top top', end: 'bottom top', pin: background, pinSpacing: false, scrub: true,
    } }).fromTo(image, { y: '0%' }, { y: '-100svh', ease: 'none' });
    if (blur && firstCardSection) gsap.fromTo(blur, { opacity: 0 }, {
      opacity: 1, duration: 0.3, ease: 'linear',
      scrollTrigger: { trigger: firstCardSection, start: 'top bottom', end: 'top 95%', toggleActions: 'play none none reverse' },
    });
  }, root);
  return () => context.revert();
}

// Existing SSR popup children are retained. Global video handlers remain owned by the caller.
export function bindOperationsCards(root, { gsap, lenis }) {
  const events = new AbortController();
  const cards = queryAll(root, '.expertise-card_component');
  const nav = queryAll(document, '.nav-layout,.nav-layout_mobile');
  const navStyles = nav.map(element => element.getAttribute('style'));
  const records = [];
  let current;
  let overlay;
  let navTween;
  let centeringFrame;
  const context = gsap.context(() => {
    cards.forEach(card => {
      const popup = card.querySelector('.expertise-popup');
      const dark = card.querySelector('.expertise-card_bg-dark');
      if (!popup || !dark) return;
      const timeline = gsap.timeline({ paused: true })
        .to(dark, { opacity: 1, duration: 0.4, ease: 'power2.inOut' }, 0)
        .fromTo(popup, { yPercent: 105 }, { yPercent: 0, duration: 0.4, ease: 'power2.inOut' }, 0);
      records.push({ card, popup, timeline, cursor: card.getAttribute('data-cursor-text') });
    });
  }, root);

  function resetCursor() { window.dispatchEvent(new Event('cursorReset')); }
  function restoreNav() {
    navTween?.kill();
    navTween = gsap.to(nav, {
      y: 0, duration: 0.3, ease: 'sine.inOut',
      // Source clears all styles; restoring original styles avoids touching unrelated app changes.
      onComplete: () => nav.forEach((element, index) => {
        if (navStyles[index] === null) element.removeAttribute('style');
        else element.setAttribute('style', navStyles[index]);
      }),
    });
  }
  function close({ restoreNavigation = true } = {}) {
    if (!current) return;
    cancelAnimationFrame(centeringFrame);
    current.timeline.reverse();
    current.card.classList.remove('is-open');
    if (current.cursor === null) current.card.removeAttribute('data-cursor-text');
    else current.card.setAttribute('data-cursor-text', current.cursor);
    overlay?.remove(); overlay = undefined;
    current = undefined;
    if (restoreNavigation) { lenis?.start(); restoreNav(); }
    resetCursor();
  }
  function open(record) {
    if (current === record) return;
    close({ restoreNavigation: false });
    current = record;
    const { card, popup, timeline } = record;
    card.classList.add('is-open');
    card.removeAttribute('data-cursor-text');
    overlay = document.createElement('div');
    overlay.className = 'expertise-overlay-fixed';
    overlay.setAttribute('data-cursor-text', 'Close');
    card.before(overlay);
    overlay.addEventListener('click', () => close(), { signal: events.signal });
    if (card.classList.contains('portrait')) {
      const layout = popup.querySelector('.expertise-popup_layout');
      if (layout) layout.scrollTop = 0;
    } else queryAll(popup, '.expertise-popup_left,.expertise-popup_right').forEach(column => { column.scrollTop = 0; });
    timeline.play();
    lenis?.stop();
    navTween?.kill();
    navTween = gsap.fromTo(nav, { y: 0 }, { y: -200, duration: 0.3, ease: 'sine.inOut' });
    resetCursor();
    centeringFrame = requestAnimationFrame(() => {
      const box = card.getBoundingClientRect();
      window.scrollTo({ top: box.top + box.height / 2 + window.scrollY - window.innerHeight / 2, behavior: 'smooth' });
    });
  }
  records.forEach(record => {
    record.card.addEventListener('click', event => {
      if (event.target.closest('.expertise-popup,.popup-close-wrap,.expertise-card_button-wrap')) return;
      open(record);
    }, { signal: events.signal });
    record.card.querySelector('.btn-popup-close')?.addEventListener('click', event => {
      event.preventDefault(); event.stopPropagation(); close();
    }, { signal: events.signal });
  });
  // Keyboard Escape is a small accessibility addition; the observed source uses close/backdrop clicks.
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); }, { signal: events.signal });
  return () => {
    close({ restoreNavigation: false });
    events.abort(); cancelAnimationFrame(centeringFrame); navTween?.kill(); context.revert();
    nav.forEach((element, index) => {
      if (navStyles[index] === null) element.removeAttribute('style');
      else element.setAttribute('style', navStyles[index]);
    });
    lenis?.start();
  };
}
