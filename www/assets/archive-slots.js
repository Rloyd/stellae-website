// The reference keeps every extracted/returning file attached to its own cell.
export const SLOT_COLUMN=5.2,SLOT_ROW=.62,SLOT_BASE_Y=-4.6;

export function slotPose(cell,track,bounds,height,lift=0,entrance=0,slope=0){
  const cy=(bounds.min.y+bounds.max.y)/2,cz=(bounds.min.z+bounds.max.z)/2;
  const halfHeight=(bounds.max.y-bounds.min.y)/2,halfDepth=(bounds.max.z-bounds.min.z)/2;
  // Keep all tilted geometry within its row's physical slab, with a 0.04 gap.
  const limit=Math.asin(Math.max(0,(SLOT_ROW/2-.02-halfDepth)/Math.max(.001,halfHeight)));
  const angle=Math.max(-limit,Math.min(limit,slope));
  const cosine=Math.cos(angle),sine=Math.sin(angle);
  return {
    x:(cell.lane-track.lane)*SLOT_COLUMN,
    y:SLOT_BASE_Y+height+lift-entrance*2+cy-(cy*cosine-cz*sine),
    z:(cell.row-track.row)*SLOT_ROW-2.17-entrance*7+cz-(cy*sine+cz*cosine),
    angle
  };
}

export function applySlotPose(object,pose){
  object.position.set(pose.x,pose.y,pose.z);object.rotation.set(pose.angle,0,0);
}
