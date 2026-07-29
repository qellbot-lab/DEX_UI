import {
  MAX_CODE_USES,
  MAX_FAILED_ATTEMPTS,
  clearSessionCookie,
  createLoginChallenge,
  createSessionCookie,
  createSessionToken,
  fingerprintValue,
  getAttemptWindow,
  getClientAddress,
  getSessionSeconds,
  normalizeAccessCode,
  parseGlobalExpiry,
  readCookie,
  sanitizeReturnPath,
  secureCodeMatch,
  verifyLoginChallenge,
  verifySessionToken,
} from './_lib/preview-access.js'
import {
  renderConfigurationError,
  renderExpiredPage,
  renderLoginPage,
} from './_lib/preview-pages.js'

const PREVIEW_PREFIX = '/__preview'
const LOGIN_LANDING_PATH = '/runtime'
const REQUIRED_SECRET_LENGTH = 32

function json(body, status = 200, extraHeaders = {}) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'private, no-store, max-age=0',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
      ...extraHeaders,
    },
  })
}

function redirect(location, cookie) {
  const headers = new Headers({
    Location: location,
    'Cache-Control': 'private, no-store, max-age=0',
  })
  if (cookie) headers.append('Set-Cookie', cookie)
  return new Response(null, { status: 303, headers })
}

function isConfigured(env) {
  return Boolean(
    env.PREVIEW_DB
    && env.PREVIEW_ID
    && env.PREVIEW_EXPIRES_AT
    && env.PREVIEW_SESSION_SECRET?.length >= REQUIRED_SECRET_LENGTH
    && env.PREVIEW_CODE_1
    && env.PREVIEW_CODE_2
    && env.PREVIEW_CODE_3,
  )
}

async function ensureCodeRows(db, previewId, nowMs) {
  const statement = db.prepare(`
    INSERT OR IGNORE INTO preview_code_uses
      (preview_id, code_slot, remaining_uses, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `)

  await db.batch([1, 2, 3].map((slot) => (
    statement.bind(previewId, slot, MAX_CODE_USES, nowMs, nowMs)
  )))
}

async function readAttemptCount(db, previewId, clientKey, attemptWindow) {
  const row = await db.prepare(`
    SELECT failed_count
    FROM preview_login_attempts
    WHERE preview_id = ? AND client_key = ? AND attempt_window = ?
  `).bind(previewId, clientKey, attemptWindow).first()

  return Number(row?.failed_count ?? 0)
}

async function recordFailedAttempt(db, previewId, clientKey, attemptWindow, nowMs) {
  return db.prepare(`
    INSERT INTO preview_login_attempts
      (preview_id, client_key, attempt_window, failed_count, updated_at)
    VALUES (?, ?, ?, 1, ?)
    ON CONFLICT (preview_id, client_key, attempt_window)
    DO UPDATE SET
      failed_count = failed_count + 1,
      updated_at = excluded.updated_at
  `).bind(previewId, clientKey, attemptWindow, nowMs).run()
}

async function createLoginPage({
  env,
  nowMs,
  globalExpiresAt,
  returnPath,
  message = '',
  status = 401,
}) {
  const challenge = await createLoginChallenge({
    previewId: env.PREVIEW_ID,
    secret: env.PREVIEW_SESSION_SECRET,
    nowMs,
  })

  return renderLoginPage({
    returnPath,
    challenge,
    globalExpiresAt,
    message,
    status,
  })
}

async function getSession(request, env, nowMs, globalExpiresAt) {
  const token = readCookie(request)
  if (!token) return null

  return verifySessionToken({
    token,
    previewId: env.PREVIEW_ID,
    secret: env.PREVIEW_SESSION_SECRET,
    nowMs,
    globalExpiresAt,
  })
}

async function findCodeSlot(env, candidate) {
  const comparisons = await Promise.all([
    secureCodeMatch(candidate, env.PREVIEW_CODE_1),
    secureCodeMatch(candidate, env.PREVIEW_CODE_2),
    secureCodeMatch(candidate, env.PREVIEW_CODE_3),
  ])
  const index = comparisons.findIndex(Boolean)
  return index === -1 ? null : index + 1
}

