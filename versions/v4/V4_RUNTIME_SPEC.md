# QELL Runtime V4

## Objective

V4 turns the historical-simulation Runtime into an event-driven operations
surface. Tasks, Agents, market data, portfolio state, decisions, alerts and
activity logs share one deterministic clock, while each entity still owns an
independent lifecycle.

V3 remains frozen on branch `v3` and tag `v3-runtime-final-20260724`.

## Motion model

- The virtual scenario clock advances through `requestAnimationFrame`.
- UI state is committed every 80ms to avoid rendering on every physical frame.
- Pause freezes the virtual clock, market samples, task events, Agent events,
  alerts, activity, decisions and portfolio state together.
- Speed cycles through `1×`, `2×` and `4×`.
- Restart rebuilds the deterministic initial state without changing the chosen
  playback speed.
- The 60-second scenario cycle repeats its event script without globally
  resetting portfolio or workflow state.

## Independent lifecycles

### Task

`recycle → progress → move → review → execute`

Only recycle and lane-move events change queue order. Progress updates preserve
the current card position.

### Agent

`assign → work/review/incident → release → reassign`

An Agent is independent from task ownership. Two or three Agents can occupy one
task, and one Agent can relocate between tasks without resizing the board.

### Alert

`error → handling → resolved → close`

The overlay is taken out of layout flow on desktop and is a compact sticky
surface on mobile. It never pushes the workflow or blocks the controls.

### Market and portfolio

- Candles evolve continuously between scheduled events.
- Trade events add circular `B` or `S` markers.
- Position, risk, paper assets, Alpha and the equity trace are linked to the
  same ledger.
- Team Core copy changes only on explicit decision events.

## Fixed geometry

- Desktop operations board: 575px.
- Four workflow lanes, five reserved task slots per lane.
- Activity Feed: five visible rolling rows.
- Agent Presence Dock: two visible collaborators plus an overflow count.
- Overflow and exit animations use transform and opacity; no layout-height
  mutation is allowed.

## Responsive motion

- Desktop (`> 720px`) uses shared-layout task and Agent movement.
- Compact view (`≤ 720px`) keeps all state transitions and controls while
  removing large spatial movement and repeated signal animation.
- `prefers-reduced-motion` follows the same reduced-motion path.
- The dense workflow receives an internal horizontal scroll surface; the page
  itself has no horizontal overflow.

## Semantic color

- Acid: live, positive, completed, selected action.
- Cyan: market data, analysis, system recovery.
- Ember: execution, waiting, caution.
- Rose: risk, failure, interruption.
- Five Agent identity colors remain local ownership signals and do not replace
  the product status palette.

## Deployment

Cloudflare keeps `versions/v2/prototype` as the project root. On branch `v4`,
that stable entry imports `versions/v4/prototype/src/main.jsx`. This lets V4
deploy as a branch preview without changing the production V3 rollback point.
