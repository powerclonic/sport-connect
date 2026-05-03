<template>
  <div class="flex flex-col gap-4">
    <section
      class="rounded-2xl border border-[rgba(var(--v-theme-primary),0.2)] bg-[rgba(var(--v-theme-primary),0.07)] px-4 py-4 text-center"
    >
      <v-avatar
        class="mx-auto border-4 border-[rgb(var(--v-theme-surface))] shadow-[0_16px_36px_rgba(15,23,42,0.18)]"
        :image="organizer.image"
        :size="88"
      />

      <h2 class="mt-3 mb-0 text-2xl leading-tight font-black [font-family:var(--font-heading)]">{{ organizer.name }}</h2>
      <p class="mt-1 mb-0 text-sm opacity-75">{{ organizer.location }}</p>
    </section>

    <div class="grid grid-cols-3 gap-3">
      <article class="rounded-2xl border border-[rgba(var(--v-theme-on-surface),0.08)] bg-[rgba(var(--v-theme-on-surface),0.03)] p-3.5 text-center">
        <p class="m-0 text-xs opacity-70">{{ t('profile.gamesPlayed') }}</p>
        <strong class="mt-1 block text-2xl leading-none [font-family:var(--font-heading)]">{{ organizer.gamesPlayed }}</strong>
      </article>

      <article class="rounded-2xl border border-[rgba(var(--v-theme-on-surface),0.08)] bg-[rgba(var(--v-theme-on-surface),0.03)] p-3.5 text-center">
        <p class="m-0 text-xs opacity-70">{{ t('profile.averageRating') }}</p>
        <strong class="mt-1 block text-2xl leading-none text-[rgb(var(--v-theme-primary))] [font-family:var(--font-heading)]">
          {{ organizer.rating }}
        </strong>
      </article>

      <article class="rounded-2xl border border-[rgba(var(--v-theme-on-surface),0.08)] bg-[rgba(var(--v-theme-on-surface),0.03)] p-3.5 text-center">
        <p class="m-0 text-xs opacity-70">{{ t('organizerProfile.reliability') }}</p>
        <strong class="mt-1 block text-2xl leading-none [font-family:var(--font-heading)]">{{ organizer.reliability }}</strong>
      </article>
    </div>

    <section class="rounded-2xl border border-[rgba(var(--v-theme-on-surface),0.08)] bg-[rgba(var(--v-theme-on-surface),0.02)] p-3.5">
      <h3 class="m-0 text-base font-bold">{{ t('profile.favoriteSports') }}</h3>

      <div class="mt-2.5 flex flex-wrap gap-2">
        <v-chip
          v-for="sport in organizer.favoriteSports"
          :key="sport"
          color="primary"
          size="small"
          variant="tonal"
        >{{ sport }}</v-chip>
      </div>
    </section>

    <section
      v-if="organizer.feedback.length > 0"
      class="rounded-2xl border border-[rgba(var(--v-theme-on-surface),0.08)] bg-[rgba(var(--v-theme-on-surface),0.02)] p-3.5"
    >
      <h3 class="m-0 mb-3 text-base font-bold">{{ t('profile.recentFeedback') }}</h3>

      <div class="flex flex-col gap-3">
        <div
          v-for="fb in organizer.feedback.slice(0, 3)"
          :key="fb.id"
          class="flex flex-col gap-1"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="text-sm font-semibold">{{ fb.author }}</span>
            <span class="flex items-center gap-1 text-sm font-bold text-[rgb(var(--v-theme-primary))]">
              <v-icon icon="mdi-star" size="14" />
              {{ fb.score }}
            </span>
          </div>
          <p class="m-0 text-sm opacity-75">{{ fb.comment }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import type { OrganizerProfile } from '@/types/feed'

  defineProps<{
    organizer: OrganizerProfile
  }>()

  const { t } = useI18n()
</script>
