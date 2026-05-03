export interface ChatParticipant {
  id: string
  name: string
  avatar?: string
  isCurrentUser?: boolean
  isOnline?: boolean
}

export interface ChatMessage {
  id: string
  event_id: string
  sender_id: string
  sender: ChatParticipant
  content: string
  created_at: string
  status: 'sending' | 'sent' | 'delivered' | 'read'
  edited_at?: string
  deleted_at?: string
  pinned_at?: string
  reply_to?: Pick<ChatMessage, 'id' | 'sender' | 'content' | 'deleted_at'>
}

export interface ChatEvent {
  id: string
  name: string
  sport: string
  sportIcon: string
  date: string
  location: string
}

export interface ChatThread {
  event_id: string
  event: ChatEvent
  participants: ChatParticipant[]
  online_count: number
  unread_count: number
  last_message?: Pick<ChatMessage, 'id' | 'sender' | 'content' | 'created_at' | 'deleted_at'>
  is_muted: boolean
}

export interface TypingIndicator {
  event_id: string
  user: ChatParticipant
  started_at: string
}

export interface ChatPage<T> {
  items: T[]
  next_cursor: string | null
  has_more: boolean
}

export interface ChatGateway {
  getThreads: (limit?: number, cursor?: string | null) => Promise<ChatPage<ChatThread>>
  getThread: (eventId: string) => Promise<ChatThread | null>
  getMessages: (eventId: string, limit?: number, cursor?: string | null) => Promise<ChatPage<ChatMessage>>
  sendMessage: (eventId: string, content: string, replyTo?: string) => Promise<ChatMessage>
  editMessage: (eventId: string, messageId: string, content: string) => Promise<ChatMessage>
  deleteMessage: (eventId: string, messageId: string) => Promise<void>
  pinMessage: (eventId: string, messageId: string, pinned: boolean) => Promise<void>
  markRead: (eventId: string) => Promise<void>
  setTyping: (eventId: string, typing: boolean) => Promise<void>
}
