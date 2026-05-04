<template>
  <div class="app-shell" :class="isDarkTheme ? 'app-shell--dark' : 'app-shell--light'">
    <aside v-if="isDesktop" class="desktop-sidebar">
      <div class="desktop-sidebar__brand">
        <AppBrandMark
          align="start"
          :label="t('app.brand')"
          sport-tone="shell"
        />
      </div>

      <nav :aria-label="locale === 'pt-BR' ? 'Navegação principal' : 'Main navigation'" class="desktop-sidebar__nav">
        <v-btn
          v-for="item in desktopNavItems"
          :key="item.value"
          class="desktop-nav-btn"
          :class="activeTab === item.value ? 'desktop-nav-btn--active' : ''"
          rounded="xl"
          variant="text"
          @click="navigate(item.value)"
        >
          <template #prepend>
            <v-icon :icon="item.icon" />
          </template>

          <span>{{ item.label }}</span>
        </v-btn>
      </nav>

      <div class="desktop-sidebar__spacer" aria-hidden="true" />

      <div class="desktop-sidebar__footer">
        <div class="desktop-sidebar__divider" />

        <v-btn
          class="desktop-nav-btn"
          :class="activeTray === 'notifications' ? 'desktop-nav-btn--active' : ''"
          rounded="xl"
          variant="text"
          @click="toggleTray('notifications')"
        >
          <template #prepend>
            <v-icon icon="mdi-bell-outline" />
          </template>
          <span>{{ t('nav.notifications') }}</span>
        </v-btn>

        <button
          class="desktop-sidebar__user"
          :class="activeTray === 'profile' ? 'desktop-sidebar__user--active' : ''"
          @click="toggleTray('profile')"
        >
          <v-avatar
            :image="authStore.user?.avatar_url ?? undefined"
            color="primary"
            size="34"
          >
            <v-icon v-if="!authStore.user?.avatar_url" icon="mdi-account" size="18" />
          </v-avatar>
          <div class="desktop-sidebar__user-text">
            <span class="desktop-sidebar__user-name">{{ userDisplayName }}</span>
            <span v-if="authStore.user?.email" class="desktop-sidebar__user-sub">{{ authStore.user.email }}</span>
          </div>
        </button>
      </div>
    </aside>

    <div class="app-workspace" :class="isDesktop ? 'app-workspace--desktop' : ''">
      <v-app-bar
        class="app-bar"
        color="surface"
        density="comfortable"
        flat
      >
        <div class="shell-header-row">
          <AppBrandMark
            v-if="!isDesktop"
            :label="t('app.brand')"
            sport-tone="shell"
          />

          <span v-else class="desktop-section-title">{{ currentPageTitle }}</span>

          <div class="header-actions">
            <v-btn
              :aria-label="t('nav.notifications')"
              color="primary"
              density="comfortable"
              icon="mdi-bell-outline"
              rounded="pill"
              variant="text"
              @click="toggleTray('notifications')"
            />

            <v-btn
              :aria-label="t('nav.profile')"
              color="primary"
              density="comfortable"
              icon="mdi-account-circle-outline"
              rounded="pill"
              variant="text"
              @click="toggleTray('profile')"
            />
          </div>
        </div>
      </v-app-bar>

      <v-main class="app-main">
        <v-container
          class="app-container px-4 px-sm-6 py-4 py-sm-6"
          :class="!isDesktop && isChatRoute ? 'app-container--chat-mobile' : ''"
          fluid
        >
          <router-view v-slot="{ Component, route: childRoute }">
            <transition mode="out-in" name="shell-page">
              <component :is="Component" :key="childRoute.fullPath" @open-event-info="openEventInfo" @open-organizer-profile="openOrganizerProfile" />
            </transition>
          </router-view>
        </v-container>
      </v-main>

      <v-bottom-navigation
        v-if="!isDesktop && !isTrayOpen"
        class="app-nav"
        color="primary"
        grow
        mandatory
        :model-value="activeTab"
        @update:model-value="navigate"
      >
        <v-btn value="feed">
          <v-icon icon="mdi-home-variant-outline" />
        </v-btn>

        <v-btn value="search">
          <v-icon icon="mdi-magnify" />
        </v-btn>

        <v-btn value="create">
          <v-icon icon="mdi-plus-circle-outline" />
        </v-btn>

        <v-btn value="chat">
          <v-icon icon="mdi-chat-outline" />
        </v-btn>

        <v-btn value="settings">
          <v-icon icon="mdi-cog-outline" />
        </v-btn>
      </v-bottom-navigation>
    </div>

    <transition name="tray-fade">
      <div
        v-if="isTrayOpen"
        aria-hidden="true"
        class="tray-backdrop"
        @click="closeTray"
      />
    </transition>

    <transition :name="trayTransitionName">
      <section
        v-if="activeTray === 'notifications'"
        :aria-label="locale === 'pt-BR' ? 'Histórico de notificações' : 'Notification history'"
        :class="isDesktop ? 'notification-sheet notification-sheet--desktop' : 'notification-sheet'"
        role="dialog"
      >
        <NotificationTray @close="closeTray" />
      </section>
    </transition>

    <transition :name="trayTransitionName">
      <section
        v-if="activeTray === 'profile'"
        :aria-label="trayTitle"
        :class="isDesktop ? 'profile-sheet profile-sheet--desktop' : 'profile-sheet'"
        role="dialog"
      >
        <div class="profile-sheet__header">
          <div>
            <h2 class="profile-sheet__title">{{ trayTitle }}</h2>
            <p class="profile-sheet__subtitle">{{ traySubtitle }}</p>
          </div>

          <v-btn
            :aria-label="locale === 'pt-BR' ? 'Fechar perfil' : 'Close profile'"
            density="comfortable"
            icon="mdi-close"
            rounded="pill"
            variant="text"
            @click="closeTray"
          />
        </div>

        <div class="profile-sheet__content">
          <ProfileSummaryCard variant="sheet" />
        </div>

        <div class="profile-sheet__footer">
          <v-btn
            block
            class="!normal-case !font-semibold [font-family:var(--font-body)]"
            color="error"
            prepend-icon="mdi-logout"
            rounded="pill"
            variant="outlined"
            @click="signOut"
          >
            {{ t('common.signOut') }}
          </v-btn>
        </div>
      </section>
    </transition>

    <transition :name="trayTransitionName">
      <section
        v-if="activeTray === 'event-info' && selectedEvent"
        :aria-label="eventTrayTitle"
        :class="isDesktop ? 'event-sheet event-sheet--desktop' : 'event-sheet'"
        role="dialog"
      >
        <div class="event-sheet__header">
          <div>
            <h2 class="event-sheet__title">{{ eventTrayTitle }}</h2>
            <p class="event-sheet__subtitle">{{ eventTraySubtitle }}</p>
          </div>

          <v-btn
            :aria-label="locale === 'pt-BR' ? 'Fechar detalhes do evento' : 'Close event details'"
            density="comfortable"
            icon="mdi-close"
            rounded="pill"
            variant="text"
            @click="closeTray"
          />
        </div>

        <div class="event-sheet__content">
          <EventInfoSheetContent :event="selectedEvent" @open-organizer-profile="openOrganizerProfile" />
        </div>
      </section>
    </transition>

    <transition :name="trayTransitionName">
      <section
        v-if="activeTray === 'organizer-profile' && selectedOrganizer"
        :aria-label="organizerTrayTitle"
        :class="isDesktop ? 'organizer-sheet organizer-sheet--desktop' : 'organizer-sheet'"
        role="dialog"
      >
        <div class="organizer-sheet__header">
          <div>
            <h2 class="organizer-sheet__title">{{ organizerTrayTitle }}</h2>
            <p class="organizer-sheet__subtitle">{{ organizerTraySubtitle }}</p>
          </div>

          <v-btn
            :aria-label="locale === 'pt-BR' ? 'Fechar perfil do organizador' : 'Close organizer profile'"
            density="comfortable"
            icon="mdi-close"
            rounded="pill"
            variant="text"
            @click="closeTray"
          />
        </div>

        <div class="organizer-sheet__content">
          <ProfileSummaryCard :profile="selectedOrganizer" variant="sheet" />
        </div>
      </section>
    </transition>
  </div>
