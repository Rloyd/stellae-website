/* Angle-driven foil and procedural sparkle inspired by Holo Card Studio.
 * Reference: https://github.com/EverettFish/holo-card-studio
 * Independently extracted background, transparent subject and foreground planes
 * share the foil renderer's camera direction; no external runtime.
 */
window.StellaeHolo = (() => {
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const surfaces=new Map();
  let frame=0;
  const vertexSource=`
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main(){v_uv=vec2(a_position.x*.5+.5,.5-a_position.y*.5);gl_Position=vec4(a_position,0.,1.);}
  `;
  const fragmentSource=`
    precision highp float;
    varying vec2 v_uv;
    uniform vec2 u_pointer;
    uniform float u_time,u_active,u_seed;
    float random(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){
      vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
      return mix(mix(random(i),random(i+vec2(1.,0.)),f.x),mix(random(i+vec2(0.,1.)),random(i+vec2(1.,1.)),f.x),f.y);
    }
    vec3 rainbow(float value){return .54+.46*cos(6.283185*(value+vec3(.04,.37,.69)));}
    float starField(vec2 uv,vec2 light){
      vec2 grid=uv*vec2(27.,38.);vec2 cell=floor(grid),local=fract(grid)-.5;
      float seed=random(cell+u_seed);
      local-=(vec2(random(cell+2.1),random(cell+7.3))-.5)*.55;
      float core=exp(-dot(local,local)*1600.);
      float cross=exp(-abs(local.x)*240.-abs(local.y)*19.)+exp(-abs(local.y)*240.-abs(local.x)*19.);
      float twinkle=pow(.5+.5*sin(u_time*1.2+seed*28.+dot(light,vec2(7.,11.))),10.);
      return (core+cross*.7)*step(.72,seed)*twinkle;
    }
    void main(){
      vec2 uv=v_uv;
      float time=u_time+u_seed*2.;
      vec2 idle=vec2(sin(time*.48)*.28,cos(time*.37)*.22);
      vec2 view=mix(idle,u_pointer,u_active);
      float warp=(noise(uv*4.8+view*.7)-.5)*.32;
      float phase=uv.x*.87-uv.y*.54+dot(view,vec2(.74,-.62))+warp;
      float ribbons=.5+.5*cos(phase*15.7+sin(uv.y*19.+view.x*4.)*.38);
      vec3 foil=rainbow(phase*.86+.12);
      float sweep=pow(ribbons,13.);
      float facets=pow(abs(sin(uv.x*29.+uv.y*17.+view.x*5.)*cos(uv.y*31.-uv.x*13.+view.y*5.)),3.);
      float fineLines=.5+.5*cos((uv.x*.91+uv.y*.41)*1100.+view.x*13.);
      vec2 light=vec2(.5)+view*vec2(.36,.32);
      float glare=exp(-dot((uv-light)*vec2(.9,1.25),(uv-light)*vec2(.9,1.25))*10.);
      float shield=mix(.3,1.,smoothstep(.06,.28,length((uv-vec2(.53,.29))*vec2(.9,1.3))));
      float stars=starField(uv,view);
      float edge=pow(1.-min(min(uv.x,1.-uv.x),min(uv.y,1.-uv.y))*2.,26.);
      float alpha=((.06+sweep*.24+facets*.04+fineLines*.015)*shield+glare*.07+stars*.75+edge*.05)*(.62+u_active*.38);
      vec3 color=foil*(.8+sweep*.2)+vec3(1.,.96,.86)*(glare*.12+stars*.85)+rainbow(phase+1.2)*edge*.12;
      alpha=clamp(alpha,0.,.72);
      gl_FragColor=vec4(clamp(color,0.,1.)*alpha,alpha);
    }
  `;
  function schedule(){if(!frame&&!document.hidden)frame=requestAnimationFrame(tick);}
  function tick(now){
    frame=0;let animate=false;
    surfaces.forEach(surface=>{
      if(!surface.visible||!surface.canvas.isConnected)return;
      const showingFront=surface.card.dataset.flipped!=='true';
      if(surface.dirty||(showingFront&&!reduced.matches&&now-surface.last>33))surface.draw(now);
      if(showingFront&&!reduced.matches)animate=true;
    });
    if(animate)schedule();
  }
  const observer='IntersectionObserver' in window ? new IntersectionObserver(entries=>{
    entries.forEach(entry=>{const surface=surfaces.get(entry.target);if(surface){surface.visible=entry.isIntersecting;surface.dirty=true;}});schedule();
  },{threshold:.01}):null;
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();});
  reduced.addEventListener('change',()=>{surfaces.forEach(surface=>surface.dirty=true);schedule();});

  function mount(canvas,card,seed=0){
    let gl,program,buffer,vertex,fragment,resize;
    try{
      gl=canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:true,powerPreference:'low-power',preserveDrawingBuffer:false});
      if(!gl)throw new Error('WebGL unavailable');
      const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader));return shader;};
      vertex=compile(gl.VERTEX_SHADER,vertexSource);fragment=compile(gl.FRAGMENT_SHADER,fragmentSource);
      program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
      gl.useProgram(program);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
      const position=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
      const uniforms={pointer:gl.getUniformLocation(program,'u_pointer'),time:gl.getUniformLocation(program,'u_time'),active:gl.getUniformLocation(program,'u_active'),seed:gl.getUniformLocation(program,'u_seed')};
      const surface={canvas,card,visible:!observer,dirty:true,last:0,x:0,y:0,active:0,
        draw(now){
          this.last=now;this.dirty=false;
          if(card.dataset.layered==='true'){
            const t=reduced.matches?0:now*.001+seed*2;
            const viewX=this.active?this.x:(reduced.matches?0:Math.sin(t*.48)*.28);
            const viewY=this.active?this.y:(reduced.matches?0:Math.cos(t*.37)*.22);
            card.style.setProperty('--view-x',viewX.toFixed(4));card.style.setProperty('--view-y',viewY.toFixed(4));
          }
          gl.viewport(0,0,canvas.width,canvas.height);gl.useProgram(program);
          gl.uniform2f(uniforms.pointer,this.x,this.y);gl.uniform1f(uniforms.time,reduced.matches?0:now*.001);
          gl.uniform1f(uniforms.active,this.active);gl.uniform1f(uniforms.seed,seed);
          gl.drawArrays(gl.TRIANGLES,0,6);
        }
      };
      surfaces.set(card,surface);
      const size=()=>{
        const ratio=Math.min(devicePixelRatio||1,1.5);
        canvas.width=Math.max(1,Math.round(card.clientWidth*ratio));canvas.height=Math.max(1,Math.round(card.clientHeight*ratio));
        surface.dirty=true;schedule();
      };
      resize=new ResizeObserver(size);resize.observe(card);size();
      if(observer)observer.observe(card);
      card.dataset.holo='webgl';schedule();
      canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();surfaces.delete(card);card.dataset.holo='css';canvas.hidden=true;},{once:true});
      return {
        set(x,y,active){surface.x=x;surface.y=y;surface.active=active?1:0;surface.dirty=true;schedule();},
        refresh(){surface.dirty=true;schedule();},
        dispose(){
          surfaces.delete(card);if(observer)observer.unobserve(card);resize.disconnect();
          gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);
          gl.getExtension('WEBGL_lose_context')?.loseContext();
        }
      };
    }catch(error){
      card.dataset.holo='css';canvas.remove();
      if(gl){if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program);if(vertex)gl.deleteShader(vertex);if(fragment)gl.deleteShader(fragment);gl.getExtension('WEBGL_lose_context')?.loseContext();}
      return {set(){},refresh(){},dispose(){}};
    }
  }
  return {mount};
})();
