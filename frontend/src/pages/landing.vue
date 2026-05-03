<template>
  <div
    class="relative min-h-dvh overflow-x-hidden bg-[rgb(var(--v-theme-background))] text-[rgb(var(--v-theme-on-background))]"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
  >
    <!-- Animated cursor glow background -->
    <div
      aria-hidden="true"
      class="pointer-events-none fixed inset-0 z-0 transition-opacity duration-700"
      :style="cursorGlowStyle"
    />

    <!-- Floating orbs (physics handled in JS lerp loop, no CSS transition needed) -->
    <div aria-hidden="true" class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div class="absolute rounded-full opacity-[0.07] blur-3xl" :style="orb1Style" />
      <div class="absolute rounded-full opacity-[0.05] blur-3xl" :style="orb2Style" />
      <div class="absolute rounded-full opacity-[0.06] blur-2xl" :style="orb3Style" />
    </div>

    <!-- Content -->
    <div class="relative z-10">

      <!-- Sticky nav -->
      <nav class="sticky top-0 z-20 flex items-center justify-between border-b border-[rgba(var(--v-theme-on-background),0.06)] bg-[rgba(var(--v-theme-background),0.8)] px-6 py-4 [backdrop-filter:blur(16px)] [-webkit-backdrop-filter:blur(16px)] md:px-10">
        <AppBrandMark
          :label="t('app.brand')"
          size="compact"
          sport-tone="shell"
        />

        <div class="flex items-center gap-2">
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
      </nav>

      <!-- Hero -->
      <section class="mx-auto flex min-h-[88dvh] max-w-6xl flex-col items-center justify-center px-6 py-20 text-center md:px-10">
        <div
          class="mb-5 inline-flex items-center gap-2 rounded-full border border-[rgba(var(--v-theme-primary),0.3)] bg-[rgba(var(--v-theme-primary),0.08)] px-4 py-1.5"
        >
          <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-[rgb(var(--v-theme-primary))]" />
          <span class="text-xs font-semibold tracking-widest uppercase text-[rgb(var(--v-theme-primary))] [font-family:var(--font-body)]">
            {{ t('landing.hero.badge') }}
          </span>
        </div>

        <h1
          class="mb-6 text-[clamp(2.6rem,7vw,5.5rem)] font-black leading-[1.05] tracking-tighter text-[rgb(var(--v-theme-on-background))] [font-family:var(--font-heading)]"
        >
          {{ t('landing.hero.titleLine1') }}
          <br />
          <span class="text-[rgb(var(--v-theme-primary))]">{{ t('landing.hero.titleLine2') }}</span>
        </h1>

        <p
          class="mb-10 max-w-2xl text-[clamp(1rem,2.2vw,1.25rem)] leading-relaxed text-[rgb(var(--v-theme-on-surface-variant))] [font-family:var(--font-body)]"
        >
          {{ t('landing.hero.subtitle') }}
        </p>

        <div class="flex flex-col items-center gap-4 sm:flex-row">
          <v-btn-primary
            color="primary"
            size="x-large"
            to="/register"
          >
            {{ t('landing.hero.cta.register') }}
            <v-icon class="ml-1" end icon="mdi-arrow-right" size="20" />
          </v-btn-primary>

          <v-btn-secondary
            size="x-large"
            to="/login"
          >
            {{ t('landing.hero.cta.login') }}
          </v-btn-secondary>
        </div>

        <!-- Scroll hint -->
        <div class="mt-20 flex flex-col items-center gap-2 opacity-40">
          <span class="text-xs uppercase tracking-widest [font-family:var(--font-body)]">{{ t('landing.hero.scrollHint') }}</span>
          <div class="h-8 w-px bg-current" />
        </div>
      </section>

      <!-- Features -->
      <section class="mx-auto max-w-6xl px-6 py-20 md:px-10">
        <div class="mb-14 text-center">
          <h2
            class="mb-3 text-[clamp(1.8rem,4vw,3rem)] font-black tracking-tight text-[rgb(var(--v-theme-on-background))] [font-family:var(--font-heading)]"
          >
            {{ t('landing.features.title') }}
          </h2>
          <p class="text-base text-[rgb(var(--v-theme-on-surface-variant))] [font-family:var(--font-body)]">
            {{ t('landing.features.subtitle') }}
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="feature in currentFeatures"
            :key="feature.key"
            class="group relative overflow-hidden rounded-2xl border border-[rgba(var(--v-theme-primary),0.1)] bg-[rgb(var(--v-theme-surface))] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(var(--v-theme-primary),0.28)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
          >
            <div
              class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(var(--v-theme-primary),0.1)] transition-colors duration-300 group-hover:bg-[rgba(var(--v-theme-primary),0.18)]"
            >
              <v-icon :icon="feature.icon" size="24" color="primary" />
            </div>
            <h3
              class="mb-2 text-lg font-bold text-[rgb(var(--v-theme-on-surface))] [font-family:var(--font-heading)]"
            >
              {{ t(feature.titleKey) }}
            </h3>
            <p class="text-sm leading-relaxed text-[rgb(var(--v-theme-on-surface-variant))] [font-family:var(--font-body)]">
              {{ t(feature.descKey) }}
            </p>
          </div>
        </div>
      </section>

      <!-- Coming soon -->
      <section class="mx-auto max-w-6xl px-6 py-20 md:px-10">
        <div class="mb-14 text-center">
          <div class="mb-4 inline-flex items-center gap-2 rounded-full border border-[rgba(var(--v-theme-primary),0.3)] bg-[rgba(var(--v-theme-primary),0.08)] px-4 py-1.5">
            <v-icon icon="mdi-rocket-launch-outline" size="14" color="primary" />
            <span class="text-xs font-semibold uppercase tracking-widest text-[rgb(var(--v-theme-primary))] [font-family:var(--font-body)]">
              {{ t('landing.comingSoon.badge') }}
            </span>
          </div>
          <h2
            class="mb-3 text-[clamp(1.8rem,4vw,3rem)] font-black tracking-tight text-[rgb(var(--v-theme-on-background))] [font-family:var(--font-heading)]"
          >
            {{ t('landing.comingSoon.title') }}
          </h2>
          <p class="mx-auto max-w-2xl text-base leading-relaxed text-[rgb(var(--v-theme-on-surface-variant))] [font-family:var(--font-body)]">
            {{ t('landing.comingSoon.subtitle') }}
          </p>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Athletes future -->
          <div class="relative overflow-hidden rounded-3xl border border-[rgba(var(--v-theme-primary),0.12)] bg-[rgb(var(--v-theme-surface))] p-8">
            <div aria-hidden="true" class="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[rgb(var(--v-theme-primary))] opacity-[0.05] blur-2xl" />
            <div class="mb-6 flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(var(--v-theme-primary),0.1)]">
                <v-icon icon="mdi-run-fast" size="22" color="primary" />
              </div>
              <h3 class="text-lg font-black tracking-tight text-[rgb(var(--v-theme-on-surface))] [font-family:var(--font-heading)]">
                {{ t('landing.comingSoon.athletes.title') }}
              </h3>
            </div>
            <div class="flex flex-col gap-3">
              <div
                v-for="item in soonAthletes"
                :key="item.key"
                class="flex items-start gap-3 rounded-xl bg-[rgba(var(--v-theme-primary),0.04)] px-4 py-3.5"
              >
                <v-icon :icon="item.icon" size="20" color="primary" class="mt-0.5 shrink-0 opacity-80" />
                <div>
                  <p class="text-sm font-semibold text-[rgb(var(--v-theme-on-surface))] [font-family:var(--font-body)]">
                    {{ t(item.labelKey) }}
                  </p>
                  <p class="text-xs leading-relaxed text-[rgb(var(--v-theme-on-surface-variant))] [font-family:var(--font-body)]">
                    {{ t(item.descKey) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Business future -->
          <div class="relative overflow-hidden rounded-3xl border border-[rgba(var(--v-theme-primary),0.12)] bg-[rgb(var(--v-theme-surface))] p-8">
            <div aria-hidden="true" class="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-[rgb(var(--v-theme-primary))] opacity-[0.05] blur-2xl" />
            <div class="mb-6 flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(var(--v-theme-primary),0.1)]">
                <v-icon icon="mdi-storefront-outline" size="22" color="primary" />
              </div>
              <div>
                <h3 class="text-lg font-black leading-tight tracking-tight text-[rgb(var(--v-theme-on-surface))] [font-family:var(--font-heading)]">
                  {{ t('landing.comingSoon.businesses.title') }}
                </h3>
                <span class="text-[10px] font-bold uppercase tracking-widest text-[rgb(var(--v-theme-primary))] [font-family:var(--font-body)]">
                  {{ t('entry.businesses.badge') }}
                </span>
              </div>
            </div>
            <div class="flex flex-col gap-3">
              <div
                v-for="item in soonBusiness"
                :key="item.key"
                class="flex items-start gap-3 rounded-xl bg-[rgba(var(--v-theme-primary),0.04)] px-4 py-3.5"
              >
                <v-icon :icon="item.icon" size="20" color="primary" class="mt-0.5 shrink-0 opacity-80" />
                <div>
                  <p class="text-sm font-semibold text-[rgb(var(--v-theme-on-surface))] [font-family:var(--font-body)]">
                    {{ t(item.labelKey) }}
                  </p>
                  <p class="text-xs leading-relaxed text-[rgb(var(--v-theme-on-surface-variant))] [font-family:var(--font-body)]">
                    {{ t(item.descKey) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Final CTA -->
      <section class="mx-auto max-w-4xl px-6 py-24 text-center md:px-10">
        <h2
          class="mb-4 text-[clamp(1.8rem,4.5vw,3.5rem)] font-black tracking-tight text-[rgb(var(--v-theme-on-background))] [font-family:var(--font-heading)]"
        >
          {{ t('landing.finalCta.title') }}
          <span class="block text-[rgb(var(--v-theme-primary))]">{{ t('landing.finalCta.titleAccent') }}</span>
        </h2>
        <p class="mb-10 text-base leading-relaxed text-[rgb(var(--v-theme-on-surface-variant))] [font-family:var(--font-body)]">
          {{ t('landing.finalCta.subtitle') }}
        </p>
        <v-btn-primary
          size="x-large"
          to="/register"
        >
          {{ t('landing.finalCta.cta') }}
          <v-icon class="ml-1" end icon="mdi-arrow-right" size="20" />
        </v-btn-primary>
      </section>

      <!-- Footer -->
      <footer
        class="border-t border-[rgba(var(--v-theme-on-background),0.08)] px-6 py-8 text-center text-xs text-[rgb(var(--v-theme-on-surface-variant))] [font-family:var(--font-body)] md:px-10"
      >
        <div class="mb-3 flex justify-center">
          <AppBrandMark :label="t('app.brand')" size="compact" sport-tone="shell" />
        </div>
        <p>{{ t('landing.footer.tagline') }}</p>
      </footer>

    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useTheme } from 'vuetify'
  import AppBrandMark from '@/components/shared/AppBrandMark.vue'
  import AppSelectGroup from '@/components/shared/AppSelectGroup.vue'
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

  // --- locale & theme ---
  const localeOptions = computed(() => [
    { value: 'pt-BR' as SupportedLocale, label: 'PT' },
    { value: 'en' as SupportedLocale, label: 'EN' },
  ])
  const currentLocale = computed(() => (locale.value === 'pt-BR' ? 'pt-BR' : 'en'))
  const currentThemeSelection = computed<'light' | 'dark'>(() =>
    resolveThemeName(themeMode.value) === 'sportDark' ? 'dark' : 'light',
  )
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

  // --- cursor glow (spring physics from scratch) ---
  const isMouseInside = ref(false)
  const targetX = ref(0)
  const targetY = ref(0)
  const followerX = ref(0)
  const followerY = ref(0)
  const velocityX = ref(0)
  const velocityY = ref(0)
  const viewportW = ref(1)
  const viewportH = ref(1)

  let rafId: number | null = null

  const SPRING_STIFFNESS = 0.045
  const SPRING_DAMPING = 0.8
  const MAX_SPEED = 45

  function clamp (value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value))
  }

  function updateViewport () {
    viewportW.value = window.innerWidth
    viewportH.value = window.innerHeight
  }

  function animateFollower () {
    const deltaX = targetX.value - followerX.value
    const deltaY = targetY.value - followerY.value

    velocityX.value = clamp((velocityX.value + deltaX * SPRING_STIFFNESS) * SPRING_DAMPING, -MAX_SPEED, MAX_SPEED)
    velocityY.value = clamp((velocityY.value + deltaY * SPRING_STIFFNESS) * SPRING_DAMPING, -MAX_SPEED, MAX_SPEED)

    followerX.value += velocityX.value
    followerY.value += velocityY.value

    rafId = requestAnimationFrame(animateFollower)
  }

  function onMouseMove (e: MouseEvent) {
    isMouseInside.value = true
    targetX.value = e.clientX
    targetY.value = e.clientY
  }

  function onMouseLeave () {
    isMouseInside.value = false
    targetX.value = viewportW.value * 0.5
    targetY.value = viewportH.value * 0.5
  }

  const followerPercentX = computed(() => (followerX.value / viewportW.value) * 100)
  const followerPercentY = computed(() => (followerY.value / viewportH.value) * 100)
  const isDark = computed(() => currentThemeSelection.value === 'dark')

  const cursorGlowStyle = computed(() => {
    const opacity = isMouseInside.value ? (isDark.value ? 0.14 : 0.09) : 0
    return {
      background: `radial-gradient(640px circle at ${followerPercentX.value}% ${followerPercentY.value}%, rgba(255,107,0,${opacity}), transparent 70%)`,
      transition: 'opacity 0.45s ease',
    }
  })

  const orb1Style = computed(() => ({
    width: '600px',
    height: '600px',
    background: 'rgb(255,107,0)',
    top: '-100px',
    left: '-150px',
    transform: `translate(${followerPercentX.value * 0.11}px, ${followerPercentY.value * 0.08}px)`,
  }))

  const orb2Style = computed(() => ({
    width: '500px',
    height: '500px',
    background: 'rgb(255,138,61)',
    bottom: '0px',
    right: '-120px',
    transform: `translate(${-followerPercentX.value * 0.08}px, ${-followerPercentY.value * 0.06}px)`,
  }))

  const orb3Style = computed(() => ({
    width: '300px',
    height: '300px',
    background: 'rgb(255,107,0)',
    top: '50%',
    left: '50%',
    transform: `translate(calc(-50% + ${(followerPercentX.value - 50) * 0.14}px), calc(-50% + ${(followerPercentY.value - 50) * 0.1}px))`,
  }))

  onMounted(() => {
    prefersDarkMedia?.addEventListener('change', handleSystemThemeChange)
    updateViewport()
    targetX.value = viewportW.value * 0.5
    targetY.value = viewportH.value * 0.5
    followerX.value = targetX.value
    followerY.value = targetY.value
    window.addEventListener('resize', updateViewport)
    rafId = requestAnimationFrame(animateFollower)
  })

  onBeforeUnmount(() => {
    prefersDarkMedia?.removeEventListener('change', handleSystemThemeChange)
    window.removeEventListener('resize', updateViewport)
    if (rafId !== null) cancelAnimationFrame(rafId)
  })

  // --- feature data ---
  const currentFeatures = [
    { key: 'find', icon: 'mdi-map-marker-radius-outline', titleKey: 'landing.features.items.find.title', descKey: 'landing.features.items.find.desc' },
    { key: 'create', icon: 'mdi-calendar-plus-outline', titleKey: 'landing.features.items.create.title', descKey: 'landing.features.items.create.desc' },
    { key: 'chat', icon: 'mdi-message-outline', titleKey: 'landing.features.items.chat.title', descKey: 'landing.features.items.chat.desc' },
    { key: 'profile', icon: 'mdi-account-star-outline', titleKey: 'landing.features.items.profile.title', descKey: 'landing.features.items.profile.desc' },
    { key: 'ratings', icon: 'mdi-star-outline', titleKey: 'landing.features.items.ratings.title', descKey: 'landing.features.items.ratings.desc' },
    { key: 'sports', icon: 'mdi-run-fast', titleKey: 'landing.features.items.sports.title', descKey: 'landing.features.items.sports.desc' },
  ]

  const soonAthletes = [
    { key: 'tournaments', icon: 'mdi-trophy-outline', labelKey: 'landing.comingSoon.athletes.items.tournaments.label', descKey: 'landing.comingSoon.athletes.items.tournaments.desc' },
    { key: 'coach', icon: 'mdi-whistle-outline', labelKey: 'landing.comingSoon.athletes.items.coach.label', descKey: 'landing.comingSoon.athletes.items.coach.desc' },
    { key: 'stats', icon: 'mdi-chart-line', labelKey: 'landing.comingSoon.athletes.items.stats.label', descKey: 'landing.comingSoon.athletes.items.stats.desc' },
    { key: 'gamification', icon: 'mdi-medal-outline', labelKey: 'landing.comingSoon.athletes.items.gamification.label', descKey: 'landing.comingSoon.athletes.items.gamification.desc' },
    { key: 'training', icon: 'mdi-dumbbell', labelKey: 'landing.comingSoon.athletes.items.training.label', descKey: 'landing.comingSoon.athletes.items.training.desc' },
  ]

  const soonBusiness = [
    { key: 'courts', icon: 'mdi-office-building-outline', labelKey: 'landing.comingSoon.businesses.items.courts.label', descKey: 'landing.comingSoon.businesses.items.courts.desc' },
    { key: 'booking', icon: 'mdi-calendar-check-outline', labelKey: 'landing.comingSoon.businesses.items.booking.label', descKey: 'landing.comingSoon.businesses.items.booking.desc' },
    { key: 'analytics', icon: 'mdi-chart-bar', labelKey: 'landing.comingSoon.businesses.items.analytics.label', descKey: 'landing.comingSoon.businesses.items.analytics.desc' },
    { key: 'visibility', icon: 'mdi-eye-outline', labelKey: 'landing.comingSoon.businesses.items.visibility.label', descKey: 'landing.comingSoon.businesses.items.visibility.desc' },
    { key: 'team', icon: 'mdi-account-group-outline', labelKey: 'landing.comingSoon.businesses.items.team.label', descKey: 'landing.comingSoon.businesses.items.team.desc' },
  ]
</script>
