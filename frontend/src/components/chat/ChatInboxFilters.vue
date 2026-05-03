<template>
  <div class="flex flex-col gap-3">
    <v-text-field
      clearable
      flat
      hide-details
      :model-value="search"
      :placeholder="t('chat.search')"
      prepend-inner-icon="mdi-magnify"
      rounded="pill"
      variant="solo-filled"
      @update:model-value="onSearchUpdate"
    />

    <v-chip-group
      :model-value="activeFilter"
      selected-class="chat-filter-chip--active"
      @update:model-value="onFilterUpdate"
    >
      <v-chip
        v-for="filter in filters"
        :key="filter.value"
        class="chat-filter-chip"
        filter
        rounded="pill"
        :value="filter.value"
        variant="flat"
      >
        {{ filter.label }}
      </v-chip>
    </v-chip-group>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'

  type ChatFilter = 'all' | 'unread' | 'muted'

  interface Props {
    search: string
    activeFilter: ChatFilter
  }

  const props = defineProps<Props>()

  const emit = defineEmits<{
    'update:search': [value: string]
    'update:activeFilter': [value: ChatFilter]
  }>()

  const { t } = useI18n()

  const filters = computed(() => [
    { value: 'all' as const, label: t('chat.filterAll') },
    { value: 'unread' as const, label: t('chat.filterUnread') },
    { value: 'muted' as const, label: t('chat.filterMuted') },
  ])

  function onSearchUpdate (value: string | null) {
    emit('update:search', value ?? '')
  }

  function onFilterUpdate (value: ChatFilter) {
    emit('update:activeFilter', value ?? props.activeFilter)
  }
</script>

<style scoped>
.chat-filter-chip {
  background: rgb(var(--v-theme-surface-variant));
  color: rgb(var(--v-theme-on-surface-variant));
}

:deep(.chat-filter-chip--active) {
  background: rgb(var(--v-theme-primary)) !important;
  color: rgb(var(--v-theme-on-primary)) !important;
}
</style>
