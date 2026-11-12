import type { AnimationKeyframe, SharedSignAnimation } from './schema'
export type PlaybackState='idle'|'playing'|'paused'|'completed'
export class SharedAnimationEngine {
 private animation:SharedSignAnimation|null=null; private elapsed=0; private speed=1; private state:PlaybackState='idle'
 load(animation:SharedSignAnimation){this.animation=animation;this.elapsed=0;this.state='idle'} play(){if(this.animation)this.state='playing'} pause(){if(this.state==='playing')this.state='paused'} stop(){this.elapsed=0;this.state='idle'} setSpeed(speed:number){if(speed<=0)throw new Error('speed must be positive');this.speed=speed} tick(ms:number){if(this.state!=='playing'||!this.animation)return;this.elapsed=Math.min(this.animation.durationMs,this.elapsed+ms*this.speed);if(this.elapsed===this.animation.durationMs)this.state='completed'} snapshot(){return {state:this.state,elapsedMs:this.elapsed,keyframe:this.frame()}} private frame():AnimationKeyframe|null{if(!this.animation)return null;return [...this.animation.keyframes].reverse().find(frame=>frame.atMs<=this.elapsed)??this.animation.keyframes[0]??null}
}
