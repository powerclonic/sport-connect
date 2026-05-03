<template>
  <div class="mx-auto flex w-full max-w-xl min-w-0 flex-col gap-4 pb-safe-sm lg:max-w-4xl lg:pb-6">
    <AppPageIntro
      :back-label="t('common.back')"
      back-to="/app/settings"
      :subtitle="t('security.subtitle')"
      :title="t('security.title')"
    />

    <SettingsSectionCard :description="t('security.accessDescription')" :title="t('security.accessTitle')">
      <div class="flex flex-col gap-2.5">
        <SettingsMenuRow
          disabled
          icon="mdi-shield-key-outline"
          :subtitle="t('security.comingSoon')"
          :title="t('security.passkeys')"
        />

        <SettingsMenuRow
          disabled
          icon="mdi-fingerprint"
          :subtitle="t('security.comingSoon')"
          :title="t('security.biometric')"
        />
      </div>
    </SettingsSectionCard>

    <SettingsSectionCard :description="t('security.sessionsDescription')" :title="t('security.sessionsTitle')">
      <div class="flex flex-col gap-2.5">
        <SettingsMenuRow
          disabled
          icon="mdi-devices"
          :subtitle="t('security.comingSoon')"
          :title="t('security.activeSessions')"
        />

        <SettingsMenuRow
          disabled
          icon="mdi-history"
          :subtitle="t('security.comingSoon')"
          :title="t('security.loginHistory')"
        />
      </div>
    </SettingsSectionCard>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import SettingsMenuRow from '@/components/settings/SettingsMenuRow.vue'
  import SettingsSectionCard from '@/components/settings/SettingsSectionCard.vue'
  import AppPageIntro from '@/components/shared/AppPageIntro.vue'

  const { t } = useI18n()
</script>
