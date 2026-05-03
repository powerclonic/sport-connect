<template>
  <div class="flex flex-col gap-4">
    <section
      class="rounded-2xl border border-[rgba(var(--v-theme-primary),0.2)] bg-[rgba(var(--v-theme-primary),0.07)] px-4 py-4 text-center"
      :class="variant === 'sheet' ? '' : 'sm:px-5 sm:py-5'"
    >
      <v-avatar
        class="mx-auto border-4 border-[rgb(var(--v-theme-surface))] shadow-[0_16px_36px_rgba(15,23,42,0.18)]"
        :image="displayAvatar"
        :size="variant === 'sheet' ? 88 : 104"
      />

      <h2 class="mt-3 mb-0 text-2xl leading-tight font-black [font-family:var(--font-heading)]">{{ displayName }}</h2>
      <p class="mt-1 mb-0 text-sm opacity-75">{{ displayLocation }}</p>

      <div v-if="!isExternalProfile" class="mt-3 flex flex-wrap items-center justify-center gap-2">
        <v-btn-primary
          @click="router.push('/app/profile/avatar')"
        >
          <template #prepend>
            <v-icon icon="mdi-camera-outline" size="16" />
          </template>
          {{ t('profile.editAvatar') }}
        </v-btn-primary>

        <v-btn-secondary
          @click="router.push('/app/profile/ratings')"
        >
          <template #prepend>
            <v-icon icon="mdi-star-outline" size="16" />
          </template>
          {{ t('profile.viewRatings') }}
        </v-btn-secondary>
      </div>
    </section>

    <div class="grid gap-3" :class="isExternalProfile ? 'grid-cols-3' : 'grid-cols-2'">
      <article class="rounded-2xl border border-[rgba(var(--v-theme-on-surface),0.08)] bg-[rgba(var(--v-theme-on-surface),0.03)] p-3.5">
        <p class="m-0 text-xs opacity-70">{{ t('profile.gamesPlayed') }}</p>
        <strong class="mt-1 block text-2xl leading-none [font-family:var(--font-heading)]">{{ displayGamesPlayed }}</strong>
      </article>

      <article class="rounded-2xl border border-[rgba(var(--v-theme-on-surface),0.08)] bg-[rgba(var(--v-theme-on-surface),0.03)] p-3.5">
        <p class="m-0 text-xs opacity-70">{{ t('profile.averageRating') }}</p>

        <strong class="mt-1 block text-2xl leading-none text-[rgb(var(--v-theme-primary))] [font-family:var(--font-heading)]">
          {{ displayRating }}
        </strong>
      </article>

      <article
        v-if="isExternalProfile"
        class="rounded-2xl border border-[rgba(var(--v-theme-on-surface),0.08)] bg-[rgba(var(--v-theme-on-surface),0.03)] p-3.5"
      >
        <p class="m-0 text-xs opacity-70">{{ t('profile.reliability') }}</p>
        <strong class="mt-1 block text-2xl leading-none [font-family:var(--font-heading)]">{{ displayReliability }}</strong>
      </article>
    </div>

    <section class="rounded-2xl border border-[rgba(var(--v-theme-on-surface),0.08)] bg-[rgba(var(--v-theme-on-surface),0.02)] p-3.5">
      <h3 class="m-0 text-base font-bold">{{ t('profile.favoriteSports') }}</h3>

      <div class="mt-2.5 flex flex-wrap gap-2">
        <v-chip
          v-for="sport in displaySports"
          :key="sport"
          color="primary"
          size="small"
          variant="tonal"
        >{{ sport }}</v-chip>
      </div>
    </section>

    <section class="rounded-2xl border border-[rgba(var(--v-theme-on-surface),0.08)] bg-[rgba(var(--v-theme-on-surface),0.02)] p-3.5">
      <div class="flex items-center justify-between gap-2">
        <h3 class="m-0 text-base font-bold">{{ t('profile.recentFeedback') }}</h3>

        <v-chip
          v-if="!isExternalProfile"
          class="text-xs"
          color="primary"
          label
          size="x-small"
          variant="tonal"
        >
          {{ appStore.ratingsReceived.length }}
        </v-chip>
      </div>

      <div v-if="visibleFeedback.length > 0" class="mt-2.5 flex flex-col gap-2">
        <article
          v-for="item in visibleRatings"
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

      <div
        v-else
        class="mt-2.5 rounded-xl border border-dashed border-[rgba(var(--v-theme-on-surface),0.2)] px-3 py-3 text-sm opacity-75"
      >
        {{ t('profile.noRatingsYet') }}
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'
  import { useAppStore } from '@/stores/app'
  import { useAuthStore } from '@/stores/auth'
  import type { OrganizerProfile } from '@/types/feed'

  const props = withDefaults(defineProps<{
    variant?: 'page' | 'sheet'
    profile?: OrganizerProfile | null
  }>(), {
    variant: 'page',
    profile: null,
  })

  const { t } = useI18n()
  const router = useRouter()
  const appStore = useAppStore()
  const authStore = useAuthStore()
  const isExternalProfile = computed(() => props.profile !== null)

  const displayAvatar = computed(() =>
    props.profile?.image ?? authStore.user?.avatar_url ?? appStore.avatarUrl,
  )
  const displayName = computed(() =>
    props.profile?.name ?? authStore.user?.display_name ?? authStore.user?.email ?? 'Athlete',
  )
  const displayLocation = computed(() => props.profile?.location ?? '')
  const displayGamesPlayed = computed(() => props.profile?.gamesPlayed ?? 142)
  const displayRating = computed(() => props.profile?.rating ?? appStore.averageRating.toFixed(1))
  const displayReliability = computed(() => props.profile?.reliability ?? '-')
  const displaySports = computed(() => props.profile?.favoriteSports ?? ['Football', 'Volleyball', 'Running'])
  const visibleFeedback = computed(() => props.profile?.feedback ?? appStore.ratingsReceived)

  const visibleRatings = computed(() => visibleFeedback.value.slice(0, 3))
</script>
