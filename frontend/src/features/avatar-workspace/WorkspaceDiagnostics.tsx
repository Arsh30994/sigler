import type { Ax1LoadState } from '../avatar-viewer/Ax1Model'

interface Props { modelState: Ax1LoadState; frameRate: number | null; trackingEnabled: boolean }
function value(state: Ax1LoadState) {
  if (state.kind === 'error') return { asset: 'Error', mapping: 'Unavailable', rig: 'Failed', error: state.message }
  if (state.kind === 'loading') return { asset: 'Loading', mapping: 'Checking', rig: 'Checking', error: 'None' }
  return { asset: 'Ready', mapping: `${state.boneCount} required bones mapped`, rig: 'Validated', error: 'None' }
}
export function WorkspaceDiagnostics({ modelState, frameRate, trackingEnabled }: Props) {
  const status = value(modelState)
  return <section className="workspace-panel diagnostics" aria-labelledby="diagnostics-heading"><p className="eyebrow">DIAGNOSTICS</p><h2 id="diagnostics-heading">Runtime evidence</h2><dl>
    <div><dt>Animation ID</dt><dd>None — registry empty</dd></div><div><dt>Playback state</dt><dd>Neutral / locked</dd></div><div><dt>Frame rate</dt><dd>{frameRate === null ? 'Measuring…' : `${frameRate} FPS`}</dd></div><div><dt>State machine</dt><dd>{trackingEnabled ? 'Idle tracking' : 'Neutral hold'}</dd></div><div><dt>Bone mapping</dt><dd>{status.mapping}</dd></div><div><dt>Rig validation</dt><dd>{status.rig}</dd></div><div><dt>Asset</dt><dd>{status.asset}</dd></div><div><dt>Load errors</dt><dd>{status.error}</dd></div>
  </dl></section>
}
