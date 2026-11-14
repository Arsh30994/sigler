import { useEffect, useRef, useState } from 'react'

import { getRecognitionReadiness, type RecognitionReadiness } from '../../api/recognitionApi'
import { findApprovedSign } from '../../avatar/registry/approvedSigns'
import { AvatarViewer } from '../avatar-viewer/AvatarViewer'
import type { Ax1LoadState } from '../avatar-viewer/Ax1Model'
import { MediaController, type MediaKind, type MediaState } from './mediaController'

type Mode = 'sign-to-speech' | 'speech-to-sign'
type RecognitionState =
  | { kind: 'checking' }
  | { kind: 'ready'; detail: RecognitionReadiness }
  | { kind: 'unavailable'; reason: string }

const mediaLabel = (state: MediaState) =>
  ({
    idle: 'Off',
    requesting: 'Requesting permission',
    active: 'Active',
    denied: 'Permission denied',
    unavailable: 'Unavailable',
    error: 'Error',
  })[state]

export function CommunicationMode() {
  const [mode, setMode] = useState<Mode>('sign-to-speech')
  const [camera, setCamera] = useState<MediaState>('idle')
  const [microphone, setMicrophone] = useState<MediaState>('idle')
  const [transcript, setTranscript] = useState('')
  const [message, setMessage] = useState('Choose a mode and start only the device you want to use.')
  const [model, setModel] = useState<Ax1LoadState>({ kind: 'loading' })
  const [recognition, setRecognition] = useState<RecognitionState>({ kind: 'checking' })
  const video = useRef<HTMLVideoElement>(null)
  const controller = useRef(new MediaController())

  const checkRecognition = () => {
    const abort = new AbortController()
    setRecognition({ kind: 'checking' })
    void getRecognitionReadiness(abort.signal)
      .then((detail) => setRecognition(detail.ready ? { kind: 'ready', detail } : { kind: 'unavailable', reason: detail.reason ?? 'The VSRS model is not ready.' }))
      .catch(() => setRecognition({ kind: 'unavailable', reason: 'The VSRS recognition service is unavailable.' }))
    return abort
  }

  useEffect(() => {
    const abort = checkRecognition()
    return () => abort.abort()
  }, [])

  useEffect(() => () => controller.current.stop(), [])

  const stop = () => {
    controller.current.stop()
    if (video.current) video.current.srcObject = null
    setCamera('idle')
    setMicrophone('idle')
  }

  const choose = (next: Mode) => {
    stop()
    setMode(next)
    setMessage(next === 'sign-to-speech' ? 'Camera is off. Start it when you are ready.' : 'Microphone is off. Type or dictate a phrase, then review it before playback.')
  }

  const start = async (kind: MediaKind) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      if (kind === 'camera') setCamera('unavailable')
      else setMicrophone('unavailable')
      setMessage(`${kind === 'camera' ? 'Camera' : 'Microphone'} access is unavailable in this browser.`)
      return
    }
    if (kind === 'camera') setCamera('requesting')
    else setMicrophone('requesting')
    try {
      const stream = await controller.current.start(kind)
      if (kind === 'camera' && video.current) {
        video.current.srcObject = stream
        await video.current.play()
        setCamera('active')
        setMessage(
          recognition.kind === 'ready'
            ? 'Camera active. The VSRS model is ready, but browser landmark extraction is not connected yet. No video frames or landmarks are sent.'
            : 'Camera active. Recognition is unavailable, and no camera data is being sent.',
        )
      } else {
        setMicrophone('active')
        setMessage('Microphone active. Speech-to-text is not installed, so no transcript is generated automatically.')
      }
    } catch (error) {
      const denied = error instanceof DOMException && error.name === 'NotAllowedError'
      if (kind === 'camera') setCamera(denied ? 'denied' : 'error')
      else setMicrophone(denied ? 'denied' : 'error')
      setMessage(denied ? 'Permission was denied. No media was captured.' : 'Unable to access the selected device.')
    }
  }

  const play = () => {
    const sign = findApprovedSign(transcript.trim())
    setMessage(sign ? 'An approved sign was found, but no approved animation assets are currently installed.' : 'Unsupported content: no approved sign or animation is available for this text.')
  }

  const recognitionText =
    recognition.kind === 'checking'
      ? 'Checking recognition service…'
      : recognition.kind === 'ready'
        ? `VSRS model ready (${recognition.detail.modelVersion}).`
        : `Recognition unavailable: ${recognition.reason}`

  return (
    <main className="communication-shell">
      <header className="communication-header">
        <div>
          <p className="eyebrow">SIGLER / COMMUNICATION MODE</p>
          <h1>Communicate your way</h1>
          <p>Devices activate only when you choose them. Draft text remains editable before any signing playback.</p>
        </div>
        <a href="/">Back to companion</a>
      </header>
      <div className="mode-switch" role="tablist" aria-label="Communication direction">
        <button role="tab" aria-selected={mode === 'sign-to-speech'} onClick={() => choose('sign-to-speech')}>Sign → Speech</button>
        <button role="tab" aria-selected={mode === 'speech-to-sign'} onClick={() => choose('speech-to-sign')}>Speech → Sign</button>
      </div>
      <p className="communication-status" role="status">{message}</p>
      <div className="communication-grid">
        <section className="communication-panel" aria-label="Input workspace">
          {mode === 'sign-to-speech' ? (
            <>
              <div className="privacy">
                <strong>Camera: {mediaLabel(camera)}</strong>
                <span>{recognitionText}</span>
              </div>
              <video ref={video} className="camera-preview" aria-label="Live camera preview" muted playsInline />
              <div className="primary-actions">
                <button onClick={() => start('camera')} disabled={camera === 'requesting' || camera === 'active'}>Start camera</button>
                <button onClick={stop} disabled={camera !== 'active'}>Stop camera</button>
                <button onClick={() => checkRecognition()}>Retry recognition service</button>
              </div>
              <section className="transcript">
                <h2>Transcript</h2>
                <p>VSRS V1 is a bounded 11-label isolated-sign experiment. A compatible browser landmark provider must be connected before candidate labels can be requested.</p>
              </section>
            </>
          ) : (
            <>
              <div className="privacy">
                <strong>Microphone: {mediaLabel(microphone)}</strong>
                <span>Audio is requested only after selecting Start microphone.</span>
              </div>
              <div className="primary-actions">
                <button onClick={() => start('microphone')} disabled={microphone === 'requesting' || microphone === 'active'}>Start microphone</button>
                <button onClick={stop} disabled={microphone !== 'active'}>Stop microphone</button>
              </div>
              <label className="transcript">
                <h2>Editable transcript</h2>
                <textarea aria-label="Editable transcript" value={transcript} onChange={(event) => setTranscript(event.target.value)} placeholder="Type a supported approved sign ID or phrase" />
              </label>
              <button className="play-sign" onClick={play} disabled={!transcript.trim() || model.kind !== 'ready'}>Play approved sign</button>
            </>
          )}
        </section>
        <section className="communication-avatar">
          <div className="privacy">
            <strong>AX-1: {model.kind === 'ready' ? 'Rig ready' : model.kind}</strong>
            <span>Only human-approved sign assets can play here.</span>
          </div>
          <AvatarViewer expression="neutral" trackingEnabled={false} showLandmarks={false} resetToken={0} rigValidationActive={false} onModelState={setModel} onFrameRate={() => {}} />
          <div className="playback-row"><button disabled>Pause</button><button disabled>Replay</button><span>No approved sign selected</span></div>
        </section>
      </div>
    </main>
  )
}
