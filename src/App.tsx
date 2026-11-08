import { useMemo, useState } from 'react'
import { AvatarViewer } from './components/AvatarViewer'
import { approvedSigns } from './registry/approvedSigns'
import type { Expression } from './avatar/types'

const expressions: Expression[] = ['neutral', 'attentive', 'question', 'negative', 'emphasis', 'acknowledgement', 'uncertainty', 'error']
export default function App() {
  const [expression, setExpression] = useState<Expression>('neutral')
  const [signing, setSigning] = useState(false)
  const status = useMemo(() => signing ? 'Signing channel owns head, arms, hands and torso.' : 'Idle mouse tracking owns head only.', [signing])
  return <main><header><div><p className="eyebrow">SIGLER / AX-1</p><h1>Avatar integration lab</h1></div><span className={`status ${signing ? 'active' : ''}`}>{signing ? 'SIGNING LOCK' : 'IDLE / LISTENING'}</span></header>
    <div className="layout"><AvatarViewer expression={expression} signing={signing} /><aside><p className="eyebrow">CHANNEL CONTROLS</p><h2>Presentation state</h2><p className="muted">{status}</p><label htmlFor="expression">Visor expression</label><select id="expression" value={expression} onChange={(event) => setExpression(event.target.value as Expression)}>{expressions.map((item) => <option key={item} value={item}>{item}</option>)}</select>
      <button type="button" className="primary" onClick={() => setSigning((active) => !active)}>{signing ? 'Stop playback / restore idle' : 'Simulate reviewed-sign playback'}</button>
      <section className="card"><h3>Approved sign registry</h3><p>{approvedSigns.length === 0 ? 'No reviewed animations are installed. AX-1 remains neutral; do not infer or generate a sign.' : `${approvedSigns.length} reviewed signs available.`}</p><small>Registry accepts only human-approved records with source, reviewer, date, and animation version.</small></section>
      <section className="card"><h3>Channel priority</h3><ol><li>Approved sign</li><li>System feedback</li><li>Idle mouse head tracking</li><li>Ambient idle</li></ol></section>
    </aside></div>
    <footer>Phase 1 local development interface · Touch input preserves a neutral head pose.</footer>
  </main>
}
