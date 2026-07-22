# 07. Assets And Source Map

## Pack Location

`/Users/wiggins/Documents/qell.ai/QELL_Frontend_Art_Pack`

## Fonts

Location: `assets/fonts/`

Included:

- `ChakraPetch-Bold.ttf`
- `ChakraPetch-BoldItalic.ttf`
- `ChakraPetch-Italic.ttf`
- `ChakraPetch-Light.ttf`
- `ChakraPetch-LightItalic.ttf`
- `ChakraPetch-Medium.ttf`
- `ChakraPetch-SemiBold.ttf`
- `Merkur-j147.otf`

Usage:

- Chakra Petch: primary UI.
- Merkur: QELL brand mark / logo moments only.

## Logos

Location: `assets/logos/`

Included:

- `qell-logo.svg`
- `qell-q-logo.svg`

Usage:

- `qell-q-logo.svg` is the compact mark.
- `qell-logo.svg` can be used where a fuller logo asset is preferred.

## Tokens

Location: `tokens/`

Included:

- `qell-theme.css`
- `qell-design-tokens.json`

Usage:

- Import CSS into a target frontend for immediate token availability.
- Use JSON for design tools, design-system mapping, or documentation import.

## Examples

Location: `examples/`

Included:

- `qell-panel-example.html`
- `color-swatch-board.html`

Usage:

- Open directly in browser to inspect typography, panel style, and token colors.

## Screenshots

Location: `screenshots/`

Included:

- `01-home-hero.jpg`
  - Homepage first viewport / live Arena language.
- `02-agent-marketplace.jpg`
  - Agent Marketplace / team composition aesthetic.
- `03-runtime-agent-map.jpg`
  - Runtime agent-native map and signal flow.
- `04-runtime-dock.jpg`
  - Runtime dock / Session Tape / Exposure Field / lifecycle.

## Source Files In Current Frontend

These are the current implementation references:

- `/Users/wiggins/Documents/qell.ai/Design.md`
- `/Users/wiggins/Documents/qell.ai/frontend/src/styles/global.css`
- `/Users/wiggins/Documents/qell.ai/frontend/src/styles/runtime-dashboard.css`
- `/Users/wiggins/Documents/qell.ai/frontend/src/pages/RuntimeDashboardPage.tsx`
- `/Users/wiggins/Documents/qell.ai/frontend/src/pages/AgentSelectPreview.tsx`
- `/Users/wiggins/Documents/qell.ai/frontend/src/pages/MarketingPage.tsx`
- `/Users/wiggins/Documents/qell.ai/frontend/src/pages/marketing/sections/TopNav.tsx`
- `/Users/wiggins/Documents/qell.ai/frontend/src/components/layout/ProductTopNav.tsx`
- `/Users/wiggins/Documents/qell.ai/frontend/src/components/agent-visuals/ParticleAgentVisual.tsx`

## Transfer Notes

If sending this package to another team:

1. Zip the entire `QELL_Frontend_Art_Pack` folder.
2. Keep folder structure unchanged.
3. Start with `README.md`.
4. Use `05-parent-project-migration-guide.md` for migration planning.
5. Use `06-qa-checklist.md` before showing migrated screens.
