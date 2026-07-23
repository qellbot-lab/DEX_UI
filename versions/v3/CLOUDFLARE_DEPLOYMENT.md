# Cloudflare Pages deployment for V3

The existing `qell-alpha` Pages project keeps
`versions/v2/prototype` as its stable build root:

- On `main`, that directory contains the V2 entry point.
- On `v3`, its `src/main.jsx` is a thin adapter that imports the V3 entry point
  from `versions/v3/prototype`.
- Both branches use the standard Vite build and write to `dist`.

Git branches provide the version boundary. No environment-variable build
selector or cross-root build script is required.

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

On the `v3` branch, running `npm run build` inside
`versions/v2/prototype` must produce an asset containing
`v3-runtime-page` and `TEAM WORKFLOW`.

Every push to `v3` creates a new immutable deployment URL. The earlier
deployment URL continues to show the artifact that was built at that time.
