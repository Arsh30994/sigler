export type AvatarChannel = 'head' | 'face' | 'leftArm' | 'rightArm' | 'hands' | 'torso'
export type Expression = 'neutral' | 'attentive' | 'question' | 'negative' | 'emphasis' | 'acknowledgement' | 'uncertainty' | 'error'
export type SchedulerState = 'idle' | 'loading' | 'playing' | 'paused' | 'completed' | 'error'
export type PlaybackSpeed = 'natural' | 'slow'
export type SignReviewStatus = 'APPROVED' | 'UNREVIEWED' | 'REJECTED' | 'UNAVAILABLE'

export interface SubtitleCue { startMs: number; endMs: number; text: string; language: string }
export interface TimelineEvent { atMs: number; kind: 'animation' | 'expression'; value: string }
export interface HumanApprovalMetadata { reviewer: string; reviewedAt: string; approvalNotes?: string }

/** A linguistic specification, never a claim that the sign is correct. */
export interface SignSpecification {
  signId: string; phraseId: string; label: string; intendedMeaning: string; context: string; language: 'ISL'
  handshape: string; palmOrientation: string; handLocation: string; movementSequence: string
  leftHandBehaviour: string; rightHandBehaviour: string; requiredFacialExpression: Expression
  requiredHeadMovement: string; requiredTorsoMovement: string; sourceReference: string
  reviewStatus: SignReviewStatus; approval: HumanApprovalMetadata | null; version: string
  animationUrl: string; animationClip: string; durationMs: number; requiredChannels: readonly AvatarChannel[]
  referencedBones: readonly string[]; subtitles: readonly SubtitleCue[]; timeline: readonly TimelineEvent[]
}

export type ProductionSign = SignSpecification & { reviewStatus: 'APPROVED'; approval: HumanApprovalMetadata }
export interface SchedulerSnapshot {
  state: SchedulerState; sign: SignSpecification | null; elapsedMs: number; speed: PlaybackSpeed
  activeSubtitle: SubtitleCue | null; activeEvents: readonly TimelineEvent[]; error: string | null
}
