<template>
  <div class="mx-auto flex w-full max-w-xl min-w-0 flex-col gap-4 pb-safe-sm lg:max-w-4xl lg:pb-6">
    <AppPageIntro
      :back-label="t('common.back')"
      back-to="/app/settings"
      :subtitle="t('privacy.subtitle')"
      :title="t('privacy.title')"
    />

    <SettingsSectionCard :description="t('privacy.visibilityDescription')" :title="t('privacy.visibilityTitle')">
      <div class="flex flex-col gap-2.5">
        <SettingsToggleRow disabled icon="mdi-account-eye-outline" :model-value="true" :title="t('privacy.publicProfile')" />
        <SettingsToggleRow disabled icon="mdi-map-marker-radius-outline" :model-value="true" :title="t('privacy.approximateLocation')" />
        <SettingsToggleRow disabled icon="mdi-account-plus-outline" :model-value="false" :title="t('privacy.invites')" />
      </div>
    </SettingsSectionCard>

    <SettingsSectionCard :description="t('privacy.protectionDescription')" :title="t('privacy.protectionTitle')">
      <div class="flex flex-col gap-2.5">
        <SettingsMenuRow disabled icon="mdi-shield-lock-outline" :subtitle="t('privacy.comingSoon')" :title="t('privacy.twoFactor')" />
        <SettingsMenuRow disabled icon="mdi-devices" :subtitle="t('privacy.comingSoon')" :title="t('privacy.activeSessions')" />
        <SettingsMenuRow disabled icon="mdi-key-outline" :subtitle="t('privacy.comingSoon')" :title="t('privacy.password')" />
      </div>
    </SettingsSectionCard>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import SettingsMenuRow from '@/components/settings/SettingsMenuRow.vue'
  import SettingsSectionCard from '@/components/settings/SettingsSectionCard.vue'
  import SettingsToggleRow from '@/components/settings/SettingsToggleRow.vue'
  import AppPageIntro from '@/components/shared/AppPageIntro.vue'

  const { t } = useI18n()
</script>
