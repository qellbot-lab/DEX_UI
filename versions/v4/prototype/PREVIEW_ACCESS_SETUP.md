# QELL Temporary Private Preview

This access layer belongs only to `codex/v4.5-private-preview`. Do not merge it
into `codex/v4.5-goal-demo` or `v4`.

## Cloudflare Pages build

| Setting | Value |
| --- | --- |
| Project name | `qell-alpha-temp` |
| Production branch | `codex/v4.5-private-preview` |
| Framework preset | `Vite` |
| Root directory | `versions/v4/prototype` |
| Build command | `npm run build` |
| Build output directory | `dist` |

## D1 binding

1. Create a D1 database named `qell-preview-access`.
2. Open its SQL console and execute `migrations/0001_preview_access.sql`.
3. In the Pages project, open **Settings > Bindings > Add > D1 database**.
4. Set the variable name to `PREVIEW_DB` and select `qell-preview-access`.

The database stores only access-code slots, remaining-use counters, consumed
login challenges, and rate-limit counters. It never stores the access codes.

## Variables and encrypted secrets

Add these under **Settings > Variables and Secrets** before the final deploy.

Plain variables:

| Name | Example |
| --- | --- |
| `PREVIEW_ID` | `qell-v45-private-20260729-01` |
| `PREVIEW_EXPIRES_AT` | `2026-07-29T21:00:00+08:00` |
| `PREVIEW_SESSION_SECONDS` | `180` |

Encrypted secrets:

| Name | Value |
| --- | --- |
| `PREVIEW_CODE_1` | First four-digit access code |
| `PREVIEW_CODE_2` | Second four-digit access code |
| `PREVIEW_CODE_3` | Third four-digit access code |
| `PREVIEW_SESSION_SECRET` | A random secret of at least 32 characters |

Generate a signing secret locally without saving it to the repository:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Generate an ISO timestamp six hours from the current Beijing-local machine
time:

```powershell
(Get-Date).AddHours(6).ToString("o")
```

Select **Encrypt** for all four secrets. Cloudflare must redeploy after adding
or changing bindings and secrets.

## Runtime behavior

- Every access code can create at most two sessions for a given `PREVIEW_ID`.
- Every successful session lasts three minutes.
- Refreshing, route changes, and tabs in the same browser share the session.
- All successful logins land on `/runtime`.
- Five failed attempts from one client within ten minutes temporarily block
  further attempts.
- The global expiry overrides every active session and returns HTTP `410`.
- To issue a fresh link with fresh counters, use a new `PREVIEW_ID`.

## Verification

After deployment:

1. Open the Pages URL in a private browser window.
2. Confirm that the credential gate appears before any application asset.
3. Confirm that a successful login opens `/runtime`.
4. Confirm that `PREVIEW · 03:00` appears at the upper-right of every route.
5. Confirm that refresh does not reset the countdown.
6. Confirm that the third successful redemption of one code is rejected.
7. Confirm that an expired global window returns:
   `预览期限结束 🐶，想看再联系我`.
