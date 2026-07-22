# QELL Chinese UI — V2 Design Brief

## 1. Objective

Create a clickable, desktop-first frontend demo for the complete Chinese QELL product journey. V2 must be materially more refined than V1 and the reference website in hierarchy, rhythm, clarity, and interaction completeness while remaining recognizably grounded in the reference site's visual system.

This is a visual frontend prototype. Backend integrations, authentication, wallet connection, signing, deployment, and live transactions are explicitly out of scope.

## 2. Authority Order

1. **Content and page-flow authority:** `中文版UI草稿/`
2. **Visual and layout authority:** `https://qell-ai.vercel.app/` and accepted screenshots in `research/reference-site/`
3. **Secondary visual evidence:** `Eryx风格/` and `QELL_Frontend_Art_Pack/`
4. **Regression evidence only:** `versions/v1/`

The reference website's product copy, feature inventory, and route content must not be imported into V2.

## 3. Product Promise

QELL lets users discover trading Agents, compose an Alpha Team, select a historical market event, observe the team's simulated decisions, review the result, and compare performance on the leaderboard.

The interface should feel like an institutional decision studio: calm enough to trust, differentiated enough to remain memorable, and legible enough to support judgment.

## 4. Visual Thesis

### Institutional Alpha Studio

V2 combines editorial composition with trading-instrument precision.

- **Editorial scale:** oversized headlines and key metrics create decisive focal points.
- **Instrument precision:** active tools, charts, inputs, and stateful objects use crisp, pixel-aligned framing.
- **Open stage:** major sections are allowed to breathe; not every piece of content becomes a card.
- **Material hierarchy:** background, section bands, work surfaces, inset rails, and active controls use distinct contrast and shadow behavior.
- **Page-specific composition:** every page shares the system but not the same grid.

Hierarchy is created through scale, space, material, density, and state—not by converting flat UI into decorative 3D.

## 5. Non-negotiable Constraints

- No purple, violet, magenta, indigo, lavender, lilac, mauve, or blue-purple gradients.
- No generic AI HUD, cyberpunk terminal, Web3 casino, random circuits, particles, or heavy glow.
- No homogeneous grid of identical bordered cards.
- No full-screen AI-generated UI image.
- No particle portraits, human faces, geometric role glyphs, or role-shape taxonomy.
- No wallet connection, signature, transaction, deployment, or backend write.
- Chinese draft content is preserved semantically but aggressively distilled for readability.

## 6. Agent Identity System

Agents are represented through institutional typographic identity plates.

Each plate combines:

- Chinese name and compact Latin/coded identifier
- role and strategy family
- one performance metric and one risk metric
- a calibrated rule or registration line
- an optional team status marker

Identity differences come from typography, number placement, density, and material—not decorative icons.

Example codes:

- `VAL-01` — 巴菲特 / 价值
- `NAR-02` — 木头姐 / 叙事
- `MOM-03` — 利弗莫尔 / 动量
- `MAC-04` — 达利欧 / 宏观
- `GRW-05` — 林奇 / 成长
- `RSK-06` — 塔勒布 / 风险

## 7. Surface Hierarchy

| Level | Role | Visual behavior |
|---|---|---|
| L0 Atmosphere | page background | near-black, subtle topographic light, no container |
| L1 Editorial band | page chapter | open spacing, large type, optional ruled baseline |
| L2 Work surface | primary interactive area | deeper material, 1px quiet border, long soft shadow |
| L3 Instrument inset | chart rail, list, detail strip | closer contrast, dense but bounded, no broad shadow |
| L4 Active object | selected item, CTA, active tab | acid accent, strong contrast, restrained halo |

## 8. Color Semantics

| Token | Role |
|---|---|
| Carbon `#050706` | global canvas |
| Ink `#090B0A` | primary surface |
| Graphite `#111411` | inset surface |
| Ivory `#F2F5EC` | primary text |
| Fog `#9CA49B` | secondary text |
| Acid `#B7EE5B` | active, live, positive, primary action |
| Cyan `#6DE3D3` | data, system, structure |
| Ember `#EAB56C` | execution, caution, pending |
| Rose `#E6789E` | risk, drawdown, negative |
| Steel `#AEB6B0` | quant, neutral intelligence |

Color behaves as a signal layer, never as decorative confetti.

## 9. Typography

- Chinese headings/body: system Chinese stack (`Microsoft YaHei`, `PingFang SC`, `Noto Sans SC`, sans-serif).
- Latin labels, numeric telemetry, agent codes: authorized local Chakra Petch.
- Brand mark: authorized QELL/Merkur asset.
- Headlines use decisive scale and compact line-height.
- Chinese body copy stays human-readable; no condensed tech font for paragraphs.

## 10. Motion

- One orchestrated entrance sequence per route.
- Hover and selection transitions use opacity and transform, 160–240ms.
- Chart transitions may use 300–450ms.
- No ambient perpetual motion except a meaningful live indicator.
- Respect `prefers-reduced-motion`.

## 11. Completion Standard

V2 is complete only when:

- all eight routes work as one coherent journey;
- every core CTA, filter, tab, selection, and state transition responds;
- the visual system is demonstrably closer to the reference site's hierarchy than V1;
- the prototype contains no purple-family values or wallet operations;
- three evidence-backed audit rounds are documented and their fixes applied.