</template>

<script setup lang="ts">
  import type { FeedEvent, FeedEventHost, OrganizerProfile } from '@/types/feed'
  import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute, useRouter } from 'vue-router'
  import { useDisplay, useTheme } from 'vuetify'
  import EventInfoSheetContent from '@/components/feed/EventInfoSheetContent.vue'
  import NotificationTray from '@/components/NotificationTray.vue'
  import ProfileSummaryCard from '@/components/profile/ProfileSummaryCard.vue'
  import AppBrandMark from '@/components/shared/AppBrandMark.vue'
  import { useFeedCatalog } from '@/composables/feed/useFeedCatalog'
  import { useAuthStore } from '@/stores/auth'
  import {
    applyDocumentColorScheme,
    getStoredThemeMode,
    resolveThemeName,
    setThemeModePreference,
    type ThemeMode,
  } from '@/plugins/vuetify'

  const { t, locale } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()
  const display = useDisplay()
  const theme = useTheme()
  const { getOrganizerById } = useFeedCatalog()
  const themeMode = ref<ThemeMode>(getStoredThemeMode() ?? 'system')
  const prefersDarkMedia = typeof window === 'undefined' ? null : window.matchMedia('(prefers-color-scheme: dark)')
  const isDarkTheme = computed(() => theme.global.current.value.dark)
  const isDesktop = computed(() => display.lgAndUp.value)
  const activeTray = ref<null | 'notifications' | 'profile' | 'event-info' | 'organizer-profile'>(null)
  const selectedEvent = ref<FeedEvent | null>(null)
  const selectedOrganizer = ref<OrganizerProfile | null>(null)

  const isTrayOpen = computed(() => activeTray.value !== null)

  const trayTitle = computed(() =>
    authStore.user?.display_name ?? authStore.user?.email ?? t('profile.title'),
  )

  const traySubtitle = computed(() =>
    authStore.user?.email ?? t('profile.subtitle'),
  )

  async function signOut () {
    closeTray()
    await authStore.logout()
    router.push('/')
  }

  const eventTrayTitle = computed(() => selectedEvent.value?.title ?? t('event.title'))

  const eventTraySubtitle = computed(() => {
    return selectedEvent.value?.summary ?? t('event.sheetSubtitle')
  })

  const organizerTrayTitle = computed(() => selectedOrganizer.value?.name ?? t('profile.organizerTitle'))

  const organizerTraySubtitle = computed(() => t('profile.organizerSubtitle'))

  const activeTab = computed(() => {
    if (route.path.includes('/search')) {
      return 'search'
    }

    if (route.path.includes('/create') || route.path.includes('/events/new')) {
      return 'create'
    }

    if (route.path.includes('/chat')) {
      return 'chat'
    }

    if (route.path.includes('/settings')) {
      return 'settings'
    }

    return 'feed'
  })

  const desktopNavItems = computed(() => [
    { value: 'feed', icon: 'mdi-home-variant-outline', label: t('nav.feed') },
    { value: 'search', icon: 'mdi-magnify', label: t('nav.search') },
    { value: 'create', icon: 'mdi-plus-circle-outline', label: t('nav.create') },
    { value: 'chat', icon: 'mdi-chat-outline', label: t('nav.chat') },
    { value: 'settings', icon: 'mdi-cog-outline', label: t('nav.settings') },
  ])

  const trayTransitionName = computed(() => isDesktop.value ? 'tray-slide-right' : 'sheet-rise')

  const currentPageTitle = computed(() => {
    const item = desktopNavItems.value.find(i => i.value === activeTab.value)
    return item?.label ?? t('app.brand')
  })

  const userDisplayName = computed(() =>
    authStore.user?.display_name ?? authStore.user?.email?.split('@')[0] ?? t('common.defaultUserName'),
  )
  const isChatRoute = computed(() => route.path.includes('/chat'))

  function navigate (value: string) {
    closeTray()
    router.push(`/app/${value}`)
  }

  function toggleTray (tray: 'notifications' | 'profile') {
    activeTray.value = activeTray.value === tray ? null : tray
    selectedEvent.value = null
  }

  function openEventInfo (event: FeedEvent) {
    selectedEvent.value = event
    activeTray.value = 'event-info'
  }

  function openOrganizerProfile (organizer: FeedEventHost | OrganizerProfile) {
    const resolvedOrganizer = getOrganizerById(organizer.id)

    selectedOrganizer.value = resolvedOrganizer ?? {
      id: organizer.id,
      name: organizer.name,
      image: organizer.image,
      rating: organizer.rating,
      location: organizer.location,
      gamesPlayed: 0,
      reliability: '-',
      favoriteSports: [],
      feedback: [],
    }

    activeTray.value = 'organizer-profile'
  }

  function closeTray () {
    activeTray.value = null
    selectedEvent.value = null
    selectedOrganizer.value = null
  }

  function syncThemeFromMode () {
    const nextThemeName = resolveThemeName(themeMode.value)
    theme.change(nextThemeName)
    setThemeModePreference(themeMode.value)
    applyDocumentColorScheme(nextThemeName)
  }

  function handleSystemThemeChange () {
    if (themeMode.value !== 'system') return
    syncThemeFromMode()
  }

  syncThemeFromMode()

  onMounted(() => {
    prefersDarkMedia?.addEventListener('change', handleSystemThemeChange)
  })

  onBeforeUnmount(() => {
    prefersDarkMedia?.removeEventListener('change', handleSystemThemeChange)
  })

  watch(
    () => route.fullPath,
    () => {
      closeTray()
    },
  )

