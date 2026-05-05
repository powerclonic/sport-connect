import { api } from './client'

// ── Response / payload types ──────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export interface UserPublicResponse {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  location: string | null
  city: string | null
  phone: string | null
  is_verified: boolean
  sports_preferences: string[]
  profile_complete: boolean
}

export interface RegisterPayload {
  email: string
  password: string
  display_name?: string
  sports?: string[]
}

export interface LoginPayload {
  email: string
  password: string
}

export interface ProfileUpdatePayload {
  display_name?: string | null
  bio?: string | null
  location?: string | null
  city?: string | null
  phone?: string | null
  sports_preferences: string[]
}

// ── Auth endpoints ────────────────────────────────────────────────────────────

export const authApi = {
  register: (payload: RegisterPayload) =>
    api.post<TokenResponse>('/auth/register', payload),

  login: (payload: LoginPayload) =>
    api.post<TokenResponse>('/auth/login', payload),

  refresh: () =>
    api.post<TokenResponse>('/auth/refresh', undefined, { skipRefresh: true }),

  logout: () =>
    api.post<void>('/auth/logout'),

  me: () =>
    api.get<UserPublicResponse>('/auth/me'),

  updateProfile: (payload: ProfileUpdatePayload) =>
    api.put<UserPublicResponse>('/auth/profile', payload),

  getOAuthRedirectUrl: (provider: 'google' | 'facebook') =>
    api.get<{ authorization_url: string }>(`/oauth/${provider}/redirect`, { skipRefresh: true }),
}
