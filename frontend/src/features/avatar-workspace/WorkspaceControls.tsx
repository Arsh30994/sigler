import type { ProductionSign } from '../../avatar/types'
import type { Expression } from '../../avatar/types'

interface Props {
  development: boolean
  trackingEnabled: boolean
  showLandmarks: boolean
  expression: Expression
  signs: readonly ProductionSign[]
  rigValidationActive: boolean
  onNeutralReset(): void
  onRigValidationChange(active: boolean): void
  onTrackingChange(enabled: boolean): void
  onLandmarksChange(enabled: boolean): void
  onExpressionChange(expression: Expression): void
}

const expressions: readonly Expression[] = ['neutral', 'attentive', 'question', 'negative', 'emphasis', 'acknowledgement', 'uncertainty', 'error']

export function WorkspaceControls({ development, trackingEnabled, showLandmarks, expression, signs, rigValidationActive, onNeutralReset, onRigValidationChange, onTrackingChange, onLandmarksChange, onExpressionChange }: Props) {
  if (!development) return <section className="workspace-panel" aria-labelledby="controls-heading"><p className="eyebrow">OPERATIONS</p><h2 id="controls-heading">Production-safe mode</h2><p className="muted">Development controls are unavailable in this build. Only human-approved registry assets can be played.</p></section>
  const noSigns = signs.length === 0
  return <section className="workspace-panel" aria-labelledby="controls-heading">
    <p className="eyebrow">DEVELOPMENT CONTROLS</p><h2 id="controls-heading">Avatar operation</h2>
    <div className="control-grid"><button type="button" onClick={onNeutralReset}>Reset neutral pose</button><button type="button" disabled aria-describedby="playback-note">Play approved animation</button><button type="button" disabled>Pause</button><button type="button" disabled>Replay</button></div>
    <p id="playback-note" className="control-note">{noSigns ? 'Playback locked: no human-approved sign assets are installed.' : 'Select an approved animation to enable playback.'}</p>
    <div className="validation-control"><strong>Rig movement inspection</strong><small>Plays AX-1's embedded mechanical validation clip. It is not an ISL sign.</small><button type="button" aria-pressed={rigValidationActive} onClick={() => onRigValidationChange(!rigValidationActive)}>{rigValidationActive ? 'Stop rig validation' : 'Play rig validation'}</button></div>
    <fieldset><legend>Playback speed</legend><div className="segmented"><button type="button" aria-pressed disabled>Natural</button><button type="button" aria-pressed={false} disabled>Slow</button></div></fieldset>
    <label className="switch-row"><span><strong>Idle head tracking</strong><small>Development only; never controls signing channels.</small></span><input type="checkbox" checked={trackingEnabled} onChange={(event) => onTrackingChange(event.target.checked)} /></label>
    <label className="switch-row"><span><strong>Signing-space landmarks</strong><small>Reference grid for development inspection.</small></span><input type="checkbox" checked={showLandmarks} onChange={(event) => onLandmarksChange(event.target.checked)} /></label>
    <label htmlFor="expression"><strong>Visor presentation preview</strong><select id="expression" value={expression} onChange={(event) => onExpressionChange(event.target.value as Expression)}>{expressions.map((item) => <option key={item} value={item}>{item}</option>)}</select><small>Preview state only; it does not assert ISL non-manual grammar.</small></label>
    <label htmlFor="animation"><strong>Approved animation</strong><select id="animation" disabled={noSigns} aria-describedby="animation-note"><option>{noSigns ? 'No approved animations available' : 'Select an approved animation'}</option>{signs.map((sign) => <option key={sign.signId}>{sign.label}</option>)}</select></label><p id="animation-note" className="control-note">Registry status is verified before an action can be created.</p>
  </section>
}
