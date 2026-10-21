(() => {
  'use strict';
  // Shared port of the App's original launchMotion.ts shader.
  let sourcePromise;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  async function mount(canvas,{speed=1,timeOffset=0,staticTime=null,transparent=false}={}){
    const gl=canvas.getContext('webgl',{alpha:transparent,premultipliedAlpha:!transparent,antialias:false,powerPreference:'low-power'});
    if(!gl){canvas.dataset.state='unavailable';throw Error('WebGL unavailable');}
    sourcePromise??=fetch('assets/launch-emblem.frag').then(response=>{
      if(!response.ok)throw Error('Launch shader unavailable');return response.text();
    });
    const source=await sourcePromise;
    const compile=(type,code)=>{
      const shader=gl.createShader(type);gl.shaderSource(shader,code);gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);throw Error('Launch shader could not compile');}
      return shader;
    };
    const vertex=compile(gl.VERTEX_SHADER,'attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}');
    // Preserve the App's light values while making zero-light pixels transparent on a colored stage.
    const fragmentSource=transparent?source.replace('void main(){','void drawOriginal(){')+'\nvoid main(){drawOriginal();float a=max(gl_FragColor.r,max(gl_FragColor.g,gl_FragColor.b));gl_FragColor=vec4(gl_FragColor.rgb/max(a,.0001),a);}\n':source;
    const fragment=compile(gl.FRAGMENT_SHADER,fragmentSource);
    const program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
    gl.deleteShader(vertex);gl.deleteShader(fragment);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)){gl.deleteProgram(program);throw Error('Launch shader could not link');}
    gl.useProgram(program);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    const resolution=gl.getUniformLocation(program,'resolution'),time=gl.getUniformLocation(program,'time');
    let visible=false,frame=0,last=0,elapsed=0,disposed=false;
    const draw=()=>{
      if(disposed)return;
      const bounds=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,1.5);
      const width=Math.max(1,Math.round(bounds.width*ratio)),height=Math.max(1,Math.round(bounds.height*ratio));
      if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);}
      gl.uniform2f(resolution,width,height);gl.uniform1f(time,reduced.matches?6.2:(staticTime??(timeOffset+elapsed*speed)));gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
      canvas.dataset.state='ready';
    };
    const animate=now=>{
      frame=0;if(disposed||!visible||document.hidden)return;
      if(!last||now-last>=32){if(last)elapsed+=(now-last)/1000;last=now;draw();}
      if(!reduced.matches&&staticTime===null)frame=requestAnimationFrame(animate);
    };
    const resume=()=>{cancelAnimationFrame(frame);frame=0;last=0;if(!disposed&&visible&&!document.hidden)frame=requestAnimationFrame(animate);};
    const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;resume();},{threshold:.1});intersection.observe(canvas);
    const resize=new ResizeObserver(()=>{if(visible)draw();});resize.observe(canvas);
    document.addEventListener('visibilitychange',resume);reduced.addEventListener('change',resume);
    draw();
    return {dispose(){
      disposed=true;cancelAnimationFrame(frame);intersection.disconnect();resize.disconnect();
      document.removeEventListener('visibilitychange',resume);reduced.removeEventListener('change',resume);
      gl.deleteBuffer(buffer);gl.deleteProgram(program);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }};
  }
  window.StellaeLaunch={mount};
})();