</script>

<style scoped>
.app-shell {
  min-height: 100dvh;
  background: transparent;
  --app-safe-bottom: env(safe-area-inset-bottom, 0px);
  --app-bottom-nav-height: 72px;
  --app-shell-bottom-offset: calc(var(--app-bottom-nav-height) + var(--app-safe-bottom));
  --shell-chrome-bg: #2f3540;
  --shell-icon-color: rgba(255, 255, 255, 0.72);
  --shell-icon-active: #ff8a3d;
  --header-action-color: #ff8a3d;
  --brand-sport-color: #ffffff;
}

.app-shell--light {
  --shell-chrome-bg: #e3e7ef;
  --shell-icon-color: #495264;
  --shell-icon-active: #a04100;
  --header-action-color: #a04100;
  --brand-sport-color: #2a3038;
}

.app-shell--dark {
  --shell-chrome-bg: #2f3540;
  --shell-icon-color: rgba(255, 255, 255, 0.72);
  --shell-icon-active: #ff8a3d;
  --header-action-color: #ff8a3d;
  --brand-sport-color: #ffffff;
}

.app-workspace {
  min-height: 100dvh;
}

.desktop-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  z-index: 1202;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 22px 14px;
  border-right: 1px solid color-mix(in srgb, rgb(var(--v-theme-on-surface)) 12%, transparent);
  background: color-mix(in srgb, var(--shell-chrome-bg) 88%, rgb(var(--v-theme-surface)));
}

