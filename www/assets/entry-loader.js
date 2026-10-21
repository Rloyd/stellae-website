(() => {
  'use strict';
  const loader=document.getElementById('entry-loader');
  if(!loader||!document.documentElement.classList.contains('is-loading'))return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const progress=loader.querySelector('[role=progressbar]');
  const percent=document.getElementById('entry-percent');
  const stage=document.getElementById('entry-stage');
  const intro=window.StellaeIntro;
  const started=performance.now(),introDuration=reduced.matches?160:(intro?.duration||3600);
  let completed=0,total=3,artwork=null,closing=false,frame=0,skipRequested=false;
  const readyImage=src=>new Promise(resolve=>{
    const image=new Image();image.onload=()=>image.decode().catch(()=>{}).then(resolve);image.onerror=resolve;image.src=src;
  });
  const finish=()=>{
    if(closing)return;closing=true;clearTimeout(window.stellaeEntryFallback);cancelAnimationFrame(frame);
    intro?.dispose();loader.dataset.state='leaving';loader.setAttribute('aria-hidden','true');
    document.documentElement.dataset.entry='ready';document.documentElement.classList.remove('is-loading');
    document.dispatchEvent(new Event('stellae:entered'));
    setTimeout(()=>{artwork?.dispose();loader.remove();},reduced.matches?0:(intro?700:500));
  };
  loader.addEventListener('stellae:skip-intro',()=>{skipRequested=true;});
  const tasks=[
    readyImage(document.querySelector('.brand img').src),
    readyImage(document.querySelector('#hero-video').poster),
    window.StellaeLaunch.mount(document.getElementById('entry-emblem'),{speed:intro?1:6200/introDuration,timeOffset:intro?6.2:0,staticTime:intro?.frozen?6.2:null,transparent:!!intro})
      .then(controller=>{if(closing)controller.dispose();else artwork=controller;})
  ];
  tasks.forEach(task=>Promise.resolve(task).catch(()=>{}).finally(()=>{completed++;}));
  // Progress reflects both the essential assets and the original emblem's formation.
  const tick=()=>{
    if(!loader.isConnected||closing){artwork?.dispose();return;}
    const elapsed=performance.now()-started;
    intro?.update(elapsed,reduced.matches);
    const fraction=Math.min(completed/total,intro?.frozen?intro.progress:elapsed/introDuration,1);
    const value=Math.floor(fraction*100);
    loader.style.setProperty('--entry-progress',fraction.toFixed(4));
    percent.textContent=String(value).padStart(2,'0');progress.setAttribute('aria-valuenow',String(value));
    if(completed===total&&((!intro?.frozen&&elapsed>=introDuration)||skipRequested)){
      percent.textContent='100';progress.setAttribute('aria-valuenow','100');loader.style.setProperty('--entry-progress','1');
      stage.textContent='即将与你相遇';document.getElementById('entry-system-status').textContent='SYSTEM INITIALIZED';
      setTimeout(finish,reduced.matches?0:180);return;
    }
    if(!intro?.frozen&&elapsed>(intro?.maxDuration||8000)){finish();return;}
    frame=requestAnimationFrame(tick);
  };
  frame=requestAnimationFrame(tick);
})();
