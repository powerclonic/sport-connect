<template>
  <div class="mx-auto flex w-full max-w-xl min-w-0 flex-col gap-4 pb-safe-sm lg:max-w-7xl lg:pb-6">
    <AppPageIntro :subtitle="t('profile.organizerSubtitle')" :title="profileTitle" />

    <section class="rounded-2xl border border-[rgba(var(--v-theme-primary),0.2)] bg-[rgba(var(--v-theme-primary),0.07)] px-5 py-5">
      <div class="flex items-center gap-4">
        <v-avatar
          class="border-4 border-[rgb(var(--v-theme-surface))] shadow-[0_12px_24px_rgba(15,23,42,0.18)]"
          :image="profile.image"
          size="96"
        />

        <div class="min-w-0 flex-1">
          <h2 class="m-0 text-2xl leading-tight font-black [font-family:var(--font-heading)]">{{ profile.name }}</h2>
          <p class="mt-1 mb-0 text-sm opacity-75">{{ profile.location }}</p>
          <div class="mt-2 flex items-center gap-2 text-sm font-bold text-[rgb(var(--v-theme-on-surface))]">
            <v-icon class="text-[rgb(var(--v-theme-primary))]!" icon="mdi-star" size="16" />
            <span>{{ profile.rating }}</span>
          </div>
        </div>
      </div>
    </section>

    <div class="grid grid-cols-2 gap-3">
      <article class="rounded-2xl border border-[rgba(var(--v-theme-on-surface),0.08)] bg-[rgba(var(--v-theme-on-surface),0.03)] p-3.5">
        <p class="m-0 text-xs opacity-70">{{ t('profile.gamesPlayed') }}</p>
        <strong class="mt-1 block text-2xl leading-none [font-family:var(--font-heading)]">{{ profile.gamesPlayed }}</strong>
      </article>

      <article class="rounded-2xl border border-[rgba(var(--v-theme-on-surface),0.08)] bg-[rgba(var(--v-theme-on-surface),0.03)] p-3.5">
        <p class="m-0 text-xs opacity-70">{{ t('profile.reliability') }}</p>
        <strong class="mt-1 block text-2xl leading-none text-[rgb(var(--v-theme-primary))] [font-family:var(--font-heading)]">
          {{ profile.reliability }}
        </strong>
      </article>
    </div>

    <section class="rounded-2xl border border-[rgba(var(--v-theme-on-surface),0.08)] bg-[rgba(var(--v-theme-on-surface),0.02)] p-3.5">
      <h3 class="m-0 text-base font-bold">{{ t('profile.favoriteSports') }}</h3>

      <div class="mt-2.5 flex flex-wrap gap-2">
        <v-chip
          v-for="sport in profile.favoriteSports"
          :key="sport"
          color="primary"
          size="small"
          variant="tonal"
        >
          {{ sport }}
        </v-chip>
      </div>
    </section>

    <section class="rounded-2xl border border-[rgba(var(--v-theme-on-surface),0.08)] bg-[rgba(var(--v-theme-on-surface),0.02)] p-3.5">
      <h3 class="m-0 text-base font-bold">{{ t('profile.recentFeedback') }}</h3>

      <div class="mt-2.5 flex flex-col gap-2">
        <article
          v-for="item in profile.feedback"
          :key="item.id"
          class="rounded-xl border border-[rgba(var(--v-theme-on-surface),0.08)] bg-[rgba(var(--v-theme-on-surface),0.02)] px-3 py-2.5"
        >
          <div class="flex items-center justify-between gap-2">
            <strong class="text-sm">{{ item.author }}</strong>
            <span class="text-xs font-semibold text-[rgb(var(--v-theme-primary))]">{{ item.score.toFixed(1) }}</span>
          </div>

          <p class="mt-1.5 mb-0 text-sm leading-snug opacity-80">{{ item.comment }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute } from 'vue-router'
  import AppPageIntro from '@/components/shared/AppPageIntro.vue'
  import { useFeedCatalog } from '@/composables/feed/useFeedCatalog'

  const { t } = useI18n()
  const route = useRoute()
  const { getOrganizerById } = useFeedCatalog()

  const organizerId = computed(() => String(route.params.id || ''))

  const profile = computed(() => {
    return getOrganizerById(organizerId.value) ?? {
      id: organizerId.value,
      name: t('profile.organizerUnknown'),
      image: '',
      rating: '4.5',
      location: '-',
      gamesPlayed: 0,
      reliability: '0%',
      favoriteSports: [],
      feedback: [],
    }
  })

  const profileTitle = computed(() => `${t('profile.organizerTitle')}: ${profile.value.name}`)
</script>
