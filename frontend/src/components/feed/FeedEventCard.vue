<template>
  <article
    class="group relative flex cursor-pointer flex-col gap-4 overflow-hidden rounded-2xl border border-[rgba(var(--v-theme-primary),0.16)] bg-[rgb(var(--v-theme-surface))] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-transform duration-200 hover:-translate-y-0.5 before:pointer-events-none before:absolute before:-top-12 before:-right-12 before:h-40 before:w-40 before:rounded-full before:bg-[rgba(var(--v-theme-primary),0.12)] before:blur-2xl"
    role="button"
    tabindex="0"
    @click="emit('open-event-info')"
    @keydown.enter.prevent="emit('open-event-info')"
    @keydown.space.prevent="emit('open-event-info')"
  >
    <div class="relative z-[1] flex items-start gap-4">
      <div
        class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[rgba(var(--v-theme-primary),0.16)] text-[rgb(var(--v-theme-primary))] shadow-[0_2px_8px_rgba(var(--v-theme-primary),0.16)]"
      >
        <v-icon :icon="event.icon" size="28" />
      </div>
      <div class="flex min-w-0 flex-1 flex-col gap-1">
        <h2 class="m-0 text-xl leading-snug font-bold text-[rgb(var(--v-theme-on-surface))] [font-family:var(--font-heading)]">
          {{ event.title }}
        </h2>
        <p class="m-0 flex items-center gap-1.5 text-sm leading-relaxed text-[rgb(var(--v-theme-on-surface-variant))] [font-family:var(--font-body)]">
          <v-icon icon="mdi-clock-outline" size="18" />
          {{ event.time }}
        </p>
      </div>
    </div>

    <div
      class="relative z-[1] flex flex-wrap items-center gap-3 rounded-lg bg-[rgba(var(--v-theme-primary),0.08)] px-3.5 py-3 text-sm text-[rgb(var(--v-theme-on-surface-variant))] [font-family:var(--font-body)]"
    >
      <span class="flex shrink-0 items-center gap-1.5 whitespace-nowrap">
        <v-icon icon="mdi-map-marker-outline" size="18" />
        {{ event.distance }}
      </span>
      <span class="h-1 w-1 shrink-0 rounded-full bg-[rgba(var(--v-theme-primary),0.32)]" />
      <span class="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[rgb(var(--v-theme-primary))]">
        <v-icon icon="mdi-account-group-outline" size="18" />
        <strong class="text-base leading-none font-bold [font-family:var(--font-heading)]">{{ event.spotsVacancies }}</strong>
        {{ event.spotsLabel }}
      </span>
    </div>

    <div class="relative z-[1] flex items-center justify-between gap-3 max-sm:flex-col max-sm:items-stretch">
      <v-btn-ghost
        class="!h-auto !min-h-0 !justify-start !px-0 !py-0 !normal-case max-sm:!w-full"
        rounded="0"
        @click.stop="openOrganizerProfile"
      >
        <span class="flex items-center gap-3 text-left">
          <v-avatar
            :image="event.host.image"
            size="44"
            class="border-2 border-[rgb(var(--v-theme-surface))] shadow-[0_2px_6px_rgba(0,0,0,0.12)]"
          />
          <span>
            <span class="block text-sm font-semibold tracking-wide text-[rgb(var(--v-theme-on-surface))] [font-family:var(--font-body)]">
              {{ event.host.name }}
            </span>
            <span class="flex items-center gap-1 text-sm font-bold text-[rgb(var(--v-theme-on-surface))] [font-family:var(--font-heading)]">
              <v-icon class="text-[rgb(var(--v-theme-primary))]!" icon="mdi-star" size="16" />
              <span>{{ event.host.rating }}</span>
            </span>
          </span>
        </span>
      </v-btn-ghost>

      <v-btn-primary
        v-if="event.primaryAction !== 'details' && !isJoined"
        class="max-sm:!w-full !text-sm !tracking-wide [font-family:var(--font-body)]"
        :loading="isLoading"
        @click.stop="handleJoin"
      >
        {{ joinLabel }}
      </v-btn-primary>

      <v-btn-primary
        v-else-if="event.primaryAction !== 'details' && isJoined"
        class="max-sm:!w-full !text-sm !tracking-wide [font-family:var(--font-body)]"
        :loading="isLoading"
        @click.stop="handleLeave"
      >
        <v-icon left icon="mdi-check" size="18" />
        Leave
      </v-btn-primary>

      <v-btn-secondary
        v-else
        class="max-sm:!w-full !text-sm !tracking-wide [font-family:var(--font-body)]"
        @click.stop="emit('open-event-info')"
      >
        {{ detailsLabel }}
      </v-btn-secondary>
    </div>
  </article>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import type { FeedEvent, FeedEventHost } from '@/types/feed'
  import { eventsApi } from '@/api/events'

  const props = defineProps<{
    event: FeedEvent
    joinLabel: string
    detailsLabel: string
  }>()

  const isJoined = ref(false)
  const isLoading = ref(false)

  const emit = defineEmits<{
    'open-event-info': []
    'open-organizer-profile': [organizer: FeedEventHost]
    'joined': [eventId: string]
    'left': [eventId: string]
  }>()

  function openOrganizerProfile () {
    emit('open-organizer-profile', props.event.host)
  }

  async function handleJoin () {
    isLoading.value = true
    try {
      await eventsApi.join(props.event.id)
      isJoined.value = true
      emit('joined', props.event.id)
    } catch (e) {
      console.error(e)
    } finally {
      isLoading.value = false
    }
  }

  async function handleLeave () {
    isLoading.value = true
    try {
      await eventsApi.leave(props.event.id)
      isJoined.value = false
      emit('left', props.event.id)
    } catch (e) {
      console.error(e)
    } finally {
      isLoading.value = false
    }
  }
</script>
