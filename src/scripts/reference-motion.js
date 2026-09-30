/**
 * Research integration snippet, not application code.
 * Vanilla translation of White Desert's delivered homepage modules (2026-09-22).
 * Expects the ORIGINAL SSR DOM and original CSS, in their original order.
 * Supply GSAP 3, ScrollTrigger, DrawSVGPlugin and MotionPathPlugin imports.
 * createHomepageMotion returns teardown. Recreate after Astro page navigation.
 * Its literal durations, eases, selector hierarchy and viewport units match source.
 * The authorized Bonanza video / aircraft insertion is deliberately not included.
 */
export function createHomepageMotion({gsap, ScrollTrigger, DrawSVGPlugin, MotionPathPlugin}, scope = document) {
  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, MotionPathPlugin);
  const q = (selector, parent = scope) => parent.querySelector(selector);
  const all = (selector, parent = scope) => [...parent.querySelectorAll(selector)];
  const disposers = [];
  const context = gsap.context(() => {
    // 66387: .hero-banner_wrapper moves by 200svh on HOME, 100svh on other variants.
    for (const hero of all('.hero-banner')) {
      const wrapper = q('.hero-banner_wrapper', hero);
      if (!wrapper) continue;
      const next = hero.nextElementSibling;
      const home = wrapper.classList.contains('wd-home');
      gsap.to(wrapper, {y:home ? '450svh' : '100svh', ease:'none', scrollTrigger:{trigger:hero, start:'top top', endTrigger:next, end:'top top', scrub:true}});
      const heading = q('.hero-banner_title', hero);
      if (home && heading) gsap.fromTo(heading, {filter:'blur(0px)'}, {filter:'blur(10px)', ease:'none', scrollTrigger:{trigger:hero, start:'top top', end:()=>'+='+innerHeight*2, scrub:true}});
      if (hero.classList.contains('hero-banner--no-clouds')) gsap.fromTo(q('.hero-banner_overlay',hero), {backgroundColor:'rgba(0, 0, 0, 0)'}, {backgroundColor:'rgba(0, 0, 0, 0.6)', ease:'none', scrollTrigger:{trigger:hero,start:'clamp(top top)',endTrigger:next,end:'clamp(top top)',scrub:true}});
      for (const element of all('[data-scroll-speed]', hero)) {
        const value = element.getAttribute('data-scroll-speed');
        const vars = {ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:home?()=>'+='+innerHeight*2:'bottom top',scrub:true}};
        if (value.startsWith('-')) gsap.to(element,{y:value,...vars});
        else gsap.fromTo(element,{y:value},{y:0,...vars});
      }
    }

    // 48753: home-hero mist and the later .mist-divider_wrap use different triggers.
    for (const mist of all('.mist-transition')) {
      const image = q('.mist-transition_image-container', mist);
      if (!image) continue;
      image.classList.add('visible');
      const divider = Boolean(mist.closest('.mist-divider_wrap'));
      gsap.fromTo(image,{rotateX:90},{rotateX:0,ease:'none',scrollTrigger:{trigger:mist,start:divider?'top bottom':'top top-=80%',end:divider?'bottom top':'bottom center',scrub:true}});
    }

    // 20400: the CSS gradient itself is in 6ad64d2e71e8012c.css.
    for (const element of all('.text-scroll-fade')) gsap.fromTo(element,{'--mask-position':-40},{'--mask-position':100,ease:'none',scrollTrigger:{trigger:element,start:'top 80%',end:'bottom 60%',scrub:true}});

    // 27866: only the editorial caption travels inside the 150svh mountain image.
    for (const banner of all('.tall-parallax-banner')) {
      const wrapper = banner.firstElementChild;
      const start = q('[data-scroll-start]',wrapper) || wrapper;
      const end = q('[data-scroll-end]',wrapper) || start;
      const endValue = end.getAttribute('data-scroll-end')?.trim() || 'bottom top';
      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px)',()=>{
        for(const element of all('[data-scroll-scrub]',wrapper)) {
          const from = Number(element.getAttribute('data-from-y') ?? 20);
          const to = Number(element.getAttribute('data-to-y') ?? (banner.classList.contains('is-operational') ? 0 : -5));
          gsap.fromTo(element,{y:`${from}em`},{y:`${to}em`,ease:'none',scrollTrigger:{trigger:start,start:'top bottom',end:endValue,endTrigger:end,scrub:true}});
        }
      });
    }

    // 38751: duration prop at callsites is unused; actual default tween is 1.2s.
    // Do not apply to .flight-path_svg: the base route is static, handled below.
    for (const scribble of all('.scribble-el')) {
      const paths = all('path,line,circle,rect,polyline,polygon',scribble);
      if(paths.length) gsap.fromTo(paths,{drawSVG:'0%'},{drawSVG:'100%',duration:1.2,ease:'power2.inOut',scrollTrigger:{trigger:scribble.parentElement,start:'top 75%',toggleActions:'play none none reverse'}});
    }

    // 3898: desktop hover strips. Mobile CSS handles the normal vertical stack.
    for (const component of all('.card-flick')) {
      const items = all('.card-flick_item',component);
      if(!items.length) continue;
      let active = Math.max(0,items.findIndex(item=>item.classList.contains('is-active')));
      let timeline;
      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px)',()=>{
        const narrow = items.length>1 ? `${50/(items.length-1)}%` : '0%';
        items.forEach((item,i)=>{
          gsap.set(item,{width:i===active?'50%':narrow});
          const content=q('.card-flick_content',item),overlay=q('.card-flick_overlay',item);
          if(content) gsap.set(content,{opacity:Number(i===active)});
          if(overlay) gsap.set(overlay,{opacity:Number(i!==active)});
        });
        const listeners=items.map((item,index)=>{
          const enter=()=>{
            if(index===active)return;
            active=index;timeline?.kill();timeline=gsap.timeline();
            items.forEach((card,i)=>{
              const selected=i===active;
              card.classList.toggle('is-active',selected);
              timeline.to(card,{width:selected?'50%':narrow,duration:.75,ease:'expo'},0);
              const overlay=q('.card-flick_overlay',card),content=q('.card-flick_content',card);
              if(overlay)timeline.to(overlay,{opacity:Number(!selected),duration:.2,ease:'expo.out'},0);
              if(content)timeline.to(content,{opacity:Number(selected),duration:.75,ease:selected?'power1':'expo'},0);
            });
          };
          item.addEventListener('mouseenter',enter);return()=>item.removeEventListener('mouseenter',enter);
        });
        return()=>{listeners.forEach(fn=>fn());timeline?.kill();items.forEach(item=>{gsap.set(item,{clearProps:'width'});all('.card-flick_content,.card-flick_overlay',item).forEach(el=>gsap.set(el,{clearProps:'opacity'}));});};
      });
    }

    // 7236: preserve this ordering (entry tweens, pinned timeline, final reveal).
    for (const outer of all('.horizontal-scroll_outer')) {
      const scene=q('.horizontal-scroll',outer),track=q('.horizontal-scroll_container',outer);
      if(!scene||!track)continue;
      const title=q('.horizontal-scroll_title',scene),text=q('.panel-1_text-wrap',scene);
      const first=q('.horizontal-scroll_panel',track);
      const behind=q(':scope > .horizontal-scroll_image-wrap',first);
      const clipped=q(':scope > .horizontal-scroll_clip-wrap',first);
      const openingOverlay=q('.horizontal-scroll_overlay',clipped);
      const endPanel=q('.horizontal-scroll_panel--full',track);
      const panels=all(':scope > .horizontal-scroll_panel',track);
      const lastCard=panels.at(-2);
      const rects=all('clipPath rect',first);
      const D=track.scrollWidth-innerWidth,H=innerHeight,textDistance=1.5*H,revealDistance=H,lateralDuration=1.5*D;
      const desktop=matchMedia('(min-width: 768px)').matches;
      const entryTitle=desktop?'5.625rem':'2rem';
      if(title&&openingOverlay){
        const trigger={trigger:scene,start:'top bottom',end:'top top',scrub:true};
        gsap.to(title,{fontSize:entryTitle,ease:'none',scrollTrigger:trigger});
        gsap.fromTo(openingOverlay,{opacity:0},{opacity:.1,ease:'none',scrollTrigger:trigger});
        gsap.fromTo(outer,{clipPath:'inset(0 10% 0 10%)'},{clipPath:'inset(0 0% 0 0%)',ease:'none',scrollTrigger:trigger,clearProps:'clipPath'});
        if(text)gsap.fromTo(text,{top:'100%'},{top:'-50%',ease:'none',scrollTrigger:{trigger:scene,start:'top 40%',end:'bottom top',scrub:true}});
      }
      if(text){
        const timeline=gsap.timeline({scrollTrigger:{trigger:scene,start:'top top',end:()=>`+=${textDistance+revealDistance+lateralDuration}`,pin:true,scrub:true,invalidateOnRefresh:true}});
        timeline.addLabel('textScroll').fromTo(title,{fontSize:entryTitle},{fontSize:desktop?'3.75rem':'1.5rem',ease:'none',duration:.5*textDistance});
        timeline.addLabel('clipReveal');
        timeline.to(rects[2],{attr:{width:0},ease:'none',duration:.5*revealDistance},'clipReveal');
        timeline.to(rects[1],{attr:{width:0},ease:'none',duration:.75*revealDistance},'clipReveal');
        timeline.to(rects[0],{attr:{width:0},ease:'none',duration:revealDistance},'clipReveal');
        timeline.addLabel('horizontalScroll',`clipReveal+=${.3*revealDistance}`);
        timeline.to(track,{x:-D,ease:'none',duration:lateralDuration},'horizontalScroll');
        if(behind)timeline.to(behind,{x:D,ease:'none',duration:lateralDuration},'horizontalScroll');
        if(clipped)timeline.to(clipped,{x:D,ease:'none',duration:lateralDuration},'horizontalScroll');
        if(behind&&lastCard&&endPanel){
          const trigger={trigger:lastCard,start:'right-=30% right',endTrigger:endPanel,end:'right right',containerAnimation:timeline,scrub:true};
          gsap.fromTo(behind,{clipPath:'inset(0% 0% 0% 0%)'},{clipPath:'inset(0% 100% 0% 0%)',ease:'none',scrollTrigger:trigger});
          // Original ref I belongs to the image-with-overlay component's forwarded img.
          // Preserve that literal target; its parent already owns --overlay-opacity:0.
          const overlayTarget=q('.image-with-overlay_img',behind);
          if(overlayTarget)gsap.fromTo(overlayTarget,{'--overlay-opacity':0},{'--overlay-opacity':.4,ease:'none',scrollTrigger:trigger});
        }
      }
      const cpt=q('.ct-antartica_section',outer),mist=q('.mist-divider_wrap',outer);
      if(cpt){
        const trigger={trigger:cpt,start:'center center',end:'bottom top',endTrigger:mist,scrub:true};
        gsap.fromTo(cpt,{y:'0svh'},{y:'120svh',ease:'none',scrollTrigger:trigger});
        const heading=q('.title-fade_wrap--desktop',cpt);
        if(heading)gsap.to(heading,{opacity:.5,ease:'none',scrollTrigger:trigger});
      }
      const finalBackground=q(':scope > .horizontal-scroll_outer-final-image',outer);
      const nextSection=q(':scope > section',outer);
      if(finalBackground&&nextSection)ScrollTrigger.create({trigger:finalBackground,start:'top top',endTrigger:nextSection,end:'top top',pin:true,pinSpacing:false});
    }

    // 57368: static shaded-relief image with a DrawSVG + MotionPath overlay.
    for (const globe of all('.travel-globe')) {
      const component=q('.travel-globe_component',globe),inner=q('.travel-globe_inner',globe);
      const wrap=q('.flight-path_wrap',globe),path=q('.flight-path_svg-flown path',globe),indicator=q('.flight-indicator',globe);
      if(!component||!inner||!wrap||!path||!indicator)continue;
      gsap.set(all('.flight-path_svg path',globe),{drawSVG:'100%'});
      let route;
      const createRoute=()=>{
        route?.kill();
        route=gsap.timeline({scrollTrigger:{trigger:wrap,start:'top bottom',end:'bottom top',scrub:true,invalidateOnRefresh:true}});
        route.fromTo(path,{drawSVG:'0%'},{drawSVG:'100%',ease:'none',duration:1},0);
        route.to(indicator,{motionPath:{path,align:path,alignOrigin:[.5,.5]},ease:'none',duration:1},0);
      };
      createRoute();ScrollTrigger.addEventListener('refreshInit',createRoute);
      disposers.push(()=>{ScrollTrigger.removeEventListener('refreshInit',createRoute);route?.kill();});
      gsap.to(inner,{y:'100svh',ease:'none',scrollTrigger:{trigger:component,start:'top top',end:'bottom top',scrub:true,invalidateOnRefresh:true}});
      gsap.fromTo(inner,{yPercent:-5},{yPercent:0,ease:'none',scrollTrigger:{trigger:component,start:'top bottom',end:'top top',scrub:true,invalidateOnRefresh:true}});
      gsap.matchMedia().add('(min-width: 768px)',()=>{
        const video=q('.globe-floating_vid',globe);
        if(video)gsap.fromTo(video,{y:'100svh'},{y:'-20svh',ease:'none',scrollTrigger:{trigger:component,start:'top bottom',end:'bottom top',scrub:true,invalidateOnRefresh:true}});
        const info=q('.is-info',globe);
        if(info)gsap.fromTo(info,{y:'0vh'},{y:'40vh',ease:'none',scrollTrigger:{trigger:component,start:'top bottom',end:'bottom bottom',scrub:true,invalidateOnRefresh:true}});
      });
    }

    // Homepage's .basic-banner explicitly has hasScrollAnimation:false.
    // Footer has no GSAP reveal. Keep original CSS and [data-reveal] keyframes.
  },scope===document?document.body:scope);
  return()=>{disposers.forEach(fn=>fn());context.revert();};
}

