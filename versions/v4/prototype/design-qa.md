# V4 Runtime Design QA

## Scope

V4 preserves the V3 QELL visual system and replaces the synchronized mock tick
with independent, event-driven task and Agent lifecycles. The reference video
defines motion behavior only; QELL content, color semantics, type, surfaces and
navigation remain project-native.

## Desktop verification

### 1920 × 1080

- Runtime identifies itself with `data-runtime-version="v4"`.
- Five Agent roster cards, four workflow lanes, five reserved task slots per
  lane, five KPI cells, Activity Feed, K-line and portfolio state all render.
- Operations board remains fixed at `575px`.
- The page intentionally uses a short vertical scroll so the K-line preserves
  its vertical range.
- The cycle-progress rail is contained by Team Core and does not cover the
  footer controls.

### 1440 × 900

- Document width: `1425px` inside a `1440px` viewport.
- No page-level horizontal overflow.
- Operations board: `575px`, width `1385px`.
- The full control surface stays in the document flow and is reachable through
  the intentional vertical scroll.

## Mobile verification — 390 × 844

- Document width: `375px`; page-level horizontal overflow: none.
- Workflow lanes use their own horizontal scroll surface.
- Empty alert stage collapses to `0px` and does not create dead whitespace.
- Runtime applies the compact/reduced-motion class at `≤ 720px`.
- Task and Agent state changes remain functional while large shared-layout
  travel and repeated signal animations are disabled.
- Control buttons retain at least `54px` row height.

## Interaction verification

- Pause changed Runtime state to `PAUSED`.
- After a measured one-second hold, session time, Agent placement, lane task
  counts, decision, alert and position remained identical.
- Continue returned the state to `1× RUNNING`.
- Speed switched to `2×`; the session clock advanced faster in a measured
  one-second interval.
- Restart returned the clock to `09:30`, position to `68%`, initial lane counts
  to `05 / 05 / 04 / 02`, and preserved the selected playback speed.
- The data-source alert reached `handling`, assigned 达利欧 to recovery and
  resolved without changing panel geometry.
- At least one two-Agent collaboration was observed in the task board.
- K-line trade markers render as circular `B` and `S` signals.
- No new browser warnings or errors appeared after the repaired reload.

## Deterministic engine verification

`npm run verify:runtime` checks:

- two-Agent collaboration;
- independent task handoff;
- alert open, handling, resolution and close;
- `S` hedge and `B` re-entry trades;
- position and ledger continuity across the 60-second cycle boundary;
- stable lane order during progress-only updates;
- fixed candle window and valid OHLC geometry.

## Iteration log

### Iteration 1 — first event-driven pass

- Added independent task, Agent, alert, activity, market and portfolio events.
- Added shared-layout Agent presence and task movement.
- Linked pause, speed and restart to one virtual clock.

### Iteration 2 — queue stability

Finding:

- Progress events refreshed `updatedAt`, causing an in-lane card to jump to the
  first position even though it had not changed stage.

Resolution:

- Progress updates preserve queue order. Recycle and lane-move events are the
  only events allowed to change task order.

### Iteration 3 — control overlay conflict

Finding:

- Team Core cycle progress was positioned against the full page. Its invisible
  hit area covered the Runtime controls and produced an overlong strip at the
  bottom of desktop screenshots.

Resolution:

- Team Core now establishes the positioning context.
- The progress rail is clipped inside that card and ignores pointer events.
- Pause, continue, speed and restart passed real browser interaction tests.

### Iteration 4 — compact motion

Finding:

- The empty mobile alert stage reserved `56px`.
- Mobile still ran full desktop shared-layout movement.

Resolution:

- Empty alert stages collapse completely.
- Mobile and user-requested reduced-motion modes preserve state changes while
  disabling spatial travel and repeated signal effects.

## Result

final result: passed
