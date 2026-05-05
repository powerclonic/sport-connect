import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authApi } from '@/api/auth'
import { ApiError, configureApiAuth } from '@/api/client'
import type { UserPublicResponse } from '@/api/auth'

const ACCESS_TOKEN_KEY = 'sc_at'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserPublicResponse | null>(null)
  const accessToken = ref<string | null>(localStorage.getItem(ACCESS_TOKEN_KEY))
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)

  // ── Internal helpers ──────────────────────────────────────────────────────

  function _setTokens(tokens: { access_token: string }) {
    accessToken.value = tokens.access_token
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token)
    _syncApiClient()
  }

  function _clearTokens() {
    accessToken.value = null
    user.value = null
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    _syncApiClient()
  }

  function _syncApiClient() {
    configureApiAuth(
      () => accessToken.value,
      () => refresh(),
    )
  }

  // ── Public actions ────────────────────────────────────────────────────────

  async function login(email: string, password: string): Promise<void> {
    isLoading.value = true
    try {
      const tokens = await authApi.login({ email, password })
      _setTokens(tokens)
      user.value = await authApi.me()
    } finally {
      isLoading.value = false
    }
  }

  async function register(
    email: string,
    password: string,
    displayName?: string,
    sports?: string[],
  ): Promise<void> {
    isLoading.value = true
    try {
      const tokens = await authApi.register({
        email,
        password,
        display_name: displayName,
        sports: sports ?? [],
      })
      _setTokens(tokens)
      user.value = await authApi.me()
    } finally {
      isLoading.value = false
    }
  }

  async function logout(): Promise<void> {
    try {
      await authApi.logout()
    } catch {
      // Best-effort — clear local state regardless
    } finally {
      _clearTokens()
    }
  }

  async function refresh(): Promise<boolean> {
    if (!accessToken.value) return false
    try {
      const tokens = await authApi.refresh()
      _setTokens(tokens)
      return true
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 422)) {
        _clearTokens()
      }
      return false
    }
  }

  /** Called once on app startup to re-hydrate session from stored access token. */
  async function initialize(): Promise<void> {
    // Always wire the API client, even if no token yet
    _syncApiClient()

    if (!accessToken.value) return

    const ok = await refresh()
    if (ok) {
      try {
        user.value = await authApi.me()
      } catch {
        _clearTokens()
      }
    }
  }

  /** Used by the OAuth callback page to store tokens received from the redirect. */
  async function hydrateFromOAuth(tokens: { access_token: string }): Promise<void> {
    _setTokens(tokens)
    user.value = await authApi.me()
  }

  async function updateProfile(
    displayName: string | null,
    sports: string[],
    location?: string,
    city?: string,
    phone?: string,
    bio?: string,
  ): Promise<void> {
    isLoading.value = true
    try {
      user.value = await authApi.updateProfile({
        display_name: displayName,
        sports_preferences: sports,
        location,
        city,
        phone,
        bio,
      })
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refresh,
    initialize,
    hydrateFromOAuth,
    updateProfile,
  }
})
