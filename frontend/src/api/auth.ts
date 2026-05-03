import { api } from './client'

// ── Response / payload types ──────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface UserPublicResponse {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  is_verified: boolean
}

export interface RegisterPayload {
  email: string
  password: string
  display_name?: string
}

export interface LoginPayload {
  email: string
  password: string
}

// ── Auth endpoints ────────────────────────────────────────────────────────────

export const authApi = {
  register: (payload: RegisterPayload) =>
    api.post<TokenResponse>('/auth/register', payload),

  login: (payload: LoginPayload) =>
    api.post<TokenResponse>('/auth/login', payload),

  refresh: (refreshToken: string) =>
    api.post<TokenResponse>('/auth/refresh', { refresh_token: refreshToken }, { skipRefresh: true }),

  logout: (refreshToken?: string) =>
    api.post<void>('/auth/logout', { refresh_token: refreshToken }),

  me: () =>
    api.get<UserPublicResponse>('/auth/me'),

  getOAuthRedirectUrl: (provider: 'google' | 'facebook') =>
    api.get<{ authorization_url: string }>(`/oauth/${provider}/redirect`, { skipRefresh: true }),
}
