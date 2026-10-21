import * as THREE from './vendor/three/three.module.min.js';
import { GLTFLoader } from './vendor/three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from './vendor/three/addons/environments/RoomEnvironment.js';
import { idleWave, settlingWave, columnStrength, baselineSelectionWave, damp } from './vendor/rhine-scene-motion.js';
import { archiveFraming } from './vendor/rhine-viewport.js';
import { frameModelFocus, focusFeather } from './scene-focus.js';
import { slotPose, applySlotPose } from './archive-slots.js';
import { archiveEntry } from './archive-entry.js';
import { sceneMetrics } from './scene-metrics.js';
import { ArchiveCoverage } from './archive-coverage.js';
import { ScenePost } from './scene-post.js';
import { sceneQuality } from './scene-quality.js';

// RhineLabUI's original cassette geometry, array dimensions and motion envelopes.
// Copyright (c) 2026 LBEILC, MIT. See vendor/rhine-boot-LICENSE.txt.
const host=document.getElementById('hero-scene');
const hero=document.getElementById('home');
const video=document.getElementById('hero-video');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const COLUMN_SPACING=5.2,ROW_SPACING=.62,BASE_Y=-4.6;

async function mount(){
  // Share the page compositor root so small frosted controls can sample the canvas.
  document.getElementById('main').prepend(host);
  const renderer=new THREE.WebGLRenderer({antialias:false,alpha:true,powerPreference:'high-performance'});
  renderer.setClearColor(0x0c0915,0);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.0;
  renderer.info.autoReset=false;
  const recordMetrics=sceneMetrics(host);
  const post=new ScenePost(renderer),quality=sceneQuality(renderer,post,host);
  renderer.domElement.setAttribute('aria-label','星黎羁绊档案三维阵列，可拖动翻阅');
  renderer.domElement.setAttribute('role','img');
  host.prepend(renderer.domElement);
  const scene=new THREE.Scene();
  scene.matrixWorldAutoUpdate=false;
  scene.fog=new THREE.Fog('#100b18',139,165);
  const camera=new THREE.PerspectiveCamera(8,1,5,240);
  const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();
  const environment=pmrem.fromScene(room,.04);
  scene.environment=environment.texture;scene.environmentIntensity=.42;
  room.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight('#d9d5ff','#171020',.6));
  const key=new THREE.DirectionalLight('#e8ddff',1.7);key.position.set(-8,14,6);scene.add(key);
  const rim=new THREE.DirectionalLight('#bd70f0',1.2);rim.position.set(7,7,-8);scene.add(rim);
  const fill=new THREE.DirectionalLight('#a6e1ff',.35);fill.position.set(-8,2,-4);scene.add(fill);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(180,180),new THREE.MeshStandardMaterial({color:'#100b18',roughness:.84,metalness:.12}));
  floor.rotation.x=-Math.PI/2;floor.position.y=-4.64;scene.add(floor);

  const gltf=await new GLTFLoader().loadAsync('assets/vendor/rhine-archive-cassette.glb');
  gltf.scene.updateMatrixWorld(true);
  const model=new THREE.Group(),instances=[],cells=[],drawnCells=[];
  const arraySurfaces=new Set(['Frosted_Polymer','Ivory_Edges','Optical_Diffuser','Titanium_Fasteners','Index_Inlay']);
  const colors={Frosted_Polymer:'#696178',Ivory_Edges:'#a899bd',Optical_Diffuser:'#26202f',Titanium_Fasteners:'#c0b9d0',Index_Inlay:'#c789df',Printed_Label:'#24202e',Internal_Ceramic:'#a29aae',Optical_Edges:'#c4b6d6',Subsurface_Optics:'#84788f',Optical_Film_Edge:'#bca5cc',Amber_Optical_Inlay:'#b56bdd',Optical_Film:'#c0abc9',Case_Engraving:'#685b78',Case_Engraving_Highlight:'#b4a4c4',Champagne_Index:'#be80dd'};
  for(let lane=-2;lane<=6;lane++)for(let row=0;row<32;row++)cells.push({lane,row});
  const sharedMatrices=new THREE.InstancedBufferAttribute(new Float32Array(cells.length*16),16).setUsage(THREE.DynamicDrawUsage);
  gltf.scene.traverse(object=>{
    if(!object.isMesh)return;
    const source=object.material,name=source.name.replace(/\.\d+$/,'');
    if(name==='Carbon_Ink'||name==='Moulded_Lettering')return;
    const geometry=object.geometry.clone().applyMatrix4(object.matrixWorld);
    const material=new THREE.MeshPhysicalMaterial({color:colors[name]||'#9c86b0',roughness:.38,metalness:.12,envMapIntensity:.8});
    if(name==='Frosted_Polymer')Object.assign(material,{transmission:.9,thickness:.18,roughness:.065,ior:1.46,clearcoat:.5,attenuationColor:new THREE.Color('#b8a5d0'),attenuationDistance:2.4});
    if(name==='Ivory_Edges')Object.assign(material,{roughness:.27,metalness:.35,clearcoat:.6});
    if(name==='Optical_Diffuser')material.roughness=.72;
    if(name==='Titanium_Fasteners')Object.assign(material,{metalness:.85,roughness:.24});
    if(/Index|Inlay/.test(name)){material.emissive=new THREE.Color('#9b3dd0');material.emissiveIntensity=.17;}
    const mesh=new THREE.Mesh(geometry,material);model.add(mesh);
    if(arraySurfaces.has(name)){
      const arrayMaterial=material.clone();
      if(name==='Frosted_Polymer')Object.assign(arrayMaterial,{transmission:.82,roughness:.25,thickness:.15,clearcoat:.25});
      const array=new THREE.InstancedMesh(geometry,arrayMaterial,cells.length);
      array.instanceMatrix=sharedMatrices;array.frustumCulled=false;array.matrixAutoUpdate=false;
      scene.add(array);instances.push(array);
    }
  });
  scene.add(model);
  // Replace the original printed brand with the site's actual Chinese wordmark.
  const logo=await new Promise(resolve=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>resolve(null);image.src='assets/logo.webp';});
  if(logo){
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=440;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#21192c';ctx.fillRect(0,0,1024,440);
    ctx.drawImage(logo,60,38,550,211);ctx.fillStyle='#d7c7e5';ctx.font='26px sans-serif';ctx.fillText('MEMORY ARCHIVE / 001',65,345);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
    const label=new THREE.Mesh(new THREE.PlaneGeometry(.99,.46),new THREE.MeshBasicMaterial({map:texture,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));
    label.position.set(-1.36,3.04,.257);model.add(label);
  }
  gltf.scene.traverse(object=>{if(object.isMesh){object.geometry.dispose();if(Array.isArray(object.material))object.material.forEach(m=>m.dispose());else object.material.dispose();}});

  const dummy=new THREE.Object3D(),pointer=new THREE.Vector2(),raycaster=new THREE.Raycaster();
  const focusBounds=new THREE.Box3().setFromObject(model);
  const coverage=new ArchiveCoverage(focusBounds);
  const focusLocal=focusBounds.getCenter(new THREE.Vector3());focusLocal.z=focusBounds.max.z;
  const focusWorld=new THREE.Vector3(),focusProjection=new THREE.Vector3(),selectedFocus=new THREE.Vector3(),handoffFocus=new THREE.Vector3();
  const track={lane:{value:2,velocity:0},row:{value:12,velocity:0}};
  const shots=[
    {id:'home',lane:2,row:12,yaw:59,elevation:19,lift:2.1,x:.25,y:.48,side:'left',code:'00 / MEMORY ARCHIVE',title:'把相处，珍藏成回忆。'},
    {id:'trailer',lane:0,row:10,yaw:50,elevation:19,lift:.8,x:.75,y:.5,side:'right',code:'01 / FIRST ENCOUNTER',title:'初见 · 故事的第一幕。'},
    {id:'meet',lane:1,row:11,yaw:42,elevation:22,lift:1.7,x:.25,y:.5,side:'left',code:'02 / A LITTLE CLOSER',title:'从一句你好，慢慢熟悉。'},
    {id:'experience',lane:1,row:13,yaw:47,elevation:23,lift:2.1,x:.75,y:.52,side:'right',code:'03 / EVERYDAY WITH YOU',title:'陪伴 · 每一次，都想靠近。'},
    {id:'world',lane:3,row:16,yaw:67,elevation:21,lift:1.4,x:.25,y:.52,side:'left',code:'04 / SOMEWHERE WITH YOU',title:'世界 · 换个地方，接着聊。'},
    {id:'moments',lane:4,row:18,yaw:34,elevation:17,lift:2.6,x:.75,y:.51,side:'right',code:'05 / FRAGMENTS OF US',title:'羁绊 · 把瞬间，变成回忆。'},
    {id:'room',lane:3,row:20,yaw:53,elevation:22,lift:1.5,x:.25,y:.52,side:'left',code:'06 / ANOTHER DOOR',title:'一扇窗，另一个世界。'},
    {id:'faq',lane:0,row:22,yaw:43,elevation:19,lift:1.5,x:.75,y:.52,side:'right',code:'07 / BEFORE WE MEET',title:'相遇之前，想告诉你的事。'},
    {id:'download',lane:2,row:24,yaw:58,elevation:19,lift:2.2,x:.25,y:.52,side:'left',code:'08 / YOUR STORY STARTS',title:'下一次相遇，就在日常里。'}
  ];
  // Conversation, App features and room copy give 60% to the archive.
  for(const shot of shots.slice(1)){
    const sceneShare=['meet','experience','room'].includes(shot.id) ? .6 : .4;
    shot.x=shot.side==='left'?sceneShare/2-.01:1-sceneShare/2+.01;
  }
  for(const shot of shots)shot.y=.5;
  shots.find(shot=>shot.id==='home').y=.48;
  const featherBounds=shot=>{
    if(shot.id==='home')return [0,0,.18,.62];
    const share=shot.id==='faq'?(document.body.dataset.faqExpanded==='true'?.44:.6):(['meet','experience','room'].includes(shot.id)?.6:.4);
    return shot.side==='left'?[0,.04,share-.26,share]:[1-share,1-share+.26,.96,1];
  };
  const featherState=featherBounds(shots[0]).map(value=>({value,velocity:0}));
  const cameraState=Object.fromEntries(['yaw','elevation','lift','x','y'].map(key=>[key,{value:shots[0][key],velocity:0}]));
  const spanScale={value:1,velocity:0};
  const extraction={value:shots[0].lift,velocity:0},handoff={value:1,velocity:0};
  const outgoing=[];
  let handoffFrom=null;
  let activeIndex=0,sceneEnabled=true,pausedByUser=false,cameraSpan=7.33,viewInitialized=false;
  let selected={lane:2,row:12},pulses=[],time=0,last=0,frame=0,previousDraw=0,ready=false,entryAt=null;
  let entryFinished=reduced.matches;
  let targetPointer={x:0,y:0},viewPointer={x:0,y:0},drag=null,lastFeather='';
  const label=document.createElement('div');label.className='hero-archive-label';label.hidden=true;
  label.append(document.createElement('span'),document.createElement('p'));
  document.body.append(label);
  const input=document.createElement('div');input.className='scene-input';input.setAttribute('aria-hidden','true');document.body.append(input);
  const canRun=()=>sceneEnabled&&!pausedByUser&&!document.hidden&&!document.documentElement.classList.contains('is-loading')&&!document.querySelector('dialog[open]')&&(activeIndex!==0||!video.paused||!entryFinished)&&!reduced.matches;
  const resize=()=>{
    const rect=host.getBoundingClientRect();quality.resize(rect.width,rect.height);camera.aspect=rect.width/rect.height;
    cameraSpan=archiveFraming(rect.width,rect.height,7.33,0,rect.width<1100).span;
    host.dataset.viewSpan=cameraSpan.toFixed(3);
    if(ready)draw();
  };
  const draw=()=>{
    // Reallocate adaptive targets immediately before drawing, never after presentation.
    quality.flush();
    const drawStarted=performance.now();renderer.info.reset();
    const shot=key=>cameraState[key].value;
    const field=(row,lane)=>settlingWave(row-track.row.value,26.56)*columnStrength(lane,track.lane.value)+idleWave(row,lane,time)*(reduced.matches?0:1)+pulses.reduce((sum,p)=>sum+baselineSelectionWave(Math.hypot(row-p.row,(lane-p.lane)*2.2),time-p.time),0);
    const entry=reduced.matches?1:Math.min(1,Math.max(0,(time-(entryAt??0))/1.5));
    const entrance=(1-entry)**3;
    const rail={lane:track.lane.value,row:track.row.value};
    const tilt=(cell,lift=0)=>{
      const quality=Math.max(0,Math.min(1,lift/.4));
      return (field(cell.row+.5,cell.lane)-field(cell.row-.5,cell.lane))*.024*(1-quality*quality*(3-2*quality));
    };
    // Source-style handoff: old files descend in their cells; the next rises in its cell.
    for(const old of outgoing)applySlotPose(old.group,slotPose(old.cell,rail,focusBounds,field(old.cell.row,old.cell.lane),old.lift.value,entrance,tilt(old.cell,old.lift.value)));
    applySlotPose(model,slotPose(selected,rail,focusBounds,field(selected.row,selected.lane),extraction.value,entrance,tilt(selected,extraction.value)));
    // Preserve the reference's full-viewport 7.33-unit long-lens framing.
    // Page sections change the target and archive, never the model's scale.
    const entryAge=Math.max(0,time-(entryAt??time));
    const opening=entryFinished||reduced.matches?null:archiveEntry(entryAge);
    if(opening?.complete)entryFinished=true;
    const yawDegrees=(opening?.yaw??shot('yaw'))+viewPointer.x*1.2;
    const elevationDegrees=(opening?.elevation??shot('elevation'))+viewPointer.y*.7;
    const yaw=THREE.MathUtils.degToRad(yawDegrees),elevation=THREE.MathUtils.degToRad(elevationDegrees);
    const renderedSpan=cameraSpan*(opening?opening.span/7.33:spanScale.value);
    camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(renderedSpan/(2*140)));camera.updateProjectionMatrix();
    const direction=new THREE.Vector3(-Math.sin(yaw)*Math.cos(elevation),Math.sin(elevation),Math.cos(yaw)*Math.cos(elevation));
    const portrait=camera.aspect<1.05;
    const anchorX=portrait?.25:shot('x'),anchorY=portrait?.32:shot('y');
    model.updateMatrixWorld(true);model.localToWorld(selectedFocus.copy(focusLocal));
    focusWorld.copy(selectedFocus);
    if(handoffFrom&&handoff.value<.9999){
      handoffFocus.copy(handoffFrom.point);
      handoffFocus.x-=(rail.lane-handoffFrom.lane)*COLUMN_SPACING;
      handoffFocus.z-=(rail.row-handoffFrom.row)*ROW_SPACING;
      const mix=Math.max(0,Math.min(1,handoff.value));
      focusWorld.lerpVectors(handoffFocus,selectedFocus,mix*mix*(3-2*mix));
    }
    frameModelFocus(camera,focusWorld,direction,renderedSpan,anchorX,anchorY);
    const featherValues=featherState.map(state=>state.value);
    coverage.update(camera,featherValues[0],featherValues[3]);
    const returningKeys=new Set(outgoing.map(item=>`${item.cell.lane}:${item.cell.row}`));
    drawnCells.length=0;dummy.scale.setScalar(1);
    for(const cell of cells){
      if(cell.lane===selected.lane&&cell.row===selected.row||returningKeys.has(`${cell.lane}:${cell.row}`))continue;
      applySlotPose(dummy,slotPose(cell,rail,focusBounds,field(cell.row,cell.lane),0,entrance,tilt(cell)));dummy.updateMatrix();
      if(!coverage.contains(dummy.matrix))continue;
      sharedMatrices.array.set(dummy.matrix.elements,drawnCells.length*16);drawnCells.push(cell);
    }
    sharedMatrices.clearUpdateRanges();sharedMatrices.addUpdateRange(0,drawnCells.length*16);sharedMatrices.needsUpdate=true;
    for(const mesh of instances){mesh.count=drawnCells.length;mesh.boundingSphere=null;}
    const feather=focusFeather(featherValues);
    if(lastFeather!==feather){host.style.maskImage=feather;host.style.webkitMaskImage=feather;lastFeather=feather;}
    scene.updateMatrixWorld();post.render(scene,camera,featherValues,quality.blur);
    focusProjection.copy(focusWorld).project(camera);
    const actualX=(focusProjection.x+1)/2,actualY=(1-focusProjection.y)/2;
    host.dataset.focusX=actualX.toFixed(5);host.dataset.focusY=actualY.toFixed(5);
    host.dataset.focusError=(Math.hypot((actualX-anchorX)*host.clientWidth,(actualY-anchorY)*host.clientHeight)).toFixed(4);
    host.dataset.focusState=handoff.value<.9999?'handoff':'locked';
    host.dataset.returning=String(outgoing.length);
    host.dataset.extraction=extraction.value.toFixed(4);
    host.dataset.entryPhase=entryFinished?'complete':'orbit';
    host.dataset.entryTime=entryAge.toFixed(3);
    host.dataset.cameraYaw=yawDegrees.toFixed(3);host.dataset.cameraElevation=elevationDegrees.toFixed(3);
    host.dataset.cameraSpan=renderedSpan.toFixed(3);
    host.dataset.state='ready';host.dataset.selection=`${selected.lane}:${selected.row}`;
    const drawEnded=performance.now();
    const stats=recordMetrics(drawEnded,drawEnded-drawStarted,renderer.info.render,drawnCells.length,cells.length,{pipeline:'depth-finish',pixelRatio:+renderer.getPixelRatio().toFixed(3),quality:host.dataset.quality,depthOfField:quality.blur});
    if(entryFinished)quality.sample(stats,drawEnded);
  };
  const tick=now=>{
    frame=0;if(!canRun())return;
    const interval=1000/60;
    if(now-previousDraw<interval-.75){frame=requestAnimationFrame(tick);return;}
    const dt=last?Math.min((now-last)/1000,.08):.016;last=now;
    previousDraw=now-Math.max(0,(now-previousDraw)%interval);time+=dt;
    if(entryAt===null)entryAt=time;
    damp(track.lane,selected.lane,4.2,dt);damp(track.row,selected.row,4.2,dt);
    for(const key of Object.keys(cameraState))damp(cameraState[key],shots[activeIndex][key],4.2,dt);
    damp(spanScale,1,4.2,dt);
    damp(extraction,cameraState.lift.value,4.2,dt);damp(handoff,1,4.2,dt);
    for(let index=outgoing.length-1;index>=0;index--){
      damp(outgoing[index].lift,0,4.5,dt);
      if(outgoing[index].lift.value<.001){scene.remove(outgoing[index].group);outgoing.splice(index,1);}
    }
    featherBounds(shots[activeIndex]).forEach((value,index)=>damp(featherState[index],value,4.2,dt));
    viewPointer.x+=(targetPointer.x-viewPointer.x)*(1-Math.exp(-dt*3));viewPointer.y+=(targetPointer.y-viewPointer.y)*(1-Math.exp(-dt*3));
    pulses=pulses.filter(p=>time-p.time<3.2);draw();frame=requestAnimationFrame(tick);
  };
  const sync=()=>{host.dataset.motion=canRun()?'playing':'paused';if(canRun()&&!frame){last=0;frame=requestAnimationFrame(tick);}else if(!canRun()&&frame){cancelAnimationFrame(frame);frame=0;last=0;}};
  const select=(lane,row,{pulse=true}={})=>{
    const next={lane:Math.max(0,Math.min(4,lane)),row:Math.max(3,Math.min(24,row))};
    const changed=next.lane!==selected.lane||next.row!==selected.row;
    if(changed&&viewInitialized){
      handoffFrom={point:focusWorld.clone(),lane:track.lane.value,row:track.row.value};
      handoff.value=0;handoff.velocity=0;
      if(extraction.value>.001){const group=model.clone(true);scene.add(group);outgoing.push({group,cell:{...selected},lift:{...extraction}});}
      extraction.value=0;extraction.velocity=0;
      const returning=outgoing.findIndex(old=>old.cell.lane===next.lane&&old.cell.row===next.row);
      if(returning>=0){Object.assign(extraction,outgoing[returning].lift);scene.remove(outgoing[returning].group);outgoing.splice(returning,1);}
    }
    selected=next;
    if(pulse)pulses.push({...selected,time});
    if(reduced.matches||pausedByUser||document.hidden||document.documentElement.classList.contains('is-loading')){
      track.lane.value=selected.lane;track.row.value=selected.row;draw();
    }else sync();
  };
  const updateSection=event=>{
    const id=event?.detail?.id||document.body.dataset.activePanel||'home';
    const next=Math.max(0,shots.findIndex(shot=>shot.id===id));
    shots.find(shot=>shot.id==='faq').x=document.body.dataset.faqExpanded==='true'?.79:.71;
    sceneEnabled=true;
    const section=shots[next].id;
    document.body.dataset.sceneSection=section;host.dataset.section=section;document.body.dataset.sceneSide=shots[next].side;
    const shot=shots[next];label.hidden=next===0;
    if(next!==0){label.querySelector('span').textContent=shot.code;label.querySelector('p').textContent=shot.title;}
    if(reduced.matches)entryFinished=true;
    if(next!==activeIndex){
      if(!entryFinished){
        // Continue from the visible camera pose if navigation interrupts the opening.
        const opening=archiveEntry(Math.max(0,time-(entryAt??time)));
        cameraState.yaw.value=opening.yaw;cameraState.yaw.velocity=0;
        cameraState.elevation.value=opening.elevation;cameraState.elevation.velocity=0;
        spanScale.value=opening.span/7.33;spanScale.velocity=0;entryFinished=true;
      }
      activeIndex=next;select(shot.lane,shot.row,{pulse:false});
    }
    if(!viewInitialized||reduced.matches||pausedByUser||!entryAt&&document.documentElement.classList.contains('is-loading')){
      track.lane.value=selected.lane;track.row.value=selected.row;track.lane.velocity=0;track.row.velocity=0;
      for(const key of Object.keys(cameraState)){cameraState[key].value=shot[key];cameraState[key].velocity=0;}
      extraction.value=shot.lift;extraction.velocity=0;handoff.value=1;handoff.velocity=0;handoffFrom=null;
      outgoing.splice(0).forEach(old=>scene.remove(old.group));
      featherBounds(shot).forEach((value,index)=>{featherState[index].value=value;featherState[index].velocity=0;});draw();
    }
    viewInitialized=true;
    sync();
  };
  input.addEventListener('pointerdown',event=>{
    if(event.pointerType==='mouse'&&event.button!==0)return;
    drag={x:event.clientX,y:event.clientY,lane:selected.lane,row:selected.row,moved:false};
    input.setPointerCapture(event.pointerId);input.classList.add('is-dragging');
  });
  input.addEventListener('pointermove',event=>{
    const rect=host.getBoundingClientRect();targetPointer={x:(event.clientX-rect.left)/rect.width-.5,y:(event.clientY-rect.top)/rect.height-.5};
    if(!drag)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;drag.moved||=Math.hypot(dx,dy)>7;
    if(Math.abs(dy)>Math.abs(dx))return;
    const lane=drag.lane+Math.round(-dx/100),row=drag.row;
    if(lane!==selected.lane||row!==selected.row)select(lane,row);
  });
  input.addEventListener('pointerup',event=>{
    if(drag&&!drag.moved){
      const rect=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);
      const hit=raycaster.intersectObjects(instances,false)[0];const cell=hit&&drawnCells[hit.instanceId];if(cell)select(cell.lane,cell.row);
    }
    drag=null;input.classList.remove('is-dragging');
  });
  const cancel=()=>{drag=null;targetPointer={x:0,y:0};input.classList.remove('is-dragging');};
  input.addEventListener('pointercancel',cancel);input.addEventListener('lostpointercapture',cancel);input.addEventListener('pointerleave',()=>{targetPointer={x:0,y:0};});
  document.getElementById('motion-toggle').addEventListener('click',()=>{pausedByUser=video.paused;sync();});
  document.addEventListener('stellae:panelchange',updateSection);
  document.addEventListener('stellae:faqresize',()=>{if(document.body.dataset.activePanel==='faq')updateSection();});
  addEventListener('resize',()=>{updateSection();},{passive:true});
  const resizer=new ResizeObserver(resize);resizer.observe(host);
  document.addEventListener('visibilitychange',sync);document.addEventListener('stellae:entered',updateSection);
  video.addEventListener('play',sync);video.addEventListener('pause',sync);reduced.addEventListener('change',updateSection);
  document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('toggle',sync));
  renderer.domElement.addEventListener('webglcontextlost',()=>{cancelAnimationFrame(frame);frame=0;host.dataset.state='unavailable';});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{draw();sync();});
  document.body.classList.add('scene-navigation');
  ready=true;resize();updateSection();
  // Even a late GLB load starts its own visible entrance instead of skipping it.
  draw();sync();
}
if(host)mount().catch(error=>{host.dataset.state='unavailable';console.warn('3D memory scene unavailable:',error.message);});
