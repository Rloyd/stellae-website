// Analytic underdamped spring: identical motion at 30, 60 and 120 Hz.
export function stepGallerySpring(state,dt){
  const omega=18,damping=.78,decay=damping*omega,frequency=omega*Math.sqrt(1-damping*damping);
  const offset=state.value-state.target,b=(state.velocity+decay*offset)/frequency;
  const elapsed=Math.max(0,Math.min(.1,dt)),fall=Math.exp(-decay*elapsed);
  const cosine=Math.cos(frequency*elapsed),sine=Math.sin(frequency*elapsed);
  const wave=offset*cosine+b*sine;
  state.value=state.target+fall*wave;
  state.velocity=fall*(-decay*wave-offset*frequency*sine+b*frequency*cosine);
  const moving=Math.abs(state.target-state.value)>.08||Math.abs(state.velocity)>.8;
  if(!moving){state.value=state.target;state.velocity=0;}
  return moving;
}
export function galleryThrow(velocity,width){return Math.max(-width*.65,Math.min(width*.65,velocity*.16));}
