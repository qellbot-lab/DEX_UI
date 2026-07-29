import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import {
  clearSessionCookie,
  createLoginChallenge,
  createSessionCookie,
  createSessionToken,
  getSessionSeconds,
  normalizeAccessCode,
  parseGlobalExpiry,
  sanitizeReturnPath,
  verifyLoginChallenge,
  verifySessionToken,
} from '../functions/_lib/preview-access.js'
import {
  renderExpiredPage,
  renderLoginPage,
} from '../functions/_lib/preview-pages.js'
import { onRequest } from '../functions/_middleware.js'

class MockStatement {
  constructor(database, sql, values = []) {
    this.database = database
    this.sql = sql.replace(/\s+/g, ' ').trim()
    this.values = values
  }

  bind(...values) {
    return new MockStatement(this.database, this.sql, values)
  }

  run() {
    return this.database.execute(this)
  }

  first() {
    return this.database.first(this)
  }
}

class MockD1 {
  constructor() {
    this.codeUses = new Map()
    this.nonces = new Set()
    this.attempts = new Map()
  }

  prepare(sql) {
    return new MockStatement(this, sql)
  }

  snapshot() {
    return {
      codeUses: new Map(this.codeUses),
      nonces: new Set(this.nonces),
      attempts: new Map(this.attempts),
    }
  }

  restore(snapshot) {
    this.codeUses = snapshot.codeUses
    this.nonces = snapshot.nonces
    this.attempts = snapshot.attempts
  }

  async batch(statements) {
    const snapshot = this.snapshot()
    try {
      const results = []
      for (const statement of statements) results.push(await this.execute(statement))
      return results
    } catch (error) {
      this.restore(snapshot)
      throw error
    }
  }

  async first(statement) {
    if (statement.sql.includes('SELECT failed_count')) {
      const key = statement.values.join(':')
      const count = this.attempts.get(key)
      return count === undefined ? null : { failed_count: count }
    }
    throw new Error(`Unhandled mock D1 first(): ${statement.sql}`)
  }

  async execute(statement) {
    const { sql, values } = statement

    if (sql.includes('INSERT OR IGNORE INTO preview_code_uses')) {
      const [preview, slot, remaining] = values
      const key = `${preview}:${slot}`
      if (this.codeUses.has(key)) return { meta: { changes: 0 } }
      this.codeUses.set(key, remaining)
      return { meta: { changes: 1 } }
    }

    if (sql.includes('INSERT INTO preview_login_attempts')) {
      const [preview, client, window] = values
      const key = `${preview}:${client}:${window}`
      this.attempts.set(key, (this.attempts.get(key) ?? 0) + 1)
      return { meta: { changes: 1 } }
    }

    if (sql.includes('INSERT INTO preview_login_nonces')) {
      const [preview, nonce] = values
      const key = `${preview}:${nonce}`
      if (this.nonces.has(key)) throw new Error('UNIQUE constraint failed')
      this.nonces.add(key)
      return { meta: { changes: 1 } }
    }

    if (sql.includes('UPDATE preview_code_uses')) {
      const [, preview, slot] = values
      const key = `${preview}:${slot}`
      const remaining = this.codeUses.get(key) ?? 0
      if (remaining <= 0) return { meta: { changes: 0 } }
      this.codeUses.set(key, remaining - 1)
      return { meta: { changes: 1 } }
    }

    if (sql.includes('DELETE FROM preview_login_attempts')) {
      const [preview, client] = values
      for (const key of this.attempts.keys()) {
        if (key.startsWith(`${preview}:${client}:`)) this.attempts.delete(key)
      }
      return { meta: { changes: 1 } }
    }

    if (sql.includes('DELETE FROM preview_login_nonces')) {
      return { meta: { changes: 0 } }
    }

    throw new Error(`Unhandled mock D1 run(): ${sql}`)
  }
}

function createContext(request, env, database, nextResponse = null) {
  const background = []
  return {
    request,
    env: { ...env, PREVIEW_DB: database },
    waitUntil(promise) {
      background.push(promise)
    },
    next() {
      return Promise.resolve(nextResponse ?? new Response('<main>QELL</main>', {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }))
    },
    background,
  }
}

function extractChallenge(html) {
  const match = html.match(/name="challenge" value="([^"]+)"/)
  assert.ok(match, 'login challenge should be present')
  return match[1]
}