/** Shared header scroll timeline (93300) and section theme triggers (58631). */
export function createHeaderMotion({gsap,ScrollTrigger,lenis,isMenuOpen=()=>false},scope=document){
  const nav=scope.querySelector('nav');
  if(!nav||!lenis)return()=>{};
  const context=gsap.context(()=>{
    gsap.set(nav,{yPercent:0});
    const about=scope.querySelector('.about-nav_wrap');
    if(about)gsap.set(about,{yPercent:0});
  });
  const timeline=gsap.timeline({paused:true}).to(nav,{yPercent:-100,duration:.3,ease:'sine.inOut'},0);
  const about=scope.querySelector('.about-nav_wrap');
  if(about)timeline.to(about,{yPercent:100,duration:.3,ease:'sine.inOut'},0);
  const onScroll=()=>{
    if(lenis.scroll>10&&!isMenuOpen()){
      if(lenis.direction===1)timeline.play();
      else if(lenis.direction===-1)timeline.reverse();
    }else if(lenis.scroll<=10)timeline.reverse();
  };
  lenis.on('scroll',onScroll);
  const themes=[];
  const syncThemes=()=>{
    for(const attribute of ['data-nav-theme','data-alt-nav']){
      const active=themes.filter(entry=>entry.attribute===attribute&&window.scrollY>=entry.trigger.start&&window.scrollY<entry.trigger.end).sort((a,b)=>b.trigger.start-a.trigger.start)[0];
      if(active)document.body.setAttribute(attribute,active.theme);
      else document.body.removeAttribute(attribute);
    }
  };
  document.body.removeAttribute('data-nav-theme');document.body.removeAttribute('data-alt-nav');
  for(const section of scope.querySelectorAll('[data-nav-theme]:not(body)')){
    const theme=section.getAttribute('data-nav-theme');
    for(const [attribute,start,end] of [['data-nav-theme','clamp(top 40px)','bottom 40px'],['data-alt-nav','top+=40px bottom','bottom bottom+=40px']]){
      themes.push({attribute,theme,trigger:ScrollTrigger.create({trigger:section,start,end,onToggle:syncThemes})});
    }
  }
  lenis.on('scroll',syncThemes);
  ScrollTrigger.addEventListener('refresh',syncThemes);
  syncThemes();
  return()=>{lenis.off('scroll',onScroll);lenis.off('scroll',syncThemes);ScrollTrigger.removeEventListener('refresh',syncThemes);timeline.revert();themes.forEach(entry=>entry.trigger.kill());context.revert();document.body.removeAttribute('data-nav-theme');document.body.removeAttribute('data-alt-nav');};
}
