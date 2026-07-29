const encoder = new TextEncoder()
const decoder = new TextDecoder()

export const SESSION_COOKIE = '__Host-qell_preview'
export const DEFAULT_SESSION_SECONDS = 180
export const MAX_CODE_USES = 2
export const LOGIN_WINDOW_SECONDS = 600
export const MAX_FAILED_ATTEMPTS = 5

function toBase64Url(bytes) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function fromBase64Url(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  const binary = atob(padded)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

function constantTimeEqual(left, right) {
  const maxLength = Math.max(left.length, right.length)
  let difference = left.length ^ right.length

  for (let index = 0; index < maxLength; index += 1) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0)
  }

  return difference === 0
}

async function importHmacKey(secret) {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
}

async function hmac(secret, value) {
  const key = await importHmacKey(secret)
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value))
  return new Uint8Array(signature)
}

async function signEnvelope(payload, secret) {
  const payloadSegment = toBase64Url(encoder.encode(JSON.stringify(payload)))
  const signatureSegment = toBase64Url(await hmac(secret, payloadSegment))
  return `${payloadSegment}.${signatureSegment}`
}

async function verifyEnvelope(token, secret) {
  if (typeof token !== 'string' || token.length > 2048) return null
  const [payloadSegment, signatureSegment, extra] = token.split('.')
  if (!payloadSegment || !signatureSegment || extra) return null

  try {
    const suppliedSignature = fromBase64Url(signatureSegment)
    const expectedSignature = await hmac(secret, payloadSegment)
    if (!constantTimeEqual(suppliedSignature, expectedSignature)) return null

    const payload = JSON.parse(decoder.decode(fromBase64Url(payloadSegment)))
    return payload && typeof payload === 'object' ? payload : null
  } catch {
    return null
  }
}

export function parseGlobalExpiry(value) {
  if (typeof value !== 'string' || value.trim() === '') return null
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function getSessionSeconds(value) {
  const parsed = Number.parseInt(value ?? '', 10)
  if (!Number.isFinite(parsed)) return DEFAULT_SESSION_SECONDS
  return Math.min(900, Math.max(30, parsed))
}

export function normalizeAccessCode(value) {
  const normalized = typeof value === 'string' ? value.trim() : ''
  return /^\d{4}$/.test(normalized) ? normalized : null
}

export async function secureCodeMatch(candidate, configuredCode) {
  if (!candidate || !configuredCode) return false
  return constantTimeEqual(encoder.encode(candidate), encoder.encode(configuredCode))
}

export function sanitizeReturnPath(value) {
  if (typeof value !== 'string') return '/'
  if (!value.startsWith('/') || value.startsWith('//')) return '/'
  if (value.startsWith('/__preview')) return '/'
  if (value.length > 512 || /[\u0000-\u001f]/.test(value)) return '/'
  return value
}

export function readCookie(request, name = SESSION_COOKIE) {
  const cookieHeader = request.headers.get('Cookie') ?? ''
  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=')
    if (separator === -1) continue
    const key = part.slice(0, separator).trim()
    if (key === name) return part.slice(separator + 1).trim()
  }
  return null
}

export function createSessionCookie(token, maxAgeSeconds) {
  const safeMaxAge = Math.max(0, Math.floor(maxAgeSeconds))
  return [
    `${SESSION_COOKIE}=${token}`,
    'Path=/',
    `Max-Age=${safeMaxAge}`,
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
  ].join('; ')
}

export function clearSessionCookie() {
  return [
    `${SESSION_COOKIE}=`,
    'Path=/',
    'Max-Age=0',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
  ].join('; ')
}

export async function createSessionToken({
  previewId,
  secret,
  nowMs,
  globalExpiresAt,
  sessionSeconds,
}) {
  const sessionExpiresAt = Math.min(
    nowMs + sessionSeconds * 1000,
    globalExpiresAt,
  )

  const payload = {
    v: 1,
    type: 'session',
    pid: previewId,
    sid: crypto.randomUUID(),
    iat: Math.floor(nowMs / 1000),
    exp: Math.floor(sessionExpiresAt / 1000),
  }

  return {
    token: await signEnvelope(payload, secret),
    sessionExpiresAt,
  }
}

export async function verifySessionToken({
  token,
  previewId,
  secret,
  nowMs,
  globalExpiresAt,
}) {
  const payload = await verifyEnvelope(token, secret)
  if (!payload) return null
  if (
    payload.v !== 1
    || payload.type !== 'session'
    || payload.pid !== previewId
    || typeof payload.sid !== 'string'
    || !Number.isInteger(payload.iat)
    || !Number.isInteger(payload.exp)
  ) return null

  const sessionExpiresAt = payload.exp * 1000
  if (sessionExpiresAt <= nowMs || sessionExpiresAt > globalExpiresAt) return null
  if (payload.iat * 1000 > nowMs + 30_000) return null

  return {
    sessionId: payload.sid,
    issuedAt: payload.iat * 1000,
    sessionExpiresAt,
  }
}

export async function createLoginChallenge({ previewId, secret, nowMs }) {
  const payload = {
    v: 1,
    type: 'login',
    pid: previewId,
    nonce: crypto.randomUUID(),
    iat: Math.floor(nowMs / 1000),
    exp: Math.floor(nowMs / 1000) + LOGIN_WINDOW_SECONDS,
  }

  return signEnvelope(payload, secret)
}

export async function verifyLoginChallenge({
  token,
  previewId,
  secret,
  nowMs,
}) {
  const payload = await verifyEnvelope(token, secret)
  if (!payload) return null
  if (
    payload.v !== 1
    || payload.type !== 'login'
    || payload.pid !== previewId
    || typeof payload.nonce !== 'string'
    || !Number.isInteger(payload.iat)
    || !Number.isInteger(payload.exp)
  ) return null

  const nowSeconds = Math.floor(nowMs / 1000)
  if (payload.exp <= nowSeconds || payload.iat > nowSeconds + 30) return null
  return payload
}

export async function fingerprintValue(secret, value) {
  return toBase64Url(await hmac(secret, value))
}

export function getClientAddress(request) {
  return (
    request.headers.get('CF-Connecting-IP')
    || request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim()
    || 'unknown'
  )
}

export function getAttemptWindow(nowMs) {
  return Math.floor(nowMs / (LOGIN_WINDOW_SECONDS * 1000))
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
