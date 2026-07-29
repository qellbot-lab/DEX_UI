const STATUS_ENDPOINT = '/__preview/status'
const LOGIN_ENDPOINT = '/__preview/login'
const SYNC_INTERVAL_MS = 15_000

let timerRoot = null
let timerValue = null
let timerShell = null
let sessionRemainingAtSync = 0
let syncedAt = 0
let syncTimer = 0
let tickTimer = 0
let navigating = false

function returnPath() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`
}

function loginUrl(reason = 'session_expired') {
  const params = new URLSearchParams({
    reason,
    return: returnPath(),
  })
  return `${LOGIN_ENDPOINT}?${params.toString()}`
}

function navigateToGate(reason) {
  if (navigating) return
  navigating = true
  window.location.replace(loginUrl(reason))
}

function createTimer() {
  if (timerRoot) return

  timerRoot = document.createElement('div')
  timerRoot.id = 'qell-preview-session'
  timerRoot.setAttribute('aria-live', 'polite')
  timerRoot.setAttribute('aria-label', '本次预览剩余时间')

  const shadow = timerRoot.attachShadow({ mode: 'open' })
  shadow.innerHTML = `
    <style>
      :host {
        position: fixed;
        z-index: 2147483000;
        top: 60px;
        right: 22px;
        pointer-events: none;
      }
      .timer {
        display: inline-flex;
        align-items: center;
        gap: 9px;
        min-width: 112px;
        padding: 7px 9px;
        border: 1px solid rgba(183, 238, 91, .38);
        background: rgba(5, 7, 6, .92);
        color: #b7ee5b;
        opacity: .88;
        font: 650 11px/1 ui-monospace, SFMono-Regular, Consolas, monospace;
        letter-spacing: .1em;
        font-variant-numeric: tabular-nums;
        text-transform: uppercase;
        box-shadow: 0 0 14px rgba(183, 238, 91, .08);
        transition:
          color .2s ease,
          border-color .2s ease,
          box-shadow .2s ease,
          opacity .2s ease;
      }
      .timer::before {
        content: "";
        width: 5px;
        height: 5px;
        flex: 0 0 5px;
        background: currentColor;
      }
      .timer strong {
        margin-left: auto;
        color: currentColor;
        font-size: 14px;
        font-weight: 750;
        letter-spacing: .04em;
      }
      .timer.is-warning {
        color: #eab56c;
        border-color: rgba(234, 181, 108, .52);
        box-shadow: 0 0 16px rgba(234, 181, 108, .1);
        opacity: .94;
      }
      .timer.is-urgent {
        color: #e6789e;
        border-color: rgba(230, 120, 158, .64);
        box-shadow: 0 0 18px rgba(230, 120, 158, .14);
        opacity: 1;
        animation: preview-pulse 1s steps(2, end) infinite;
      }
      @keyframes preview-pulse {
        50% { opacity: .58; }
      }
      @media (max-width: 720px) {
        :host { top: 59px; right: 14px; }
        .timer {
          min-width: 104px;
          padding: 6px 8px;
          font-size: 10px;
        }
        .timer strong { font-size: 13px; }
      }
      @media (prefers-reduced-motion: reduce) {
        .timer { transition: none; }
        .timer.is-urgent { animation: none; }
      }
    </style>
    <span class="timer">
      <span>PREVIEW</span>
      <strong>00:40</strong>
    </span>
  `

  timerShell = shadow.querySelector('.timer')
  timerValue = shadow.querySelector('strong')
  document.body.append(timerRoot)
}

function formatRemaining(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function tick() {
  if (!timerRoot) return

  const elapsed = performance.now() - syncedAt
  const remaining = sessionRemainingAtSync - elapsed
  timerValue.textContent = formatRemaining(remaining)
  timerShell.classList.toggle('is-warning', remaining <= 20_000 && remaining > 10_000)
  timerShell.classList.toggle('is-urgent', remaining <= 10_000)

  if (remaining <= 0) {
    window.clearInterval(tickTimer)
    window.clearInterval(syncTimer)
    navigateToGate('session_expired')
  }
}

async function syncStatus() {
  try {
    const response = await fetch(STATUS_ENDPOINT, {
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })

    if (response.status === 401) {
      navigateToGate('session_expired')
      return
    }
    if (response.status === 410) {
      navigateToGate('preview_expired')
      return
    }

    const contentType = response.headers.get('Content-Type') ?? ''
    if (!response.ok || !contentType.includes('application/json')) return

    const status = await response.json()
    if (!status.active || !Number.isFinite(status.sessionExpiresAt) || !Number.isFinite(status.serverNow)) {
      navigateToGate('session_expired')
      return
    }

    sessionRemainingAtSync = Math.max(0, status.sessionExpiresAt - status.serverNow)
    syncedAt = performance.now()
    createTimer()
    tick()
  } catch {
    // Keep the last trusted deadline. The timer still closes the session locally.
  }
}

function start() {
  syncStatus()
  tickTimer = window.setInterval(tick, 250)
  syncTimer = window.setInterval(syncStatus, SYNC_INTERVAL_MS)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true })
} else {
  start()
}
