import { escapeHtml } from './preview-access.js'

const palette = {
  carbon: '#050706',
  ink: '#090b0a',
  ivory: '#f2f5ec',
  fog: '#9fa79e',
  muted: '#788078',
  acid: '#b7ee5b',
  ember: '#eab56c',
  rose: '#e6789e',
  line: 'rgba(242,245,236,.16)',
}

function formatBeijingTime(timestamp) {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(timestamp))
}

function shell({ title, body, status = 200 }) {
  return new Response(`<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex,nofollow,noarchive">
    <meta name="theme-color" content="${palette.carbon}">
    <title>${escapeHtml(title)}</title>
    <style>
      :root {
        color-scheme: dark;
        font-family: "Microsoft YaHei", "PingFang SC", "Noto Sans SC", sans-serif;
        background: ${palette.carbon};
        color: ${palette.ivory};
      }
      * { box-sizing: border-box; }
      html, body { min-height: 100%; }
      body {
        margin: 0;
        min-width: 320px;
        background: ${palette.carbon};
      }
      button, input { font: inherit; }
      button { cursor: pointer; }
      :focus-visible { outline: 2px solid ${palette.acid}; outline-offset: 3px; }
      .gate {
        min-height: 100vh;
        display: grid;
        grid-template-rows: 64px 1fr 52px;
        padding: 0 clamp(20px, 5vw, 72px);
      }
      .gate__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid ${palette.line};
      }
      .gate__brand {
        font-size: 19px;
        font-weight: 700;
        letter-spacing: .16em;
      }
      .gate__brand i {
        display: inline-block;
        width: 10px;
        height: 10px;
        margin-inline-end: 5px;
        border: 2px solid ${palette.acid};
        font-style: normal;
      }
      .gate__mode {
        color: ${palette.muted};
        font: 600 10px/1 ui-monospace, SFMono-Regular, Consolas, monospace;
        letter-spacing: .14em;
      }
      .gate__main {
        display: grid;
        place-items: center;
        padding-block: 48px;
      }
      .gate__panel {
        width: min(100%, 440px);
        padding: clamp(28px, 5vw, 46px);
        border: 1px solid ${palette.line};
        background: ${palette.ink};
      }
      .gate__index {
        margin: 0 0 26px;
        color: ${palette.acid};
        font: 600 10px/1 ui-monospace, SFMono-Regular, Consolas, monospace;
        letter-spacing: .16em;
      }
      h1 {
        margin: 0;
        font-size: clamp(31px, 5vw, 44px);
        line-height: 1.08;
        letter-spacing: -.055em;
        font-weight: 650;
      }
      .gate__lede {
        margin: 18px 0 0;
        color: ${palette.fog};
        font-size: 13px;
        line-height: 1.8;
      }
      .gate__rule {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 20px;
        margin-top: 32px;
        padding-block: 12px;
        border-block: 1px solid ${palette.line};
        color: ${palette.muted};
        font-size: 11px;
      }
      .gate__rule b {
        color: ${palette.ivory};
        font: 600 11px/1.4 ui-monospace, SFMono-Regular, Consolas, monospace;
      }
      .gate__form { margin-top: 28px; }
      .gate__label {
        display: block;
        margin-bottom: 10px;
        color: ${palette.fog};
        font-size: 11px;
      }
      .gate__input {
        width: 100%;
        height: 54px;
        padding: 0 16px;
        border: 1px solid ${palette.line};
        border-radius: 0;
        background: ${palette.carbon};
        color: ${palette.ivory};
        font: 650 22px/1 ui-monospace, SFMono-Regular, Consolas, monospace;
        letter-spacing: .32em;
        transition: border-color .18s ease, background .18s ease;
      }
      .gate__input:hover { border-color: rgba(183,238,91,.42); }
      .gate__input:focus {
        border-color: ${palette.acid};
        background: #070a07;
      }
      .gate__error {
        margin: 12px 0 0;
        color: ${palette.rose};
        font-size: 11px;
        line-height: 1.55;
      }
      .gate__submit {
        width: 100%;
        height: 46px;
        margin-top: 18px;
        border: 1px solid ${palette.acid};
        border-radius: 0;
        background: transparent;
        color: ${palette.acid};
        font-size: 12px;
        font-weight: 700;
        transition: background .18s ease, color .18s ease;
      }
      .gate__submit:hover { background: ${palette.acid}; color: #071006; }
      .gate__submit:disabled { cursor: wait; opacity: .55; }
      .gate__footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-top: 1px solid ${palette.line};
        color: ${palette.muted};
        font: 500 9px/1 ui-monospace, SFMono-Regular, Consolas, monospace;
        letter-spacing: .1em;
      }
      .gate__signal {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .gate__signal::before {
        content: "";
        width: 5px;
        height: 5px;
        background: ${palette.acid};
      }
      .gate__expired { text-align: left; }
      .gate__expired .gate__index { color: ${palette.ember}; }
      .gate__expired h1 {
        white-space: nowrap;
        font-size: clamp(30px, 4.5vw, 46px);
      }
      @media (max-width: 520px) {
        .gate { grid-template-rows: 58px 1fr 46px; padding-inline: 16px; }
        .gate__panel { padding: 28px 22px; }
        .gate__mode, .gate__footer span:last-child { display: none; }
      }
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after { transition-duration: .01ms !important; }
      }
    </style>
  </head>
  <body>${body}</body>
</html>`, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
    },
  })
}

