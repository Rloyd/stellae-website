/* Copyright (c) 2026 LBEILC. MIT; see rhine-boot-LICENSE.txt.
 * From src/document-decryption.ts: TypeScript removed; selectors and duration configurable.
 */
export class DocumentDecryption {
  root=null;
  covers=[];
  started=null;
  progress=0;
  constructor(selector,duration=2000){this.selector=selector;this.duration=duration;}
  reset(root,clear=false){
    this.remove();this.root=root;this.started=null;this.progress=clear?1:0;this.refresh();
  }
  refresh(){
    this.remove();
    if(!this.root||this.progress===1)return;
    const targets=this.root.querySelectorAll(this.selector);
    targets.forEach(target=>{
      target.classList.add('document-redacted');
      const bounds=target.getBoundingClientRect(),scale=bounds.width/target.offsetWidth;
      if(!scale||!Number.isFinite(scale))return;
      const walker=document.createTreeWalker(target,NodeFilter.SHOW_TEXT),lines=[];
      let node;
      while((node=walker.nextNode())){
        if(!node.textContent?.trim())continue;
        const range=document.createRange();range.selectNodeContents(node);
        for(const rect of range.getClientRects()){
          if(!rect.width||!rect.height)continue;
          const x=(rect.left-bounds.left)/scale,y=(rect.top-bounds.top)/scale;
          const right=(rect.right-bounds.left)/scale,bottom=(rect.bottom-bounds.top)/scale;
          const line=lines.find(entry=>Math.abs(entry.y-y)<6);
          if(line){line.x=Math.min(line.x,x);line.y=Math.min(line.y,y);line.right=Math.max(line.right,right);line.bottom=Math.max(line.bottom,bottom);}
          else lines.push({x,y,right,bottom});
        }
      }
      for(const line of lines){
        const window=document.createElement('span');window.className='document-redaction-window';window.setAttribute('aria-hidden','true');
        const left=Math.max(0,line.x-1),right=Math.min(target.clientWidth,line.right+1);
        window.style.cssText=`left:${left}px;top:${line.y-1}px;width:${right-left}px;height:${line.bottom-line.y+2}px`;
        const ink=document.createElement('span');ink.className='document-redaction-ink';window.append(ink);target.append(window);
        this.covers.push({window,ink,order:this.covers.length});
      }
    });
    this.paint();
  }
  update(now,ready=true,reduced=false){
    if(!this.root||this.progress===1)return;
    if(reduced)this.progress=1;
    else{
      if(this.started===null&&ready)this.started=now;
      if(this.started!==null)this.progress=Math.min(1,Math.max(0,(now-this.started)/this.duration));
    }
    if(this.progress===1)this.remove();
    else if(this.started!==null)this.paint();
  }
  paint(){
    const count=Math.max(1,this.covers.length-1);
    for(const cover of this.covers){
      const delay=(cover.order/count)*.22;
      const t=Math.min(1,Math.max(0,(this.progress-delay)/.78));
      const eased=t<.2?.4*(t/.2)**2:1-.6*((1-t)/.8)**(16/3);
      cover.ink.style.transform=`translateX(${eased*101}%)`;
    }
  }
  remove(){
    for(const cover of this.covers){cover.window.parentElement?.classList.remove('document-redacted');cover.window.remove();}
    this.covers=[];
  }
}
