<template>
  <div class="mx-auto flex w-full max-w-xl min-w-0 flex-col gap-4 pb-safe-sm lg:max-w-4xl lg:pb-6">
    <AppPageIntro
      :back-label="t('common.back')"
      back-to="/app/settings"
      :subtitle="t('notifications.subtitle')"
      :title="t('notifications.title')"
    />

    <SettingsSectionCard :description="t('notifications.channelsDescription')" :title="t('notifications.channelsTitle')">
      <div class="flex flex-col gap-2.5">
        <SettingsToggleRow v-model="pushEnabled" icon="mdi-bell-ring-outline" :title="t('notifications.push')" />
        <SettingsToggleRow v-model="emailEnabled" icon="mdi-email-outline" :title="t('notifications.email')" />
        <SettingsToggleRow v-model="smsEnabled" icon="mdi-message-text-outline" :title="t('notifications.sms')" />
      </div>
    </SettingsSectionCard>

    <SettingsSectionCard :description="t('notifications.typesDescription')" :title="t('notifications.typesTitle')">
      <div class="flex flex-col gap-2.5">
        <SettingsToggleRow v-model="upcomingEnabled" icon="mdi-calendar-clock" :title="t('notifications.upcoming')" />
        <SettingsToggleRow v-model="chatEnabled" icon="mdi-chat-outline" :title="t('notifications.chat')" />
        <SettingsToggleRow v-model="eventsEnabled" icon="mdi-bell-outline" :title="t('notifications.events')" />

        <SettingsToggleRow
          v-model="performanceEnabled"
          disabled
          icon="mdi-chart-line"
          :subtitle="t('notifications.comingSoon')"
          :title="t('notifications.performance')"
        />
      </div>
    </SettingsSectionCard>

    <v-btn-primary class="!normal-case !font-semibold [font-family:var(--font-body)]">
      {{ t('common.save') }}
    </v-btn-primary>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import SettingsSectionCard from '@/components/settings/SettingsSectionCard.vue'
  import SettingsToggleRow from '@/components/settings/SettingsToggleRow.vue'
  import AppPageIntro from '@/components/shared/AppPageIntro.vue'

  const { t } = useI18n()

  const pushEnabled = ref(true)
  const emailEnabled = ref(true)
  const smsEnabled = ref(false)

  const upcomingEnabled = ref(true)
  const chatEnabled = ref(true)
  const eventsEnabled = ref(true)
  const performanceEnabled = ref(false)
</script>
