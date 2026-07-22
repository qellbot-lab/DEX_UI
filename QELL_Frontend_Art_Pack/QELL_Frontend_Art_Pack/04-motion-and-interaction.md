# 04. Motion And Interaction

## Motion Philosophy

QELL motion should feel like live infrastructure. It should communicate state, signal, and system activity.

Motion should not become noise.

## Preferred Motion Types

### 1. Signal Flow Lines

Use for:

- Runtime agent communication
- Data source to agent connections
- Agent to Team Core routes

Behavior:

- Continuous flow.
- No visible stutter.
- Use low opacity base line plus brighter traveling pulse.
- Use a small number of thicker lines instead of many thin laggy lines.

### 2. Hover Reveal

Use for:

- Agent detail popover
- Data source black-box reveal
- Marketplace card preview

Behavior:

- Reveal content in-place or near the hovered item.
- Avoid covering the item being inspected.
- Background must be opaque enough to preserve readability.

### 3. Agent Status Glyphs

Use animated glyphs instead of text-only states.

Examples:

- Scanning: small radar sweep / oscillating dots
- Mapping: grid trace / small line matrix
- Filtering: gate movement / compression bars
- Scoring: score pips / metric ticks
- Routing: path pulse / arrow trace

### 4. Breathing Live States

Use for:

- Active lifecycle point
- Live system indicator
- Current runtime action

Correct breathing:

- Brightness fades up/down smoothly.
- Do not hard-switch colors.
- Use shadow intensity and opacity.

Example:

```css
@keyframes qell-breathe {
  0%, 100% {
    opacity: 0.52;
    filter: brightness(0.8);
    box-shadow: 0 0 6px rgb(var(--acid-rgb) / 0.12);
  }
  50% {
    opacity: 1;
    filter: brightness(1.35);
    box-shadow: 0 0 22px rgb(var(--acid-rgb) / 0.44);
  }
}
```

## Timing

| Motion | Duration |
| --- | --- |
| Hover border/color | `140ms - 180ms` |
| Hover reveal | `240ms - 360ms` |
| Agent magnet movement | `200ms - 550ms` |
| Line pulse | `2.8s - 5.6s` |
| Breathing light | `1.8s - 2.8s` |

## Performance Rules

- Do not animate layout properties such as width, height, top, left.
- Prefer `transform`, `opacity`, `filter`, and SVG stroke dash offsets.
- Avoid too many always-on animated particles on Runtime.
- If the page feels stuttery, reduce the number of lines before reducing quality of the main agent surface.
- Animate wrappers around SVGs rather than large SVG DOM groups when possible.
- Do not make every module pulse at once.

## Interaction Rules

### Navigation

- Page switching should not shift the top navigation.
- Avoid visible layout flash between `Market` and `Runtime`.

### Marketplace

- Agent card hover preview must not be clipped by parent containers.
- Cursor effects should activate only in focused builder/market contexts, not globally.

### Runtime

- Hovering an agent should reveal what the agent is processing.
- Hovering a data source should reveal the inside of the black box.
- Connection lines should remain visually behind agents.
- Agents should have solid enough backgrounds to cover lines underneath.

### Actions

- `Pause Team` should be accessible but not dominate the page.
- Adjusting team from Runtime should route to Builder/Market intentionally.
- Closing exposure should be visible but not styled like a retail exchange order button.

## Anti-Patterns

Avoid:

- Stuttering line animations.
- Too many tiny dotted routes.
- Color-switch blinking.
- Saturated glowing cards everywhere.
- Motion that competes with primary information.
- Particles in every panel.
