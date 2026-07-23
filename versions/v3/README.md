# QELL UI V3

V3 is isolated from the deployed V2 prototype.

- Branch: `v3`
- App root: `versions/v3/prototype`
- Direction: live historical-simulation operations board
- Default Alpha Team: five Agents
- V2 remains in `versions/v2/prototype` on `main`
- The existing Cloudflare project selects V2 or V3 from the Git branch

## Specifications

- Agent identity and copy system:
  [`AGENT_IDENTITY_AND_LANGUAGE.md`](AGENT_IDENTITY_AND_LANGUAGE.md)
- Runtime visual and interaction verification:
  [`prototype/design-qa.md`](prototype/design-qa.md)
- Branch-aware Cloudflare Pages configuration:
  [`CLOUDFLARE_DEPLOYMENT.md`](CLOUDFLARE_DEPLOYMENT.md)

## Local preview

```powershell
cd versions/v3/prototype
npm install
npm run dev -- --host 0.0.0.0 --port 4173 --strictPort
```

## Build

```powershell
npm run build
```
