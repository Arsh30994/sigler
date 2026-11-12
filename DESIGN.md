<<<<<<< HEAD
# SIGLER — Product and Interaction Design

**Status:** Design principles and target interaction specification  
**Primary language scope:** Indian Sign Language (ISL), subject to qualified human review.

## 1. Product experience

Sigler aims to make communication between signing and non-signing people more accessible through two clearly separated modes:

- **Sign to Speech:** A signer uses the camera; the system recognizes a supported sign sequence and presents text, with optional speech output.
- **Speech to Sign:** A person enters text or speaks; the system resolves supported content to approved signs and plays them on an articulated avatar.

The interface must communicate what the system can and cannot understand. It must not imply that every sentence can already be translated.

## 2. Design principles

1. **Clarity over decoration:** The next action and current system state must be obvious.
2. **Explicit control:** Camera and microphone start only after user action.
3. **Accessible by default:** Large touch targets, readable typography, high contrast, captions, keyboard navigation, and reduced motion.
4. **Honest feedback:** Distinguish listening, detecting, processing, recognized, uncertain, and unsupported states.
5. **Linguistic integrity:** Only approved sign assets are played as signs.
6. **Consistent avatar behavior:** All compatible avatars consume the same semantic animation timeline through adapters.
7. **Graceful failure:** Camera denial, poor lighting, lost hands, unsupported phrases, and low confidence must have understandable recovery paths.

## 3. Information architecture

Proposed primary navigation:

- **Home:** Explain the two modes and current readiness.
- **Communication:** Main two-way communication workspace.
- **Sign Library:** Browse approved sign entries and their review status.
- **Avatar Studio:** Select a supported avatar and inspect rig/animation capabilities.
- **Accessibility & Settings:** Text size, contrast, reduced motion, captions, voice, and privacy controls.
- **About & Safety:** Scope, limitations, data use, and human-interpreter guidance.

These are target product surfaces. They should not be described as existing pages unless verified in the application.

## 4. Communication workspace

### Mode selector

Use one prominent, clearly labelled selector:

- **Sign → Speech**
- **Speech → Sign**

Switching modes must stop the previous camera or microphone stream before activating another input. Show permission requests only after the user selects the relevant action.

### Sign → Speech flow

1. User selects **Sign → Speech**.
2. User presses **Start camera** and grants permission.
3. The interface displays a persistent camera-active indicator and a live preview.
4. Landmark tracking reports whether hands are visible and tracking quality is sufficient.
5. Recognized content appears as a transcript with uncertainty where applicable.
6. User can edit/copy the text or choose **Speak transcript**.
7. User can stop the camera at any time.

Do not speak provisional or low-confidence predictions as if they were final.

### Speech → Sign flow

1. User selects **Speech → Sign**.
2. User types a message or presses **Start speaking**.
3. Speech input is transcribed and shown for confirmation/editing.
4. The resolver identifies supported approved sign content.
5. Unsupported content is clearly marked; do not fabricate motion.
6. User selects an available avatar and presses **Play signs**.
7. Playback controls include play/pause, replay, speed where safe, and stop.

### Avatar selector

The long-term product may support several visual characters, including stylized and realistic human avatars and the AX-1 robot. A character is selectable for signing only after its rig has passed articulation, retargeting, and visual validation. A portrait image or static model is not sufficient evidence of sign capability.

## 5. Accessibility requirements

| Area | Requirement |
| --- | --- |
| Touch | Primary controls target 64–80 CSS px where practical |
| Typography | Adjustable text size; avoid dense small labels |
| Contrast | High-contrast text and controls; never rely on color alone |
| State | Pair icons with text labels and clear status messages |
| Captions | Display recognized speech/text and spoken output |
| Keyboard | All primary actions reachable and operable by keyboard |
| Screen readers | Accessible names, roles, focus order, and status announcements |
| Motion | Respect reduced-motion preferences |
| Errors | Plain-language explanation and a clear recovery action |
| Older users | Simple navigation, consistent placement, large controls, minimal steps |

## 6. Visual language

The interface should feel calm, dependable, modern, and inclusive. Avoid a clinical or overly technical appearance in the communication flow.

Recommended hierarchy:

- One dominant task per screen.
- Large mode selector.
- Large primary action.
- Clear live status region.
- Transcript and avatar stage with sufficient spacing.
- Secondary diagnostics tucked away unless the user opens them.

Use animation sparingly for interface feedback. Lottie may be used for listening, processing, success, and empty-state illustrations. Lottie must not be used as a substitute for the articulated signing avatar or as evidence of correct sign production.

## 7. Camera and microphone states

Every media control must expose a visible state:

- Off
- Permission required
- Starting
- Active
- Paused/stopped
- Permission denied
- Device unavailable
- Tracking/input lost
- Error

The user must always be able to stop capture. Switching modes and navigating away must release media tracks.

An eye-shaped icon may be used as a camera/privacy indicator, but it must not be represented as eye-gaze or blink control. Gaze/blink interaction is a separate optional feature requiring its own design, consent, calibration, and validation.

## 8. Avatar and signing presentation

- Use a WebGL renderer for actual articulated 3D signing.
- Ensure hands are large and visible enough to inspect finger articulation and palm orientation.
- Avoid cropping hands, elbows, shoulders, or head during signs.
- Provide a neutral idle pose that does not look like a sign.
- Show loading, unavailable, unsupported-channel, and playback-error states.
- Keep facial and non-manual grammar support explicit; do not imply it exists if the rig or asset lacks it.
- Use consistent camera framing and lighting across avatars so users can compare them.

## 9. Trust and safety language

Suggested product copy:

- “Recognizing supported signs” rather than “Translating everything.”
- “This result is uncertain” rather than silently guessing.
- “This phrase is not available in the approved sign library yet” rather than generating an unreviewed sign.
- “For important conversations, confirm the message with the signer or a qualified interpreter.”

## 10. Design validation checklist

- [ ] A first-time user can identify both communication modes.
- [ ] Camera/microphone activation is always intentional.
- [ ] Active capture is clearly visible.
- [ ] Switching modes stops the previous stream.
- [ ] Transcript is visible before speech output.
- [ ] Unsupported phrases never trigger invented signs.
- [ ] Primary actions work with keyboard and touch.
- [ ] Text scaling and contrast remain usable.
- [ ] Reduced-motion preference is respected.
- [ ] Avatar hands and face remain visible during playback.
- [ ] Error states explain what happened and how to recover.

## 11. Open design questions

- Which user group and real-world setting should the first pilot prioritize?
- Which exact ISL vocabulary will be approved for the first release?
- Should the initial communication experience be fully local, or can approved inference services be used?
- Which avatar(s) pass rig and signing validation for the first public demo?
- What language(s) should speech output support in addition to English?

## Related documents

- [System architecture](ARCHITECTURE.md)
- [Product requirements](PRD.md)
- [Project memory](MEMORY.md)
## Current implementation note

Communication Mode uses large text-labelled mode controls, 68–76px primary targets, live status announcements, high contrast, and a reduced-motion-safe static interface. Camera and microphone state is always stated in text.
