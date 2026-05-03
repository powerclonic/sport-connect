<template>
  <div
    class="chat-composer flex flex-col gap-2 pt-2"
    :style="{ paddingBottom: `${keyboardInset}px` }"
  >
    <v-sheet
      v-if="replyTo"
      class="flex items-center gap-2 rounded-xl px-3 py-2"
      color="surface-variant"
    >
      <v-icon color="primary" icon="mdi-reply" size="16" />

      <div class="flex-1 min-w-0">
        <div class="text-xs font-semibold" style="color: rgb(var(--v-theme-primary))">
          {{ replyTo.sender.name }}
        </div>

        <div class="text-xs truncate" style="color: rgb(var(--v-theme-on-surface-variant))">
          {{ replyTo.content }}
        </div>
      </div>

      <v-btn icon="mdi-close" size="x-small" variant="text" @click="emit('cancel-reply')" />
    </v-sheet>

    <v-sheet
      v-if="editingMessage"
      class="flex items-center gap-2 rounded-xl px-3 py-2"
      color="surface-variant"
    >
      <v-icon color="primary" icon="mdi-pencil" size="16" />

      <div class="flex-1 text-xs" style="color: rgb(var(--v-theme-on-surface-variant))">
        {{ t('chat.editingMessage') }}
      </div>

      <v-btn icon="mdi-close" size="x-small" variant="text" @click="emit('cancel-edit')" />
    </v-sheet>

    <div class="flex items-end gap-2">
      <div class="flex-1 min-w-0">
        <v-text-field
          bg-color="surface"
          class="chat-composer-input w-full"
          density="compact"
          hide-details
          :model-value="draft"
          :placeholder="t('chat.messagePlaceholder')"
          rounded="pill"
          variant="outlined"
          @keydown.enter.exact.prevent="emit('send')"
          @update:model-value="emit('update:draft', $event ?? '')"
        />
      </div>

      <v-btn
        class="chat-send-btn"
        color="primary"
        :disabled="!draft.trim()"
        icon="mdi-send"
        rounded="pill"
        :variant="draft.trim() ? 'flat' : 'tonal'"
        @click="emit('send')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { ChatMessage } from '@/types/chat'
  import { useI18n } from 'vue-i18n'

  interface Props {
    draft: string
    replyTo: ChatMessage | null
    editingMessage: ChatMessage | null
    keyboardInset: number
  }

  defineProps<Props>()

  const emit = defineEmits<{
    'update:draft': [value: string]
    'send': []
    'cancel-reply': []
    'cancel-edit': []
  }>()

  const { t } = useI18n()
</script>

<style scoped>
.chat-composer {
  background: rgba(var(--v-theme-surface), 0.94);
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  backdrop-filter: blur(10px);
}

.chat-composer-input {
  font-size: 14px;
}

.chat-composer-input :deep(.v-field) {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.14);
  box-shadow: none;
}

.chat-composer-input :deep(.v-field--focused) {
  border-color: rgba(var(--v-theme-primary), 0.48);
}

.chat-send-btn.v-btn--disabled {
  opacity: 0.6;
}

.chat-send-btn {
  height: 44px !important;
  width: 44px !important;
  min-width: 44px !important;
  padding: 0 !important;
}
</style>
