/** Research snippets for ORIGINAL White Desert DOM. No app files are changed.
 * Dynamic menu groups/video markup are absent from SSR: mount them from the
 * captured HTML/module excerpts first. Each function returns its controls/cleanup.
 */

// 73782: homepage's sticky How It Works panel (all its content IS in SSR).
export function createHowItWorks({gsap,lenis},container=document.querySelector('.flyout_container')){
  if(!container)return null;
  const panel=container.querySelector('.flyout_component');
  const overlay=container.querySelector('.flyout-overlay');
  const buttonWrap=container.querySelector('.flyout-button-wrap');
  const visibleWrap=container.querySelector('.flyout-visible-wrap');
  const button=visibleWrap?.querySelector('button');
  const layout=container.querySelector('.flyout_layout');
  let open=false,timeline;
  const readyTimer=setTimeout(()=>container.classList.add('is-ready'),250);
  const mm=gsap.matchMedia();
  mm.add({isMobile:'(max-width: 766px)',isDesktop:'(min-width: 767px)'},context=>{
    const mobile=context.conditions.isMobile;
    gsap.set(overlay,{opacity:0});
    gsap.set(panel,mobile?{y:'100%'}:{x:'100%'});
    timeline=gsap.timeline({paused:true});
    timeline.to(overlay,{opacity:1,duration:.4,ease:'sine'},0);
    timeline.to(panel,mobile?{y:'0%',duration:.8,ease:'expo.inOut'}:{x:'0%',duration:.8,ease:'expo.inOut'},0);
  });
  function setOpen(value){
    open=value;container.classList.toggle('is-active',open);
    buttonWrap?.classList.toggle('is-open',open);
    button?.classList.toggle('btn-popup-open',!open);button?.classList.toggle('btn-popup-close',open);
    container.querySelector('.open-label')?.classList.toggle('active',!open);
    container.querySelector('.close-label')?.classList.toggle('active',open);
    const mobile=matchMedia('(max-width: 766px)').matches;
    const nav=document.querySelector(mobile?'.nav-layout_mobile':'.nav-layout');
    const about=document.querySelector('.about-nav');
    if(open){
      if(layout)layout.scrollTop=0;
      lenis?.stop();document.body.classList.add('hide-grid');timeline?.play();
      if(nav)gsap.fromTo(nav,{y:0},{y:-200,duration:.3,ease:'sine.inOut'});
      if(about)gsap.fromTo(about,{y:0},{y:200,duration:.3,ease:'sine.inOut'});
    }else{
      lenis?.start();timeline?.eventCallback('onReverseComplete',()=>document.body.classList.remove('hide-grid'));timeline?.reverse();
      for(const element of [nav,about].filter(Boolean))gsap.to(element,{y:0,duration:.3,ease:'sine.inOut',onComplete:()=>gsap.set(element,{clearProps:'all'})});
    }
  }
  const showTab=()=>{
    const footer=document.querySelector('.footer-component');
    const visible=!(footer&&footer.getBoundingClientRect().top<innerHeight)&&scrollY>=innerHeight;
    visibleWrap?.classList.toggle('is-visible',visible);
  };
  const toggle=e=>{e.stopPropagation();setOpen(!open);};
  const close=e=>{e.stopPropagation();setOpen(false);};
  const stop=e=>e.stopPropagation();
  button?.addEventListener('click',toggle);overlay.addEventListener('click',close);panel.addEventListener('click',stop);
  addEventListener('scroll',showTab);showTab();
  return{open:()=>setOpen(true),close:()=>setOpen(false),destroy(){clearTimeout(readyTimer);removeEventListener('scroll',showTab);button?.removeEventListener('click',toggle);overlay.removeEventListener('click',close);panel.removeEventListener('click',stop);mm.revert();}};
}

/** 93300. Exact desktop menu timelines, with rendering supplied by caller.
 * renderGroup(index) replaces ONLY .menu-inner.is-desktop .menu-group using
 * menu-experience.html / menu-operation.html / menu-about.html captured in this dir.
 * setMobileGroup(index|null) renders source mobile group/head state; no GSAP tween.
 * Call preview(url|null) in pointerenter/leave handlers after canPreview() is true.
 */
