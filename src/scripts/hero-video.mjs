export function heroSources(mobile, webmSupported) {
  const stem = mobile ? '/media/hero-mobile-v5' : '/media/hero-desktop-v3';
  return webmSupported ? [`${stem}.webm`, `${stem}.mp4`] : [`${stem}.mp4`];
}

export function initializeHeroVideo() {
  const video = document.querySelector('.hero-banner_video');
  const poster = document.querySelector('.hero-poster img');
  if (!video || !poster) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const sources = heroSources(matchMedia('(max-width: 767px)').matches, Boolean(video.canPlayType('video/webm; codecs="vp9"')));
  let sourceIndex = 0;
  let visible = true;
  let posterReady = false;

  const play = () => {
    if (!posterReady || reduced.matches || document.hidden || !visible || video.dataset.scrollCovered === 'true') {
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
    if (![3, 4].includes(video.error?.code) || sourceIndex + 1 >= sources.length) return;
    sourceIndex += 1;
    video.src = sources[sourceIndex];
    play();
  });
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    play();
  }).observe(video);
  document.addEventListener('visibilitychange', play);
  video.addEventListener('bonanza:hero-visibility', play);
  document.addEventListener('pointerdown', play, { once: true });
  document.addEventListener('keydown', play, { once: true });
  reduced.addEventListener('change', play);

  // Decode the visible image before video competes for the connection. Two
  // frames give the browser a paint opportunity, regardless of network speed.
  poster.decode().catch(() => {}).then(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      posterReady = true;
      play();
    }));
  });
}
