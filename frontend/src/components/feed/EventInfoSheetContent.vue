<template>
  <div class="flex flex-col gap-4 pb-1">
    <v-card
      class="overflow-hidden border border-[rgba(var(--v-theme-primary),0.18)]"
      color="surface"
      rounded="xl"
      variant="flat"
    >
      <div class="relative">
        <div
          class="h-44 w-full bg-cover bg-center"
          style="background-image: linear-gradient(180deg, rgba(2, 6, 23, 0.1), rgba(2, 6, 23, 0.72)), url('https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=1200&q=80')"
        />

        <div class="absolute inset-x-0 bottom-0 p-4">
          <v-chip class="font-medium" color="primary" size="small" variant="flat">
            {{ event.category }} · {{ event.participantsCount }}
          </v-chip>
          <h3 class="mt-3 mb-1 text-2xl font-black text-white [font-family:var(--font-heading)]">{{ event.title }}</h3>
          <p class="m-0 text-sm leading-relaxed text-white/90 [font-family:var(--font-body)]">{{ event.summary }}</p>
        </div>
      </div>
    </v-card>

    <v-card class="border border-[rgba(var(--v-theme-primary),0.14)] p-4" color="surface" rounded="xl" variant="flat">
      <div class="mb-3 flex items-center justify-between gap-3">
        <div>
          <p class="m-0 text-xs font-semibold tracking-[0.06em] text-[rgb(var(--v-theme-primary))] uppercase">{{ t('event.title') }}</p>
          <p class="mt-1 mb-0 text-base font-semibold text-[rgb(var(--v-theme-on-surface))]">{{ t('event.subtitle') }}</p>
        </div>

        <v-avatar color="primary" size="36" variant="tonal">
          <v-icon icon="mdi-information-outline" />
        </v-avatar>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <article class="rounded-xl border border-[rgba(var(--v-theme-on-surface),0.1)] bg-[rgba(var(--v-theme-on-surface),0.03)] px-3.5 py-3">
          <v-icon class="mb-1 text-[rgb(var(--v-theme-primary))]" icon="mdi-calendar-clock" />
          <p class="m-0 text-xs text-[rgba(var(--v-theme-on-surface),0.72)]">Date & time</p>
          <p class="mt-0.5 mb-0 text-sm font-semibold">{{ event.schedule }}</p>
        </article>

        <article class="rounded-xl border border-[rgba(var(--v-theme-on-surface),0.1)] bg-[rgba(var(--v-theme-on-surface),0.03)] px-3.5 py-3">
          <v-icon class="mb-1 text-[rgb(var(--v-theme-primary))]" icon="mdi-map-marker" />
          <p class="m-0 text-xs text-[rgba(var(--v-theme-on-surface),0.72)]">Location</p>
          <p class="mt-0.5 mb-0 text-sm font-semibold">{{ event.location }}</p>
        </article>
      </div>

      <v-btn-secondary
        block
        class="mt-4 !normal-case"
        prepend-icon="mdi-account-circle-outline"
        @click="emit('open-organizer-profile', event.host)"
      >
        {{ t('event.viewOrganizer') }}
      </v-btn-secondary>
    </v-card>

    <v-card class="border border-[rgba(var(--v-theme-primary),0.14)] p-4" color="surface" rounded="xl" variant="flat">
      <div class="mb-3 flex items-center justify-between gap-3">
        <p class="m-0 text-base font-semibold">{{ t('event.participants') }} ({{ event.participantsCount }})</p>
      </div>

      <div class="flex flex-wrap gap-3">
        <v-avatar
          v-for="(avatar, index) in event.participantsPreview"
          :key="avatar"
          :aria-label="`${t('event.participants')} ${index + 1}`"
          :image="avatar"
          size="48"
        />
      </div>
    </v-card>

    <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <v-btn-primary>
        {{ t('event.join') }}
      </v-btn-primary>

      <v-btn-secondary
        prepend-icon="mdi-chat-outline"
        @click="router.push(`/app/chat/${event.chatId}`)"
      >
        {{ t('chat.openChat') }}
      </v-btn-secondary>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'
  import type { FeedEvent, FeedEventHost } from '@/types/feed'

  defineProps<{
    event: FeedEvent
  }>()

  const emit = defineEmits<{
    'open-organizer-profile': [organizer: FeedEventHost]
  }>()

  const { t } = useI18n()
  const router = useRouter()
</script>
