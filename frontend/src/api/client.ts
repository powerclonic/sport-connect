/**
 * API client — thin fetch wrapper with:
 *   - Authorization: Bearer header (mobile / Capacitor)
 *   - credentials: 'include' (cookie transport for same-site web)
 *   - Automatic 401 → refresh → retry
 *   - Typed ApiError for uniform error handling in stores
 *
 * Token provider is injected by the auth store to avoid circular imports.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1'

// ── Token injection (set by auth store after init) ────────────────────────────

let _getAccessToken: () => string | null = () => null
let _doRefresh: (() => Promise<boolean>) | null = null

export function configureApiAuth(
  getToken: () => string | null,
  doRefresh: () => Promise<boolean>,
) {
  _getAccessToken = getToken
  _doRefresh = doRefresh
}

// ── Error class ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ── Core request ──────────────────────────────────────────────────────────────

type RequestOptions = RequestInit & { skipRefresh?: boolean }

async function _request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipRefresh = false, ...init } = options

  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const token = _getAccessToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  })

  // Auto-refresh on 401
  if (response.status === 401 && !skipRefresh && _doRefresh) {
    const refreshed = await _doRefresh()

    if (refreshed) {
      const retryHeaders = new Headers(init.headers)
      if (!retryHeaders.has('Content-Type') && !(init.body instanceof FormData)) {
        retryHeaders.set('Content-Type', 'application/json')
      }
      const newToken = _getAccessToken()
      if (newToken) retryHeaders.set('Authorization', `Bearer ${newToken}`)

      const retryRes = await fetch(`${BASE_URL}${path}`, {
        ...init,
        headers: retryHeaders,
        credentials: 'include',
      })

      if (!retryRes.ok) {
        const err = await retryRes.json().catch(() => ({}))
        throw new ApiError(retryRes.status, err.detail ?? 'Request failed')
      }

      if (retryRes.status === 204) return undefined as T
      return retryRes.json() as Promise<T>
    }

    throw new ApiError(401, 'Session expired')
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new ApiError(response.status, err.detail ?? 'Request failed')
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

// ── Public API ────────────────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    _request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    _request<T>(path, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    _request<T>(path, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    _request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string, options?: RequestOptions) =>
    _request<T>(path, { ...options, method: 'DELETE' }),
}
