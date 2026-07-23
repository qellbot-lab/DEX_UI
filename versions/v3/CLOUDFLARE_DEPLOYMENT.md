# Cloudflare Pages deployment for V3

The existing `qell-alpha` Pages project uses one stable build root while its
branches select the appropriate prototype at build time:

- `main` builds V2 from `versions/v2/prototype`.
- `v3` builds V3 from `versions/v3/prototype`.
- Both targets write the final site to the configured `dist` directory.

The selector lives in
`versions/v2/prototype/cloudflare-build.mjs`. Cloudflare Pages injects
`CF_PAGES_BRANCH`; local QA can set `QELL_DEPLOY_TARGET=v3`.

## Existing project settings

| Field | Value |
| --- | --- |
| Project name | `qell-alpha` |
| Production branch | `main` |
| Root directory | `versions/v2/prototype` |
| Framework preset | `Vite` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | `20` |

No runtime environment variables are required for the current frontend demo.

## Verification

Cloudflare should print one of these lines near the start of the build:

```text
[qell-build] branch=main target=v2
[qell-build] branch=v3 target=v3
```

Every push to `v3` creates a new immutable deployment URL. The earlier
deployment URL continues to show the artifact that was built at that time.
