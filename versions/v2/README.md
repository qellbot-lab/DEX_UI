# QELL Chinese UI — Version 2

V2 is a high-fidelity, clickable frontend demo for the complete Chinese QELL product journey.

## Working Prototype

```powershell
cd E:\工作文件\code\DEX_UI\versions\v2\prototype
npm install
npm run dev
```

Default local preview: `http://127.0.0.1:4173/`

Production check:

```powershell
npm run build
```

## Routes

| Route | Page |
|---|---|
| `/` | 首页 |
| `/agents` | 选择角色 / 智能体广场 |
| `/agents/:id` | 智能体详情 |
| `/team` | 组建战队 |
| `/events` | 历史事件副本 |
| `/runtime` | 模拟盘直播 / 决策运行 |
| `/result` | 副本结算与归因 |
| `/leaderboard` | 排行榜 |

## Core Interaction State

The demo stores only presentation state in browser `localStorage`:

- selected Agent IDs;
- captain;
- selected historical event;
- temporary runtime controls.

There is no wallet connection, signature, deployment, transaction, identity token, or backend write.

## Source-of-Truth Rules

- Chinese page content and flow: `中文版UI草稿/`
- Visual hierarchy and system behavior: captured reference website evidence
- Secondary art evidence: `Eryx风格/` and `QELL_Frontend_Art_Pack/`
- Historical evidence only: `versions/v1/`

## Technical Stack

- React + React Router
- Motion for restrained route/section reveals
- Radix Tabs and Tooltip for accessible interaction primitives
- Recharts for deterministic data visualization
- Lucide for consistent interface icons
- Vite 6.4.3

## Directory Map

| Folder | Purpose |
|---|---|
| `prototype/` | working React application |
| `design-system/` | V2 tokens and component rules |
| `research/` | reference-site captures, source analysis, competitor baseline |
| `previews/final/` | 17 final 1440 × 900 screen captures |
| `qa/` | three audit rounds and final requirement verification |

## Final Status

- Build: pass
- Dependency audit: 0 known vulnerabilities
- Browser console: 0 errors / 0 warnings
- Desktop and mobile route audit: 8/8 pass
- Forbidden purple-family color scan: 0 matches in prototype source
