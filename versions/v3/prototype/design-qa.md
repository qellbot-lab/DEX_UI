# V3 Runtime Design QA

## Visual truth

- Source video frame: `../../../.tmp/v3-video-analysis/frames/frame-05.jpg`
- Desktop implementation capture: `qa/runtime-v3-2094x1080.png`
- K-line proportion capture: `qa/runtime-v3-kline-fixed-viewport.png`
- Fixed workflow capture: `qa/runtime-v3-workflow-fixed-2094x1080.png`
- Mobile implementation capture: `qa/runtime-v3-mobile-390x844.png`
- Side-by-side comparison: `qa/runtime-v3-source-comparison.jpg`

The source frame establishes the operational composition: fixed Agent roster,
multi-stage task board, activity rail, live market context and top-level KPIs.
The implementation retains that hierarchy while applying QELL's hard-edged,
low-glow institutional visual system.

## Viewport verification

### Desktop — 2094 × 1080

- Five Agent cards rendered.
- Six live task cards rendered across four workflow lanes.
- Document content width: `2079px`; no horizontal document overflow.
- Operations board height: `575px` at every tested task-migration phase.
- Market strip document position: `795px` at every tested phase.
- The operations board remains complete in the first viewport. The expanded
  market strip continues below it with a short intentional scroll, preserving
  the K-line's vertical range instead of compressing it into a status ribbon.

### Mobile — 390 × 844

- Five Agent cards remain visible.
- Document width: `375px`; no horizontal document overflow.
- Operations board receives its own horizontal scroll surface:
  `345px` viewport / `900px` content.
- Page height: `2768px`, providing a deliberate vertical reading order:
  scenario → KPIs → team → workflow → activity → market → controls.

## Interaction verification

- Pause freezes session time, market price, position and Team Core decision
  immediately.
- Continue resumes all linked runtime values.
- Speed changes from `1×` to `2×`; session time advanced eight simulated
  minutes in the measured 1.9-second interval.
- Selecting `回测相关性突变` focuses 西蒙斯 and updates `ACTIVE TASK`.
- Core click flow passed:
  `/ → /agents → /team → /events → /runtime → /result → /leaderboard`.
- Browser warning/error log after the route sweep: empty.

## Responsive and motion checks

- Task movement uses shared-layout transitions with transform/opacity-based
  timing.
- The first visible card in every non-empty lane carries the CRT running-state
  treatment. Overflow exits collapse vertically into a one-pixel bright line.
- Lane capacity is three cards on desktop; hidden task count is retained in the
  lane header rather than changing board geometry.
- Changing activity count uses five fixed slots and `contain: layout paint`;
  adjacent panels do not inherit feed-height changes.
- `prefers-reduced-motion` disables runtime animation and transition duration.
- Trade markers use text (`B` / `S`) inside fixed-size circular HTML overlays,
  so SVG aspect-ratio changes do not deform the circles.

## Comparison history

### Iteration 1

- P2: runtime controls extended below the target desktop viewport.
- P2: the global footer added unnecessary height to an operating-console route.

Resolution:

- Hide the global footer only while the V3 Runtime is mounted.
- Compact the runtime shell and lower strip while preserving all functions.

### Iteration 2

- Runtime controls and primary CTA remain directly reachable at desktop size.
- Five Agent identity colors are visually distinct and limited to ownership.
- No actionable P0, P1 or P2 findings remain.

### Iteration 3

- P2: the K-line was technically readable but appeared vertically flattened in
  a `145px` chart area.

Resolution:

- Expand the market strip from `200px` to `264px`.
- Give the chart a responsive `190–220px` plotting height.
- Measure the rendered chart with `ResizeObserver` and make the SVG view box
  follow that exact width and height. Axis labels, candle bodies and marker
  leaders no longer inherit horizontal or vertical stretching at any
  breakpoint.
- Restore the Runtime chart typography tokens locally so axis and current-price
  labels render at `9px` instead of falling back to the browser's `16px`
  default.
- Keep the short vertical scroll; chart geometry and trading signals take
  priority over forcing the entire console into a single viewport.

### Iteration 4

- P2: task migration changed a lane's content height and pushed the lower
  market section up and down.

Resolution:

- Fix the desktop operations board at `575px`.
- Reserve three visible task slots per lane; changing task count no longer
  changes the board or lower-section position.
- When a lane exceeds its visible capacity, older leading cards close in
  sequence with a vertical CRT collapse into a bright line, then disappear.
- The first visible task in each non-empty lane receives a restrained scan-line
  treatment so the active edge of every workflow stage remains identifiable.
- Below `1220px`, the board returns to natural height and horizontal lane
  scrolling to protect touch readability.

## Remaining P3 observations

- Mobile users discover the workflow lanes through horizontal scrolling. A
  subtle one-time scroll affordance may be added after user testing.
- The source reference uses rounded avatar discs and elevated cards. V3
  intentionally replaces them with typographic staff identities and hard
  surfaces to preserve the QELL design language.

## Result

Passed.