const nowMs = Date.parse('2026-07-29T10:00:00+08:00')
const globalExpiresAt = nowMs + 6 * 60 * 60 * 1000
const secret = 'test-session-secret-with-at-least-thirty-two-characters'
const previewId = 'qell-private-preview-test'

assert.equal(normalizeAccessCode(' 1234 '), '1234')
assert.equal(normalizeAccessCode('123'), null)
assert.equal(normalizeAccessCode('12a4'), null)
assert.equal(sanitizeReturnPath('/runtime?mode=live'), '/runtime?mode=live')
assert.equal(sanitizeReturnPath('https://example.com'), '/')
assert.equal(sanitizeReturnPath('//example.com'), '/')
assert.equal(sanitizeReturnPath('/__preview/status'), '/')
assert.equal(parseGlobalExpiry('2026-07-29T16:00:00+08:00'), globalExpiresAt)
assert.equal(parseGlobalExpiry('not-a-date'), null)
assert.equal(getSessionSeconds(undefined), 180)
assert.equal(getSessionSeconds('5'), 30)
assert.equal(getSessionSeconds('1200'), 900)

const session = await createSessionToken({
  previewId,
  secret,
  nowMs,
  globalExpiresAt,
  sessionSeconds: 180,
})
assert.equal(session.sessionExpiresAt, nowMs + 180_000)

const verifiedSession = await verifySessionToken({
  token: session.token,
  previewId,
  secret,
  nowMs: nowMs + 30_000,
  globalExpiresAt,
})
assert.equal(verifiedSession.sessionExpiresAt, nowMs + 180_000)

assert.equal(await verifySessionToken({
  token: `${session.token.slice(0, -1)}x`,
  previewId,
  secret,
  nowMs,
  globalExpiresAt,
}), null)

assert.equal(await verifySessionToken({
  token: session.token,
  previewId,
  secret,
  nowMs: nowMs + 181_000,
  globalExpiresAt,
}), null)

const nearExpirySession = await createSessionToken({
  previewId,
  secret,
  nowMs: globalExpiresAt - 45_000,
  globalExpiresAt,
  sessionSeconds: 180,
})
assert.equal(nearExpirySession.sessionExpiresAt, globalExpiresAt)

const challenge = await createLoginChallenge({ previewId, secret, nowMs })
assert.ok(await verifyLoginChallenge({
  token: challenge,
  previewId,
  secret,
  nowMs: nowMs + 60_000,
}))
assert.equal(await verifyLoginChallenge({
  token: challenge,
  previewId,
  secret,
  nowMs: nowMs + 601_000,
}), null)

const sessionCookie = createSessionCookie(session.token, 180)
assert.match(sessionCookie, /^__Host-qell_preview=/)
assert.match(sessionCookie, /Max-Age=180/)
assert.match(sessionCookie, /HttpOnly/)
assert.match(sessionCookie, /Secure/)
assert.match(sessionCookie, /SameSite=Lax/)
assert.match(clearSessionCookie(), /Max-Age=0/)

const loginResponse = renderLoginPage({
  returnPath: '/runtime',
  challenge,
  globalExpiresAt,
  message: '',
  status: 401,
})
const loginHtml = await loginResponse.text()
assert.equal(loginResponse.status, 401)
assert.match(loginHtml, /输入预览凭证/)
assert.match(loginHtml, /本次浏览窗口持续三分钟/)
assert.doesNotMatch(loginHtml, /name="code"[^>]+value=/)

const expiredResponse = renderExpiredPage()
const expiredHtml = await expiredResponse.text()
assert.equal(expiredResponse.status, 410)
assert.match(expiredHtml, /预览期限结束 🐶/)
assert.match(expiredHtml, /想看再联系我/)

