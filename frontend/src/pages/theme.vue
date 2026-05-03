<template>
  <div class="mx-auto flex w-full max-w-xl min-w-0 flex-col gap-4 pb-safe-sm">
    <AppPageIntro
      :back-label="t('common.back')"
      back-to="/app/settings"
      :subtitle="t('theme.subtitle')"
      :title="t('theme.title')"
    />

    <SettingsSectionCard :description="t('theme.description')" :title="t('theme.selectionTitle')">
      <div class="grid gap-2.5 sm:grid-cols-3">
        <v-sheet
          v-for="option in themeOptions"
          :key="option.value"
          class="min-h-24 cursor-pointer p-3 text-left transition duration-200 active:scale-[0.985] [font-family:var(--font-body)]"
          :class="selectedMode === option.value
            ? '!border-[rgb(var(--v-theme-primary))] !bg-[rgba(var(--v-theme-primary),0.14)] !text-[rgb(var(--v-theme-primary-darken-1))] !shadow-[0_8px_20px_rgba(var(--v-theme-primary),0.14)]'
            : '!border-transparent !bg-[rgb(var(--v-theme-surface-variant))] !text-[rgb(var(--v-theme-on-surface))]'"
          rounded="xl"
          role="button"
          :tabindex="0"
          @click="setThemeMode(option.value)"
          @keydown.enter="setThemeMode(option.value)"
          @keydown.space.prevent="setThemeMode(option.value)"
        >
          <div class="mb-2 flex items-center justify-between gap-2">
            <v-icon :icon="option.icon" size="22" />
            <v-icon :icon="selectedMode === option.value ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'" size="20" />
          </div>
          <div class="text-base font-semibold [font-family:var(--font-body)]">
            {{ option.label }}
          </div>
        </v-sheet>
      </div>
    </SettingsSectionCard>

    <v-btn-primary class="!normal-case !font-semibold [font-family:var(--font-body)]">
      {{ t('common.save') }}
    </v-btn-primary>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useTheme } from 'vuetify'
  import AppPageIntro from '@/components/shared/AppPageIntro.vue'
  import SettingsSectionCard from '@/components/settings/SettingsSectionCard.vue'
  import {
    applyDocumentColorScheme,
    getStoredThemeMode,
    resolveThemeName,
    setThemeModePreference,
    type ThemeMode,
  } from '@/plugins/vuetify'

  const { t } = useI18n()
  const theme = useTheme()
  const selectedMode = ref<ThemeMode>(getStoredThemeMode() ?? 'system')

  const themeOptions = computed(() => [
    { value: 'system' as const, label: t('theme.system'), icon: 'mdi-cellphone' },
    { value: 'light' as const, label: t('theme.light'), icon: 'mdi-weather-sunny' },
    { value: 'dark' as const, label: t('theme.dark'), icon: 'mdi-weather-night' },
  ])

  function setThemeMode (mode: ThemeMode) {
    selectedMode.value = mode
    const nextTheme = resolveThemeName(mode)
    theme.change(nextTheme)
    setThemeModePreference(mode)
    applyDocumentColorScheme(nextTheme)
  }

  const resolvedTheme = computed(() => resolveThemeName(selectedMode.value))

  if (theme.global.name.value !== resolvedTheme.value) {
    theme.change(resolvedTheme.value)
    applyDocumentColorScheme(resolvedTheme.value)
  }
</script>
