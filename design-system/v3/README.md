# QELL Design System V3

Direction: **Quiet Trading Infrastructure / 静默交易基础设施**

## Files

- `qell-v3-tokens.css` — Primitive and semantic CSS tokens.
- `qell-v3-tokens.json` — Structured token source for design tooling.
- `component-lab.css` — Component Lab layout and component styles.
- `component-lab.html` — Foundations and core-component verification page.
- `pilots/home.html` — Homepage first-viewport pilot using Chinese draft content.
- `pilots/runtime.html` — Live-simulation first-viewport pilot using Chinese draft content.
- `pilots/agent-detail.html` — Two-screen Agent identity and strategy-system pilot.
- `pilots/team.html` — Two-screen Team composition and preflight-analysis pilot.
- `pilots/events.html` — Historical scenario library single-screen pilot.
- `pilots/marketplace.html` — Two-screen Agent marketplace and inspection pilot.
- `pilots/leaderboard.html` — Season ranking and reward-progress pilot.
- `pilots/result.html` — Two-screen settlement and post-mortem pilot.
- `pilots/pilot-shared.css` — Shared navigation, actions, labels, and utility styles.
- `pilots/agent-identity.css` — Institutional Agent Plate system; strategy codes identify role while color remains a runtime-state signal.
- `references/agent-identity-typographic-plate-reference.png` — Selected visual target for the institutional typographic identity direction.
- `previews/home-1440x900.png` — Homepage pilot reference render.
- `previews/runtime-1440x900.png` — Runtime pilot reference render.
- `previews/agent-detail-screen-1-1440x900.png` — Agent identity and performance viewport.
- `previews/agent-detail-screen-2-1440x900.png` — Agent strategy-system viewport.
- `previews/team-screen-1-1440x900.png` — Team composition viewport.
- `previews/team-screen-2-1440x900.png` — Team preflight-analysis viewport.
- `previews/events-1440x900.png` — Historical scenario library viewport.
- `previews/marketplace-screen-1-1440x900.png` — Agent marketplace viewport.
- `previews/marketplace-screen-2-1440x900.png` — Agent inspection viewport.
- `previews/leaderboard-1440x900.png` — Season ranking and rewards viewport.
- `previews/result-screen-1-1440x900.png` — Settlement summary viewport.
- `previews/result-screen-2-1440x900.png` — Post-mortem attribution viewport.

Project design context is stored in `../../.impeccable.md`.

## Preview

From the repository root:

```powershell
python -m http.server 4175 --bind 127.0.0.1
```

Open:

`http://127.0.0.1:4175/design-system/v3/component-lab.html`

Pilots:

- `http://127.0.0.1:4175/design-system/v3/pilots/home.html`
- `http://127.0.0.1:4175/design-system/v3/pilots/runtime.html`
- `http://127.0.0.1:4175/design-system/v3/pilots/agent-detail.html`
- `http://127.0.0.1:4175/design-system/v3/pilots/team.html`
- `http://127.0.0.1:4175/design-system/v3/pilots/events.html`
- `http://127.0.0.1:4175/design-system/v3/pilots/marketplace.html`
- `http://127.0.0.1:4175/design-system/v3/pilots/leaderboard.html`
- `http://127.0.0.1:4175/design-system/v3/pilots/result.html`

## Phase 1 Gate

Before starting the homepage and Runtime pilots, confirm:

- Typography feels restrained and premium rather than futuristic.
- Acid green is rare enough to remain meaningful.
- Surface hierarchy works without glass, glow, or decorative lines.
- Core data components feel like a real product rather than an image-generation concept.
- No purple-family color appears in the rendered UI.

## Agent Identity System

- **Agent Plate** is the compact typographic identifier used in lists, rosters, runtime records, and marketplace cards.
- **Identity Plate** is the expanded strategy identifier used in focused and detail views.
- Role is encoded by one institutional code family: `VAL`, `NAR`, `MOM`, `MAC`, `GRW`, `RSK`, and `QNT`.
- Acid, cyan, ember, and rose are not character colors. They indicate active, data, warning, and negative runtime states.
- Human portraits, geometric role glyphs, particle people, decorative glows, and animated “AI thinking” effects are intentionally excluded.
