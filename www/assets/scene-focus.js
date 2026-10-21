import { Vector3 } from './vendor/three/three.module.min.js';

const worldUp=new Vector3(0,1,0),right=new Vector3(),up=new Vector3(),aim=new Vector3();

// Keep an actual point on the extracted model at an exact normalized screen anchor.
// Offset the camera's orbit plane, so changing yaw, lift or rail cannot move that point.
export function frameModelFocus(camera,focus,direction,span,x,y,distance=140){
  right.crossVectors(worldUp,direction).normalize();
  up.crossVectors(direction,right).normalize();
  aim.copy(focus)
    .addScaledVector(right,(.5-x)*span*camera.aspect)
    .addScaledVector(up,(y-.5)*span);
  camera.position.copy(aim).addScaledVector(direction,distance);
  camera.lookAt(aim);camera.updateMatrixWorld(true);
}

export function focusFeather(bounds){
  const [outerLeft,innerLeft,innerRight,outerRight]=bounds;
  const stops=[];
  const knots=[[0,0],[.12,.04],[.27,.16],[.46,.38],[.65,.68],[.85,.9],[1,1]];
  for(const [t,alpha] of knots)stops.push(`rgba(0,0,0,${alpha}) ${((outerLeft+(innerLeft-outerLeft)*t)*100).toFixed(3)}%`);
  for(const [t,alpha] of [...knots].reverse())stops.push(`rgba(0,0,0,${alpha}) ${((innerRight+(outerRight-innerRight)*(1-t))*100).toFixed(3)}%`);
  return `linear-gradient(90deg,${stops.join(',')})`;
}
