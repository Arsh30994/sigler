import { describe, expect, it, vi } from 'vitest'
import { MediaController } from '../../frontend/src/features/communication/mediaController'

describe('MediaController', () => {
  it('requests the chosen device constraints and releases tracks on stop', async () => {
    const stop = vi.fn(); const stream = { getTracks: () => [{ stop }] } as unknown as MediaStream
    const getUserMedia = vi.fn().mockResolvedValue(stream)
    Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia }, configurable: true })
    const controller = new MediaController(); await controller.start('camera')
    expect(getUserMedia).toHaveBeenCalledWith({ video: true, audio: false })
    controller.stop(); expect(stop).toHaveBeenCalledOnce()
  })
})
