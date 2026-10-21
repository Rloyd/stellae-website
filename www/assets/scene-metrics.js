// Low-frequency DOM diagnostics; no page UI or telemetry/network requests.
export function sceneMetrics(host){
  let start=0,last=0,cpu=[],intervals=[];
  return function record(now,cpuMs,info,visible,total,quality={}){
    if(!start||now-last>500){start=now;cpu=[];intervals=[];}
    if(last&&now-last<500)intervals.push(now-last);
    last=now;cpu.push(cpuMs);
    if(now-start<1000)return;
    const sorted=[...intervals].sort((a,b)=>a-b);
    const mean=values=>values.reduce((a,b)=>a+b,0)/Math.max(1,values.length);
    const stats={
      fps:+(1000/mean(intervals)).toFixed(1),frameP95:+(sorted[Math.floor((sorted.length-1)*.95)]||0).toFixed(2),
      cpuMs:+mean(cpu).toFixed(2),calls:info.calls,triangles:info.triangles,visible,total,...quality
    };
    host.dataset.metrics=JSON.stringify(stats);
    start=now;cpu=[];intervals=[];
    return stats;
  };
}
