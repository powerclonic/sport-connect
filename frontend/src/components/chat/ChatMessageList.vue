<template>
  <div
    ref="scrollContainer"
    class="chat-timeline h-full overflow-y-auto pr-1"
    @scroll.passive="handleScroll"
  >
    <div v-if="isLoadingOlder" class="flex items-center justify-center py-3">
      <v-progress-circular color="primary" indeterminate size="20" width="2" />
    </div>

    <div
      v-else-if="!hasMore && groupedMessages.length > 0"
      class="flex items-center justify-center py-2"
    >
      <v-chip color="primary" size="x-small" variant="tonal">
        {{ t('chat.noOlderMessages') }}
      </v-chip>
    </div>

    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <v-progress-circular color="primary" indeterminate size="32" />
    </div>

    <div v-else-if="groupedMessages.length === 0" class="flex flex-col items-center justify-center py-16 gap-3">
      <v-icon icon="mdi-chat-outline" size="48" style="color: rgb(var(--v-theme-on-surface-variant))" />
      <p class="text-sm" style="color: rgb(var(--v-theme-on-surface-variant))">{{ t('chat.noMessages') }}</p>
    </div>

    <div v-else class="flex flex-col gap-2 pb-2">
      <TransitionGroup class="flex flex-col gap-2" name="day-divider" tag="div">
        <div v-for="group in groupedMessages" :key="group.date" class="chat-day-group">
          <div class="flex items-center justify-center my-2">
            <v-chip color="primary" size="x-small" variant="tonal">
              {{ group.label }}
            </v-chip>
          </div>

          <TransitionGroup class="flex flex-col gap-2" name="message-in" tag="div">
            <ChatMessageBubble
              v-for="message in group.messages"
              :key="message.id"
              :message="message"
              @delete="emit('delete', $event)"
              @edit="emit('edit', $event)"
              @pin="emit('pin', $event)"
              @reply="emit('reply', $event)"
            />
          </TransitionGroup>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { ChatMessage } from '@/types/chat'
  import { computed, nextTick, onMounted, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import ChatMessageBubble from '@/components/chat/ChatMessageBubble.vue'
  import { useGroupedMessages } from '@/composables/chat/useGroupedMessages'

  interface Props {
    messages: ChatMessage[]
    isLoading: boolean
    hasMore: boolean
    isLoadingOlder: boolean
  }

  const props = defineProps<Props>()

  const emit = defineEmits<{
    'reply': [message: ChatMessage]
    'edit': [message: ChatMessage]
    'delete': [message: ChatMessage]
    'pin': [message: ChatMessage]
    'load-older': []
  }>()

  const { t } = useI18n()

  const todayLabel = computed(() => t('chat.today'))
  const yesterdayLabel = computed(() => t('chat.yesterday'))
  const messagesComputed = computed(() => props.messages)
  const groupedMessages = useGroupedMessages(messagesComputed, todayLabel, yesterdayLabel)

  const scrollContainer = ref<HTMLElement | null>(null)
  const pendingAnchorOffset = ref<number | null>(null)
  const previousFirstId = ref<string | null>(null)
  const previousLastId = ref<string | null>(null)
  const previousLength = ref(0)

  const TOP_LOAD_THRESHOLD = 80
  const STICK_BOTTOM_THRESHOLD = 120

  async function scrollToBottom () {
    await nextTick()
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
    }
  }

  function isNearBottom () {
    if (!scrollContainer.value) return true
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value
    return scrollHeight - (scrollTop + clientHeight) < STICK_BOTTOM_THRESHOLD
  }

  function handleScroll () {
    if (!scrollContainer.value || props.isLoading || props.isLoadingOlder || !props.hasMore) return
    if (scrollContainer.value.scrollTop > TOP_LOAD_THRESHOLD) return

    pendingAnchorOffset.value = scrollContainer.value.scrollHeight - scrollContainer.value.scrollTop
    emit('load-older')
  }

  watch(() => props.isLoadingOlder, async (isLoadingOlderNow, wasLoadingOlder) => {
    if (!wasLoadingOlder || isLoadingOlderNow || pendingAnchorOffset.value === null) return
    await nextTick()
    if (!scrollContainer.value) return

    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight - pendingAnchorOffset.value
    pendingAnchorOffset.value = null
  })

  watch(() => props.messages, async nextMessages => {
    const nextLength = nextMessages.length
    const nextFirstId = nextMessages[0]?.id ?? null
    const nextLastId = nextMessages[nextLength - 1]?.id ?? null
    const prepended = previousFirstId.value !== null && nextFirstId !== previousFirstId.value
    const appended = previousLastId.value !== null && nextLastId !== previousLastId.value
    const threadChanged = previousLastId.value !== null && !nextMessages.some(message => message.id === previousLastId.value)

    if (nextLength > 0 && (previousLength.value === 0 || threadChanged)) {
      await scrollToBottom()
    } else if (nextLength > previousLength.value && appended && !prepended && isNearBottom()) {
      await scrollToBottom()
    }

    previousLength.value = nextLength
    previousFirstId.value = nextFirstId
    previousLastId.value = nextLastId
  }, { immediate: true })

  onMounted(scrollToBottom)
</script>

<style scoped>
.chat-timeline {
  scroll-behavior: smooth;
}

.chat-day-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.day-divider-enter-active,
.day-divider-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.day-divider-enter-from,
.day-divider-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.message-in-enter-active,
.message-in-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.message-in-enter-from,
.message-in-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.message-in-move {
  transition: transform 0.16s ease;
}
</style>
