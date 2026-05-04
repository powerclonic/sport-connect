import { api } from './client'

export interface EventResponse {
  id: string
  title: string
  description: string | null
  sport: string
  location: string | null
  city: string
  date_start: string
  date_end: string
  organizer_id: string
  max_participants: number | null
  status: string
  participant_count: number
  created_at: string
  updated_at: string
}

export interface EventCreatePayload {
  title: string
  description?: string | null
  sport: string
  location?: string | null
  city: string
  date_start: string
  date_end: string
  max_participants?: number | null
}

export interface EventUpdatePayload {
  title?: string
  description?: string | null
  sport?: string
  location?: string | null
  city?: string
  date_start?: string
  date_end?: string
  max_participants?: number | null
  status?: string
}

export const eventsApi = {
  list: (sport?: string, city?: string, skip?: number, limit?: number) =>
    api.get<EventResponse[]>('/events', { params: { sport, city, skip, limit } }),

  create: (payload: EventCreatePayload) =>
    api.post<EventResponse>('/events', payload),

  get: (eventId: string) =>
    api.get<EventResponse>(`/events/${eventId}`),

  update: (eventId: string, payload: EventUpdatePayload) =>
    api.put<EventResponse>(`/events/${eventId}`, payload),

  delete: (eventId: string) =>
    api.delete<void>(`/events/${eventId}`),

  join: (eventId: string) =>
    api.post<EventResponse>(`/events/${eventId}/join`, {}),

  leave: (eventId: string) =>
    api.delete<void>(`/events/${eventId}/leave`),
}
