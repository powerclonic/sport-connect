<template>
  <div
    ref="listContainer"
    class="chat-thread-list h-full overflow-y-auto pr-1"
    @scroll.passive="handleScroll"
  >
    <div v-if="isLoading" class="flex flex-col gap-3">
      <v-skeleton-loader v-for="i in 3" :key="i" rounded="xl" type="list-item-avatar-two-line" />
    </div>

    <div v-else-if="threads.length === 0" class="flex flex-col items-center justify-center py-16 gap-3">
      <v-icon icon="mdi-chat-sleep-outline" size="56" style="color: rgb(var(--v-theme-on-surface-variant))" />

      <p class="text-base text-center" style="color: rgb(var(--v-theme-on-surface-variant))">
        {{ t('chat.noChats') }}
      </p>
    </div>

    <v-list v-else class="bg-transparent pa-0" lines="two">
      <v-list-item
        v-for="thread in threads"
        :key="thread.event_id"
        class="mb-2 rounded-2xl chat-thread-item"
        rounded="xl"
        @click="emit('open-thread', thread.event_id)"
      >
        <template #prepend>
          <div
            class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 relative mr-3"
            style="background: rgb(var(--v-theme-surface-variant))"
          >
            <v-icon color="primary" :icon="thread.event.sportIcon" size="22" />

            <span
              v-if="thread.online_count > 0"
              class="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
              style="background: #22c55e; border-color: rgb(var(--v-theme-surface))"
            />
          </div>
        </template>

        <v-list-item-title class="font-bold text-sm">
          {{ thread.event.name }}
        </v-list-item-title>

        <v-list-item-subtitle class="chat-thread-subtitle">
          <span v-if="thread.last_message">
            <span v-if="thread.last_message.sender.isCurrentUser">{{ t('common.you') }}:&nbsp;</span>
            <span v-else>{{ thread.last_message.sender.name }}:&nbsp;</span>
            {{ thread.last_message.deleted_at ? t('chat.deleted') : thread.last_message.content }}
          </span>

          <span v-else>{{ t('chat.noMessages') }}</span>
        </v-list-item-subtitle>

        <template #append>
          <div class="flex flex-col items-end gap-1 ml-3">
            <span class="text-xs" style="color: rgb(var(--v-theme-on-surface-variant))">
              {{ formatThreadTime(thread.last_message?.created_at, t('chat.yesterday')) }}
            </span>

            <div class="flex items-center gap-1">
              <v-icon
                v-if="thread.is_muted"
                icon="mdi-bell-off-outline"
                size="14"
                style="color: rgb(var(--v-theme-on-surface-variant))"
              />

              <v-chip
                v-if="thread.unread_count > 0"
                color="primary"
                size="x-small"
                variant="flat"
              >
                {{ thread.unread_count > 99 ? '99+' : thread.unread_count }}
              </v-chip>
            </div>
          </div>
        </template>
      </v-list-item>
    </v-list>

    <div v-if="!isLoading && threads.length > 0" class="flex items-center justify-center py-3">
      <v-progress-circular
        v-if="isLoadingMore"
        color="primary"
        indeterminate
        size="20"
        width="2"
      />

      <v-btn
        v-else-if="hasMore"
        color="primary"
        size="small"
        variant="tonal"
        @click="emit('load-more')"
      >
        {{ t('chat.loadMoreThreads') }}
      </v-btn>

      <v-chip v-else color="primary" size="x-small" variant="tonal">
        {{ t('chat.noMoreThreads') }}
      </v-chip>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { ChatThread } from '@/types/chat'
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { formatThreadTime } from '@/utils/chat/date'

  interface Props {
    threads: ChatThread[]
    isLoading: boolean
    hasMore: boolean
    isLoadingMore: boolean
  }

  const props = defineProps<Props>()

  const listContainer = ref<HTMLElement | null>(null)

  const SCROLL_THRESHOLD = 96

  const emit = defineEmits<{
    'open-thread': [eventId: string]
    'load-more': []
  }>()

  const { t } = useI18n()

  function handleScroll () {
    if (!listContainer.value || props.isLoading || props.isLoadingMore || !props.hasMore) return

    const distanceToBottom
      = listContainer.value.scrollHeight - (listContainer.value.scrollTop + listContainer.value.clientHeight)

    if (distanceToBottom <= SCROLL_THRESHOLD) {
      emit('load-more')
    }
  }
</script>

<style scoped>
.chat-thread-item {
  background: rgb(var(--v-theme-surface));
}

.chat-thread-subtitle {
  color: rgb(var(--v-theme-on-surface-variant));
}
</style>
