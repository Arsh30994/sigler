import type { AvatarAnimationAdapter, AvatarCapabilities } from './AvatarAnimationAdapter'
import type { SharedSignAnimation } from '../shared/schema'

/** Contract-only adapter for a selected visual reference before a production rig exists. */
export class ReferenceAvatarAdapter implements AvatarAnimationAdapter {
  constructor(private readonly id: string, private readonly reason: string) {}
  capabilities(): AvatarCapabilities { return { runtime: this.id, hands: false, independentFingers: false, thumbOpposition: false, face: false, head: false, body: false } }
  supports(animation: SharedSignAnimation) { void animation; return [`${this.id} is unavailable for signing: ${this.reason}`] }
  apply(animation: SharedSignAnimation, elapsedMs: number) { void elapsedMs; throw new Error(this.supports(animation).join('; ')) }
  reset() {}
  dispose() {}
}
