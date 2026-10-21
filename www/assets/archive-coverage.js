import { Box3, Frustum, Matrix4 } from './vendor/three/three.module.min.js';

// Adapted from RhineLabUI ArchiveDrawCoverage (LBEILC, MIT).
// Include the complete transformed geometry and overscan for refraction/soft masks.
export class ArchiveCoverage{
  constructor(bounds){
    this.bounds=bounds;this.box=new Box3();this.frustum=new Frustum();
    this.matrix=new Matrix4();this.crop=new Matrix4();
  }
  update(camera,left=0,right=1){
    const a=(left-.07)*2-1,b=(right+.07)*2-1;
    this.crop.makeScale(2/(b-a),1/1.08,1);this.crop.elements[12]=-(a+b)/(b-a);
    this.matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
    this.matrix.premultiply(this.crop);this.frustum.setFromProjectionMatrix(this.matrix);
  }
  contains(matrix){
    this.box.copy(this.bounds).applyMatrix4(matrix).expandByScalar(.04);
    return this.frustum.intersectsBox(this.box);
  }
}
