import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '../auth'
import type { TokenResponse, UserPublicResponse } from '@/api/auth'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockTokenResponse: TokenResponse = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  token_type: 'bearer',
}

const mockUser: UserPublicResponse = {
  id: 'user-1',
  email: 'test@example.com',
  display_name: 'Test User',
  avatar_url: null,
  bio: null,
  location: null,
  city: null,
  phone: null,
  is_verified: true,
  sports_preferences: [],
  profile_complete: false,
}

vi.mock('@/api/auth', () => ({
  authApi: {
    register: vi.fn(),
    login: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
    updateProfile: vi.fn(),
    getOAuthRedirectUrl: vi.fn(),
  },
}))

vi.mock('@/api/client', () => ({
  configureApiAuth: vi.fn(),
  ApiError: class ApiError extends Error {
    status: number
    constructor(status: number, message: string) {
      super(message)
      this.status = status
      this.name = 'ApiError'
    }
  },
}))

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useAuthStore', () => {
  let authApi: any
  let store: ReturnType<typeof useAuthStore>

  beforeEach(async () => {
    setActivePinia(createPinia())

    // Reset mocks and localStorage before each test
    vi.clearAllMocks()
    localStorage.clear()

    const mod = await import('@/api/auth')
    authApi = mod.authApi

    store = useAuthStore()
  })

  // ── Initial state ────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('should start unauthenticated', () => {
      expect(store.isAuthenticated).toBe(false)
      expect(store.user).toBeNull()
      expect(store.accessToken).toBeNull()
      expect(store.isLoading).toBe(false)
    })
  })

  // ── Login ────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('should set user and tokens after successful login', async () => {
      authApi.login.mockResolvedValue(mockTokenResponse)
      authApi.me.mockResolvedValue(mockUser)

      await store.login('test@example.com', 'password')

      expect(store.accessToken).toBe('test-access-token')
      expect(store.user).toEqual(mockUser)
      expect(store.isAuthenticated).toBe(true)
      expect(store.isLoading).toBe(false)
    })

    it('should save refresh token to localStorage', async () => {
      authApi.login.mockResolvedValue(mockTokenResponse)
      authApi.me.mockResolvedValue(mockUser)

      await store.login('test@example.com', 'password')

      expect(localStorage.getItem('sc_rt')).toBe('test-refresh-token')
    })

    it('should set isLoading to false even when login throws', async () => {
      authApi.login.mockRejectedValue(new Error('Invalid credentials'))

      await expect(store.login('bad@example.com', 'wrongpw')).rejects.toThrow()
      expect(store.isLoading).toBe(false)
    })
  })

  // ── Register ─────────────────────────────────────────────────────────────

  describe('register', () => {
    it('should set user and tokens after successful registration', async () => {
      authApi.register.mockResolvedValue(mockTokenResponse)
      authApi.me.mockResolvedValue(mockUser)

      await store.register('new@example.com', 'Password1', 'New User', ['tennis'])

      expect(store.accessToken).toBe('test-access-token')
      expect(store.user).toEqual(mockUser)
      expect(store.isAuthenticated).toBe(true)
    })

    it('should set isLoading to false even when register throws', async () => {
      authApi.register.mockRejectedValue(new Error('Email taken'))

      await expect(store.register('taken@example.com', 'Password1')).rejects.toThrow()
      expect(store.isLoading).toBe(false)
    })
  })

  // ── Logout ───────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('should clear user and tokens after logout', async () => {
      authApi.login.mockResolvedValue(mockTokenResponse)
      authApi.me.mockResolvedValue(mockUser)
      authApi.logout.mockResolvedValue(undefined)

      await store.login('test@example.com', 'password')
      await store.logout()

      expect(store.user).toBeNull()
      expect(store.accessToken).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(localStorage.getItem('sc_rt')).toBeNull()
    })

    it('should clear local state even if server logout throws', async () => {
      authApi.login.mockResolvedValue(mockTokenResponse)
      authApi.me.mockResolvedValue(mockUser)
      authApi.logout.mockRejectedValue(new Error('Network error'))

      await store.login('test@example.com', 'password')
      await store.logout()

      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })
  })

  // ── Refresh ──────────────────────────────────────────────────────────────

  describe('refresh', () => {
    it('should return false when no refresh token is stored', async () => {
      const result = await store.refresh()
      expect(result).toBe(false)
    })

    it('should update tokens on successful refresh', async () => {
      // Seed the store with a refresh token via login first
      authApi.login.mockResolvedValue(mockTokenResponse)
      authApi.me.mockResolvedValue(mockUser)
      await store.login('test@example.com', 'password')

      const newTokens: TokenResponse = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        token_type: 'bearer',
      }
      authApi.refresh.mockResolvedValue(newTokens)

      const result = await store.refresh()

      expect(result).toBe(true)
      expect(store.accessToken).toBe('new-access-token')
    })
  })

  // ── Update Profile ───────────────────────────────────────────────────────

  describe('updateProfile', () => {
    it('should update user data after successful profile update', async () => {
      authApi.login.mockResolvedValue(mockTokenResponse)
      authApi.me.mockResolvedValue(mockUser)
      await store.login('test@example.com', 'password')

      const updatedUser: UserPublicResponse = {
        ...mockUser,
        display_name: 'Updated Name',
        city: 'São Paulo',
        profile_complete: true,
      }
      authApi.updateProfile.mockResolvedValue(updatedUser)

      await store.updateProfile('Updated Name', ['football'], undefined, 'São Paulo')

      expect(store.user?.display_name).toBe('Updated Name')
      expect(store.user?.city).toBe('São Paulo')
      expect(store.isLoading).toBe(false)
    })
  })

  // ── hydrateFromOAuth ─────────────────────────────────────────────────────

  describe('hydrateFromOAuth', () => {
    it('should set tokens and user from OAuth callback', async () => {
      authApi.me.mockResolvedValue(mockUser)

      await store.hydrateFromOAuth(mockTokenResponse)

      expect(store.accessToken).toBe('test-access-token')
      expect(store.user).toEqual(mockUser)
      expect(store.isAuthenticated).toBe(true)
    })
  })
})
