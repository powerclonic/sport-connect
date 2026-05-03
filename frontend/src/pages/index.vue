<template>
  <main class="relative flex min-h-dvh w-full flex-col overflow-hidden">
    <div
      aria-hidden="true"
      class="absolute inset-0 z-0 bg-cover bg-center"
      style="background-image: url('https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1400&q=80');"
    >
      <div
        class="absolute inset-0 bg-linear-to-t from-[rgba(0,0,0,0.90)] via-[rgba(0,0,0,0.40)] to-[rgba(0,0,0,0.30)] [backdrop-filter:blur(2px)] [-webkit-backdrop-filter:blur(2px)]"
      />
    </div>

    <div class="relative z-10 mx-auto flex min-h-dvh w-full max-w-7xl flex-col justify-between px-6 py-6">
      <header class="flex flex-col items-center gap-3 pt-1 max-sm:gap-2.5 md:gap-3.5">
        <div class="inline-flex w-full items-center justify-between gap-2">
          <AppSelectGroup
            :aria-label="t('common.locale')"
            :model-value="currentLocale"
            :options="localeOptions"
            variant="glass"
            @update:model-value="(v) => changeLocale(v as SupportedLocale)"
          />

          <AppSelectGroup
            :aria-label="t('common.theme')"
            :model-value="currentThemeSelection"
            :options="themeOptions"
            variant="glass"
            @update:model-value="(v) => setThemeMode(v as 'light' | 'dark')"
          />
        </div>

        <!-- Brand mark: mobile/tablet only — desktop shows it in the left column -->
        <AppBrandMark
          class="lg:hidden"
          hero-shadow
          :label="t('app.brand')"
          size="hero"
          sport-tone="inverse"
        />
      </header>

      <section
        :aria-label="t('entry.title')"
        class="mx-auto mt-auto flex w-full max-w-md flex-col gap-8 pb-2 md:mx-0 lg:mx-auto lg:mt-0 lg:max-w-5xl lg:flex-1 lg:flex-row lg:items-center lg:gap-16 lg:pb-10"
      >
        <!-- Left column: brand + hero text (desktop only) -->
        <div class="hidden flex-col gap-5 lg:flex lg:flex-1">
          <AppBrandMark
            align="start"
            hero-shadow
            :label="t('app.brand')"
            size="hero"
            sport-tone="inverse"
          />

          <div>
            <h1
              class="m-0 mb-2 text-4xl leading-tight font-bold tracking-tighter text-[color:color-mix(in_srgb,rgb(var(--v-theme-on-background))_18%,white_82%)] md:text-5xl [font-family:var(--font-heading)] [text-shadow:0_2px_8px_rgba(0,0,0,0.5)]"
            >
              {{ t('entry.title') }}
            </h1>

            <p
              class="m-0 text-lg leading-relaxed font-normal text-[color:color-mix(in_srgb,rgb(var(--v-theme-on-surface-variant))_24%,white_76%)] [font-family:var(--font-body)] [text-shadow:0_1px_4px_rgba(0,0,0,0.4)]"
            >
              {{ t('entry.subtitle') }}
            </p>
          </div>
        </div>

        <!-- Right column: always visible. Mobile shows hero text above cards; desktop shows cards only. -->
        <div class="flex flex-col gap-8 lg:w-[400px] lg:shrink-0 lg:gap-4">
          <!-- Hero text: mobile/tablet only -->
          <div class="text-center md:text-left lg:hidden">
            <h1
              class="m-0 mb-2 text-4xl leading-tight font-bold tracking-tighter text-[color:color-mix(in_srgb,rgb(var(--v-theme-on-background))_18%,white_82%)] md:text-5xl [font-family:var(--font-heading)] [text-shadow:0_2px_8px_rgba(0,0,0,0.5)]"
            >
              {{ t('entry.title') }}
            </h1>

            <p
              class="m-0 text-lg leading-relaxed font-normal text-[color:color-mix(in_srgb,rgb(var(--v-theme-on-surface-variant))_24%,white_76%)] [font-family:var(--font-body)] [text-shadow:0_1px_4px_rgba(0,0,0,0.4)]"
            >
              {{ t('entry.subtitle') }}
            </p>
          </div>

          <!-- Entry cards -->
          <div class="flex flex-col gap-4">
            <FormSectionCard
              class="motion-reduce:transition-none hover:-translate-y-0.5 rounded-xl border-[rgba(var(--v-theme-primary),0.2)] bg-[rgb(var(--v-theme-surface))] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-transform duration-300"
            >
              <template #header>
                <div class="mb-2 flex items-center gap-2">
                  <v-icon class="text-[rgb(var(--v-theme-primary))]!" icon="mdi-run" size="22" />

                  <h2
                    class="m-0 text-2xl leading-snug font-semibold text-[rgb(var(--v-theme-on-surface))] [font-family:var(--font-heading)]"
                  >
                    {{ t('entry.athletes.title') }}
                  </h2>
                </div>

                <p class="m-0 mb-4 text-base leading-relaxed font-normal text-[rgb(var(--v-theme-on-surface-variant))] [font-family:var(--font-body)]">
                  {{ t('entry.athletes.description') }}
                </p>
              </template>

              <div class="flex flex-col gap-3">
                <div class="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <v-btn-primary
                    class="!min-w-0 !text-sm !font-semibold !tracking-wide !normal-case [font-family:var(--font-body)]"
                    size="large"
                    to="/register"
                  >
                    {{ t('entry.athletes.register') }}
                    <v-icon end icon="mdi-arrow-right" />
                  </v-btn-primary>

                  <v-btn-secondary
                    class="!min-w-0 !text-sm !font-semibold !tracking-wide !normal-case sm:!flex-1 [font-family:var(--font-body)]"
                    size="large"
                    to="/login"
                  >
                    {{ t('entry.athletes.enter') }}
                  </v-btn-secondary>
                </div>

                <div class="relative flex items-center gap-3">
                  <div class="h-px flex-1 bg-[rgba(var(--v-theme-on-surface),0.12)]" />
                  <span class="text-xs text-[rgb(var(--v-theme-on-surface-variant))] [font-family:var(--font-body)]">
                    {{ t('auth.orContinueWith') }}
                  </span>
                  <div class="h-px flex-1 bg-[rgba(var(--v-theme-on-surface),0.12)]" />
                </div>

                <GoogleOAuthButton class="!w-full" size="large" />
              </div>
            </FormSectionCard>

            <EntryBusinessGlassCard
              :badge="t('entry.businesses.badge')"
              :description="t('entry.businesses.description')"
              :title="t('entry.businesses.title')"
            />
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<script lang="ts" setup>
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useTheme } from 'vuetify'
  import AppBrandMark from '@/components/shared/AppBrandMark.vue'
  import AppSelectGroup from '@/components/shared/AppSelectGroup.vue'
  import EntryBusinessGlassCard from '@/components/shared/EntryBusinessGlassCard.vue'
  import FormSectionCard from '@/components/shared/FormSectionCard.vue'
  import GoogleOAuthButton from '@/components/auth/GoogleOAuthButton.vue'
  import { setLocale, type SupportedLocale } from '@/plugins/i18n'
  import {
    applyDocumentColorScheme,
    getStoredThemeMode,
    resolveThemeName,
    setThemeModePreference,
    type ThemeMode,
  } from '@/plugins/vuetify'

  const { t, locale } = useI18n()
  const theme = useTheme()
  const themeMode = ref<ThemeMode>(getStoredThemeMode() ?? 'system')
  const prefersDarkMedia = typeof window === 'undefined' ? null : window.matchMedia('(prefers-color-scheme: dark)')

  const localeOptions = computed(() => [
    { value: 'pt-BR' as SupportedLocale, label: 'PT' },
    { value: 'en' as SupportedLocale, label: 'EN' },
  ])

  const currentLocale = computed(() => (locale.value === 'pt-BR' ? 'pt-BR' : 'en'))

  const currentThemeSelection = computed<'light' | 'dark'>(() => {
    return resolveThemeName(themeMode.value) === 'sportDark' ? 'dark' : 'light'
  })

  const themeOptions = computed(() => [
    { value: 'light' as const, icon: 'mdi-weather-sunny' },
    { value: 'dark' as const, icon: 'mdi-weather-night' },
  ])

  function changeLocale (nextLocale: SupportedLocale) {
    if (nextLocale === currentLocale.value) return
    setLocale(nextLocale)
    locale.value = nextLocale
  }

  function applyThemeMode (mode: ThemeMode) {
    const nextThemeName = resolveThemeName(mode)
    theme.change(nextThemeName)
    setThemeModePreference(mode)
    applyDocumentColorScheme(nextThemeName)
  }

  function setThemeMode (nextMode: 'light' | 'dark') {
    if (nextMode === currentThemeSelection.value) return
    themeMode.value = nextMode
    applyThemeMode(nextMode)
  }

  function handleSystemThemeChange () {
    if (themeMode.value !== 'system') return
    applyThemeMode('system')
  }

  applyThemeMode(themeMode.value)

  onMounted(() => {
    prefersDarkMedia?.addEventListener('change', handleSystemThemeChange)
  })

  onBeforeUnmount(() => {
    prefersDarkMedia?.removeEventListener('change', handleSystemThemeChange)
  })
</script>
