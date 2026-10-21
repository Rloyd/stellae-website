(() => {
  'use strict';
  if(!document.documentElement.classList.contains('intro-cinematic'))return;
  const loader=document.getElementById('entry-loader');
  if(!loader||!window.RhineBootMotion)return;
  const params=new URLSearchParams(location.search),reviewTime=Number(params.get('introTime'));
  const frozen=params.has('introTime')&&Number.isFinite(reviewTime)&&reviewTime>=6.76&&reviewTime<=26.92;
  if(frozen)clearTimeout(window.stellaeEntryFallback);
  const stage=document.createElement('div');stage.className='rhine-opening';
  stage.innerHTML=`
    <div class="rl-background" aria-hidden="true"><svg viewBox="0 0 1920 1080" preserveAspectRatio="none"><g fill="none"><path d="M-210 705C-45 705 182 704 247 567C337 377 99 306 4 435S27 680 169 631C309 584 227 314 279 111S568-113 568-113"/><path d="M1560-80C1374 114 1671 168 1601 323S1371 367 1431 480S1692 666 1559 787S1329 886 1498 1130"/><circle cx="1450" cy="648" r="346"/><circle cx="1450" cy="648" r="348"/></g></svg><div class="rl-exit-field"></div></div>
    <header class="rl-brand"><h1>STELLAE.AI</h1><div>SYNTHESIZE INFORMATION</div><p><span>ANALYSIS</span><b>OS</b></p></header>
    <button class="rl-enter" type="button" aria-label="跳过开场">ENTER SYSTEM <span aria-hidden="true">↗</span></button>
    <div class="rl-access"></div>
    <div class="rl-logo"><div class="rl-logo-art"></div><svg class="rl-logo-trace" viewBox="0 0 280 220" aria-hidden="true"><path class="rl-trace-path" pathLength="1" d="M230 63A99.825 23.55 -25.3 1 1 50 149A99.825 23.55 -25.3 1 1 230 63"/><path class="rl-trace-star" pathLength="1" d="M140 47Q145 103 195 110Q145 117 140 173Q135 117 85 110Q135 103 140 47"/></svg><span class="rl-logo-wordmark"><img src="assets/logo.webp" alt="星黎宇宙" width="1784" height="684"></span></div>
    <div class="rl-auth"><span aria-hidden="true">▪</span><span class="rl-auth-message"></span></div>
    <div class="rl-scan"><svg viewBox="0 0 1920 1080" aria-hidden="true"><g class="rl-scan-geometry" fill="none" stroke-linecap="round"><path/><path class="rl-scan-dark"/><path/><path/><path/><path/><circle class="rl-orbit-dot" r="8"/><circle class="rl-orbit-dot" r="8"/><g class="rl-satellites"></g><circle class="rl-scan-core" cx="959.5" cy="539.5"/><circle class="rl-ring-cap"/><circle class="rl-ring-cap rl-scan-dark"/></g></svg><span>PERMISSION AUTHORIZED</span></div>
    <div class="rl-welcome"><div class="rl-welcome-panel"></div><div class="rl-welcome-heading">WELCOME TO</div><div class="rl-welcome-company"><strong><span>STELLAE UNIVERSE</span></strong><strong class="rl-welcome-highlight" aria-hidden="true"><span>STELLAE UNIVERSE</span></strong></div><div class="rl-welcome-database">INTERNAL DATABASE</div><div class="rl-welcome-logo"><svg viewBox="0 0 280 220" aria-hidden="true"><defs><linearGradient id="rl-star-ink"><stop stop-color="#eadcff"/><stop offset="1" stop-color="#e5f8ff"/></linearGradient></defs><ellipse cx="140" cy="108" rx="100" ry="24" transform="rotate(-25.3 140 108)"/><path d="M140 47Q145 103 195 110Q145 117 140 173Q135 117 85 110Q135 103 140 47"/><path class="rl-pink" d="M101 41Q103 53 114 56Q103 59 101 71Q99 59 88 56Q99 53 101 41"/><path class="rl-cyan" d="M193 136Q195 146 204 149Q195 152 193 162Q191 152 182 149Q191 146 193 136"/></svg><span class="rl-welcome-wordmark-reveal"><img class="rl-welcome-wordmark" src="assets/logo.webp" alt="星黎宇宙" width="1784" height="684"></span></div></div>
    <div class="rl-powered">POWERED BY <b>STELLAE.AI</b><i></i></div>`;
  loader.append(stage);
  const touchSkip=document.createElement('button');touchSkip.type='button';touchSkip.className='rl-mobile-enter';touchSkip.textContent='ENTER SYSTEM ↗';touchSkip.setAttribute('aria-label','跳过开场');loader.append(touchSkip);
  const artwork=loader.querySelector('.entry-artwork');stage.querySelector('.rl-logo-art').append(artwork);
  loader.querySelector('.entry-composition').className='entry-composition rl-progress-host';
  loader.querySelector('.entry-system').hidden=true;
  if(params.get('intro')==='rhine'||frozen){
    const preview=document.createElement('div');preview.className='entry-preview-tools';
    preview.innerHTML='<button class="pill pill-outline" type="button">重播开场 <span aria-hidden="true">↻</span></button><a href="./?intro=classic#home">旧版加载页 ↗</a>';
    preview.querySelector('button').addEventListener('click',()=>{if(frozen){const url=new URL(location.href);url.searchParams.delete('introTime');location.href=url.href;}else location.reload();});document.body.append(preview);
  }
  const $=selector=>stage.querySelector(selector);
  const paths=[...stage.querySelectorAll('.rl-scan-geometry>path')];
  const satellites=Array.from({length:6},()=>{const node=document.createElementNS('http://www.w3.org/2000/svg','circle');$('.rl-satellites').append(node);return node;});
  const orbitDots=[...stage.querySelectorAll('.rl-orbit-dot')],caps=[...stage.querySelectorAll('.rl-ring-cap')];
  const opacity=(selector,value)=>{const node=$(selector);node.style.opacity=String(Number(value));node.setAttribute('aria-hidden',String(Number(value)<=.001));};
  const setText=(selector,text)=>{const node=$(selector);if(node.textContent!==text)node.textContent=text;};
  const arc=(r,start,sweep,x=960,y=540)=>{
    const point=a=>`${x+Math.cos(a)*r},${y+Math.sin(a)*r}`;
    if(sweep>=Math.PI*1.999)return `M${point(start)}A${r},${r} 0 1 1 ${point(start+Math.PI)}A${r},${r} 0 1 1 ${point(start+Math.PI*2)}`;
    return `M${point(start)}A${r},${r} 0 ${sweep>Math.PI?1:0} 1 ${point(start+sweep)}`;
  };
  let portrait=false;
  const fit=()=>{
    const box=loader.getBoundingClientRect();
    portrait=box.width<=700&&box.height>=box.width;
    loader.dataset.layout=portrait?'portrait':'landscape';
    const scale=portrait?box.width/720:Math.min(box.width/1920,box.height/1080);
    loader.style.setProperty('--rl-scale',scale.toFixed(6));
    loader.style.setProperty('--rl-height',(portrait?box.height/scale:1080).toFixed(2)+'px');
  };
  const resize=new ResizeObserver(fit);resize.observe(loader);fit();
  const skip=()=>loader.dispatchEvent(new Event('stellae:skip-intro'));
  const keydown=event=>{if(event.key==='Escape'||event.key==='Enter'){event.preventDefault();skip();}};
  $('.rl-enter').addEventListener('click',skip);touchSkip.addEventListener('click',skip);document.addEventListener('keydown',keydown);
  const controller={
    duration:20160,maxDuration:25500,frozen,progress:0,
    update(elapsed,reduced){
      const sourceTime=reduced?25.6:frozen?reviewTime:6.76+elapsed/1000;
      const s=window.RhineBootMotion.bootMotion(sourceTime-5);
      controller.progress=Math.max(0,Math.min(1,(sourceTime-6.76)/20.16));
      loader.dataset.phase=s.step;loader.dataset.sourceFrame=String(s.f);
      setText('.rl-access',s.access);opacity('.rl-access',s.accessOpacity);
      opacity('.rl-logo',s.logoOpacity);$('.rl-logo').style.transform=portrait?`translateY(${(s.logo.offsetX-294)*.2}px)`:`translateX(${s.logo.offsetX}px)`;
      for(const path of stage.querySelectorAll('.rl-logo-trace path')){path.style.strokeDasharray=`${s.logo.length} ${1-s.logo.length}`;path.style.strokeDashoffset=String(-s.logo.start);path.style.strokeWidth=String(Math.min(1.5,s.logo.strokeWidth*.06));}
      const ink=Math.max(0,Math.min(1,(s.f-249)/18));$('.rl-logo-art').style.opacity=String(ink);$('.rl-logo-trace').style.opacity=String(1-ink*.84);
      const wordmarkReveal=Math.min(1,s.logoLetters.length/9);
      $('.rl-logo-wordmark').style.clipPath=`inset(0 ${100*(1-wordmarkReveal)}% 0 0)`;
      $('.rl-logo-wordmark').setAttribute('aria-hidden',String(wordmarkReveal===0));
      opacity('.rl-auth',s.authOpacity);setText('.rl-auth-message',s.auth);
      [...$('.rl-brand').children].forEach((line,i)=>{line.style.opacity=String(s.brand[i].opacity);line.style.transform=`translateX(${s.brand[i].x}px)`;});
      opacity('.rl-powered',s.poweredLetters>0);$('.rl-powered').style.clipPath=`inset(0 ${100*(1-s.poweredLetters/21)}% 0 0)`;
      opacity('.rl-scan',s.scanVisible);
      if(s.scanVisible){
        const scan=s.scan;$('.rl-scan-geometry').setAttribute('transform',`translate(960 540) scale(${s.ringScale}) translate(-960 -540)`);$('.rl-scan-geometry').style.opacity=String(s.ringOpacity);$('.rl-scan-geometry').style.filter=`blur(${s.ringBlur}px)`;
        paths[0].setAttribute('d',arc(scan.radius,scan.outerStart,scan.outerSweep));paths[0].setAttribute('stroke-width','2.4');paths[1].setAttribute('d',arc(scan.whiteRadius,scan.whiteStart,scan.whiteSweep));paths[1].setAttribute('stroke-width','4');
        paths[2].setAttribute('d',arc(scan.innerRadius,scan.innerStart,scan.innerSweep));paths[3].setAttribute('d',arc(scan.innerRadius,scan.innerStart+Math.PI,scan.innerSweep));
        s.scanOrbit.sides.forEach((side,i)=>{paths[i+4].setAttribute('d',arc(side.radius,side.start,side.sweep,side.x,side.y));paths[i+4].style.opacity=s.scanOrbit.sideVisible?'1':'0';});
        s.scanOrbit.satellites.forEach((point,i)=>{satellites[i].setAttribute('cx',point.x);satellites[i].setAttribute('cy',point.y);satellites[i].setAttribute('r',point.radius);});
        $('.rl-scan-core').style.opacity=s.ornament?'1':'0';$('.rl-scan-core').setAttribute('r',s.coreRadius);
        orbitDots.forEach((dot,i)=>{dot.setAttribute('cx',960+Math.cos(scan.orbit+i*Math.PI)*scan.orbitRadius);dot.setAttribute('cy',540+Math.sin(scan.orbit+i*Math.PI)*scan.orbitRadius);dot.setAttribute('r',scan.dotRadius);});
        caps.forEach((cap,i)=>{const angle=i?scan.whiteStart:scan.outerStart+scan.outerSweep;const radius=i?scan.whiteRadius:scan.radius;cap.setAttribute('cx',960+Math.cos(angle)*radius);cap.setAttribute('cy',540+Math.sin(angle)*radius);cap.setAttribute('r',i?scan.whiteCap:scan.blackCap);});
        opacity('.rl-scan>span',s.permissionOpacity);$('.rl-scan>span').style.letterSpacing=(portrait?Math.min(s.scanTracking,10):s.scanTracking)+'px';$('.rl-scan>span').style.fontSize=(portrait?30:s.scanFont)+'px';
      }
      opacity('.rl-welcome',s.welcomeVisible?s.welcomeOpacity:0);$('.rl-welcome').style.transform=`scale(${s.welcomeScale*(portrait?1.1:1)})`;$('.rl-welcome').style.filter=`blur(${s.exitBlur}px)`;
      opacity('.rl-welcome-panel',s.welcomePanel*.18);$('.rl-welcome-heading').style.color=s.welcomeInk<.5?'#b7a1d5':'#f0e9ff';
      opacity('.rl-welcome-company',s.companyVisible?(s.companyMask?.65:1):0);$('.rl-welcome-highlight').style.clipPath=`inset(0 ${100*(1-s.highlight)}% 0 0)`;$('.rl-welcome-highlight').style.opacity=s.companyMask?'.06':'1';
      opacity('.rl-welcome-database',s.databaseOpacity);opacity('.rl-welcome-logo',s.welcomeLogo);
      const welcomeDrop=reduced?1:Math.max(0,Math.min(1,(sourceTime-24.64)/.9));
      const welcomeEase=1-Math.pow(1-welcomeDrop,3);
      $('.rl-welcome-wordmark').style.transform=`translateY(${-48*(1-welcomeEase)}px)`;
      opacity('.rl-welcome-wordmark-reveal',Math.min(1,welcomeDrop*2));
      $('.rl-background>svg').style.transform=`translate(${Math.sin(s.t*.16)*18}px,${-(s.t-6)*5}px) scale(1.08)`;opacity('.rl-exit-field',s.white*.65);
      document.getElementById('entry-stage').textContent=s.step==='access'?'ACCESS':s.step==='logo'?'CONNECTING':s.step==='auth'?'PROCESSING':s.step==='scan'?'AUTHORIZING':'READY';
    },
    dispose(){resize.disconnect();document.removeEventListener('keydown',keydown);}
  };
  window.StellaeIntro=controller;
})();
