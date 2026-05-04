<template>
  <div class="mx-auto flex w-full max-w-xl min-w-0 flex-col gap-7 overflow-x-clip px-0 py-2 pb-safe-sm lg:max-w-7xl lg:pb-6">
    <AppPageIntro :subtitle="t('feed.subtitle')" :title="t('feed.title')" />

    <section class="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
      <FeedEventCard
        v-for="event in events"
        :key="event.id"
        :details-label="t('feed.details')"
        :event="event"
        :join-label="t('feed.join')"
        @open-event-info="emit('open-event-info', event)"
        @open-organizer-profile="emit('open-organizer-profile', $event)"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import FeedEventCard from '@/components/feed/FeedEventCard.vue'
  import AppPageIntro from '@/components/shared/AppPageIntro.vue'
  import type { FeedEvent, FeedEventHost } from '@/types/feed'
  import { useFeedCatalog } from '@/composables/feed/useFeedCatalog'

  const { t } = useI18n()
  const { events } = useFeedCatalog()

  const emit = defineEmits<{
    'open-event-info': [event: FeedEvent]
    'open-organizer-profile': [organizer: FeedEventHost]
  }>()
</script>
