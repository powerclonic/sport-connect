<template>
  <div class="mx-auto flex w-full max-w-xl min-w-0 flex-col gap-4 pb-safe-sm lg:max-w-7xl lg:pb-6">
    <AppPageIntro
      :back-label="t('common.back')"
      back-to="/app/profile"
      :subtitle="t('rating.historySubtitle')"
      :title="t('rating.historyTitle')"
    />

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <v-sheet class="p-4" rounded="lg">
        <h2 class="m-0 text-base font-bold">{{ t('rating.receivedTitle') }}</h2>

        <div v-if="appStore.ratingsReceived.length > 0" class="mt-3 flex flex-col gap-2.5">
          <article
            v-for="item in appStore.ratingsReceived"
            :key="item.id"
            class="rounded-xl border border-[rgba(var(--v-theme-on-surface),0.08)] bg-[rgba(var(--v-theme-on-surface),0.02)] p-3"
          >
            <div class="flex items-center justify-between gap-2">
              <strong class="text-sm">{{ item.author }}</strong>
              <span class="text-xs font-semibold text-[rgb(var(--v-theme-primary))]">{{ item.score.toFixed(1) }}</span>
            </div>

            <p class="mt-1.5 mb-0 text-sm leading-snug opacity-80">{{ item.comment }}</p>
          </article>
        </div>

        <p v-else class="mt-3 mb-0 rounded-xl border border-dashed border-[rgba(var(--v-theme-on-surface),0.2)] p-3 text-sm opacity-75">
          {{ t('profile.noRatingsYet') }}
        </p>
      </v-sheet>

      <v-sheet class="p-4" rounded="lg">
        <h2 class="m-0 text-base font-bold">{{ t('rating.givenTitle') }}</h2>

        <div v-if="appStore.ratingsGiven.length > 0" class="mt-3 flex flex-col gap-2.5">
          <article
            v-for="item in appStore.ratingsGiven"
            :key="item.id"
            class="rounded-xl border border-[rgba(var(--v-theme-on-surface),0.08)] bg-[rgba(var(--v-theme-on-surface),0.02)] p-3"
          >
            <div class="flex items-center justify-between gap-2">
              <strong class="text-sm">{{ item.targetName }}</strong>
              <span class="text-xs font-semibold text-[rgb(var(--v-theme-primary))]">{{ item.score.toFixed(1) }}</span>
            </div>

            <p class="mt-1.5 mb-0 text-sm leading-snug opacity-80">{{ item.comment }}</p>
          </article>
        </div>

        <p v-else class="mt-3 mb-0 rounded-xl border border-dashed border-[rgba(var(--v-theme-on-surface),0.2)] p-3 text-sm opacity-75">
          {{ t('rating.noGiven') }}
        </p>
      </v-sheet>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import AppPageIntro from '@/components/shared/AppPageIntro.vue'
  import { useAppStore } from '@/stores/app'

  const appStore = useAppStore()
  const { t } = useI18n()
</script>
