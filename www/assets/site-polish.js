(() => {
  'use strict';
  const $=selector=>document.querySelector(selector);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');

  // Keep the selected App-style tab in view as the carousel advances.
  const tabs=$('#feature-tabs');
  let selectionFrame=0;
  const followSelection=()=>{
    cancelAnimationFrame(selectionFrame);
    selectionFrame=requestAnimationFrame(()=>{
      const active=tabs.querySelector('[aria-selected=true]');if(!active)return;
      const left=active.offsetLeft-(tabs.clientWidth-active.offsetWidth)/2;
      tabs.scrollTo({left:Math.max(0,left),behavior:reduced.matches?'instant':'smooth'});
    });
  };
  new ResizeObserver(followSelection).observe(tabs);
  new MutationObserver(()=>{
    followSelection();
    if(!reduced.matches){
      $('.feature-copy').animate([{opacity:.25,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:600,easing:'cubic-bezier(.2,.8,.2,1)'});
    }
  }).observe(tabs,{subtree:true,attributes:true,attributeFilter:['aria-selected']});
  followSelection();

  function createCycle(root,strip,toggle,name,period,onAdvance){
    const buttons=[...strip.querySelectorAll('[role=tab]')];
    let paused=false,visible=false,hovered=false,keyboard=false,elapsed=0,last=performance.now(),autoPicking=false;
    const sync=()=>{
      if(!toggle)return;
      toggle.setAttribute('aria-pressed',String(paused));
      toggle.setAttribute('aria-label',(paused?'开始':'暂停')+name+'轮播');
      const label=[...toggle.childNodes].find(node=>node.nodeType===3);if(label)label.textContent=paused?'▷':'Ⅱ';
      else toggle.append(document.createTextNode(paused?'▷':'Ⅱ'));
    };
    toggle?.addEventListener('click',()=>{paused=!paused;sync();});
    strip.addEventListener('click',event=>{if(event.target.closest('[role=tab]')&&!autoPicking)elapsed=0;});
    root.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')hovered=true;});
    root.addEventListener('pointerleave',()=>{hovered=false;});
    root.addEventListener('focusin',event=>{keyboard=event.target.matches(':focus-visible');});
    root.addEventListener('focusout',()=>queueMicrotask(()=>{keyboard=root.contains(document.activeElement)&&document.activeElement.matches(':focus-visible');}));
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;last=performance.now();},{threshold:.18});observer.observe(root);
    const tick=()=>{
      const now=performance.now();
      const running=visible&&(!root.dataset.pagePanel||root.dataset.active==='true')&&!paused&&!hovered&&!keyboard&&!reduced.matches&&!document.hidden&&!document.documentElement.classList.contains('is-loading')&&!document.querySelector('dialog[open]');
      if(running){
        elapsed+=Math.min(250,now-last);
        if(elapsed>=period){
          elapsed=0;const current=buttons.findIndex(button=>button.getAttribute('aria-selected')==='true');
          autoPicking=true;buttons[(current+1)%buttons.length].click();autoPicking=false;
          const selected=buttons[(current+1)%buttons.length];
          strip.scrollTo({left:Math.max(0,selected.offsetLeft-(strip.clientWidth-selected.offsetWidth)/2),behavior:'smooth'});
          onAdvance?.();
        }
      }
      last=now;root.dataset.autoState=paused?'paused':running?'running':'waiting';
      setTimeout(tick,100);
    };
    sync();tick();
  }
  createCycle($('#experience'),tabs,$('[data-cycle-toggle=features]'),'功能',8500,()=>{
    if($('#feature-video').paused)$('#feature-play').click();
  });

  // The download section shares the same App emblem as the entry screen.
  window.StellaeLaunch.mount($('#launch-emblem'),{transparent:true,timeOffset:6.2}).catch(()=>{$('#launch-emblem').dataset.state='unavailable';});
})();
