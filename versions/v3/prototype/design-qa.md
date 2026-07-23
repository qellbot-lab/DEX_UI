# V3 Runtime Design QA

## Visual truth

- Source video frame: `../../../.tmp/v3-video-analysis/frames/frame-05.jpg`
- Desktop implementation capture: `qa/runtime-v3-2094x1080.png`
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
- Document width: `2094px`; no horizontal document overflow.
- Document height after final compacting: `1080px`.
- Runtime controls bottom edge: `1067px`; the complete operating surface fits
  in the first viewport.

### Mobile — 390 × 844

- Five Agent cards remain visible.
- Document width: `375px`; no horizontal document overflow.
- Operations board receives its own horizontal scroll surface:
  `345px` viewport / `900px` content.
- Page height: `2835px`, providing a deliberate vertical reading order:
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

- Full runtime, controls and primary CTA fit at `2094 × 1080`.
- Five Agent identity colors are visually distinct and limited to ownership.
- No actionable P0, P1 or P2 findings remain.

## Remaining P3 observations

- Mobile users discover the workflow lanes through horizontal scrolling. A
  subtle one-time scroll affordance may be added after user testing.
- The source reference uses rounded avatar discs and elevated cards. V3
  intentionally replaces them with typographic staff identities and hard
  surfaces to preserve the QELL design language.

## Result

Passed.
