import * as THREE from './vendor/three/three.module.min.js';

// One beauty/depth target + one fullscreen triangle. No depth/normal scene re-render.
// Deliberately subtle: selected file stays sharp, distant rows soften by < 2 CSS px.
export class ScenePost{
  constructor(renderer){
    this.renderer=renderer;this.size=new THREE.Vector2();
    const type=renderer.extensions.has('EXT_color_buffer_float')?THREE.HalfFloatType:THREE.UnsignedByteType;
    this.target=new THREE.WebGLRenderTarget(1,1,{type,samples:Math.min(2,renderer.capabilities.maxSamples),depthBuffer:true});
    this.target.texture.colorSpace=THREE.LinearSRGBColorSpace;
    this.target.depthTexture=new THREE.DepthTexture(1,1,THREE.UnsignedIntType);
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute([-1,-1,0,3,-1,0,-1,3,0],3));
    geometry.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,2,0,0,2],2));
    this.material=new THREE.ShaderMaterial({
      name:'StellaeLightDepthFinish',depthTest:false,depthWrite:false,blending:THREE.NoBlending,dithering:true,
      uniforms:{tColor:{value:this.target.texture},tDepth:{value:this.target.depthTexture},texel:{value:new THREE.Vector2()},
        nearClip:{value:5},farClip:{value:240},focus:{value:140},blurStrength:{value:1},coverage:{value:new THREE.Vector2(0,1)}},
      vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}',
      fragmentShader:`
        varying vec2 vUv;
        uniform sampler2D tColor,tDepth;
        uniform vec2 texel,coverage;
        uniform float nearClip,farClip,focus,blurStrength;
        #include <common>
        #include <packing>
        #include <dithering_pars_fragment>
        float depthAt(vec2 p){return -perspectiveDepthToViewZ(textureLod(tDepth,p,0.0).x,nearClip,farClip);}
        void main(){
          if(vUv.x<coverage.x||vUv.x>coverage.y){gl_FragColor=vec4(0.0);return;}
          vec4 center=texture2D(tColor,vUv);
          float depth=depthAt(vUv);
          float radius=smoothstep(3.5,14.0,abs(depth-focus))*1.25*blurStrength;
          vec4 result=center;
          if(radius>.04&&center.a>.001){
            vec4 sum=center*2.0;float weight=2.0;
            for(int i=0;i<8;i++){
              float angle=float(i)*.78539816339;
              vec2 p=clamp(vUv+vec2(cos(angle),sin(angle))*texel*radius,vec2(0.0),vec2(1.0));
              vec4 sampleColor=textureLod(tColor,p,0.0);
              // Prevent a distant row bleeding over the sharp foreground silhouette.
              float w=1.0-smoothstep(2.5,7.0,abs(depthAt(p)-depth));
              sum+=sampleColor*w;weight+=w;
            }
            result=sum/weight;
          }
          // A very light edge falloff, keeping the approved cold-violet grade.
          vec2 edge=vUv*2.0-1.0;
          result.rgb*=1.0-.018*dot(edge,edge);
          gl_FragColor=result;
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          #include <dithering_fragment>
        }`
    });
    this.scene=new THREE.Scene();this.scene.add(new THREE.Mesh(geometry,this.material));
    this.camera=new THREE.Camera();
  }
  resize(){
    this.renderer.getDrawingBufferSize(this.size);
    this.target.setSize(this.size.x,this.size.y);
    // Blur radius is measured in CSS pixels even as the scene resolution adapts.
    this.material.uniforms.texel.value.set(this.renderer.getPixelRatio()/this.size.x,this.renderer.getPixelRatio()/this.size.y);
  }
  render(scene,camera,bounds,blur=true){
    const u=this.material.uniforms;
    u.nearClip.value=camera.near;u.farClip.value=camera.far;
    u.coverage.value.set(Math.max(0,bounds[0]-.02),Math.min(1,bounds[3]+.02));
    u.blurStrength.value=blur?1:0;
    this.renderer.setRenderTarget(this.target);this.renderer.render(scene,camera);
    this.renderer.setRenderTarget(null);this.renderer.render(this.scene,this.camera);
  }
  dispose(){this.target.dispose();this.scene.children[0].geometry.dispose();this.material.dispose();}
}
