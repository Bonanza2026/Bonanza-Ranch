export function heroSources(mobile, webmSupported) {
  const stem = mobile ? '/media/hero-mobile-v7' : '/media/hero-desktop-v3';
  return webmSupported ? [`${stem}.webm`, `${stem}.mp4`] : [`${stem}.mp4`];
}

export function initializeHeroVideo(browser = globalThis) {
  const { document } = browser;
  const video = document.querySelector('.hero-banner_video');
  const poster = document.querySelector('.hero-poster img');
  if (!video || !poster) return;

  const reduced = browser.matchMedia('(prefers-reduced-motion: reduce)');
  const sources = heroSources(browser.matchMedia('(max-width: 767px)').matches, Boolean(video.canPlayType('video/webm; codecs="vp9"')));
  let sourceIndex = 0;
  let visible = true;
  let posterReady = false;
  let paintReady = Boolean(browser.performance?.getEntriesByName?.('first-contentful-paint', 'paint').length);
  let paintFallback = false;

  const play = () => {
    if (!posterReady || !paintReady || reduced.matches || document.hidden || !visible || video.dataset.scrollCovered === 'true') {
      video.pause();
      return;
    }
    if (!video.getAttribute('src')) {
      video.poster = poster.currentSrc || poster.src;
      video.src = sources[sourceIndex];
      video.muted = true;
    }
    // Autoplay rejection leaves the poster visible; it is not a codec failure.
    video.play().catch(() => {});
  };

  video.addEventListener('error', () => {
    if (!posterReady || !paintReady || !video.getAttribute('src')) return;
    if (![3, 4].includes(video.error?.code) || sourceIndex + 1 >= sources.length) return;
    sourceIndex += 1;
    video.src = sources[sourceIndex];
    play();
  });
  new browser.IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    play();
  }).observe(video);
  document.addEventListener('visibilitychange', play);
  video.addEventListener('bonanza:hero-visibility', play);
  document.addEventListener('pointerdown', play, { once: true });
  document.addEventListener('keydown', play, { once: true });
  reduced.addEventListener('change', play);

  // A decoded image and two animation frames can still precede first paint.
  // Keep the media request behind actual FCP, including when input arrives early.
  if (!paintReady) {
    const PaintObserver = browser.PerformanceObserver;
    if (typeof PaintObserver === 'function' && (!PaintObserver.supportedEntryTypes || PaintObserver.supportedEntryTypes.includes('paint'))) {
      let observer;
      try {
        observer = new PaintObserver((list) => {
          if (!list.getEntries().some((entry) => entry.name === 'first-contentful-paint')) return;
          paintReady = true;
          observer.disconnect();
          play();
        });
        observer.observe({ type: 'paint', buffered: true });
      } catch {
        observer?.disconnect();
        paintFallback = true;
      }
    } else {
      paintFallback = true;
    }
  }

  poster.decode().catch(() => {}).then(() => {
    posterReady = true;
    if (paintFallback) {
      // Browsers without Paint Timing still get two frames to display the poster.
      browser.requestAnimationFrame(() => browser.requestAnimationFrame(() => {
        paintReady = true;
        play();
      }));
    } else {
      play();
    }
  });
}
