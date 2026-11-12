import type { SharedSignAnimation } from '../shared/schema'
export interface AvatarCapabilities { runtime:string; hands:boolean; independentFingers:boolean; thumbOpposition:boolean; face:boolean; head:boolean; body:boolean }
export interface AvatarAnimationAdapter { capabilities():AvatarCapabilities; supports(animation:SharedSignAnimation):string[]; apply(animation:SharedSignAnimation, elapsedMs:number):void; reset():void; dispose():void }
