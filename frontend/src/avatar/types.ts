export type AvatarChannel = 'head' | 'face' | 'leftArm' | 'rightArm' | 'hands' | 'torso'
export type Expression = 'neutral' | 'attentive' | 'question' | 'negative' | 'emphasis' | 'acknowledgement' | 'uncertainty' | 'error'
export type SchedulerState = 'idle' | 'playing' | 'paused' | 'error'
export type PlaybackSpeed = 'natural' | 'slow'

export interface ApprovedSign {
  id: string
  label: string
  sourceReference: string
  meaningContext: string
  handshape: string
  palmOrientation: string
  handLocation: string
  movement: string
  handBehaviour: string
  nonManualFeatures: string
  bodyMovement: string
  reviewer: string
  reviewDate: string
  approvalStatus: 'approved'
  animationVersion: string
  durationSeconds: number
  subtitles: readonly { start: number; end: number; text: string }[]
}
