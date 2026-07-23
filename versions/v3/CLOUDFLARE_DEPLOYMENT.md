# Cloudflare Pages deployment for V3

V2 remains deployed from `main`. Create a second Pages project for V3 so both
versions can be reviewed independently.

## Recommended settings

| Field | Value |
| --- | --- |
| Project name | `qell-alpha-v3` |
| Production branch | `v3` |
| Root directory | `versions/v3/prototype` |
| Framework preset | `Vite` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | `20` |

No runtime environment variables are required for the current frontend demo.

## Version boundary

- Existing V2 Pages project continues to follow `main`.
- V3 Pages project follows `v3`.
- Do not repoint the existing V2 project to `v3`.