export function createMenuMotion({gsap,CustomEase,lenis,renderGroup=()=>{},setMobileGroup=()=>{},renderPreview=()=>{}},nav=document.querySelector('nav')){
  if(!nav)return null;
  gsap.registerPlugin(CustomEase);
  const ease=CustomEase.create('menuClip','0.76,0,0.24,1');
  const closedClip='inset(0% 100% 0% 0% round 0.25em)';
  const menu=nav.querySelector('.menu-component'),panel=menu.querySelector('.menu-el'),inner=menu.querySelector('.menu-inner.is-desktop');
  const tabs=[...nav.querySelectorAll('.nav-left .btn')];
  let open=false,group=null,previewReady=true,cooldown;
  function setGroup(index){
    group=index;renderGroup(index);
    tabs.forEach((tab,i)=>{tab.classList.toggle('btn-tab-active',i===index);tab.classList.toggle('btn-tab',i!==index);});
    const content=menu.querySelector('.menu-inner.is-desktop .menu-group');
    if(content)gsap.fromTo(content,{opacity:0},{opacity:1,duration:.35,ease:'power2.out'});
    previewReady=false;clearTimeout(cooldown);cooldown=setTimeout(()=>previewReady=true,350);
  }
  function setOpen(value,index){
    if(index!==undefined&&index!==group)setGroup(index);
    open=value;document.body.setAttribute('data-menu-open',String(value));menu.classList.toggle('open',value);
    gsap.killTweensOf([panel,inner]);
    if(open){
      lenis?.stop();
      gsap.fromTo(panel,{clipPath:closedClip},{clipPath:'inset(0% 0% 0% 0% round 0.25em)',duration:.45,ease});
      gsap.fromTo(inner,{opacity:0},{opacity:1,duration:.6,ease:'power1.out'});
      gsap.fromTo(inner,{x:'-10rem'},{x:'0rem',duration:.8,ease:'expo'});
    }else{
      lenis?.start();gsap.set(panel,{clipPath:closedClip});gsap.set(inner,{opacity:0});renderPreview(null);setMobileGroup(null);
      group=null;tabs.forEach(tab=>{tab.classList.remove('btn-tab-active');tab.classList.add('btn-tab');});
    }
  }
  const listeners=[];const on=(el,event,fn)=>{el?.addEventListener(event,fn);listeners.push(()=>el?.removeEventListener(event,fn));};
  tabs.forEach((tab,index)=>on(tab,'click',()=>{if(open)setGroup(index);else setOpen(true,index);}));
  on(nav.querySelector('.menu-toggle'),'click',()=>setOpen(true));
  on(menu.querySelector('.menu-bg'),'click',()=>setOpen(false));
  on(menu.querySelector('.menu-close'),'click',()=>setOpen(false));
  return{open:(index=0)=>setOpen(true,index),close:()=>setOpen(false),isOpen:()=>open,
    canPreview:()=>previewReady&&matchMedia('(hover: hover) and (pointer: fine)').matches,
    preview:url=>{if(previewReady&&matchMedia('(hover: hover) and (pointer: fine)').matches)renderPreview(url);},
    destroy(){clearTimeout(cooldown);listeners.forEach(fn=>fn());gsap.killTweensOf([panel,inner]);document.body.removeAttribute('data-menu-open');}};
}

// 39521: mount the exact .video-popup subtree before calling this function.
// The caller chooses media URLs from original RSC data. .m3u8 URLs have original
// /downloads/default.mp4 fallback. Never substitute the hero film for all films.
export function createVideoModal({gsap,lenis},popup){
  const video=popup.querySelector('video'),overlay=popup.querySelector('.video-popup_overlay');
  const frame=popup.querySelector('.video-popup_video-wrap'),closeWrap=popup.querySelector('.video-popup_close-wrap');
  const controls=popup.querySelector('.video-popup_controls'),progress=popup.querySelector('.video-popup_progress');
  const progressBar=popup.querySelector('.video-popup_progress-bar');
  const pauseOverlay=popup.querySelector('.video-popup_video-overlay');
  let hovered=false;
  const cursorLabel=text=>window.dispatchEvent(new CustomEvent('cursorLabel',{detail:text}));
  const state=()=>{pauseOverlay?.classList.toggle('is-paused',video.paused);if(hovered)cursorLabel(video.paused?'Play':'Pause');};
  const timeline=gsap.timeline({paused:true});
  timeline.eventCallback('onStart',()=>{video.currentTime=0;video.play().catch(()=>{});state();});
  timeline.eventCallback('onReverseComplete',()=>{video.pause();video.currentTime=0;state();});
  timeline.fromTo(overlay,{opacity:0},{opacity:1,duration:.5,ease:'power2.out'});
  timeline.fromTo(frame,{clipPath:'inset(15% 10% 85% 10% round 0.5rem)'},{clipPath:'inset(0% 0% 0% 0% round 0.5rem)',duration:.5,ease:'power2.out'},'<50%');
  timeline.fromTo(closeWrap,{opacity:0},{opacity:1,duration:.5,ease:'power2.out'},'<');
  timeline.fromTo(controls,{opacity:0,y:'10rem'},{opacity:1,y:0,duration:.5,ease:'power2.out'},'<');
  const open=()=>{popup.hidden=false;document.body.style.overflow='hidden';lenis?.stop();timeline.play();};
  const close=()=>{document.body.style.overflow='';lenis?.start();timeline.reverse().then(()=>{popup.hidden=true;});};
  const listeners=[];const on=(el,event,fn)=>{el?.addEventListener(event,fn);listeners.push(()=>el?.removeEventListener(event,fn));};
  on(overlay,'click',close);on(popup.querySelector('.video-popup_close'),'click',close);
  on(video,'click',()=>{if(video.paused)video.play().catch(()=>{});else video.pause();state();});
  on(video,'play',state);on(video,'pause',state);on(video,'ended',close);
  on(video,'timeupdate',()=>{if(video.duration&&!Number.isNaN(video.duration))progressBar.style.width=`${video.currentTime/video.duration*100}%`;});
  on(progress,'click',event=>{const box=progress.getBoundingClientRect();video.currentTime=(event.clientX-box.left)/box.width*video.duration;});
  on(frame,'mouseenter',()=>{if(matchMedia('(hover: hover) and (pointer: fine)').matches){hovered=true;requestAnimationFrame(state);}});
  on(frame,'mouseleave',()=>{if(matchMedia('(hover: hover) and (pointer: fine)').matches){hovered=false;cursorLabel('');}});
  on(document,'visibilitychange',()=>{if(document.hidden&&!video.paused)video.pause();});
  on(popup.querySelector('.video-popup_fullscreen'),'click',()=>{
    if(document.fullscreenElement){document.exitFullscreen?.();}
    else if(video.requestFullscreen)video.requestFullscreen();
    else video.webkitEnterFullscreen?.();
  });
  return{open,close,destroy(){listeners.forEach(fn=>fn());timeline.revert();video.pause();cursorLabel('');}};
}

