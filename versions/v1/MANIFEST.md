# QELL UI — First Version Archive

Archive created: **2026-07-22**  
Archive policy: **copy-only snapshot; original files were not moved or changed**

Although the implementation folder was previously called `design-system/v3`, this archive names it **V1** because it represents the first complete product-wide UI attempt before the new visual-system redesign.

## Inventory

| Collection | Files | Purpose |
|---|---:|---|
| `code/design-system-v3/` | 38 | Component Lab, tokens, eight HTML pilots, CSS, twelve reference renders, identity reference, and design comparison evidence |
| `previews/ui-previews/` | 22 | Earlier generated screen set, screen map, discarded drafts, and eighteen Chinese UI previews |
| `content-reference/chinese-ui-drafts/` | 9 | Original purple Chinese UI drafts; content and product-flow authority for V2, never a visual-style authority |
| `documents/` | 3 | Design context, V1 planning document, and final design QA report |
| `qa/browser-snapshots/` | 19 | Browser DOM snapshots and console evidence from V1 verification |
| `qa/intermediate-renders/` | 12 | Intermediate screenshots and visual contact sheets used while evaluating V1 |
| `historical-backups/` | 1 | Earlier pre-Agent-identity ZIP snapshot |
| **Payload total** | **104** | Excludes this manifest and the checksum file |

## Integrity

- `CHECKSUMS.sha256` contains one SHA-256 entry for each of the 104 payload files.
- SHA-256 of `CHECKSUMS.sha256`: `EEC4329F913FE09BF45FED2D7E79093438F251C30ECFD1BB95D25C692AEE4848`
- Source-to-archive file counts and content hashes were verified for the design system, generated previews, Chinese drafts, browser snapshots, and intermediate renders.

## Source Mapping

| Archived path | Original path |
|---|---|
| `code/design-system-v3/` | `design-system/v3/` |
| `previews/ui-previews/` | `output/ui-previews/` |
| `content-reference/chinese-ui-drafts/` | `中文版UI草稿/` |
| `documents/.impeccable.md` | `.impeccable.md` |
| `documents/design-qa.md` | `design-qa.md` |
| `documents/QELL_DESIGN_SYSTEM_V3_PLAN.md` | `QELL_DESIGN_SYSTEM_V3_PLAN.md` |
| `qa/browser-snapshots/` | `.playwright-mcp/` |
| `qa/intermediate-renders/` | `.tmp/` |
| `historical-backups/qell-v3-pre-agent-identity-20260721-192334.zip` | `backups/qell-v3-pre-agent-identity-20260721-192334.zip` |

## V1 Scope

V1 implemented eight desktop product surfaces:

1. Home
2. Agent marketplace
3. Agent detail
4. Team builder
5. Historical event library
6. Simulation runtime
7. Settlement and post-mortem
8. Leaderboard

The HTML pilot set produced twelve `1440 × 900` verification renders. An earlier image-only exploration produced eighteen screen images across the same Chinese product flow.

## Known V1 Limitations

- Surface hierarchy relied too heavily on similarly styled bordered panels.
- Repeated grids and uniform component density reduced visual rhythm and focal hierarchy.
- The visual language remained materially behind the reference website despite passing technical QA.
- Page-to-page navigation was incomplete; several screens behaved as isolated pilots rather than one coherent product journey.
- The earlier image set contained style drift and discarded drafts that are preserved here only as process evidence.

## V2 Authority Rules

- **Content and flow authority:** the archived purple Chinese UI drafts.
- **Visual authority:** the live reference website, `Eryx风格/`, and `QELL_Frontend_Art_Pack/`.
- **V1 role:** evidence, lessons, and regression reference only.
- V2 must not copy the reference website's product content.
- Purple-family colors and blue-purple gradients remain prohibited unless the user explicitly changes that constraint.