function frame(content) {
  return `<div class="gate">
    <header class="gate__header">
      <div class="gate__brand"><i aria-hidden="true"></i>QELL.</div>
      <div class="gate__mode">PRIVATE PREVIEW</div>
    </header>
    <main class="gate__main">${content}</main>
    <footer class="gate__footer">
      <span class="gate__signal">TEMPORARY ACCESS</span>
      <span>QELL / PREPDEX</span>
    </footer>
  </div>`
}

export function renderLoginPage({
  returnPath,
  challenge,
  globalExpiresAt,
  message = '',
  status = 401,
}) {
  const safeReturnPath = escapeHtml(returnPath)
  const safeChallenge = escapeHtml(challenge)
  const error = message
    ? `<p class="gate__error" role="alert">${escapeHtml(message)}</p>`
    : ''

  const body = frame(`<section class="gate__panel" aria-labelledby="gate-title">
    <p class="gate__index">01 / ACCESS CONTROL</p>
    <h1 id="gate-title">输入预览凭证</h1>
    <p class="gate__lede">验证成功后，本次浏览窗口持续 40 秒。刷新页面不会重置计时。</p>
    <div class="gate__rule">
      <span>链接总期限</span>
      <b>${escapeHtml(formatBeijingTime(globalExpiresAt))} CST</b>
    </div>
    <form class="gate__form" method="post" action="/__preview/login">
      <input type="hidden" name="return" value="${safeReturnPath}">
      <input type="hidden" name="challenge" value="${safeChallenge}">
      <label class="gate__label" for="preview-code">四位访问密码</label>
      <input
        class="gate__input"
        id="preview-code"
        name="code"
        type="password"
        inputmode="numeric"
        pattern="[0-9]{4}"
        minlength="4"
        maxlength="4"
        autocomplete="one-time-code"
        aria-describedby="preview-error"
        required
        autofocus
      >
      <div id="preview-error">${error}</div>
      <button class="gate__submit" type="submit">验证并进入</button>
    </form>
  </section>`)

  return shell({ title: 'QELL — Private Preview', body, status })
}

export function renderExpiredPage() {
  return shell({
    title: 'QELL — Preview Expired',
    status: 410,
    body: frame(`<section class="gate__panel gate__expired">
      <p class="gate__index">WINDOW CLOSED</p>
      <h1>预览期限结束 🐶</h1>
      <p class="gate__lede">想看再联系我</p>
    </section>`),
  })
}

export function renderConfigurationError() {
  return shell({
    title: 'QELL — Preview Unavailable',
    status: 503,
    body: frame(`<section class="gate__panel gate__expired">
      <p class="gate__index">CONFIGURATION HOLD</p>
      <h1>预览暂不可用</h1>
      <p class="gate__lede">请联系提供者检查访问配置。</p>
    </section>`),
  })
}
