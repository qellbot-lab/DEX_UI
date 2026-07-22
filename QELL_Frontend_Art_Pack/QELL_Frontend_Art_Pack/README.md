# QELL.AI Frontend Art Pack

Version: 2026-07-02  
Source project: `/Users/wiggins/Documents/qell.ai`  
Purpose: frontend visual system handoff for applying the current QELL.AI aesthetic to related products.

## What This Pack Contains

This folder is a portable UI / art direction package for QELL.AI.

- `01-brand-art-direction.md` explains the product-level visual language.
- `02-design-tokens.md` documents colors, typography, spacing, borders, shadows, and role tones.
- `03-ui-components.md` documents navigation, panels, cards, Marketplace, Runtime, Session Tape, and agent-native surfaces.
- `04-motion-and-interaction.md` documents animation principles, hover behavior, pulse lines, agent states, and performance limits.
- `05-parent-project-migration-guide.md` explains how to migrate another product into this visual system.
- `06-qa-checklist.md` is the visual QA checklist before shipping.
- `tokens/qell-theme.css` is a reusable CSS token file.
- `tokens/qell-design-tokens.json` is a structured token reference.
- `examples/qell-panel-example.html` is a lightweight standalone visual sample.
- `assets/fonts/` contains QELL typography files.
- `assets/logos/` contains the QELL logo assets.
- `screenshots/` is reserved for reference screenshots captured from the current product.

## One-Line Design Definition

QELL.AI should feel like dark agentic trading infrastructure: technical, live, competitive, Web3-native, and agent-native, without becoming a generic SaaS dashboard or a normal exchange trading panel.

## Core Visual Commitments

- Dark infrastructure background, not bright SaaS UI.
- Sharp technical panels, low radius, no soft rounded cards.
- High-contrast white typography with acid green, cyan, violet, amber, and rose as controlled system accents.
- Uppercase micro-labels and strong block headings.
- Agent-native runtime surfaces: show signal flow, team state, data boxes, and session records instead of exchange-style order tables.
- Use motion as a system signal, not decoration.
- Keep information density disciplined: the interface can feel powerful, but should not look crowded.

## Quick Start For Another Frontend Team

1. Copy `assets/fonts/` and `assets/logos/` into the target frontend.
2. Import `tokens/qell-theme.css` before product-level styles.
3. Apply `font-family: "Chakra Petch Local"` to product UI surfaces.
4. Use `Merkur` only for the primary QELL mark or large brand moments.
5. Rebuild global navigation, panels, cards, data boxes, and runtime modules using `03-ui-components.md`.
6. Run the QA checklist in `06-qa-checklist.md`.

## Design Source Of Truth

The current React frontend under `frontend/` is the live visual source of truth. This art pack is a distilled, portable layer for handoff and migration.
