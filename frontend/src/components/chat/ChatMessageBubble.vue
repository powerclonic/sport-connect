<template>
  <div class="flex flex-col px-1" :class="isOwnMessage ? 'items-end' : 'items-start'">
    <span
      v-if="!isOwnMessage"
      class="text-xs font-medium mb-0.5 ml-3"
      style="color: rgb(var(--v-theme-on-surface-variant))"
    >
      {{ message.sender.name }}
    </span>

    <div class="chat-bubble-wrap relative w-full max-w-[84%]" :class="isOwnMessage ? 'pl-8' : 'pr-8'">
      <v-sheet
        class="rounded-2xl px-3.5 py-2.5"
        :class="[
          isOwnMessage ? 'rounded-br-sm' : 'rounded-bl-sm',
          message.deleted_at ? 'opacity-60' : '',
        ]"
        :style="bubbleStyle"
      >
        <div
          v-if="message.reply_to && !message.deleted_at"
          class="flex gap-1.5 rounded-lg px-2 py-1 mb-1.5 text-xs border-l-2"
          :style="isOwnMessage
            ? 'background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.6); color: rgb(var(--v-theme-on-primary))'
            : 'background: rgb(var(--v-theme-surface-variant)); border-color: rgb(var(--v-theme-primary)); color: rgb(var(--v-theme-on-surface))'"
        >
          <div class="flex-1 min-w-0">
            <div class="font-semibold truncate">{{ message.reply_to.sender.name }}</div>
            <div class="truncate">{{ message.reply_to.deleted_at ? t('chat.deleted') : message.reply_to.content }}</div>
          </div>
        </div>

        <p
          v-if="message.deleted_at"
          class="text-sm leading-5 italic"
          :style="messageTextStyle"
        >
          {{ t('chat.deleted') }}
        </p>
        <p
          v-else
          class="text-sm leading-5 whitespace-pre-wrap break-words"
          :style="messageTextStyle"
        >
          {{ message.content }}
        </p>

        <div v-if="!message.deleted_at" class="flex items-center justify-end gap-1 mt-0.5">
          <span
            class="text-xs opacity-70"
            :style="messageMetaStyle"
          >
            {{ formatMessageTime(message.created_at) }}
            <span v-if="message.edited_at"> · {{ t('chat.edited') }}</span>
          </span>

          <v-icon
            v-if="isOwnMessage"
            :icon="message.status === 'read' ? 'mdi-check-all' : message.status === 'delivered' ? 'mdi-check-all' : 'mdi-check'"
            :color="message.status === 'read' ? '#93c5fd' : undefined"
            size="13"
          />

          <v-icon v-if="message.pinned_at" icon="mdi-pin" size="11" />
        </div>
      </v-sheet>

      <v-menu :location="menuLocation">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            class="chat-bubble-menu-btn"
            :class="isOwnMessage ? 'chat-bubble-menu-btn--own' : ''"
            icon="mdi-dots-vertical"
            size="x-small"
            variant="tonal"
          />
        </template>

        <v-list density="compact" rounded="xl">
          <v-list-item
            v-if="!message.deleted_at"
            :title="t('chat.reply')"
            prepend-icon="mdi-reply"
            @click="emit('reply', message)"
          />
          <v-list-item
            v-if="isOwnMessage && !message.deleted_at"
            :title="t('chat.edit')"
            prepend-icon="mdi-pencil"
            @click="emit('edit', message)"
          />
          <v-list-item
            v-if="isOwnMessage && !message.deleted_at"
            :title="t('chat.delete')"
            base-color="error"
            prepend-icon="mdi-delete"
            @click="emit('delete', message)"
          />
          <v-list-item
            v-if="!message.deleted_at"
            :title="message.pinned_at ? t('chat.unpin') : t('chat.pin')"
            :prepend-icon="message.pinned_at ? 'mdi-pin-off' : 'mdi-pin'"
            @click="emit('pin', message)"
          />
        </v-list>
      </v-menu>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import type { ChatMessage } from '@/types/chat'
  import { formatMessageTime } from '@/utils/chat/date'

  interface Props {
    message: ChatMessage
  }

  const props = defineProps<Props>()

  const emit = defineEmits<{
    reply: [message: ChatMessage]
    edit: [message: ChatMessage]
    delete: [message: ChatMessage]
    pin: [message: ChatMessage]
  }>()

  const { t } = useI18n()

  const isOwnMessage = computed(() => !!props.message.sender.isCurrentUser)
  const bubbleStyle = computed(() =>
    isOwnMessage.value
      ? 'background: rgb(var(--v-theme-primary)); color: rgb(var(--v-theme-on-primary));'
      : 'background: rgb(var(--v-theme-surface)); color: rgb(var(--v-theme-on-surface));'
  )

  const messageTextStyle = computed(() =>
    isOwnMessage.value
      ? 'color: rgb(var(--v-theme-on-primary));'
      : 'color: rgb(var(--v-theme-on-surface));'
  )

  const messageMetaStyle = computed(() =>
    isOwnMessage.value
      ? 'color: rgb(var(--v-theme-on-primary));'
      : 'color: rgb(var(--v-theme-on-surface-variant));'
  )

  const menuLocation = computed(() => isOwnMessage.value ? 'top start' : 'top end')
</script>

<style scoped>
.chat-bubble-menu-btn {
  position: absolute;
  top: 8px;
  right: 4px;
  opacity: 0;
  transition: opacity 0.16s ease;
}

.chat-bubble-menu-btn--own {
  left: 4px;
  right: auto;
}

.chat-bubble-wrap:hover .chat-bubble-menu-btn,
.chat-bubble-wrap:focus-within .chat-bubble-menu-btn {
  opacity: 0.92;
}

@media (hover: none) {
  .chat-bubble-menu-btn {
    opacity: 0.9;
  }
}
</style>
