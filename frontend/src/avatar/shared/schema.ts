export type ValidationStatus = 'SYNTHETIC_TEST' | 'PLACEHOLDER' | 'HUMAN_AUTHORED' | 'HUMAN_VALIDATED'
export interface JointPose { flexion?: number; spread?: number; rotation?: number }
export type FingerName = 'thumb' | 'index' | 'middle' | 'ring' | 'little'
/** Values are radians and renderer independent; adapters apply their documented rig constraints. */
export interface FingerPose extends JointPose { mcp?: number; pip?: number; dip?: number; opposition?: number }
export interface HandPose { palmOrientation: 'front' | 'back' | 'edge'; wrist: JointPose; fingers: Partial<Record<FingerName, FingerPose>>; position: readonly [number, number, number] }
export interface ArmPose { shoulder?: JointPose; elbow?: JointPose; wrist?: JointPose }
export interface AnimationKeyframe { atMs: number; left?: HandPose; right?: HandPose; leftArm?: ArmPose; rightArm?: ArmPose; head?: JointPose; body?: JointPose; facialExpression?: string }
export interface SharedSignAnimation { schemaVersion: '1.0'; animationId: string; signId: string; durationMs: number; dominantHand: 'left' | 'right' | 'both'; keyframes: readonly AnimationKeyframe[]; provenance: string; validationStatus: ValidationStatus; supportedRuntimes: readonly string[] }
export function validateAnimation(value: SharedSignAnimation): string[] {
 const errors:string[]=[]; if(!value.animationId||!value.signId) errors.push('animationId and signId are required'); if(value.durationMs<=0) errors.push('duration must be positive'); if(!value.keyframes.length) errors.push('at least one keyframe is required'); if(value.keyframes.some((frame,index)=>frame.atMs<0||frame.atMs>value.durationMs||(index&&frame.atMs<value.keyframes[index-1].atMs))) errors.push('keyframes must be chronological and within duration'); return errors
}
