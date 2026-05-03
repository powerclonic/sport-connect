<template>
  <div class="chat-thread-head rounded-2xl bg-[rgb(var(--v-theme-background))] px-3 py-2.5">
    <div class="flex items-center gap-2.5">
      <v-btn
        icon="mdi-chevron-left"
        rounded="pill"
        size="small"
        to="/app/chat"
        variant="tonal"
      />

      <div class="flex-1 min-w-0">
        <div class="font-semibold text-base truncate" style="color: rgb(var(--v-theme-on-surface))">
          {{ thread?.event.name ?? '...' }}
        </div>

        <div class="text-xs flex items-center gap-1" style="color: rgb(var(--v-theme-on-surface-variant))">
          <v-icon :icon="thread?.event.sportIcon ?? 'mdi-run'" size="12" />
          <span>{{ thread ? t('chat.onlineCount', { count: thread.online_count }) : '' }}</span>
        </div>
      </div>

      <div v-if="thread" class="flex -space-x-2">
        <v-avatar
          v-for="participant in thread.participants.slice(0, 3)"
          :key="participant.id"
          class="border-2"
          :color="participant.avatar ? undefined : 'primary'"
          :image="participant.avatar"
          size="28"
          style="border-color: rgb(var(--v-theme-surface))"
        >
          <span v-if="!participant.avatar" class="text-xs font-bold">{{ participant.name[0] }}</span>
        </v-avatar>
      </div>
    </div>

    <v-sheet
      v-if="pinnedMessage"
      class="mt-2.5 flex items-start gap-2 rounded-xl px-3.5 py-3"
      color="surface-variant"
    >
      <v-icon class="mt-0.5" color="primary" icon="mdi-pin" size="14" />

      <span class="text-sm leading-5 truncate" style="color: rgb(var(--v-theme-on-surface))">
        {{ pinnedMessage.content }}
      </span>
    </v-sheet>

    <v-sheet
      v-if="showRatingPrompt"
      class="chat-rating-prompt mt-2.5 rounded-xl border px-3 py-2"
    >
      <div class="flex items-center justify-between gap-2">
        <p class="m-0 text-xs leading-snug" style="color: rgb(var(--v-theme-on-surface))">
          {{ t('rating.promptAfterEvent') }}
        </p>

        <v-btn-primary
          class="chat-rating-cta !normal-case"
          size="small"
          @click="emit('rate')"
        >
          {{ t('rating.cta') }}
        </v-btn-primary>
      </div>
    </v-sheet>
  </div>
</template>

<script setup lang="ts">
  import type { ChatMessage, ChatThread } from '@/types/chat'
  import { useI18n } from 'vue-i18n'

  interface Props {
    thread: ChatThread | null
    pinnedMessage: ChatMessage | null
    showRatingPrompt?: boolean
  }

  defineProps<Props>()

  const emit = defineEmits<{
    rate: []
  }>()

  const { t } = useI18n()
</script>

<style scoped>
.chat-thread-head {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.chat-rating-prompt {
  border-color: rgba(var(--v-theme-primary), 0.24);
  background: rgba(var(--v-theme-primary), 0.1);
}

.chat-rating-cta {
  min-height: 30px !important;
  padding-inline: 10px !important;
}

.chat-rating-cta :deep(.v-btn__content) {
  font-size: 12px;
  font-weight: 600;
  line-height: 1.15;
}
</style>
