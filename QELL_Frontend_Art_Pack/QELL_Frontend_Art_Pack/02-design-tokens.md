# 02. Design Tokens

## Token Philosophy

QELL tokens are built around a dark infrastructure base with controlled signal accents. Use color to indicate system meaning, not decoration.

## Core Colors

| Token | Hex / Value | Usage |
| --- | --- | --- |
| `--bg` | `#050706` | Main app background |
| `--ink` | `#080909` | Deep panel inner background |
| `--surface` | `rgba(9, 12, 12, 0.78)` | Default translucent panel |
| `--surface-strong` | `rgba(8, 10, 10, 0.96)` | Modal / focused panel |
| `--line` | `rgba(224, 232, 218, 0.14)` | Default border / divider |
| `--text` | `#f2f5ec` | Primary text |
| `--muted` | `rgba(242, 245, 236, 0.68)` | Body text |
| `--faint` | `rgba(242, 245, 236, 0.38)` | Metadata / inactive labels |
| `--acid` | `#b7ee5b` | Primary QELL action / live state |
| `--cyan` | `#6de3d3` | System / data / info |
| `--violet` | `#8c6fb0` | Secondary intelligence / quant |
| `--violet-strong` | `#a488d0` | Active violet accent |
| `--violet-soft` | `#c8b6e4` | Soft violet labels |
| `--ember` | `#eab56c` | Execution / caution / amber state |
| `--rose` | `#e6789e` | Catalyst / negative / drawdown |

## RGB Tokens

Use these for `rgb(var(--token-rgb) / alpha)` syntax:

| Token | RGB |
| --- | --- |
| `--acid-rgb` | `183 238 91` |
| `--cyan-rgb` | `109 227 211` |
| `--violet-rgb` | `140 111 176` |

## Role Color System

| Role | Color | Meaning |
| --- | --- | --- |
| Macro | Acid green | Macro event / regime / risk appetite |
| Structure | Cyan | Market structure / trend map |
| Catalyst | Rose | Narrative / headline / sentiment pressure |
| Quant | Violet | Model scoring / signal quality |
| Execution | Amber | Sizing / stop routing / order policy |

## Rarity Colors

Use rarity colors only in Agent Marketplace / selection contexts. Do not apply rarity color heavily across Runtime.

| Rarity | RGB | Suggested Color |
| --- | --- | --- |
| Core | `205 213 210` | Neutral white-gray |
| Rare | `88 244 221` | Cyan |
| Epic | `164 136 208` | Violet |
| Legendary | `255 180 79` | Amber |
| Experimental | `255 111 159` | Rose |

## Typography

### Primary UI Typeface

`Chakra Petch Local`

Use for:

- Navigation
- UI labels
- Panels
- Agent cards
- Runtime dashboard
- Marketplace
- Buttons
- Metrics

### Brand / Logo Typeface

`Merkur`

Use only for:

- Primary QELL mark
- Large brand lockup moments
- Do not use as body/UI font.

### Font Face Reference

```css
@font-face {
  font-family: "Chakra Petch Local";
  src: url("./assets/fonts/ChakraPetch-Medium.ttf") format("truetype");
  font-weight: 500;
}
```

Include the available weights:

- Light
- Medium
- SemiBold
- Bold
- Italic variants where useful

## Type Scale

| Use | Size | Weight | Notes |
| --- | --- | --- | --- |
| Micro label | `10px - 11px` | `780 - 840` | Uppercase, letter spacing `0.16em - 0.24em` |
| Body | `14px - 17px` | `400 - 500` | Muted color, relaxed line-height |
| Panel title | `18px - 28px` | `720 - 840` | Uppercase when short |
| Metric | `22px - 44px` | `800 - 860` | Use only for primary panel metric |
| Hero title | `clamp(46px, 5vw, 96px)` | `820 - 880` | Tight line-height, uppercase |

## Layout And Spacing

| Token | Value | Usage |
| --- | --- | --- |
| Shell width | `min(1600px, calc(100vw - 32px))` | Runtime shell |
| Marketing max width | `1180px` | Homepage content |
| Panel gap | `12px - 18px` | Dashboard modules |
| Panel padding | `14px - 24px` | Dense technical panels |
| Nav height | `72px - 96px` | Fixed top navigation |
| Low radius | `0px - 4px` | Default surfaces |

## Border Rules

Default:

```css
border: 1px solid rgba(244, 245, 238, 0.12);
```

Active:

```css
border-color: rgb(var(--acid-rgb) / 0.52);
```

Role active:

```css
border-color: rgb(var(--tone-rgb) / 0.48);
```

Do not use thick borders unless it is a deliberate retro terminal treatment.

## Shadows And Glow

Default panel:

```css
box-shadow:
  inset 0 1px 0 rgba(244, 245, 238, 0.08),
  inset 0 -1px 0 rgba(0, 0, 0, 0.32),
  0 22px 64px rgba(0, 0, 0, 0.18);
```

Active glow:

```css
box-shadow: 0 0 28px rgb(var(--tone-rgb) / 0.16);
```

Use glow sparingly. Glow should imply live state, not decorate every component.

## Background Rules

Recommended background:

```css
background:
  radial-gradient(circle at 18% 8%, rgb(var(--cyan-rgb) / 0.07), transparent 34%),
  radial-gradient(circle at 80% 18%, rgb(var(--violet-rgb) / 0.06), transparent 34%),
  linear-gradient(180deg, rgba(8, 12, 11, 0.9), rgba(4, 7, 6, 0.91) 70%, rgba(2, 3, 3, 0.97));
```

Avoid:

- Decorative blobs
- Bright gradients
- Purple-green overlay filters on animated background
- Beige, blue SaaS, or warm brown themes

## Motion Timing

| Token | Value | Usage |
| --- | --- | --- |
| `--ease-heavy` | `cubic-bezier(0.16, 1, 0.3, 1)` | Major UI transitions |
| Quick hover | `140ms - 180ms ease` | Border/color changes |
| Panel reveal | `240ms - 360ms` | Data box hover/reveal |
| Ambient line pulse | `2.8s - 5.6s linear infinite` | Runtime connection lines |

## CSS Source

Use `tokens/qell-theme.css` as the portable token file.
