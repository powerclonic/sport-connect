<template>
  <div
    class="chat-thread-page min-h-96 overflow-x-hidden overflow-y-hidden"
    :class="isDesktop ? 'grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]' : 'flex flex-col'"
    :style="{ '--keyboard-offset': `${keyboardInset}px` }"
  >
    <aside
      v-if="isDesktop"
      class="hidden min-h-0 flex-col gap-4 rounded-3xl border border-[rgba(var(--v-theme-on-surface),0.08)] bg-[rgba(var(--v-theme-on-surface),0.02)] p-4 lg:flex"
    >
      <ChatInboxFilters
        :active-filter="activeFilter"
        :search="search"
        @update:active-filter="activeFilter = $event"
        @update:search="search = $event"
      />

      <div class="min-h-0 flex-1">
        <ChatThreadList
          :has-more="chatStore.hasMoreThreads"
          :is-loading="chatStore.isLoadingThreads"
          :is-loading-more="chatStore.isLoadingMoreThreads"
          :threads="visibleThreads"
          @load-more="chatStore.loadMoreThreads"
          @open-thread="openChat"
        />
      </div>
    </aside>

    <section
      class="chat-thread-main min-h-0 overflow-hidden"
      :class="isDesktop ? 'rounded-3xl border border-[rgba(var(--v-theme-on-surface),0.08)] bg-[rgba(var(--v-theme-on-surface),0.02)] px-2 py-2' : 'flex flex-col'"
      :style="{ height: pageHeight }"
    >
      <ChatThreadHeader
        class="chat-thread-header shrink-0"
        :pinned-message="chatStore.pinnedMessage"
        :show-rating-prompt="showRatingPrompt"
        :thread="thread"
        @rate="router.push(`/app/events/${eventId}/rate`)"
      />

      <div class="chat-thread-messages flex-1 min-h-0 overflow-x-hidden py-2">
        <ChatMessageList
          :has-more="threadHasMore"
          :is-loading="chatStore.isLoadingMessages[eventId]"
          :is-loading-older="chatStore.isLoadingOlderMessages[eventId] ?? false"
          :messages="threadMessages"
          @delete="onDelete"
          @edit="onEdit"
          @load-older="onLoadOlder"
          @pin="onPin"
          @reply="onReply"
        />
      </div>

      <ChatComposer
        class="chat-thread-composer shrink-0"
        :draft="draftText"
        :editing-message="editingMessage"
        :keyboard-inset="keyboardInset"
        :reply-to="replyMessage"
        @cancel-edit="cancelEdit"
        @cancel-reply="cancelReply"
        @send="handleSend"
        @update:draft="chatStore.setDraft(eventId, $event)"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
  import type { ChatMessage } from '@/types/chat'
  import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useDisplay } from 'vuetify'
  import ChatComposer from '@/components/chat/ChatComposer.vue'
  import ChatInboxFilters from '@/components/chat/ChatInboxFilters.vue'
  import ChatMessageList from '@/components/chat/ChatMessageList.vue'
  import ChatThreadHeader from '@/components/chat/ChatThreadHeader.vue'
  import ChatThreadList from '@/components/chat/ChatThreadList.vue'
  import { useAppStore } from '@/stores/app'
  import { useChatStore } from '@/stores/chat'

  const display = useDisplay()
  const route = useRoute()
  const router = useRouter()
  const appStore = useAppStore()
  const chatStore = useChatStore()
  const keyboardInset = ref(0)
  const search = ref('')
  const activeFilter = ref<'all' | 'unread' | 'muted'>('all')
  const isDesktop = computed(() => display.lgAndUp.value)

  const eventId = computed(() => route.params.eventId as string)

  const thread = computed(() =>
    chatStore.threads.find(t => t.event_id === eventId.value) ?? null,
  )

  const threadMessages = computed(() => chatStore.messages[eventId.value] ?? [])
  const threadHasMore = computed(() => chatStore.hasMoreMessages[eventId.value] ?? false)
  const draftText = computed(() => chatStore.drafts[eventId.value] ?? '')
  const replyMessage = computed(() => chatStore.replyingTo[eventId.value] ?? null)
  const editingMessage = computed(() => chatStore.editingMessage[eventId.value] ?? null)
  const showRatingPrompt = computed(() => appStore.canRateEvent(eventId.value))
  const pageHeight = computed(() => {
    if (isDesktop.value) {
      return 'calc(100dvh - 128px)'
    }

    // Mobile page keeps only top container spacing; bottom offset is handled by shell vars.
    return 'calc(100dvh - var(--v-layout-top, 56px) - var(--app-shell-bottom-offset, 72px) - 1rem)'
  })

  const visibleThreads = computed(() => {
    let list = chatStore.sortedThreads
    if (activeFilter.value === 'unread') list = list.filter(t => t.unread_count > 0)
    if (activeFilter.value === 'muted') list = list.filter(t => t.is_muted)
    if (search.value.trim()) {
      const q = search.value.toLowerCase()
      list = list.filter(t => t.event.name.toLowerCase().includes(q))
    }
    return list
  })

  function openChat (nextEventId: string) {
    router.push(`/app/chat/${nextEventId}`)
  }

  function onReply (message: ChatMessage) {
    chatStore.setReplyingTo(eventId.value, message)
  }

  function onEdit (message: ChatMessage) {
    chatStore.setEditingMessage(eventId.value, message)
  }

  async function onDelete (message: ChatMessage) {
    await chatStore.deleteMessage(eventId.value, message.id)
  }

  async function onPin (message: ChatMessage) {
    await chatStore.pinMessage(eventId.value, message.id, !message.pinned_at)
  }

  async function onLoadOlder () {
    await chatStore.loadOlderMessages(eventId.value)
  }

  function cancelReply () {
    chatStore.setReplyingTo(eventId.value, null)
  }

  function cancelEdit () {
    chatStore.setEditingMessage(eventId.value, null)
    chatStore.setDraft(eventId.value, '')
  }

  async function handleSend () {
    if (editingMessage.value) {
      await chatStore.editMessage(eventId.value, editingMessage.value.id, draftText.value.trim())
      return
    }

    await chatStore.sendMessage(eventId.value)
  }

  function syncKeyboardInset () {
    if (isDesktop.value) {
      keyboardInset.value = 0
      return
    }

    if (!window.visualViewport) {
      keyboardInset.value = 0
      return
    }

    const viewport = window.visualViewport
    const occupied = window.innerHeight - viewport.height - viewport.offsetTop
    keyboardInset.value = occupied > 0 ? Math.min(occupied, 320) : 0
  }

  onMounted(() => {
    if (!isDesktop.value && window.visualViewport) {
      window.visualViewport.addEventListener('resize', syncKeyboardInset)
      window.visualViewport.addEventListener('scroll', syncKeyboardInset)
      syncKeyboardInset()
    }
  })

  watch(
    eventId,
    async currentEventId => {
      if (chatStore.threads.length === 0) {
        await chatStore.loadThreads()
      }
      await chatStore.openThread(currentEventId)
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    if (!isDesktop.value && window.visualViewport) {
      window.visualViewport.removeEventListener('resize', syncKeyboardInset)
      window.visualViewport.removeEventListener('scroll', syncKeyboardInset)
    }
  })
</script>

<style scoped>
.chat-thread-header {
  position: sticky;
  top: 0;
  z-index: 3;
  backdrop-filter: blur(8px);
}

.chat-thread-messages {
  min-height: 0;
}

.chat-thread-composer {
  position: sticky;
  bottom: 0;
  z-index: 4;
}
</style>
