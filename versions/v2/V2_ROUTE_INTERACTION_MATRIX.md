# V2 Route and Interaction Matrix

## Canonical Journey

`Home → Agent Marketplace → Agent Detail → Team Builder → Historical Events → Runtime → Result → Leaderboard`

Global navigation may jump between sections, but every page must preserve the primary forward path.

## Screen Strategy

Each “screen” is a natural viewport chapter inside one scrollable page, not an isolated poster.

| Route | Page chapters | Primary decision |
|---|---:|---|
| `/` | 3 | understand value and enter Agent discovery |
| `/agents` | 2 | choose an Agent or inspect details |
| `/agents/:id` | 2 | decide whether this Agent belongs in the team |
| `/team` | 2 | compose and validate the Alpha Team |
| `/events` | 2 | choose a historical stress-test scenario |
| `/runtime` | 2 | observe and control a simulation |
| `/result` | 2 | understand outcome and attribution |
| `/leaderboard` | 2 | compare team performance and progression |

## Route Details

### Home — `/`

**Chapter 1:** product proposition, featured team composition, primary CTA `探索智能体`.

**Chapter 2:** three product capabilities and a six-step journey rail, expressed with short verbs and one visual scenario line.

**Chapter 3:** selected historical events, leaderboard preview, reward progress, CTA `开始组队`.

Interactions:

- `探索智能体` → `/agents`
- featured Agent plate → `/agents/:id`
- selected event → `/events?event=<id>`
- leaderboard preview → `/leaderboard`
- `开始组队` → `/team`

### Agent Marketplace — `/agents`

**Chapter 1:** curated Agent field with search, role filters, sort, and selected-team dock.

**Chapter 2:** selected Agent inspection strip and alternate recommendations.

Interactions:

- role filter updates visible Agent set;
- search filters by name, code, and strategy;
- selecting a plate updates the inspection strip;
- `查看详情` → `/agents/:id`;
- `加入战队` adds the Agent, with maximum three;
- selected-team dock supports remove;
- `继续组队` → `/team`.

### Agent Detail — `/agents/:id`

**Chapter 1:** identity, strategy thesis, simulated return, risk, team fit, CTA.

**Chapter 2:** strategy DNA, suitable/unsuitable markets, partner recommendations, data sources.

Interactions:

- add/remove team;
- partner plate → partner detail;
- `加入并组队` → `/team`;
- `返回智能体广场` → `/agents`.

### Team Builder — `/team`

**Chapter 1:** three role desks, captain selection, team thesis, conflict view.

**Chapter 2:** readiness analysis, contribution balance, market fit, risk gates.

Interactions:

- select captain;
- remove and replace via marketplace;
- analysis tab changes readiness detail;
- `选择历史事件` enabled when at least two Agents are selected → `/events`.

### Historical Events — `/events`

**Chapter 1:** event shelf with category filters and compact market fingerprints.

**Chapter 2:** selected event story, objectives, difficulty, volatility, recommended team type.

Interactions:

- filter and event selection;
- selected event persists in the demo session;
- `进入模拟` → `/runtime`;
- `调整战队` → `/team`.

### Runtime — `/runtime`

**Chapter 1:** current event and PnL headline, compact market context, Agent decision tape as focal work surface.

**Chapter 2:** factor skills, subagent execution, position lifecycle, compressed market events.

Interactions:

- pause/resume simulation;
- timeline step selection updates active decision;
- factor/subagent selection updates explanation;
- speed control toggles `1× / 2×`;
- `完成模拟` → `/result`;
- no live order or wallet action.

### Result — `/result`

**Chapter 1:** final PnL, return, rank, points, performance curve, claim/archive action.

**Chapter 2:** contribution attribution, best/worst decision, lifecycle timeline, next actions.

Interactions:

- result tabs switch `结果 / 归因 / 回放`;
- `再试一次` → `/events`;
- `调整战队` → `/team`;
- `查看排行榜` → `/leaderboard`.

### Leaderboard — `/leaderboard`

**Chapter 1:** season state, ranking dimension, Top 8 field, selected team profile.

**Chapter 2:** personal rank trajectory, reward ladder, recent simulation history.

Interactions:

- period and ranking-dimension filters;
- ranking row selection updates profile;
- reward milestones expand in place;
- recent run → `/result`.

## Demo State

Use a React context persisted to `localStorage`:

- selected Agent IDs;
- captain ID;
- selected event ID;
- runtime paused/speed/active decision;
- last result state.

No identity, wallet, private data, network write, or transaction state is stored.

## Navigation Rules

- Header logo always returns home.
- Desktop global nav: `智能体 / 战队 / 历史副本 / 排行榜`.
- Contextual journey marker shows the current product stage without turning into a full wizard.
- Browser back/forward must work through React Router.
- Every primary CTA has a working destination or state change.
- Disabled states explain the requirement in visible helper text.
