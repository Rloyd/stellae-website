import { SurfaceTransition } from './vendor/rhine-ui-transitions.js';
import { revealPanelText } from './panel-text-reveal.js';

// Fixed viewport + explicit panel state, following RhineLabUI's setMode/input model.
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const definitions=[
  {id:'home',title:'与你相遇',side:'right'},
  {id:'trailer',title:'初见星黎',side:'left'},
  {id:'meet',title:'从一句你好开始',side:'right',balance:'scene'},
  {id:'experience',title:'陪伴的形状',side:'left',balance:'scene'},
  {id:'world',title:'换个地方，接着聊',side:'right'},
  {id:'moments',title:'把瞬间，变成羁绊',side:'left'},
  {id:'room',title:'她的房间',side:'right',balance:'scene'},
  {id:'faq',title:'相遇之前',side:'left'},
  {id:'download',title:'下一次相遇',side:'right'}
];
document.querySelector('.meet-section').id='meet';
document.querySelector('.room-section').id='room';
const panels=definitions.map(item=>({...item,node:document.getElementById(item.id)}));
const transitions=new Map();
for(const item of panels){
  item.node.dataset.pagePanel=item.id;item.node.dataset.contentSide=item.side;item.node.dataset.panelBalance=item.balance||'ui';
  item.node.hidden=true;item.node.inert=true;item.node.setAttribute('aria-hidden','true');
  const content=item.node.querySelector(':scope>.wrap')||item.node;
  transitions.set(item.id,new SurfaceTransition(item.node,content,300,200));
}
history.scrollRestoration='manual';
const faq=document.getElementById('faq');
const questions=[...faq.querySelectorAll('details')];
questions.forEach(item=>{item.open=false;});
const syncQuestions=()=>{
  const expanded=questions.some(item=>item.open);
  faq.dataset.expanded=String(expanded);document.body.dataset.faqExpanded=String(expanded);
  document.dispatchEvent(new CustomEvent('stellae:faqresize',{detail:{expanded}}));
};
for(const item of questions)item.addEventListener('toggle',()=>{
  if(item.open)questions.forEach(other=>{if(other!==item)other.open=false;});
  syncQuestions();
});
syncQuestions();
let current=-1,wheelTotal=0,wheelTime=0,wheelDirection=0,wheelLatched=false,lockedUntil=0,pointerStart=null;
const isLoading=()=>document.documentElement.classList.contains('is-loading');
const interactive=target=>target instanceof Element&&target.closest('button,a,input,select,textarea,summary,video,dialog,[role=tablist],.memory-gallery,[data-local-gallery]');
function activate(index,{historyMode='replace',focus=false}={}){
  index=Math.max(0,Math.min(panels.length-1,index));
  if(index===current)return;
  const previous=current<0?null:panels[current],next=panels[index];current=index;
  document.body.dataset.activePanel=next.id;
  document.body.dataset.panelBalance=next.balance||'ui';
  document.body.dataset.sceneSection=next.id;
  document.body.dataset.sceneSide=next.side==='left'?'right':'left';
  document.querySelectorAll('.desktop-nav a').forEach(link=>{if(link.hash===`#${next.id}`)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
  for(const item of panels){
    const active=item===next;item.node.dataset.active=String(active);item.node.inert=!active;item.node.setAttribute('aria-hidden',String(!active));
    if(active)transitions.get(item.id).show(reduced.matches||isLoading()||!previous);
    else if(item===previous)transitions.get(item.id).hide(reduced.matches||isLoading());
    else item.node.hidden=true;
  }
  revealPanelText(next.node);
  if(previous?.node.contains(document.activeElement)){
    const target=next.node.querySelector('h1,h2');target?.setAttribute('tabindex','-1');target?.focus({preventScroll:true});
  }else if(focus){
    const target=next.node.querySelector('h1,h2');target?.setAttribute('tabindex','-1');target?.focus({preventScroll:true});
  }
  if(historyMode!=='none'){
    const url=new URL(location.href);url.hash=next.id;
    history[historyMode==='push'?'pushState':'replaceState']({panel:next.id},'',url);
  }
  document.dispatchEvent(new CustomEvent('stellae:panelchange',{detail:{id:next.id,index,side:next.side,previous:previous?.id}}));
  lockedUntil=performance.now()+(reduced.matches?150:650);wheelTotal=0;
}
function step(direction){activate(current+direction);}
document.addEventListener('click',event=>{
  if(!(event.target instanceof Element))return;
  const link=event.target.closest('a[href]');if(!link)return;
  const url=new URL(link.href,location.href);
  if(url.origin!==location.origin||url.pathname!==location.pathname)return;
  const index=panels.findIndex(panel=>`#${panel.id}`===url.hash);
  if(index<0)return;
  event.preventDefault();activate(index,{historyMode:'push'});
},true);
// Accumulate wheel input like the reference, with one transition per gesture.
addEventListener('wheel',event=>{
  if(event.ctrlKey||document.querySelector('dialog[open]')||isLoading())return;
  if(Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
  const local=event.target instanceof Element?event.target.closest('[data-local-scroll]'):null;
  if(local&&local.scrollHeight>local.clientHeight+2){
    const canScroll=event.deltaY>0?local.scrollTop+local.clientHeight<local.scrollHeight-2:local.scrollTop>2;
    if(canScroll)return;
  }
  event.preventDefault();const now=performance.now();
  const delta=Math.max(-300,Math.min(300,event.deltaY*(event.deltaMode===1?40:event.deltaMode===2?innerHeight:1)));
  const direction=Math.sign(delta);
  if(now-wheelTime>220||direction!==wheelDirection){wheelTotal=0;wheelLatched=false;}
  wheelTime=now;wheelDirection=direction;
  if(now<lockedUntil||wheelLatched)return;
  wheelTotal+=delta;
  if(Math.abs(wheelTotal)>=100){wheelLatched=true;step(direction);}
},{passive:false});
document.addEventListener('keydown',event=>{
  if(isLoading()||document.querySelector('dialog[open]')||event.altKey||event.ctrlKey||event.metaKey)return;
  if(interactive(event.target)&&!['PageDown','PageUp','Home','End'].includes(event.key))return;
  if(event.target instanceof Element&&event.target.closest('input,select,textarea,video'))return;
  if(['ArrowDown','PageDown','ArrowRight'].includes(event.key)){event.preventDefault();step(1);}
  if(['ArrowUp','PageUp','ArrowLeft'].includes(event.key)){event.preventDefault();step(-1);}
  if(event.key==='Home'){event.preventDefault();activate(0);}
  if(event.key==='End'){event.preventDefault();activate(panels.length-1);}
});
document.addEventListener('pointerdown',event=>{
  if(event.pointerType!=='touch'||interactive(event.target)||isLoading())return;
  pointerStart={id:event.pointerId,x:event.clientX,y:event.clientY};
},{passive:true});
document.addEventListener('pointerup',event=>{
  if(!pointerStart||pointerStart.id!==event.pointerId)return;
  const dx=event.clientX-pointerStart.x,dy=event.clientY-pointerStart.y;pointerStart=null;
  if(Math.abs(dy)>55&&Math.abs(dy)>Math.abs(dx)*1.3&&!document.querySelector('dialog[open]'))step(dy<0?1:-1);
},{passive:true});
document.addEventListener('pointercancel',()=>{pointerStart=null;},{passive:true});
const fromHash=()=>{const index=panels.findIndex(panel=>`#${panel.id}`===location.hash);activate(index<0?0:index,{historyMode:'none'});};
addEventListener('popstate',fromHash);addEventListener('hashchange',fromHash);
addEventListener('pageshow',event=>{if(event.persisted)activate(0);});
document.addEventListener('stellae:entered',()=>{document.body.dataset.panelReady='true';lockedUntil=performance.now()+250;});
document.documentElement.classList.add('panel-interface');
document.body.classList.add('panel-interface');
// Hashes describe navigation within this visit; they never restore a previous visit.
activate(0);
