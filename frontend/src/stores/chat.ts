import type { ChatGateway, ChatMessage, ChatThread } from '@/types/chat'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { mockChatGateway } from '@/mocks/chat/mockGateway'

const CHAT_PAGE_SIZE = 30

export const useChatStore = defineStore('chat', () => {
  const gateway: ChatGateway = mockChatGateway

  const threads = ref<ChatThread[]>([])
  const hasMoreThreads = ref(false)
  const threadsNextCursor = ref<string | null>(null)
  const messages = ref<Record<string, ChatMessage[]>>({})
  const messagesNextCursor = ref<Record<string, string | null>>({})
  const hasMoreMessages = ref<Record<string, boolean>>({})
  const hasMarkedRead = ref<Record<string, boolean>>({})
  const drafts = ref<Record<string, string>>({})
  const replyingTo = ref<Record<string, ChatMessage | null>>({})
  const editingMessage = ref<Record<string, ChatMessage | null>>({})
  const isLoadingThreads = ref(false)
  const isLoadingMoreThreads = ref(false)
  const isLoadingMessages = ref<Record<string, boolean>>({})
  const isLoadingOlderMessages = ref<Record<string, boolean>>({})
  const activeEventId = ref<string | null>(null)

  const sortedThreads = computed(() => {
    const ordered: ChatThread[] = []

    for (const thread of threads.value) {
      const insertedAt = ordered.findIndex(candidate => {
        const currentTime = thread.last_message?.created_at ?? ''
        const candidateTime = candidate.last_message?.created_at ?? ''
        return currentTime.localeCompare(candidateTime) > 0
      })

      if (insertedAt === -1) {
        ordered.push(thread)
      } else {
        ordered.splice(insertedAt, 0, thread)
      }
    }

    return ordered
  })

  const pinnedMessage = computed(() => {
    if (!activeEventId.value) {
      return null
    }
    const msgs = messages.value[activeEventId.value] ?? []
    return msgs.find(m => m.pinned_at && !m.deleted_at) ?? null
  })

  async function loadThreads (force = false) {
    if (isLoadingThreads.value) {
      return
    }
    if (!force && threads.value.length > 0) {
      return
    }

    isLoadingThreads.value = true
    try {
      const page = await gateway.getThreads(CHAT_PAGE_SIZE)
      threads.value = page.items
      hasMoreThreads.value = page.has_more
      threadsNextCursor.value = page.next_cursor
    } finally {
      isLoadingThreads.value = false
    }
  }

  async function loadMoreThreads () {
    if (!hasMoreThreads.value || isLoadingMoreThreads.value || !threadsNextCursor.value) {
      return
    }

    isLoadingMoreThreads.value = true
    try {
      const page = await gateway.getThreads(CHAT_PAGE_SIZE, threadsNextCursor.value)
      const knownIds = new Set(threads.value.map(thread => thread.event_id))
      const appended = page.items.filter(thread => !knownIds.has(thread.event_id))
      threads.value = [...threads.value, ...appended]
      hasMoreThreads.value = page.has_more
      threadsNextCursor.value = page.next_cursor
    } finally {
      isLoadingMoreThreads.value = false
    }
  }

  async function openThread (eventId: string) {
    activeEventId.value = eventId
    if (!messages.value[eventId]) {
      isLoadingMessages.value[eventId] = true
      try {
        const page = await gateway.getMessages(eventId, CHAT_PAGE_SIZE)
        messages.value[eventId] = page.items
        messagesNextCursor.value[eventId] = page.next_cursor
        hasMoreMessages.value[eventId] = page.has_more
      } finally {
        isLoadingMessages.value[eventId] = false
      }
    }

    if (!hasMarkedRead.value[eventId]) {
      await gateway.markRead(eventId)
      hasMarkedRead.value[eventId] = true
    }
    const thread = threads.value.find(t => t.event_id === eventId)
    if (thread) {
      thread.unread_count = 0
    }
  }

  async function loadOlderMessages (eventId: string) {
    if (isLoadingOlderMessages.value[eventId]) {
      return
    }
    if (!hasMoreMessages.value[eventId]) {
      return
    }

    const cursor = messagesNextCursor.value[eventId]
    if (!cursor) {
      return
    }

    isLoadingOlderMessages.value[eventId] = true
    try {
      const page = await gateway.getMessages(eventId, CHAT_PAGE_SIZE, cursor)
      const knownIds = new Set((messages.value[eventId] ?? []).map(message => message.id))
      const olderMessages = page.items.filter(message => !knownIds.has(message.id))
      messages.value[eventId] = [...olderMessages, ...(messages.value[eventId] ?? [])]
      messagesNextCursor.value[eventId] = page.next_cursor
      hasMoreMessages.value[eventId] = page.has_more
    } finally {
      isLoadingOlderMessages.value[eventId] = false
    }
  }

  async function sendMessage (eventId: string) {
    const content = (drafts.value[eventId] ?? '').trim()
    if (!content) {
      return
    }

    const replyTo = replyingTo.value[eventId]?.id
    const optimistic: ChatMessage = {
      id: `optimistic-${Date.now()}`,
      event_id: eventId,
      sender_id: 'user-me',
      sender: { id: 'user-me', name: 'You', isCurrentUser: true },
      content,
      created_at: new Date().toISOString(),
      status: 'sending',
      reply_to: replyingTo.value[eventId]
        ? { id: replyingTo.value[eventId]!.id, sender: replyingTo.value[eventId]!.sender, content: replyingTo.value[eventId]!.content }
        : undefined,
    }

    if (!messages.value[eventId]) {
      messages.value[eventId] = []
    }
    messages.value[eventId].push(optimistic)
    drafts.value[eventId] = ''
    replyingTo.value[eventId] = null

    try {
      const confirmed = await gateway.sendMessage(eventId, content, replyTo)
      const idx = messages.value[eventId].findIndex(m => m.id === optimistic.id)
      if (idx !== -1) {
        messages.value[eventId][idx] = confirmed
      }
      const thread = threads.value.find(t => t.event_id === eventId)
      if (thread) {
        thread.last_message = { id: confirmed.id, sender: confirmed.sender, content: confirmed.content, created_at: confirmed.created_at }
      }
    } catch {
      const idx = messages.value[eventId].findIndex(m => m.id === optimistic.id)
      if (idx !== -1) {
        messages.value[eventId][idx] = { ...optimistic, status: 'sending' }
      }
    }
  }

  async function editMessage (eventId: string, messageId: string, content: string) {
    const confirmed = await gateway.editMessage(eventId, messageId, content)
    const idx = messages.value[eventId]?.findIndex(m => m.id === messageId) ?? -1
    if (idx !== -1) {
      messages.value[eventId][idx] = confirmed
    }
    editingMessage.value[eventId] = null
  }

  async function deleteMessage (eventId: string, messageId: string) {
    await gateway.deleteMessage(eventId, messageId)
    const msg = messages.value[eventId]?.find(m => m.id === messageId)
    if (msg) {
      msg.deleted_at = new Date().toISOString()
    }
  }

  async function pinMessage (eventId: string, messageId: string, pinned: boolean) {
    await gateway.pinMessage(eventId, messageId, pinned)
    const msg = messages.value[eventId]?.find(m => m.id === messageId)
    if (msg) {
      msg.pinned_at = pinned ? new Date().toISOString() : undefined
    }
  }

  function setDraft (eventId: string, text: string) {
    drafts.value[eventId] = text
  }

  function setReplyingTo (eventId: string, message: ChatMessage | null) {
    replyingTo.value[eventId] = message
  }

  function setEditingMessage (eventId: string, message: ChatMessage | null) {
    editingMessage.value[eventId] = message
    if (message) {
      drafts.value[eventId] = message.content
    }
  }

  return {
    threads,
    sortedThreads,
    messages,
    drafts,
    replyingTo,
    editingMessage,
    isLoadingThreads,
    isLoadingMoreThreads,
    isLoadingMessages,
    isLoadingOlderMessages,
    activeEventId,
    pinnedMessage,
    hasMoreThreads,
    hasMoreMessages,
    loadThreads,
    loadMoreThreads,
    openThread,
    loadOlderMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    pinMessage,
    setDraft,
    setReplyingTo,
    setEditingMessage,
  }
})
