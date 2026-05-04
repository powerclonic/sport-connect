import { api } from './client'

export interface MessageResponse {
  id: string
  sender_id: string
  text: string
  created_at: string
  sender_name?: string
}

export interface ConversationResponse {
  id: string
  participant_ids: string[]
  created_at: string
  updated_at: string
  message_count: number
}

export interface ConversationDetailResponse extends ConversationResponse {
  messages: MessageResponse[]
}

export interface MessageCreatePayload {
  text: string
}

export interface ConversationCreatePayload {
  participant_id: string
}

export const chatApi = {
  listConversations: (skip?: number, limit?: number) =>
    api.get<ConversationResponse[]>('/conversations', { params: { skip, limit } }),

  createConversation: (payload: ConversationCreatePayload) =>
    api.post<ConversationResponse>('/conversations', payload),

  getConversation: (convId: string, skip?: number, limit?: number) =>
    api.get<ConversationDetailResponse>(`/conversations/${convId}`, { params: { skip, limit } }),

  sendMessage: (convId: string, payload: MessageCreatePayload) =>
    api.post<MessageResponse>(`/conversations/${convId}/messages`, payload),
}
