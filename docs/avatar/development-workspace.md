# AX-1 development workspace

The workspace is an engineering surface for AX-1, not the end-user communication platform. The avatar stage remains the primary visual element; the sidebar groups operational controls and observable runtime diagnostics.

## Components

- `features/avatar-viewer/AvatarViewer.tsx` owns the WebGL canvas, stable camera, optional signing-space grid, idle-only pointer input, frame-rate sampling, and WebGL fallback.
- `features/avatar-workspace/WorkspaceControls.tsx` contains semantic development controls. They are rendered only in Vite development mode; production mode displays a safe explanatory panel instead.
- `features/avatar-workspace/WorkspaceDiagnostics.tsx` presents asset state, bone mapping, rig state, FPS, controller state, playback state, and load errors as text rather than colour alone.

## Approval safety

The approved-sign registry is empty. Playback, pause, replay, and speed buttons remain disabled and explicitly explain why. The development expression selector is only a presentation preview; it cannot establish ISL grammar. Mouse tracking remains head-only and resets to neutral on pointer leave, blur, or explicit reset.

## Accessibility and test coverage

Controls use native buttons, labels, checkboxes, selects, focus-visible outlines, and text labels for status. CSS collapses the sidebar beneath the stage at tablet width and into one column at narrow mobile widths. Playwright covers the desktop ready state, keyboard focus, disabled approval-gated playback, narrow layout, and a query-triggered WebGL fallback. The fallback exists for testing and recovery only; it does not expose a production control.
