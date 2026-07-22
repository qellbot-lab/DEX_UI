# 03. UI Components And Patterns

## Global Navigation

Navigation should be fixed, dark, technical, and consistent across all product pages.

Required behavior:

- QELL logo on the left.
- Main links centered where practical.
- Product action on the right.
- No shifting when switching between pages.
- Do not use a different nav frame per route.

Recommended labels:

- `Home`
- `Team`
- `Leaderboard`
- `Market`
- `Runtime`

Button language:

- Before login: `Log In`
- After team creation: `Runtime`, `My Team`, or `Paper Trading`

## Panel System

Panels are the core QELL surface.

Default panel:

- Low or no border radius.
- Thin border.
- Dark translucent background.
- Header uses micro-label on the left and secondary state on the right.
- One main purpose per panel.

Panel header pattern:

```html
<div class="qell-panel-head">
  <span>Session Tape</span>
  <strong>Recent Decisions</strong>
</div>
```

Header rules:

- Left label can use acid green.
- Right label should usually be faint gray.
- Do not make both sides equally loud.

## Buttons

Primary action:

- Acid green fill.
- Near-black text.
- Uppercase.
- Tight letter spacing.

Secondary action:

- Transparent / dark fill.
- Thin border.
- White or muted text.

Danger / pause / close:

- Do not default to red unless it is destructive.
- Pause can use violet or muted border.
- Close position can be a small control, not a large exchange-style order button.

## Homepage Modules

Homepage first screen:

- Must communicate live Arena and leaderboard.
- Current pool should be visible early.
- Leaderboard is borderless or lightly framed.
- The first impression should be competition + infrastructure, not a plain landing page.

Homepage lower sections:

- `What is MAAI`
- `Engine`
- `Protocol`
- `Arena`
- `Benchmark`

Use scroll depth and background continuity. Avoid card-heavy SaaS blocks.

## Agent Marketplace

Marketplace should feel like picking specialized agents, close to MOBA hero selection, but still technical.

Agent card must include:

- Position role
- Agent name
- Rarity
- Short summary
- Tags / tools
- Optional particle identity

Hover preview:

- Should reveal skills, tools, config tendencies.
- Must sit above all nearby cards.
- Background must be opaque enough to avoid text overlap.

Do:

- Use rarity colors only on Agent cards and selection borders.
- Keep cards compact enough to show multiple choices.
- Use particle identity as a premium differentiator.

Don't:

- Let every card become a giant hero.
- Use too much rarity color in other pages.
- Make Builder feel like a form wizard.

## Team Builder

Builder route should behave like a team composition room.

Recommended structure:

- Position selection
- Agent Marketplace
- Hero/particle preview
- Team readiness / selected roster
- Trading Mode selection
- Team identity
- Final configuration

UX principle:

Users should feel they are assembling a team, not filling out settings.

## Runtime Dashboard

Runtime should be agent-native. Avoid making it feel like Binance, OKX, or a normal exchange terminal.

Core objects:

- Data source boxes
- Agent nodes
- Team core
- Signal / circuit connections
- Session Tape
- Exposure Field
- Position Lifecycle

Runtime page should answer:

- What is the team doing?
- Which data sources are being watched?
- Which agents are active?
- What is the current exposure state?
- What session decisions happened recently?

## Runtime Agent Map

Agent nodes should:

- Have clear borders.
- Sit around the Team Core naturally.
- Cover connection lines underneath.
- Show status in a richer way than plain text.
- Reveal processing details on hover.

Agent status examples:

- `Scanning`
- `Mapping`
- `Filtering`
- `Scoring`
- `Routing`

These should use small animated meter/glyph states rather than text alone.

## Data Source Box

Data source boxes are black-box modules.

Default state:

- Title only.
- Dark sealed box.
- Thin border.

Hover state:

- Pixel ripple or reveal.
- Internal data appears.
- Still compact.

Example:

- `Macro Signal Box`
- Contains sentiment, funding, volatility, BTC dominance, macro feed.
- User does not see every backend detail by default.

## Session Tape

Session Tape should use the original compact list style.

Required content:

- Session ID, e.g. `RT-0021`
- UTC timestamp with date, e.g. `2026-06-30 07:18 UTC`
- Market / timeframe
- Status
- Participating roles
- Result
- Short decision preview

Session detail should feel like entering a replay, not just refreshing the same dashboard.

## Exposure Field

Exposure Field is not an exchange position table.

It should show:

- Net unrealized PnL
- Markets synced
- Active exposure nodes
- Market
- Direction
- Status
- Team size
- Lightweight close action

Avoid:

- Orderbook style tables
- Too many entry/stop/size fields on the first Runtime view
- Huge close buttons
- Duplicated `Paper Book` language

## Position Lifecycle

Lifecycle is a compact timeline, not a huge panel.

Example:

- Opened
- Stop Adjusted
- Holding
- Close Ready

Design notes:

- Small square status points.
- Subtle glowing active point.
- Thin connecting rail.
- Compact type.

## Modal / Login

Login modal should be compact.

Required choices:

- Continue with Google
- Continue with Web3 Wallet

Wallet options:

- MetaMask
- OKX Wallet
- WalletConnect
- Privy bridge when configured

Do not over-explain Web3 login inside the modal.

## Footer

Footer should be sparse:

- QELL mark
- Legal links
- Social buttons
- Copyright
- Product tagline

Do not turn the footer into another marketing section.
