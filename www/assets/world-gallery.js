import {stepGallerySpring,galleryThrow} from './gallery-spring.js';

(() => {
  'use strict';
  const root=document.getElementById('scene-view'),track=document.getElementById('world-gallery-track');
  if(!root||!track)return;
  const images=window.STELLAE_CONFIG.worldGallery;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const section=root.closest('section');
  let copies=0;
  const appendCopy=()=>{
    const copy=copies++;
    images.forEach((item,index)=>{
      const slide=document.createElement('figure');slide.className='world-gallery-slide';
      if(copy===2){slide.setAttribute('role','group');slide.setAttribute('aria-label',`第 ${index+1} 张，共 ${images.length} 张`);}
      else slide.setAttribute('aria-hidden','true');
      const image=document.createElement('img');image.src=item.image;image.alt=copy===2?item.alt:'';image.width=1179;image.height=2556;image.loading=copy===2&&index<2?'eager':'lazy';image.decoding='async';image.draggable=false;
      slide.append(image);track.append(slide);
    });
  };
  for(let copy=0;copy<5;copy++)appendCopy();
  root.querySelector('.world-gallery-total').textContent=String(images.length).padStart(2,'0');
  const buttons=[...root.querySelectorAll('[data-gallery-step]')];
  const spring={value:0,target:0,velocity:0};
  let cycleWidth=0,manualUntil=0,drag=null,last=0,lastWritten=0,moving=false;
  const manual=()=>{manualUntil=performance.now()+1000;};
  const normalize=()=>{
    if(!cycleWidth)return;
    const next=2*cycleWidth+((spring.value-2*cycleWidth)%cycleWidth+cycleWidth)%cycleWidth;
    const shift=next-spring.value;
    if(Math.abs(shift)>1){spring.value+=shift;spring.target+=shift;if(drag)drag.left+=shift;}
  };
  const write=()=>{normalize();track.scrollLeft=spring.value;lastWritten=track.scrollLeft;};
  const finish=()=>{spring.value=spring.target;spring.velocity=0;moving=false;write();};
  const measure=()=>{
    if(!track.clientWidth||!track.clientHeight)return;
    const phase=cycleWidth?((spring.value%cycleWidth)+cycleWidth)%cycleWidth/cycleWidth:0;
    cycleWidth=track.children[images.length].offsetLeft-track.children[0].offsetLeft;
    if(!cycleWidth)return;
    while(copies<Math.ceil(track.clientWidth/cycleWidth)+4)appendCopy();
    spring.value=spring.target=(2+phase)*cycleWidth;spring.velocity=0;moving=false;write();
  };
  const shift=distance=>{manual();spring.target+=distance;moving=true;if(reduced.matches)finish();};
  buttons.forEach(button=>button.addEventListener('click',()=>shift(Number(button.dataset.galleryStep)*cycleWidth/images.length)));
  new ResizeObserver(measure).observe(track);
  track.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();event.stopPropagation();
    if(event.key==='Home'||event.key==='End'){
      manual();spring.target=2*cycleWidth+(event.key==='End'?cycleWidth*(images.length-1)/images.length:0);moving=true;if(reduced.matches)finish();
    }else shift((event.key==='ArrowRight'?1:-1)*cycleWidth/images.length);
  });
  track.addEventListener('wheel',event=>{
    if(event.ctrlKey||(!event.shiftKey&&Math.abs(event.deltaX)<=Math.abs(event.deltaY)))return;
    event.preventDefault();event.stopPropagation();
    const unit=event.deltaMode===1?16:event.deltaMode===2?track.clientWidth:1;
    shift((event.shiftKey?event.deltaY+event.deltaX:event.deltaX)*unit);
  },{passive:false});
  track.addEventListener('pointerdown',event=>{
    if(event.pointerType==='mouse'&&event.button!==0)return;
    manual();spring.target=spring.value;spring.velocity=0;moving=false;
    drag={id:event.pointerId,type:event.pointerType,x:event.clientX,y:event.clientY,left:spring.value,lastX:event.clientX,lastAt:performance.now(),velocity:0};
    track.setPointerCapture(event.pointerId);track.classList.add('is-dragging');
  });
  const release=(event,cancelled=false)=>{
    if(!drag||drag.id!==event.pointerId)return;
    const pointer=drag.id,velocity=!cancelled&&performance.now()-drag.lastAt<100?drag.velocity:0;
    drag=null;track.classList.remove('is-dragging');
    if(!reduced.matches)spring.target+=galleryThrow(velocity,track.clientWidth);
    moving=true;manual();if(reduced.matches)finish();
    if(track.hasPointerCapture(pointer))track.releasePointerCapture(pointer);
  };
  track.addEventListener('pointermove',event=>{
    if(!drag||drag.id!==event.pointerId)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(drag.type==='touch'&&Math.abs(dy)>Math.abs(dx)+10){release(event,true);return;}
    const now=performance.now(),dt=Math.max(.008,Math.min(.1,(now-drag.lastAt)/1000));
    const speed=Math.max(-3200,Math.min(3200,(drag.lastX-event.clientX)/dt));
    drag.velocity=drag.velocity*.4+speed*.6;drag.lastX=event.clientX;drag.lastAt=now;
    spring.target=drag.left-dx;moving=true;
    if(reduced.matches)finish();
  });
  track.addEventListener('pointerup',event=>release(event));
  track.addEventListener('pointercancel',event=>release(event,true));
  track.addEventListener('lostpointercapture',event=>release(event,true));
  const tick=now=>{
    const dt=last?Math.min((now-last)/1000,.08):0;last=now;
    const active=section.dataset.active==='true'&&!document.hidden&&!document.documentElement.classList.contains('is-loading');
    if(active&&cycleWidth){
      if(Math.abs(track.scrollLeft-lastWritten)>2){spring.value=spring.target=track.scrollLeft;spring.velocity=0;moving=false;manual();}
      if(moving&&!reduced.matches)moving=stepGallerySpring(spring,dt);
      else if(moving)finish();
      const running=!reduced.matches&&!drag&&!moving&&now>=manualUntil;
      if(running){spring.value+=24*dt;spring.target=spring.value;}
      write();
      root.dataset.autoState=running?'running':reduced.matches?'reduced':'interacting';
      root.dataset.galleryMotion=drag?'dragging':moving?'spring':running?'auto':'rest';
      root.dataset.springOffset=(spring.target-spring.value).toFixed(2);
    }else{root.dataset.autoState='waiting';root.dataset.galleryMotion='waiting';}
    requestAnimationFrame(tick);
  };
  reduced.addEventListener('change',()=>{if(reduced.matches)finish();});
  document.addEventListener('stellae:panelchange',event=>{
    if(event.detail.id==='world')requestAnimationFrame(measure);
    else if(drag){const id=drag.id;drag=null;track.classList.remove('is-dragging');if(track.hasPointerCapture(id))track.releasePointerCapture(id);}
  });
  measure();requestAnimationFrame(tick);
})();