async function handleLogin(context, config) {
  const { request, env } = context
  const url = new URL(request.url)

  if (request.method === 'GET' || request.method === 'HEAD') {
    const returnPath = sanitizeReturnPath(url.searchParams.get('return'))
    const session = await getSession(
      request,
      env,
      config.nowMs,
      config.globalExpiresAt,
    )
    if (session) return redirect(LOGIN_LANDING_PATH)

    const reason = url.searchParams.get('reason')
    const message = reason === 'session_expired'
      ? '本次 40 秒预览已结束，请使用仍有效的访问凭证。'
      : ''

    return createLoginPage({
      env,
      nowMs: config.nowMs,
      globalExpiresAt: config.globalExpiresAt,
      returnPath,
      message,
    })
  }

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { Allow: 'GET, HEAD, POST' },
    })
  }

  let formData
  try {
    formData = await request.formData()
  } catch {
    return createLoginPage({
      env,
      nowMs: config.nowMs,
      globalExpiresAt: config.globalExpiresAt,
      returnPath: '/',
      message: '请求格式无效，请重新输入访问凭证。',
      status: 400,
    })
  }

  const returnPath = sanitizeReturnPath(formData.get('return'))
  const challenge = await verifyLoginChallenge({
    token: formData.get('challenge'),
    previewId: env.PREVIEW_ID,
    secret: env.PREVIEW_SESSION_SECRET,
    nowMs: config.nowMs,
  })

  if (!challenge) {
    return createLoginPage({
      env,
      nowMs: config.nowMs,
      globalExpiresAt: config.globalExpiresAt,
      returnPath,
      message: '验证请求已经失效，请重新输入访问凭证。',
      status: 400,
    })
  }

  const clientKey = await fingerprintValue(
    env.PREVIEW_SESSION_SECRET,
    getClientAddress(request),
  )
  const attemptWindow = getAttemptWindow(config.nowMs)

  context.waitUntil(Promise.all([
    env.PREVIEW_DB.prepare(`
      DELETE FROM preview_login_nonces
      WHERE preview_id = ? AND expires_at < ?
    `).bind(env.PREVIEW_ID, config.nowMs).run(),
    env.PREVIEW_DB.prepare(`
      DELETE FROM preview_login_attempts
      WHERE preview_id = ? AND updated_at < ?
    `).bind(env.PREVIEW_ID, config.nowMs - 86_400_000).run(),
  ]))

  const attempts = await readAttemptCount(
    env.PREVIEW_DB,
    env.PREVIEW_ID,
    clientKey,
    attemptWindow,
  )

  if (attempts >= MAX_FAILED_ATTEMPTS) {
    return createLoginPage({
      env,
      nowMs: config.nowMs,
      globalExpiresAt: config.globalExpiresAt,
      returnPath,
      message: '尝试次数过多，请在下一时间窗口重试。',
      status: 429,
    })
  }

  const candidate = normalizeAccessCode(formData.get('code'))
  const codeSlot = candidate ? await findCodeSlot(env, candidate) : null

  if (!codeSlot) {
    await recordFailedAttempt(
      env.PREVIEW_DB,
      env.PREVIEW_ID,
      clientKey,
      attemptWindow,
      config.nowMs,
    )
    return createLoginPage({
      env,
      nowMs: config.nowMs,
      globalExpiresAt: config.globalExpiresAt,
      returnPath,
      message: '访问凭证无效或可用次数已经耗尽。',
      status: 401,
    })
  }

  const nonceFingerprint = await fingerprintValue(
    env.PREVIEW_SESSION_SECRET,
    challenge.nonce,
  )
  await ensureCodeRows(env.PREVIEW_DB, env.PREVIEW_ID, config.nowMs)

  const nonceInsert = env.PREVIEW_DB.prepare(`
    INSERT INTO preview_login_nonces
      (preview_id, nonce_fingerprint, expires_at, created_at)
    VALUES (?, ?, ?, ?)
  `).bind(
    env.PREVIEW_ID,
    nonceFingerprint,
    challenge.exp * 1000,
    config.nowMs,
  )
  const decrement = env.PREVIEW_DB.prepare(`
    UPDATE preview_code_uses
    SET remaining_uses = remaining_uses - 1, updated_at = ?
    WHERE preview_id = ? AND code_slot = ? AND remaining_uses > 0
  `).bind(config.nowMs, env.PREVIEW_ID, codeSlot)

  let results
  try {
    results = await env.PREVIEW_DB.batch([nonceInsert, decrement])
  } catch {
    return createLoginPage({
      env,
      nowMs: config.nowMs,
      globalExpiresAt: config.globalExpiresAt,
      returnPath,
      message: '该验证请求已经处理，请刷新后重试。',
      status: 409,
    })
  }

  if (Number(results?.[1]?.meta?.changes ?? 0) !== 1) {
    await recordFailedAttempt(
      env.PREVIEW_DB,
      env.PREVIEW_ID,
      clientKey,
      attemptWindow,
      config.nowMs,
    )
    return createLoginPage({
      env,
      nowMs: config.nowMs,
      globalExpiresAt: config.globalExpiresAt,
      returnPath,
      message: '访问凭证无效或可用次数已经耗尽。',
      status: 401,
    })
  }

  const { token, sessionExpiresAt } = await createSessionToken({
    previewId: env.PREVIEW_ID,
    secret: env.PREVIEW_SESSION_SECRET,
    nowMs: config.nowMs,
    globalExpiresAt: config.globalExpiresAt,
    sessionSeconds: config.sessionSeconds,
  })
  const maxAgeSeconds = Math.max(
    1,
    Math.floor((sessionExpiresAt - config.nowMs) / 1000),
  )

  context.waitUntil(Promise.all([
    env.PREVIEW_DB.prepare(`
      DELETE FROM preview_login_attempts
      WHERE preview_id = ? AND client_key = ?
    `).bind(env.PREVIEW_ID, clientKey).run(),
  ]))

  return redirect(
    LOGIN_LANDING_PATH,
    createSessionCookie(token, maxAgeSeconds),
  )
}

