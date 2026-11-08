import { describe, expect, it } from 'vitest'
import { ChannelOwnership } from '../../frontend/src/avatar/animation/channelOwnership'

describe('ChannelOwnership', () => {
  it('keeps mouse tracking from overriding an approved sign head channel', () => { const ownership = new ChannelOwnership(); ownership.claim('approved-sign', ['head', 'hands']); expect(ownership.canWrite('idle-mouse', 'head')).toBe(false); expect(ownership.canWrite('idle-mouse', 'hands')).toBe(false); ownership.release('approved-sign'); expect(ownership.canWrite('idle-mouse', 'head')).toBe(true) })
})
