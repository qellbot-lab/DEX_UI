# QELL Reference Site — Visual Reverse Engineering

## Evidence Base

The accepted `1440 × 900` captures are stored in `reference-site/`. Unstable captures from transition states are retained as evidence but excluded from visual judgment.

Measured and observed pages include landing, app home, builder, team, operations, runtime, result, leaderboard, simulations, and live runtime.

## What Creates the Reference Site's Premium Feel

### 1. Macro-to-micro scale contrast

The landing hero uses an extremely large display title while application pages move to a 44–58px focal title and 10–12px telemetry. The spread is intentional. V1 compressed all content into a similar mid-range scale, making every module feel equally important.

V2 response:

- use one dominant typographic event per viewport;
- allow important metrics to become visual objects, not just values inside cards;
- reduce secondary labels before reducing primary scale.

### 2. Open black stage before framed work surfaces

The reference rarely begins with a dashboard grid. It establishes an open dark stage, then introduces a single dominant work area and subordinate rails. The eye understands the scene before reading details.

V2 response:

- route hero/summary remains largely unboxed;
- complex data is delayed into a clearly bounded work surface;
- no section may start with six equally weighted cards.

### 3. Depth through material and shadow—not fake 3D

The site uses subtle contrast changes, long soft shadows, inset 1px highlights, and sparse active halos. Many surfaces are square and nearly flat, but they sit at different optical depths.

V2 response:

- define four surface levels;
- use long black shadows only on dominant work surfaces;
- use inset highlights on elevated or selected elements;
- never add arbitrary perspective, bevel, or 3D illustration.

### 4. Variable composition across routes

Builder, operations, result, and leaderboard do not repeat a generic three-column template. They reuse tokens and controls but arrange information according to the task.

V2 response:

- marketplace behaves like a curated catalog;
- detail behaves like an editorial profile;
- team behaves like a composition desk;
- events behave like a scenario library;
- runtime behaves like an operations theater;
- result behaves like a performance report;
- leaderboard behaves like a ranking field.

### 5. Precise edge treatment

Most primary surfaces have zero radius; selected controls occasionally use a rare 2px radius. Borders are continuous, low-contrast, and aligned. The sophistication comes from discipline rather than decorative linework.

V2 response:

- use `0` radius for surfaces and at most `2px` for compact controls;
- forbid corner brackets, broken lines, circuit traces, and ornamental hairlines;
- use one clear border instead of multiple decorative outlines.

## Reference Traits to Preserve

- carbon-black field and ivory typography;
- acid green for active state and main action;
- editorial hierarchy and extreme scale contrast;
- hard-edged surfaces;
- long, soft, almost invisible depth shadows;
- sparse use of cyan, ember, and rose as semantic signals;
- compact labels and data after the main judgment.

## Reference Traits to Improve

- remove all purple residue;
- raise contrast of overly faint text and rules;
- remove excessive particles/dot fields;
- replace generic AI theatrics with product-specific hierarchy;
- prevent dense builder/runtime panels from becoming visually flat;
- use a Chinese-first type system instead of applying a condensed Latin tech face everywhere.

## V1 Regression Checklist

V2 fails if any route returns to:

- a full viewport of identical bordered modules;
- identical card height and density across the page;
- decorative charts with no decision role;
- agent portraits or abstract role geometry;
- multiple equally loud CTAs;
- walls of fine text;
- narrow fine lines used as decoration;
- page-specific copy borrowed from the reference website.
