import { smooth } from './vendor/rhine-scene-motion.js';

// RhineLabUI src/scene.ts, opening shot 21.9–26.5 (MIT, LBEILC).
// Start this camera passage when our welcome overlay leaves, so it remains visible.
export const ARCHIVE_ENTRY_DURATION=4.6;
export function archiveEntry(elapsed){
  const shot=21.9+Math.max(0,elapsed);
  const orbit=smooth((shot-22.6)/1.6),settle=smooth((shot-24.25)/2.25);
  const wideSpan=10.8+(10.3-10.8)*orbit;
  return {
    yaw:89-22*orbit-8*settle,
    elevation:3+40*smooth((shot-21.96)/.22)-8*orbit-16*settle,
    span:wideSpan+(7.33-wideSpan)*settle,
    complete:elapsed>=ARCHIVE_ENTRY_DURATION
  };
}
