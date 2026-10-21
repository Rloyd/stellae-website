// Hysteresis prevents repeated framebuffer reallocations during camera movements.
export function sceneQuality(renderer,post,host){
  let width=1,height=1,level=0,lastChange=0,slow=0,fast=0,pending=false;
  const factors=[1,.86,.72];
  const apply=()=>{
    const ratio=Math.min(devicePixelRatio,1.25,Math.sqrt(1500000/(width*height)))*factors[level];
    renderer.setPixelRatio(ratio);renderer.setSize(width,height,false);post.resize();
    renderer.transmissionResolutionScale=[.65,.5,.4][level];
    host.dataset.quality=['balanced','adaptive','light'][level];
  };
  return {
    resize(w,h){width=Math.max(1,w);height=Math.max(1,h);apply();pending=false;},
    flush(){if(pending){apply();pending=false;}},
    get blur(){return level<2;},
    sample(stats,now){
      if(!stats)return;
      slow=stats.fps<47?slow+1:0;fast=stats.fps>57?fast+1:0;
      if(now-lastChange<8000)return;
      if(slow>=3&&level<2){level++;slow=0;fast=0;lastChange=now;pending=true;}
      else if(fast>=10&&level>0){level--;slow=0;fast=0;lastChange=now;pending=true;}
    }
  };
}
