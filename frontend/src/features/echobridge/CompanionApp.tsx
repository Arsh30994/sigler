import { useState } from 'react'

const ax1FrontRender = new URL('../../../../assets/ax1/renders/rig_validation/ax1_open_front.png', import.meta.url).href

/** Minimal end-user shell. It has no translation claim until approved assets exist. */
export function CompanionApp() {
  const [caption, setCaption] = useState('Captions will appear here when an approved communication service is connected.')
  return <main className="companion-shell"><header className="companion-brand"><span>◉</span> EchoBridge</header><section className="companion-caption" aria-live="polite"><p className="eyebrow">LIVE CAPTIONS</p><p>{caption}</p></section><section className="companion-avatar companion-avatar-2d" aria-label="AX-1 front avatar"><img src={ax1FrontRender} alt="AX-1 front-facing avatar" /></section><footer className="companion-footer"><span>AX-1 front view ready · waiting for approved sign content</span><label><span className="sr-only">Caption preview</span><input aria-label="Caption preview" value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="Type a caption preview" /></label><a href="/signing-demo">Automatic demo</a><a href="/workspace">Development workspace</a></footer></main>
}
