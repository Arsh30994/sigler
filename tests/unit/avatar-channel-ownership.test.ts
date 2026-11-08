import { describe, expect, it } from 'vitest'
import { ChannelOwnership } from '../../frontend/src/avatar/animation/channelOwnership'

describe('ChannelOwnership', () => {
  it('keeps mouse tracking from overriding an approved sign head channel', () => { const ownership = new ChannelOwnership(); ownership.claim('approved-sign', ['head', 'hands']); expect(ownership.canWrite('idle-mouse', 'head')).toBe(false); expect(ownership.canWrite('idle-mouse', 'hands')).toBe(false); ownership.release('approved-sign'); expect(ownership.canWrite('idle-mouse', 'head')).toBe(true) })
  it('restores writable channels after rapid claim and release cycles', () => { const ownership = new ChannelOwnership(); for (let index = 0; index < 20; index += 1) { ownership.claim('approved-sign', ['head']); ownership.release('approved-sign') } expect(ownership.canWrite('idle-mouse', 'head')).toBe(true) })
})