async function handleStatus(request, env, config) {
  const session = await getSession(
    request,
    env,
    config.nowMs,
    config.globalExpiresAt,
  )
  if (!session) {
    return json({
      active: false,
      reason: 'session_expired',
      serverNow: config.nowMs,
      globalExpiresAt: config.globalExpiresAt,
    }, 401, {
      'Set-Cookie': clearSessionCookie(),
    })
  }

  return json({
    active: true,
    serverNow: config.nowMs,
    sessionExpiresAt: session.sessionExpiresAt,
    globalExpiresAt: config.globalExpiresAt,
  })
}

async function protectResponse(response) {
  const headers = new Headers(response.headers)
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()')
  headers.set('Referrer-Policy', 'no-referrer')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('X-Frame-Options', 'DENY')
  headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
  headers.append('Vary', 'Cookie')

  if (headers.get('Content-Type')?.includes('text/html')) {
    headers.set('Cache-Control', 'private, no-store, max-age=0')
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export async function onRequest(context) {
  const { request, env } = context
  const nowMs = Date.now()
  const url = new URL(request.url)

  if (!isConfigured(env)) return renderConfigurationError()

  const globalExpiresAt = parseGlobalExpiry(env.PREVIEW_EXPIRES_AT)
  if (!globalExpiresAt) return renderConfigurationError()
  if (nowMs >= globalExpiresAt) return renderExpiredPage()

  const config = {
    nowMs,
    globalExpiresAt,
    sessionSeconds: getSessionSeconds(env.PREVIEW_SESSION_SECONDS),
  }

  try {
    if (url.pathname === `${PREVIEW_PREFIX}/login`) {
      return handleLogin(context, config)
    }
    if (url.pathname === `${PREVIEW_PREFIX}/status`) {
      return handleStatus(request, env, config)
    }
    if (url.pathname === `${PREVIEW_PREFIX}/logout`) {
      return redirect(
        `${PREVIEW_PREFIX}/login?reason=logged_out`,
        clearSessionCookie(),
      )
    }

    const session = await getSession(
      request,
      env,
      nowMs,
      globalExpiresAt,
    )
    if (!session) {
      return createLoginPage({
        env,
        nowMs,
        globalExpiresAt,
        returnPath: sanitizeReturnPath(`${url.pathname}${url.search}`),
      })
    }

    return protectResponse(await context.next())
  } catch {
    return renderConfigurationError()
  }
}
