<template>
  <div class="mx-auto flex w-full max-w-xl min-w-0 flex-col gap-7 overflow-x-clip px-0 py-2 pb-safe-sm lg:max-w-7xl lg:pb-6">
    <AppPageIntro :subtitle="t('search.subtitle')" :title="t('search.title')" />

    <FeedFilters
      v-model:active-category="activeCategory"
      v-model:search-query="searchQuery"
      :categories="categories"
      :search-placeholder="t('feed.search')"
    />

    <section class="grid grid-cols-1 gap-5 lg:grid-cols-2 xxl:grid-cols-3">
      <FeedEventCard
        v-for="event in filteredEvents"
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
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import FeedEventCard from '@/components/feed/FeedEventCard.vue'
  import FeedFilters from '@/components/feed/FeedFilters.vue'
  import AppPageIntro from '@/components/shared/AppPageIntro.vue'
  import type { FeedEvent, FeedEventHost } from '@/types/feed'
  import { useFeedCatalog } from '@/composables/feed/useFeedCatalog'

  const { t } = useI18n()
  const { events, categories } = useFeedCatalog()

  const emit = defineEmits<{
    'open-event-info': [event: FeedEvent]
    'open-organizer-profile': [organizer: FeedEventHost]
  }>()

  const activeCategory = ref('all')
  const searchQuery = ref('')

  const filteredEvents = computed(() => {
    return events.value.filter(event => {
      const categoryMatch = activeCategory.value === 'all' || event.category === activeCategory.value
      const query = searchQuery.value.trim().toLowerCase()

      if (!query) return categoryMatch

      const matchesQuery = event.title.toLowerCase().includes(query) || event.host.name.toLowerCase().includes(query)
      return categoryMatch && matchesQuery
    })
  })
</script>