const middlewareSource = await readFile(
  new URL('../functions/_middleware.js', import.meta.url),
  'utf8',
)
assert.match(middlewareSource, /const LOGIN_LANDING_PATH = '\/runtime'/)
assert.match(middlewareSource, /PREVIEW_CODE_1/)
assert.match(middlewareSource, /PREVIEW_CODE_2/)
assert.match(middlewareSource, /PREVIEW_CODE_3/)
assert.doesNotMatch(
  middlewareSource,
  /PREVIEW_CODE_[123]\s*=\s*['"]\d{4}['"]/,
)

const migrationSource = await readFile(
  new URL('../migrations/0001_preview_access.sql', import.meta.url),
  'utf8',
)
assert.match(migrationSource, /remaining_uses INTEGER NOT NULL DEFAULT 2/)
assert.match(migrationSource, /PRIMARY KEY \(preview_id, code_slot\)/)
assert.match(migrationSource, /preview_login_nonces/)

const integrationDatabase = new MockD1()
const integrationEnv = {
  PREVIEW_ID: 'integration-preview',
  PREVIEW_EXPIRES_AT: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
  PREVIEW_SESSION_SECONDS: '180',
  PREVIEW_SESSION_SECRET: secret,
  PREVIEW_CODE_1: '1111',
  PREVIEW_CODE_2: '2222',
  PREVIEW_CODE_3: '3333',
}

async function getFreshChallenge() {
  const request = new Request('https://preview.example/__preview/login')
  const context = createContext(request, integrationEnv, integrationDatabase)
  const response = await onRequest(context)
  const html = await response.text()
  assert.equal(response.status, 401)
  return extractChallenge(html)
}

async function redeem(code, challengeToken, client = '203.0.113.7') {
  const body = new URLSearchParams({
    code,
    challenge: challengeToken,
    return: '/',
  })
  const request = new Request('https://preview.example/__preview/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'CF-Connecting-IP': client,
    },
    body,
  })
  const context = createContext(request, integrationEnv, integrationDatabase)
  const response = await onRequest(context)
  await Promise.all(context.background)
  return response
}

const firstChallenge = await getFreshChallenge()
const firstRedemption = await redeem('1111', firstChallenge)
assert.equal(firstRedemption.status, 303)
assert.equal(firstRedemption.headers.get('Location'), '/runtime')
assert.match(firstRedemption.headers.get('Set-Cookie'), /^__Host-qell_preview=/)

const replayedRedemption = await redeem('1111', firstChallenge)
assert.equal(replayedRedemption.status, 409)

const issuedCookie = firstRedemption.headers.get('Set-Cookie').split(';')[0]
const statusContext = createContext(
  new Request('https://preview.example/__preview/status', {
    headers: { Cookie: issuedCookie },
  }),
  integrationEnv,
  integrationDatabase,
)
const activeStatusResponse = await onRequest(statusContext)
const activeStatus = await activeStatusResponse.json()
assert.equal(activeStatusResponse.status, 200)
assert.equal(activeStatus.active, true)
assert.ok(activeStatus.sessionExpiresAt - activeStatus.serverNow <= 180_000)

const protectedContext = createContext(
  new Request('https://preview.example/runtime', {
    headers: { Cookie: issuedCookie },
  }),
  integrationEnv,
  integrationDatabase,
)
const protectedResponse = await onRequest(protectedContext)
assert.equal(protectedResponse.status, 200)
assert.equal(protectedResponse.headers.get('X-Frame-Options'), 'DENY')

const secondRedemption = await redeem(
  '1111',
  await getFreshChallenge(),
  '203.0.113.8',
)
assert.equal(secondRedemption.status, 303)

const exhaustedRedemption = await redeem(
  '1111',
  await getFreshChallenge(),
  '203.0.113.9',
)
assert.equal(exhaustedRedemption.status, 401)
assert.match(await exhaustedRedemption.text(), /访问凭证无效或可用次数已经耗尽/)

for (let attempt = 0; attempt < 5; attempt += 1) {
  const invalidResponse = await redeem(
    '9999',
    await getFreshChallenge(),
    '203.0.113.20',
  )
  assert.equal(invalidResponse.status, 401)
}
const rateLimitedResponse = await redeem(
  '9999',
  await getFreshChallenge(),
  '203.0.113.20',
)
assert.equal(rateLimitedResponse.status, 429)

const expiredContext = createContext(
  new Request('https://preview.example/runtime'),
  {
    ...integrationEnv,
    PREVIEW_EXPIRES_AT: new Date(Date.now() - 1000).toISOString(),
  },
  integrationDatabase,
)
const globallyExpiredResponse = await onRequest(expiredContext)
assert.equal(globallyExpiredResponse.status, 410)
assert.match(await globallyExpiredResponse.text(), /预览期限结束 🐶/)

console.log('Private preview access verification passed')
