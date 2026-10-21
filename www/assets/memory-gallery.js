(() => {
  'use strict';
  const gallery=document.getElementById('memory-gallery');
  if(!gallery)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const narrow=matchMedia('(max-width:700px)');
  const instruction=document.getElementById('flash-instruction');
  const desktopInstruction=instruction.textContent;
  const hint=()=>{instruction.textContent=narrow.matches?'左右滑动，查看更多碎片 · 轻点卡片翻面':desktopInstruction;};
  narrow.addEventListener('change',hint);hint();
  gallery.setAttribute('role','group');
  gallery.setAttribute('aria-label','羁绊碎片，左右滑动查看三张卡片');
  gallery.querySelectorAll('img').forEach(image=>{image.draggable=false;});
  let drag=null,suppressClick=false;
  const canSlide=()=>gallery.scrollWidth>gallery.clientWidth+2;
  const snapTarget=(position)=>{
    const limit=gallery.scrollWidth-gallery.clientWidth;
    const targets=[...gallery.children].map(card=>Math.max(0,Math.min(limit,card.offsetLeft+card.offsetWidth/2-gallery.clientWidth/2)));
    return targets.reduce((best,value)=>Math.abs(value-position)<Math.abs(best-position)?value:best,targets[0]||0);
  };
  const finish=event=>{
    if(!drag||event.pointerId!==drag.id)return;
    const ended=drag;drag=null;
    gallery.classList.remove('is-dragging');
    if(gallery.hasPointerCapture(ended.id))gallery.releasePointerCapture(ended.id);
    if(!ended.moved)return;
    suppressClick=true;
    // A short projection retains a flick, with a bounded distance to the next card.
    const velocity=performance.now()-ended.time<90?ended.velocity:0;
    const projected=gallery.scrollLeft-Math.max(-100,Math.min(100,velocity*90));
    gallery.scrollTo({left:snapTarget(projected),behavior:reduced.matches?'auto':'smooth'});
  };
  gallery.addEventListener('pointerdown',event=>{
    if(!event.isPrimary||event.button!==0||!canSlide())return;
    suppressClick=false;
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,left:gallery.scrollLeft,moved:false,lastX:event.clientX,time:performance.now(),velocity:0};
  },{capture:true});
  gallery.addEventListener('pointermove',event=>{
    if(!drag||drag.id!==event.pointerId)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(!drag.moved){
      if(Math.max(Math.abs(dx),Math.abs(dy))<8)return;
      if(Math.abs(dy)>Math.abs(dx)){drag=null;return;}
      drag.moved=true;gallery.classList.add('is-dragging');gallery.setPointerCapture(event.pointerId);
    }
    event.preventDefault();event.stopPropagation();
    const now=performance.now(),elapsed=now-drag.time;
    if(elapsed>0)drag.velocity=(event.clientX-drag.lastX)/elapsed;
    drag.lastX=event.clientX;drag.time=now;
    gallery.scrollLeft=drag.left-dx;
  },{capture:true,passive:false});
  gallery.addEventListener('pointerup',finish,{capture:true});
  gallery.addEventListener('pointercancel',finish,{capture:true});
  gallery.addEventListener('lostpointercapture',finish);
  gallery.addEventListener('click',event=>{
    if(!suppressClick||event.detail===0)return;
    suppressClick=false;event.preventDefault();event.stopImmediatePropagation();
  },{capture:true});
  gallery.addEventListener('wheel',event=>{
    if(!event.shiftKey||!canSlide()||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
    event.preventDefault();event.stopPropagation();
    gallery.scrollBy({left:event.deltaY*(event.deltaMode===1?16:1),behavior:'auto'});
  },{passive:false});
})();