// 76848: ORIGINAL cursor subtree can be taken from live-components.json.
export function createCursor({gsap},cursor=document.querySelector('.custom-cursor')){
  if(!cursor)return()=>{};
  const lineV=cursor.querySelector('.custom-cursor_line-vertical'),lineH=cursor.querySelector('.custom-cursor_line-horizontal');
  const dot=cursor.querySelector('.custom-cursor_dot'),label=cursor.querySelector('.custom-cursor_label'),text=cursor.querySelector('.custom-cursor_label-text');
  let x=0,y=0,interactive=false,customText='';
  const mm=gsap.matchMedia();
  mm.add('(hover: hover) and (pointer: fine)',()=>{
    gsap.set(cursor,{xPercent:-150,yPercent:-150});
    const moveX=gsap.quickTo(cursor,'x',{duration:.3,ease:'power3.out'}),moveY=gsap.quickTo(cursor,'y',{duration:.3,ease:'power3.out'});
    const render=()=>{
      const visible=interactive||Boolean(customText);text.textContent=customText;
      gsap.to(dot,{rotation:visible?45:0,duration:.3,ease:'power2.out'});
      gsap.to(lineV,{height:visible?12:0,opacity:Number(visible),duration:.3,ease:'power2.out'});
      gsap.to(lineH,{width:visible?12:0,opacity:Number(visible),duration:.3,ease:'power2.out'});
      if(customText||!visible)gsap.to(label,{opacity:Number(Boolean(customText)),duration:.3,ease:'power2.out'});
    };
    const pointer=element=>Boolean(element&&(element.tagName==='A'||element.tagName==='BUTTON'||element.closest('a')||element.closest('button')||element.style.cursor==='pointer'||getComputedStyle(element).cursor==='pointer'));
    const inspect=element=>{
      if(!element){interactive=false;customText='';render();return;}
      const target=element.closest('[data-cursor-text]')||element;
      customText=target.getAttribute('data-cursor-text')||'';
      interactive=Boolean(customText)||pointer(element);
      label.classList.toggle('is-glass',Boolean(target.hasAttribute('data-cursor-glass')||element.closest('[data-cursor-glass]')));
      render();
    };
    const move=event=>{x=event.clientX;y=event.clientY;moveX(x);moveY(y);};
    const over=event=>inspect(event.target);
    const out=()=>{interactive=false;customText='';label.classList.remove('is-glass');render();};
    const scroll=()=>inspect(document.elementFromPoint(x,y));
    const external=event=>{customText=event.detail;render();};
    const reset=()=>{interactive=false;customText='';render();};
    window.addEventListener('mousemove',move);document.addEventListener('mouseover',over);document.addEventListener('mouseout',out);window.addEventListener('scroll',scroll,true);window.addEventListener('cursorLabel',external);window.addEventListener('cursorReset',reset);
    return()=>{window.removeEventListener('mousemove',move);document.removeEventListener('mouseover',over);document.removeEventListener('mouseout',out);window.removeEventListener('scroll',scroll,true);window.removeEventListener('cursorLabel',external);window.removeEventListener('cursorReset',reset);};
  });
  return()=>mm.revert();
}
