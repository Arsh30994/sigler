export type MediaKind = 'camera' | 'microphone'
export type MediaState = 'idle' | 'requesting' | 'active' | 'denied' | 'unavailable' | 'error'
export class MediaController {
  private stream: MediaStream | null = null
  async start(kind: MediaKind) {
    this.stop()
    this.stream = await navigator.mediaDevices.getUserMedia(kind === 'camera' ? { video: true, audio: false } : { audio: true, video: false })
    return this.stream
  }
  stop() { this.stream?.getTracks().forEach((track) => track.stop()); this.stream = null }
}
