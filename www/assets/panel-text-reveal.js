import {DocumentDecryption} from './vendor/rhine-document-reveal.js';

// Retain RhineLab's per-line redaction and easing; start promptly without waiting for 3D decryption.
const selector=[
  '.hero-copy h1','.hero-pretitle','.hero-description',
  '.section-heading h2','.section-aside',
  '.meet-copy h2','.meet-copy>p:not(.section-code)','.chat-bubble p',
  '.feature-copy h3','.feature-description','.scene-title h3',
  '.room-copy h2','.room-copy>p:not(.section-code)',
  '.faq-layout h2','.faq-intro',
  '.download-section h2','.download-section .wrap>p:not(.section-code)'
].join(',');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const reveal=new DocumentDecryption(selector,2000);
let frame=0,timer=0,revision=0;
function finish(){
  clearTimeout(timer);cancelAnimationFrame(frame);frame=0;
  reveal.update(performance.now(),true,true);
  if(reveal.root)reveal.root.dataset.textReveal='clear';
}
function play(delay=40){
  clearTimeout(timer);cancelAnimationFrame(frame);
  const version=revision;
  timer=setTimeout(()=>{
    if(version!==revision)return;
    if(reduced.matches){finish();return;}
    const tick=now=>{
      if(version!==revision)return;
      reveal.update(now);
      reveal.root.dataset.textReveal=reveal.progress===1?'clear':'revealing';
      frame=reveal.progress<1?requestAnimationFrame(tick):0;
    };
    frame=requestAnimationFrame(tick);
  },delay);
}
export function revealPanelText(root){
  finish();revision++;
  reveal.reset(root,reduced.matches);
  root.dataset.textReveal=reduced.matches?'clear':'covered';
  if(!document.documentElement.classList.contains('is-loading'))play();
}
// Let the opening fade enough to make the text gesture visible, without holding for the model.
document.addEventListener('stellae:entered',()=>play(300));
reduced.addEventListener('change',finish);
document.addEventListener('visibilitychange',()=>{if(document.hidden)finish();});
addEventListener('resize',()=>reveal.refresh(),{passive:true});
document.fonts?.ready.then(()=>reveal.refresh());

// Existing feature/scene controls replace their copy; apply the same quick reveal to that copy only.
const changedText=records=>records.some(record=>record.type==='characterData'||[...record.addedNodes,...record.removedNodes].some(node=>
  node.nodeType===Node.TEXT_NODE||(node.nodeType===Node.ELEMENT_NODE&&!node.classList.contains('document-redaction-window')&&!node.closest('.document-redaction-window'))
));
for(const root of document.querySelectorAll('.feature-copy,.scene-title')){
  new MutationObserver(records=>{
    if(changedText(records)&&root.closest('[data-page-panel]')?.dataset.active==='true')revealPanelText(root);
  }).observe(root,{subtree:true,childList:true,characterData:true});
}
