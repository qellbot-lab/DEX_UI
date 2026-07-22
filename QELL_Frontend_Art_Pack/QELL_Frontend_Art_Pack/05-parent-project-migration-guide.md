# 05. Parent Project Migration Guide

This guide explains how to migrate another product into the QELL visual standard.

## Phase 1: Foundation

1. Copy fonts:
   - `assets/fonts/ChakraPetch-*.ttf`
   - `assets/fonts/Merkur-j147.otf`
2. Copy logos:
   - `assets/logos/qell-logo.svg`
   - `assets/logos/qell-q-logo.svg`
3. Import `tokens/qell-theme.css`.
4. Apply the dark background and typography globally.

Goal: the product immediately feels like the same family.

## Phase 2: Navigation Unification

Replace old navigation with QELL-style navigation:

- Logo left.
- Product links centered.
- Account / CTA right.
- Fixed or consistently positioned.
- No per-page nav dimensions.

QA:

- Switching pages does not shift the nav.
- Button heights are consistent.
- Logo does not resize between routes.

## Phase 3: Surface Migration

Replace generic cards with QELL panels:

- Low radius.
- Thin border.
- Dark translucent background.
- Micro-label header.
- Controlled accent line.

Common replacements:

- SaaS card -> QELL panel.
- Info table -> Signal box.
- Exchange position card -> Exposure field.
- Activity list -> Session tape.
- Settings form -> Configuration stack.

## Phase 4: Color Migration

Map old colors into QELL tokens:

| Old Meaning | QELL Token |
| --- | --- |
| Primary CTA | `--acid` |
| System info | `--cyan` |
| Secondary / intelligence | `--violet` |
| Caution / execution | `--ember` |
| Negative / catalyst / drawdown | `--rose` |
| Border | `--line` |
| Background | `--bg` / `--ink` |

Rule:

Do not recolor every component with accent colors. Keep most UI dark and use accents as semantic signals.

## Phase 5: Page-Specific Migration

### Landing / Homepage

Keep:

- Strong first viewport.
- Live leaderboard / proof of activity.
- Technical background.
- Product narrative sections.

Remove:

- Generic SaaS hero cards.
- Decorative blobs.
- Overly explanatory copy.

### Marketplace / Agent Selection

Add:

- Agent cards.
- Rarity accents.
- Particle / agent identity when relevant.
- Hover preview.

Keep:

- User can scan many agents quickly.
- Marketplace feels game-like but technical.

### Runtime / Dashboard

Replace exchange-like screens with:

- Agent map.
- Data source boxes.
- Team core.
- Session tape.
- Exposure field.
- Position lifecycle.

Do not make a K-line chart the center of the product unless the page is explicitly a chart analysis view.

## Phase 6: Interaction Migration

Add:

- Hover reveals.
- Breathing live indicators.
- Signal flow lines where they explain relationships.
- Compact action states.

Remove:

- Heavy tooltips that cover primary content.
- Repeated explanation blocks.
- Full-screen onboarding overlays.

## Phase 7: QA

Before delivery:

- Run the checklist in `06-qa-checklist.md`.
- Check desktop and narrow viewport.
- Verify top nav stability between routes.
- Confirm no text overlap.
- Confirm no component feels like a generic exchange module unless intentional.

## Recommended Rollout

1. Apply tokens and typography.
2. Replace navigation.
3. Replace panel/card system.
4. Migrate homepage.
5. Migrate dashboard.
6. Migrate interactive states.
7. Add agent-native runtime expression.

Do not start with advanced particles. The base visual language must work without them.
