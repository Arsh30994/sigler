import type { LoadedAx1 } from '../rig/runtime'
import type { AvatarAnimationAdapter, AvatarCapabilities } from './AvatarAnimationAdapter'
import type { SharedSignAnimation } from '../shared/schema'
export class Ax1AnimationAdapter implements AvatarAnimationAdapter {
 constructor(private readonly asset:LoadedAx1){} capabilities():AvatarCapabilities{return {runtime:'ax1-3d',hands:true,independentFingers:true,thumbOpposition:true,face:false,head:true,body:true}} supports(animation:SharedSignAnimation){const missing=[]; if(!animation.supportedRuntimes.includes('ax1-3d'))missing.push('asset does not declare ax1-3d support'); if(animation.keyframes.some(frame=>frame.facialExpression))missing.push('AX-1 has no validated facial expression runtime'); return missing} apply():void{/* Mapping is enabled only for human-validated assets; no synthetic pose is applied here. */} reset(){this.asset.playback.stop()} dispose(){this.asset.dispose()} }
