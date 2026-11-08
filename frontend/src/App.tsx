import { useMemo, useState } from 'react'
import { AvatarViewer } from './features/avatar-viewer/AvatarViewer'
import type { Ax1LoadState } from './features/avatar-viewer/Ax1Model'
import { WorkspaceControls } from './features/avatar-workspace/WorkspaceControls'
import { WorkspaceDiagnostics } from './features/avatar-workspace/WorkspaceDiagnostics'
import { approvedSigns } from './avatar/registry/approvedSigns'
import type { Expression } from './avatar/types'

export default function App() {
  const [expression, setExpression] = useState<Expression>('neutral')
  const [trackingEnabled, setTrackingEnabled] = useState(true)
  const [showLandmarks, setShowLandmarks] = useState(true)
  const [resetToken, setResetToken] = useState(0)
  const [frameRate, setFrameRate] = useState<number | null>(null)
  const [modelState, setModelState] = useState<Ax1LoadState>({ kind: 'loading' })
  const development = import.meta.env.DEV
  const forceWebGlFallback = development && new URLSearchParams(window.location.search).has('webgl-fallback')
  const status = useMemo(() => modelState.kind === 'ready' ? 'AX-1 rig ready · neutral state' : modelState.kind === 'error' ? 'AX-1 asset issue detected' : 'Loading AX-1 model and rig mapping', [modelState])
  return <main className="workspace-shell"><header className="workspace-header"><div><p className="eyebrow">SIGLER / AX-1 / DEVELOPMENT WORKSPACE</p><h1>Avatar operations lab</h1><p className="header-summary">{status}</p></div><span className={`status ${modelState.kind === 'ready' ? 'active' : ''}`}><span aria-hidden="true">●</span> {modelState.kind.toUpperCase()}</span></header>
    <div className="workspace-layout"><section className="stage-column" aria-label="AX-1 development stage"><div className="stage-toolbar"><span>Signing space / stable camera</span><span>{approvedSigns.length === 0 ? 'No approved animation selected' : 'Approved registry ready'}</span></div><AvatarViewer expression={expression} trackingEnabled={development && trackingEnabled} showLandmarks={showLandmarks} resetToken={resetToken} forceWebGlFallback={forceWebGlFallback} onModelState={setModelState} onFrameRate={setFrameRate} /><p className="stage-caption">Mouse input affects the head only while idle. No control can create, approve, or bypass a signing animation.</p></section>
      <aside className="workspace-sidebar"><WorkspaceControls development={development} trackingEnabled={trackingEnabled} showLandmarks={showLandmarks} expression={expression} signs={approvedSigns} onNeutralReset={() => setResetToken((value) => value + 1)} onTrackingChange={setTrackingEnabled} onLandmarksChange={setShowLandmarks} onExpressionChange={setExpression} /><WorkspaceDiagnostics modelState={modelState} frameRate={frameRate} trackingEnabled={trackingEnabled} /></aside></div>
    <footer>AX-1 engineering workspace · Development controls are intentionally unavailable in production builds.</footer>
  </main>
}
