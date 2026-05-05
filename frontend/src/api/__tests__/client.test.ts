import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api, ApiError, configureApiAuth } from '../client'

// ── Helpers ───────────────────────────────────────────────────────────────────

function mockFetch(status: number, body: unknown = {}, ok?: boolean) {
  const isOk = ok !== undefined ? ok : status >= 200 && status < 300
  return vi.fn().mockResolvedValue({
    ok: isOk,
    status,
    json: vi.fn().mockResolvedValue(body),
  })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('API client', () => {
  beforeEach(() => {
    // Reset auth configuration
    configureApiAuth(
      () => null,
      async () => false,
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ── GET ──────────────────────────────────────────────────────────────────

  describe('api.get', () => {
    it('should return parsed JSON on a 200 response', async () => {
      vi.stubGlobal('fetch', mockFetch(200, { data: 'hello' }))

      const result = await api.get<{ data: string }>('/test')

      expect(result).toEqual({ data: 'hello' })
    })

    it('should throw ApiError on non-2xx response', async () => {
      vi.stubGlobal('fetch', mockFetch(404, { detail: 'Not found' }, false))

      await expect(api.get('/missing')).rejects.toThrow(ApiError)
      await expect(api.get('/missing')).rejects.toMatchObject({ status: 404 })
    })

    it('should set Authorization header when access token is available', async () => {
      configureApiAuth(
        () => 'my-access-token',
        async () => false,
      )
      const fetchMock = mockFetch(200, {})
      vi.stubGlobal('fetch', fetchMock)

      await api.get('/secure')

      const requestInit = fetchMock.mock.calls[0][1] as RequestInit
      const headers = new Headers(requestInit.headers as HeadersInit)
      expect(headers.get('Authorization')).toBe('Bearer my-access-token')
    })

    it('should not set Authorization header when no access token', async () => {
      const fetchMock = mockFetch(200, {})
      vi.stubGlobal('fetch', fetchMock)

      await api.get('/public')

      const requestInit = fetchMock.mock.calls[0][1] as RequestInit
      const headers = new Headers(requestInit.headers as HeadersInit)
      expect(headers.get('Authorization')).toBeNull()
    })
  })

  // ── POST ─────────────────────────────────────────────────────────────────

  describe('api.post', () => {
    it('should send JSON body and return parsed response', async () => {
      const fetchMock = mockFetch(201, { id: '123' })
      vi.stubGlobal('fetch', fetchMock)

      const result = await api.post<{ id: string }>('/items', { name: 'test' })

      expect(result).toEqual({ id: '123' })

      const callInit = fetchMock.mock.calls[0][1] as RequestInit
      expect(callInit.method).toBe('POST')
      expect(callInit.body).toBe(JSON.stringify({ name: 'test' }))
    })

    it('should return undefined for 204 No Content', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 204, json: vi.fn() }))

      const result = await api.post<void>('/logout')

      expect(result).toBeUndefined()
    })
  })

  // ── PUT ──────────────────────────────────────────────────────────────────

  describe('api.put', () => {
    it('should send PUT request with JSON body', async () => {
      const fetchMock = mockFetch(200, { updated: true })
      vi.stubGlobal('fetch', fetchMock)

      const result = await api.put<{ updated: boolean }>('/item/1', { value: 42 })

      expect(result).toEqual({ updated: true })
      const callInit = fetchMock.mock.calls[0][1] as RequestInit
      expect(callInit.method).toBe('PUT')
    })
  })

  // ── DELETE ───────────────────────────────────────────────────────────────

  describe('api.delete', () => {
    it('should send DELETE request and return undefined for 204', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 204, json: vi.fn() }))

      const result = await api.delete<void>('/item/1')

      expect(result).toBeUndefined()
    })

    it('should throw ApiError on 403 response', async () => {
      vi.stubGlobal('fetch', mockFetch(403, { detail: 'Forbidden' }, false))

      await expect(api.delete('/protected')).rejects.toThrow(ApiError)
      await expect(api.delete('/protected')).rejects.toMatchObject({ status: 403 })
    })
  })

  // ── Auto-refresh ─────────────────────────────────────────────────────────

  describe('auto-refresh on 401', () => {
    it('should retry request after successful token refresh', async () => {
      let callCount = 0
      const fetchMock = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ ok: false, status: 401, json: vi.fn().mockResolvedValue({}) })
        }
        return Promise.resolve({ ok: true, status: 200, json: vi.fn().mockResolvedValue({ ok: true }) })
      })
      vi.stubGlobal('fetch', fetchMock)

      configureApiAuth(
        () => 'old-token',
        async () => true, // refresh succeeds
      )

      const result = await api.get('/secure')

      expect(result).toEqual({ ok: true })
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it('should throw ApiError 401 when refresh fails', async () => {
      vi.stubGlobal('fetch', mockFetch(401, {}, false))

      configureApiAuth(
        () => 'old-token',
        async () => false, // refresh fails
      )

      await expect(api.get('/secure')).rejects.toMatchObject({
        status: 401,
        message: 'Session expired',
      })
    })

    it('should not attempt refresh when skipRefresh is true', async () => {
      const fetchMock = mockFetch(401, {}, false)
      vi.stubGlobal('fetch', fetchMock)

      const refreshFn = vi.fn().mockResolvedValue(true)
      configureApiAuth(() => 'old-token', refreshFn)

      await expect(
        api.post('/auth/refresh', {}, { skipRefresh: true }),
      ).rejects.toThrow(ApiError)

      expect(refreshFn).not.toHaveBeenCalled()
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })
  })

  // ── ApiError ─────────────────────────────────────────────────────────────

  describe('ApiError', () => {
    it('should have correct name and status', () => {
      const error = new ApiError(422, 'Unprocessable')
      expect(error.name).toBe('ApiError')
      expect(error.status).toBe(422)
      expect(error.message).toBe('Unprocessable')
      expect(error).toBeInstanceOf(Error)
    })
  })
})
