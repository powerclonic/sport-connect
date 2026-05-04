import { api } from './client'

export interface RatingResponse {
  id: string
  rater_id: string
  ratee_id: string
  event_id: string
  score: number
  comment: string | null
  created_at: string
  author?: string
  target_name?: string
}

export interface RatingCreatePayload {
  ratee_id: string
  event_id: string
  score: number
  comment?: string | null
}

export interface UserStatsResponse {
  games_played: number
  average_rating: number
  reliability: number
}

export const ratingsApi = {
  getReceived: (skip?: number, limit?: number) =>
    api.get<RatingResponse[]>('/ratings/received', { params: { skip, limit } }),

  getGiven: (skip?: number, limit?: number) =>
    api.get<RatingResponse[]>('/ratings/given', { params: { skip, limit } }),

  create: (payload: RatingCreatePayload) =>
    api.post<RatingResponse>('/ratings', payload),

  getUserStats: (userId: string) =>
    api.get<UserStatsResponse>(`/users/${userId}/stats`),
}