.desktop-sidebar__brand {
  display: flex;
  justify-content: flex-start;
  padding-inline: 8px;
}

.desktop-sidebar__nav {
  display: grid;
  gap: 6px;
}

.desktop-nav-btn {
  justify-content: flex-start;
  text-transform: none;
  letter-spacing: normal;
  font-weight: 600;
  min-height: 44px;
  color: rgba(var(--v-theme-on-surface), 0.72);
}

.desktop-nav-btn--active {
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.12);
}

.desktop-sidebar__spacer {
  flex: 1;
  min-height: 8px;
}

.desktop-sidebar__footer {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.desktop-sidebar__divider {
  height: 1px;
  background: color-mix(in srgb, rgb(var(--v-theme-on-surface)) 10%, transparent);
  margin-bottom: 6px;
}

.desktop-sidebar__user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: background 0.16s ease;
  outline: none;
  min-height: 44px;
}

.desktop-sidebar__user:hover {
  background: rgba(var(--v-theme-on-surface), 0.06);
}

.desktop-sidebar__user:focus-visible {
  background: rgba(var(--v-theme-on-surface), 0.08);
  outline: 2px solid rgba(var(--v-theme-primary), 0.6);
  outline-offset: 1px;
}

.desktop-sidebar__user--active {
  background: rgba(var(--v-theme-primary), 0.12);
}

.desktop-sidebar__user-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.desktop-sidebar__user-name {
  font-size: 14px;
  font-weight: 600;
  font-family: var(--font-body);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.3;
}

.desktop-sidebar__user-sub {
  font-size: 11px;
  opacity: 0.6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: var(--font-body);
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.4;
  margin-top: 1px;
}

.desktop-section-title {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: rgb(var(--v-theme-on-surface));
}

.app-workspace--desktop {
  padding-left: 280px;
}

.app-bar {
  background: var(--shell-chrome-bg) !important;
}

.app-bar :deep(.v-toolbar__content) {
  width: min(100%, 1200px);
  margin: 0 auto;
  position: relative;
}

