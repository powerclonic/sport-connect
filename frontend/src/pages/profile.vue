<template>
  <div class="mx-auto flex w-full max-w-xl min-w-0 flex-col gap-4 pb-safe-sm lg:max-w-7xl lg:pb-6">
    <AppPageIntro :subtitle="t('profile.subtitle')" :title="t('profile.title')" />
    <ProfileSummaryCard variant="page" />
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import ProfileSummaryCard from '@/components/profile/ProfileSummaryCard.vue'
  import AppPageIntro from '@/components/shared/AppPageIntro.vue'

  const { t } = useI18n()
</script>
