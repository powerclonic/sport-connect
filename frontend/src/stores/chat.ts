import type { ChatMessage, ChatThread } from '@/types/chat'
import { chatApi, type ConversationResponse, type MessageResponse } from '@/api/chat'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const CHAT_PAGE_SIZE = 30

export const useChatStore = defineStore('chat', () => {
  const conversations = ref<ConversationResponse[]>([])
  const threads = ref<ChatThread[]>([])
  const hasMoreThreads = ref(false)
  const threadsNextCursor = ref<string | null>(null)
  const messages = ref<Record<string, MessageResponse[]>>({})
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
      const data = await chatApi.listConversations(0, CHAT_PAGE_SIZE)
      conversations.value = data
      threads.value = []
    } finally {
      isLoadingThreads.value = false
    }
  }

  async function loadMoreThreads () {
    if (isLoadingMoreThreads.value) {
      return
    }

    isLoadingMoreThreads.value = true
    try {
      const data = await chatApi.listConversations(conversations.value.length, CHAT_PAGE_SIZE)
      const knownIds = new Set(conversations.value.map(conv => conv.id))
      const appended = data.filter(conv => !knownIds.has(conv.id))
      conversations.value = [...conversations.value, ...appended]
    } finally {
      isLoadingMoreThreads.value = false
    }
  }

  async function openThread (eventId: string) {
    activeEventId.value = eventId
    if (!messages.value[eventId]) {
      isLoadingMessages.value[eventId] = true
      try {
        const data = await chatApi.getConversation(eventId, 0, CHAT_PAGE_SIZE)
        messages.value[eventId] = data.messages
        messagesNextCursor.value[eventId] = null
        hasMoreMessages.value[eventId] = false
      } finally {
        isLoadingMessages.value[eventId] = false
      }
    }

    hasMarkedRead.value[eventId] = true
    const thread = threads.value.find(t => t.event_id === eventId)
    if (thread) {
      thread.unread_count = 0
    }
  }

  async function loadOlderMessages (eventId: string) {
    if (isLoadingOlderMessages.value[eventId]) {
      return
    }

    isLoadingOlderMessages.value[eventId] = true
    try {
      const skip = (messages.value[eventId] ?? []).length
      const data = await chatApi.getConversation(eventId, skip, CHAT_PAGE_SIZE)
      const knownIds = new Set((messages.value[eventId] ?? []).map(message => message.id))
      const olderMessages = data.messages.filter(message => !knownIds.has(message.id))
      messages.value[eventId] = [...olderMessages, ...(messages.value[eventId] ?? [])]
    } finally {
      isLoadingOlderMessages.value[eventId] = false
    }
  }

  async function sendMessage (eventId: string) {
    const draftText = (drafts.value[eventId] ?? '').trim()
    if (!draftText) {
      return
    }

    if (!messages.value[eventId]) {
      messages.value[eventId] = []
    }
    drafts.value[eventId] = ''
    replyingTo.value[eventId] = null

    try {
      const msg = await chatApi.sendMessage(eventId, { text: draftText })
      messages.value[eventId].push(msg)
    } catch {
      // restore draft on failure
      drafts.value[eventId] = draftText
    }
  }

  async function editMessage (eventId: string, messageId: string, content: string) {
    // TODO: implement editMessage via chatApi
    editingMessage.value[eventId] = null
  }

  async function deleteMessage (eventId: string, messageId: string) {
    // TODO: implement deleteMessage via chatApi
  }

  async function pinMessage (eventId: string, messageId: string, pinned: boolean) {
    // TODO: implement pinMessage via chatApi
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
