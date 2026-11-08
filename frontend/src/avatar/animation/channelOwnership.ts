import type { AvatarChannel } from '../types'

export type ChannelOwner = 'approved-sign' | 'system' | 'idle-mouse' | 'ambient'
const priority: Record<ChannelOwner, number> = { 'approved-sign': 4, system: 3, 'idle-mouse': 2, ambient: 1 }

/** Prevents lower-priority procedural controllers from writing a claimed channel. */
export class ChannelOwnership {
  private owners = new Map<AvatarChannel, ChannelOwner>()

  claim(owner: ChannelOwner, channels: readonly AvatarChannel[]) {
    channels.forEach((channel) => {
      const current = this.owners.get(channel)
      if (!current || priority[owner] >= priority[current]) this.owners.set(channel, owner)
    })
  }
  release(owner: ChannelOwner) { for (const [channel, current] of this.owners) if (current === owner) this.owners.delete(channel) }
  canWrite(owner: ChannelOwner, channel: AvatarChannel) { const current = this.owners.get(channel); return !current || current === owner || priority[owner] >= priority[current] }
  snapshot() { return new Map(this.owners) }
}
