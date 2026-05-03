<template>
  <div class="mx-auto flex w-full max-w-xl min-w-0 flex-col gap-4 pb-safe-sm lg:max-w-7xl lg:pb-6">
    <AppPageIntro :subtitle="t('settings.subtitle')" :title="t('settings.title')" />

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <SettingsSectionCard :description="t('settings.sections.mainDescription')" :title="t('settings.sections.main')">
        <div class="flex flex-col gap-2.5">
          <SettingsMenuRow icon="mdi-bell-outline" :title="t('settings.notifications')" to="/app/settings/notifications" />
          <SettingsMenuRow icon="mdi-weather-night" :title="t('settings.theme')" to="/app/settings/theme" />
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard :description="t('settings.sections.securityDescription')" :title="t('settings.sections.security')">
        <div class="flex flex-col gap-2.5">
          <SettingsMenuRow icon="mdi-shield-account-outline" :title="t('settings.privacy')" to="/app/settings/privacy" />
          <SettingsMenuRow icon="mdi-lock-check-outline" :title="t('settings.security')" to="/app/settings/security" />
        </div>
      </SettingsSectionCard>
    </div>

    <SettingsSectionCard :description="t('settings.sections.languageDescription')" :title="t('settings.sections.language')">
      <AppSelectGroup
        :aria-label="t('settings.sections.language')"
        :model-value="locale"
        :options="[
          { value: 'en', label: t('settings.languageEnglish') },
          { value: 'pt-BR', label: t('settings.languagePortuguese') },
        ]"
        @update:model-value="changeLocale"
      />
    </SettingsSectionCard>

    <SettingsSectionCard :description="t('settings.sections.accountDescription')" :title="t('settings.sections.account')">
      <div class="flex flex-col gap-2.5">
        <SettingsMenuRow disabled icon="mdi-lifebuoy" :subtitle="t('settings.comingSoon')" :title="t('settings.help')" />
        <SettingsMenuRow disabled icon="mdi-information-outline" :subtitle="t('settings.comingSoon')" :title="t('settings.about')" />
      </div>
    </SettingsSectionCard>

    <v-btn
      block
      class="!normal-case !font-semibold [font-family:var(--font-body)]"
      color="error"
      rounded="pill"
      variant="outlined"
    >
      {{ t('common.signOut') }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import SettingsMenuRow from '@/components/settings/SettingsMenuRow.vue'
  import SettingsSectionCard from '@/components/settings/SettingsSectionCard.vue'
  import AppPageIntro from '@/components/shared/AppPageIntro.vue'
  import AppSelectGroup from '@/components/shared/AppSelectGroup.vue'
  import { setLocale, type SupportedLocale } from '@/plugins/i18n'

  const { t, locale } = useI18n()

  function changeLocale (nextLocale: string) {
    const normalizedLocale: SupportedLocale = nextLocale === 'pt-BR' ? 'pt-BR' : 'en'

    setLocale(normalizedLocale)
    locale.value = normalizedLocale
  }
</script>