.shell-header-row {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

@media (min-width: 1280px) {
  .shell-header-row {
    justify-content: flex-start;
  }
}

.header-actions {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.header-actions :deep(.v-btn) {
  color: var(--header-action-color);
}

.app-main {
  padding-top: max(var(--v-layout-top, 56px), 56px);
  padding-bottom: var(--app-shell-bottom-offset);
  overflow-x: clip;
}

.app-container {
  width: min(100%, 1200px);
  overflow-x: clip;
}

.app-container--chat-mobile {
  padding-bottom: 0 !important;
}

.app-nav {
  background: var(--shell-chrome-bg) !important;
  padding: 0 8px var(--app-safe-bottom);
}

.app-nav :deep(.v-bottom-navigation__content) {
  width: min(100%, 560px);
  margin: 0 auto;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.app-nav :deep(.v-btn) {
  min-height: 56px;
  border-radius: 0;
  min-width: 0;
  color: var(--shell-icon-color);
}

.app-nav :deep(.v-btn .v-icon) {
  margin: 0;
  font-size: 24px;
}

.app-nav :deep(.v-btn--active) {
  color: var(--shell-icon-active);
}

.app-nav :deep(.v-btn--active .v-btn__overlay) {
  opacity: 0;
}

.tray-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.26);
  z-index: 1200;
}

.notification-sheet {
  position: fixed;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: min(100%, 560px);
  max-height: min(82dvh, 760px);
  background: rgb(var(--v-theme-surface));
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  border: 1px solid color-mix(in srgb, rgb(var(--v-theme-on-surface)) 12%, transparent);
  border-bottom: none;
  z-index: 1201;
  overflow: hidden;
}

  .profile-sheet,
  .event-sheet,
  .organizer-sheet {
  position: fixed;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: min(100%, 560px);
  max-height: min(82dvh, 760px);
  background: rgb(var(--v-theme-surface));
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  border: 1px solid color-mix(in srgb, rgb(var(--v-theme-on-surface)) 12%, transparent);
  border-bottom: none;
  z-index: 1201;
  display: flex;
  flex-direction: column;
}

  .notification-sheet--desktop,
  .profile-sheet--desktop,
  .event-sheet--desktop,
  .organizer-sheet--desktop {
  left: auto;
  right: 0;
  top: 0;
  bottom: 0;
  transform: none;
  width: min(100%, 440px);
  max-height: none;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-bottom: none;
  border-right: none;
  border-left: 1px solid color-mix(in srgb, rgb(var(--v-theme-on-surface)) 14%, transparent);
}

  .profile-sheet__header,
  .event-sheet__header,
  .organizer-sheet__header {
  padding: 18px 16px 12px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid color-mix(in srgb, rgb(var(--v-theme-on-surface)) 10%, transparent);
}

  .profile-sheet__title,
  .event-sheet__title,
  .organizer-sheet__title {
  margin: 0;
  font-family: 'Lexend', sans-serif;
  font-size: 22px;
  line-height: 1.2;
}

  .profile-sheet__subtitle,
  .event-sheet__subtitle,
  .organizer-sheet__subtitle {
  margin: 6px 0 0;
  color: rgba(var(--v-theme-on-surface), 0.72);
  font-size: 14px;
  line-height: 1.45;
}

  .profile-sheet__content,
  .event-sheet__content,
  .organizer-sheet__content {
  flex: 1;
  overflow-y: auto;
  padding: 14px 16px 12px;
}

.profile-sheet__footer {
  padding: 12px 16px calc(16px + env(safe-area-inset-bottom));
  border-top: 1px solid color-mix(in srgb, rgb(var(--v-theme-on-surface)) 10%, transparent);
}

.tray-slide-enter-active,
.tray-slide-leave-active {
  transition: transform 0.24s ease, opacity 0.2s ease;
}

.tray-slide-right-enter-active,
.tray-slide-right-leave-active {
  transition: transform 0.24s ease, opacity 0.2s ease;
}

.tray-slide-right-enter-from,
.tray-slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.tray-slide-enter-from,
.tray-slide-leave-to {
  transform: translateX(-50%) translateY(100%);
  opacity: 0;
}

.tray-fade-enter-active,
.tray-fade-leave-active {
  transition: opacity 0.2s ease;
}

.tray-fade-enter-from,
.tray-fade-leave-to {
  opacity: 0;
}

.sheet-rise-enter-active,
.sheet-rise-leave-active {
  transition: transform 0.24s ease, opacity 0.2s ease;
}

.sheet-rise-enter-from,
.sheet-rise-leave-to {
  transform: translateX(-50%) translateY(100%);
  opacity: 0;
}

.shell-page-enter-active,
.shell-page-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.shell-page-enter-from,
.shell-page-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (prefers-reduced-motion: reduce) {
  .shell-page-enter-active,
  .shell-page-leave-active {
    transition: none;
  }
}

@media (min-width: 1280px) {
  .app-main {
    padding-bottom: 24px;
  }

  .app-shell {
    --app-shell-bottom-offset: 24px;
  }
}
</style>
