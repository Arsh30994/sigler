import { useEffect, useState } from 'react'
import { AvatarViewer } from '../avatar-viewer/AvatarViewer'
import type { Ax1LoadState } from '../avatar-viewer/Ax1Model'
import { resolveSyntheticDemo } from '../../avatar/shared/syntheticDemo'
import type { SharedSignAnimation } from '../../avatar/shared/schema'
import { apiHealth, resolveSigning } from '../../api/signingApi'

const avatars = [
  { id: 'ax1', name: 'AX-1', style: 'Rigged 3D robot', ready: true, note: '46-bone GLB · individual fingers verified' },
  { id: 'animated-boy', name: 'Animated boy', style: 'Stylized human', ready: false, note: 'Reference portrait only · full-body signing rig required' },
  { id: 'realistic-male', name: 'Realistic male', style: 'Realistic human', ready: false, note: 'Reference portrait only · neutral full-body rig required' },
  { id: 'animated-female', name: 'Animated female', style: 'Stylized human', ready: false, note: 'Reference portrait only · full-body signing rig required' },
  { id: 'realistic-female', name: 'Realistic female', style: 'Realistic human', ready: false, note: 'Reference portrait only · neutral full-body rig required' },
] as const

export function AutomaticSigningApp() {
  const [input, setInput] = useState('synthetic demo')
  const [selected, setSelected] = useState('ax1')
  const [animation, setAnimation] = useState<SharedSignAnimation | null>(null)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('Ready for the clearly labelled engineering demonstration.')
  const [modelState, setModelState] = useState<Ax1LoadState>({ kind: 'loading' })
  const [apiStatus, setApiStatus] = useState('Checking API and MongoDB…')
  useEffect(() => { apiHealth().then((health) => setApiStatus(health.ok ? 'API connected · MongoDB connected' : 'API unavailable')).catch(() => setApiStatus('API unavailable · start MongoDB and the Sigler API')) }, [])
  const run = async () => {
    if (selected !== 'ax1') { setMessage('That avatar has no production model or validated signing rig yet.'); return }
    const response = await resolveSigning(input, selected).catch(() => null)
    if (response && !response.ok) { setMessage(response.message ?? 'The API rejected this animation request.'); return }
    const resolved = resolveSyntheticDemo(input)
    if (!resolved) { setMessage('No approved sign is installed. Use “synthetic demo” only for the engineering animation test.'); return }
    setAnimation(resolved); setProgress(0); setPlaying(true); setMessage('Synthetic bimanual engineering demo is playing — not ISL.')
  }
  const stop = () => { setPlaying(false); setAnimation(null); setProgress(0); setMessage('Returned AX-1 to the idle pose.') }
  const duration = animation?.durationMs ?? 2800
  return <main className="signing-shell"><header className="signing-header"><div><p className="eyebrow">SIGLER / AUTOMATIC SIGNING ENGINE</p><h1>Automatic motion demonstration</h1><p>This page has no manual-joint controls. It only runs an explicitly synthetic engineering sequence.</p><small>{apiStatus}</small></div><a href="/">Back to companion</a></header>
    <div className="signing-layout"><section className="signing-stage"><div className="signing-notice" role="status">{message}</div><AvatarViewer expression="neutral" trackingEnabled={false} showLandmarks={false} resetToken={0} rigValidationActive={false} automaticAnimation={animation} automaticPlaying={playing} automaticSpeed={speed} onAutomaticProgress={setProgress} onAutomaticComplete={() => { setPlaying(false); setMessage('Demo complete. AX-1 returned to idle.'); setProgress(duration) }} onModelState={setModelState} onFrameRate={() => {}} /><p className="stage-caption">Automatic controller owns head, arm, wrist, thumb and finger channels during playback, then restores the neutral pose.</p></section>
      <aside className="signing-controls"><section className="workspace-panel"><p className="eyebrow">AVATAR</p><div className="avatar-options">{avatars.map((avatar) => <button key={avatar.id} type="button" className={selected === avatar.id ? 'avatar-option selected' : 'avatar-option'} disabled={!avatar.ready} onClick={() => setSelected(avatar.id)}><strong>{avatar.name}</strong><span>{avatar.style}</span><small>{avatar.ready ? `Signing rig ready · ${avatar.note}` : `Not signing-ready · ${avatar.note}`}</small></button>)}</div></section>
        <section className="workspace-panel"><label><strong>Sign ID or supported gloss</strong><input aria-label="Sign ID or supported gloss" value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') run() }} placeholder="synthetic demo" /></label><p className="control-note">No approved ISL signs are installed. The only supported input is <code>synthetic demo</code>.</p><div className="control-grid"><button type="button" onClick={run} disabled={modelState.kind !== 'ready'}>Play automatically</button><button type="button" onClick={() => setPlaying(false)} disabled={!playing}>Pause</button><button type="button" onClick={() => { if (animation) setPlaying(true) }} disabled={!animation || playing}>Resume</button><button type="button" onClick={stop} disabled={!animation}>Stop</button></div><label><strong>Playback speed</strong><select aria-label="Playback speed" value={speed} onChange={(event) => setSpeed(Number(event.target.value))}><option value={1}>Natural</option><option value={0.5}>Slow</option></select></label><progress aria-label="Animation progress" max={duration} value={progress} /><dl className="signing-diagnostics"><div><dt>Animation</dt><dd>{animation?.animationId ?? 'None'}</dd></div><div><dt>Validation</dt><dd>{animation?.validationStatus ?? 'No asset selected'}</dd></div><div><dt>Rig compatibility</dt><dd>{modelState.kind === 'ready' ? 'AX-1 compatible' : modelState.kind}</dd></div><div><dt>Progress</dt><dd>{Math.round(progress / duration * 100)}%</dd></div></dl></section></aside></div></main>
}
