import type { SignSpecification, SubtitleCue, TimelineEvent } from '../types'

export interface TimelineFrame { elapsedMs: number; subtitle: SubtitleCue | null; events: readonly TimelineEvent[] }

/** Pure timeline projection; using scheduler elapsed time keeps pause and slow playback synchronized. */
export function projectSignTimeline(sign: SignSpecification, elapsedMs: number): TimelineFrame {
  const clamped = Math.max(0, Math.min(elapsedMs, sign.durationMs))
  return {
    elapsedMs: clamped,
    subtitle: sign.subtitles.find((cue) => cue.startMs <= clamped && clamped < cue.endMs) ?? null,
    events: sign.timeline.filter((event) => event.atMs <= clamped),
  }
}
