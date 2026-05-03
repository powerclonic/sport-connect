import type { ChatGateway, ChatMessage, ChatPage, ChatThread } from '@/types/chat'
import { CURRENT_USER_ID, currentUser, mockMessages, mockThreads } from './mockData'

const DEFAULT_PAGE_SIZE = 30

function delay (ms = 120): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function now (): string {
  return new Date().toISOString()
}

class MockChatGateway implements ChatGateway {
  private threads: ChatThread[] = mockThreads.map(t => ({ ...t }))
  private messages: Record<string, ChatMessage[]> = Object.fromEntries(
    Object.entries(mockMessages).map(([k, v]) => [k, v.map(m => ({ ...m }))]),
  )

  async getThreads (limit = DEFAULT_PAGE_SIZE, cursor: string | null = null): Promise<ChatPage<ChatThread>> {
    await delay()
    const sorted: ChatThread[] = []
    for (const thread of this.threads) {
      const insertedAt = sorted.findIndex(candidate => {
        const currentTime = thread.last_message?.created_at ?? ''
        const candidateTime = candidate.last_message?.created_at ?? ''
        return currentTime.localeCompare(candidateTime) > 0
      })

      if (insertedAt === -1) {
        sorted.push(thread)
      } else {
        sorted.splice(insertedAt, 0, thread)
      }
    }

    const startIndex = cursor
      ? Math.max(0, sorted.findIndex(t => t.event_id === cursor) + 1)
      : 0
    const items = sorted.slice(startIndex, startIndex + limit)
    const hasMore = startIndex + items.length < sorted.length
    const nextCursor = hasMore ? items.at(-1)?.event_id ?? null : null

    return {
      items,
      next_cursor: nextCursor,
      has_more: hasMore,
    }
  }

  async getThread (eventId: string): Promise<ChatThread | null> {
    await delay()
    return this.threads.find(t => t.event_id === eventId) ?? null
  }

  async getMessages (
    eventId: string,
    limit = DEFAULT_PAGE_SIZE,
    cursor: string | null = null,
  ): Promise<ChatPage<ChatMessage>> {
    await delay()
    const allMessages = this.messages[eventId] ?? []

    if (!cursor) {
      const start = Math.max(0, allMessages.length - limit)
      const items = allMessages.slice(start)
      const hasMore = start > 0
      const nextCursor = hasMore ? items[0]?.id ?? null : null
      return {
        items,
        next_cursor: nextCursor,
        has_more: hasMore,
      }
    }

    const cursorIndex = allMessages.findIndex(m => m.id === cursor)
    if (cursorIndex <= 0) {
      return {
        items: [],
        next_cursor: null,
        has_more: false,
      }
    }

    const start = Math.max(0, cursorIndex - limit)
    const items = allMessages.slice(start, cursorIndex)
    const hasMore = start > 0
    const nextCursor = hasMore ? items[0]?.id ?? null : null

    return {
      items,
      next_cursor: nextCursor,
      has_more: hasMore,
    }
  }

  async sendMessage (eventId: string, content: string, replyTo?: string): Promise<ChatMessage> {
    await delay()
    const replyMsg = replyTo
      ? this.messages[eventId]?.find(m => m.id === replyTo)
      : undefined

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      event_id: eventId,
      sender_id: CURRENT_USER_ID,
      sender: currentUser,
      content,
      created_at: now(),
      status: 'sent',
      reply_to: replyMsg
        ? { id: replyMsg.id, sender: replyMsg.sender, content: replyMsg.content }
        : undefined,
    }

    if (!this.messages[eventId]) {
      this.messages[eventId] = []
    }
    this.messages[eventId].push(message)

    const thread = this.threads.find(t => t.event_id === eventId)
    if (thread) {
      thread.last_message = { id: message.id, sender: message.sender, content: message.content, created_at: message.created_at }
      thread.unread_count = 0
    }

    return message
  }

  async editMessage (eventId: string, messageId: string, content: string): Promise<ChatMessage> {
    await delay()
    const messages = this.messages[eventId] ?? []
    const msg = messages.find(m => m.id === messageId)
    if (!msg) {
      throw new Error('Message not found')
    }
    msg.content = content
    msg.edited_at = now()
    return { ...msg }
  }

  async deleteMessage (eventId: string, messageId: string): Promise<void> {
    await delay()
    const messages = this.messages[eventId] ?? []
    const msg = messages.find(m => m.id === messageId)
    if (msg) {
      msg.deleted_at = now()
    }
  }

  async pinMessage (eventId: string, messageId: string, pinned: boolean): Promise<void> {
    await delay()
    const messages = this.messages[eventId] ?? []
    const msg = messages.find(m => m.id === messageId)
    if (msg) {
      msg.pinned_at = pinned ? now() : undefined
    }
  }

  async markRead (eventId: string): Promise<void> {
    await delay(50)
    const thread = this.threads.find(t => t.event_id === eventId)
    if (thread) {
      thread.unread_count = 0
    }
  }

  async setTyping (_eventId: string, _typing: boolean): Promise<void> {
    // no-op in mock
  }
}

export const mockChatGateway = new MockChatGateway()
