/**
 * router/index.ts
 *
 * Manual routes for ./src/pages/*.vue
 */

import 'vue-router'
declare module 'vue-router' {
  interface RouteMeta {
    publicOnly?: boolean
  }
}

import { createRouter, createWebHistory } from 'vue-router'
import AppShell from '@/layouts/AppShell.vue'
import ChatEventPage from '@/pages/chat-event.vue'
import OAuthCallbackPage from '@/pages/oauth-callback.vue'
import ChatPage from '@/pages/chat.vue'
import CreateEventPage from '@/pages/create-event.vue'
import FeedPage from '@/pages/feed.vue'
import Index from '@/pages/index.vue'
import LandingPage from '@/pages/landing.vue'
import LoginPage from '@/pages/login.vue'
import NotFoundPage from '@/pages/not-found.vue'
import NotificationsPage from '@/pages/notifications.vue'
import PrivacyPage from '@/pages/privacy.vue'
import ProfileAvatarPage from '@/pages/profile-avatar.vue'
import ProfileRatingsPage from '@/pages/profile-ratings.vue'
import ProfilePage from '@/pages/profile.vue'
import RateEventPage from '@/pages/rate-event.vue'
import RegisterPage from '@/pages/register.vue'
import SearchPage from '@/pages/search.vue'
import SecurityPage from '@/pages/security.vue'
import SettingsPage from '@/pages/settings.vue'
import ThemePage from '@/pages/theme.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: LandingPage,
    },
    {
      path: '/welcome',
      component: Index,
    },
    {
      path: '/login',
      component: LoginPage,
      meta: { publicOnly: true },
    },
    {
      path: '/register',
      component: RegisterPage,
      meta: { publicOnly: true },
    },
    {
      path: '/oauth/callback',
      component: OAuthCallbackPage,
    },
    {
      path: '/app',
      component: AppShell,
      redirect: '/app/feed',
      children: [
        {
          path: 'feed',
          component: FeedPage,
        },
        {
          path: 'search',
          component: SearchPage,
        },
        {
          path: 'create',
          component: CreateEventPage,
        },
        {
          path: 'events/new',
          component: CreateEventPage,
        },
        {
          path: 'events/:id/rate',
          component: RateEventPage,
        },
        {
          path: 'chat',
          component: ChatPage,
        },
        {
          path: 'chat/:eventId',
          component: ChatEventPage,
        },
        {
          path: 'profile',
          component: ProfilePage,
        },
        {
          path: 'profile/avatar',
          component: ProfileAvatarPage,
        },
        {
          path: 'profile/ratings',
          component: ProfileRatingsPage,
        },
        {
          path: 'settings',
          component: SettingsPage,
        },
        {
          path: 'settings/privacy',
          component: PrivacyPage,
        },
        {
          path: 'settings/security',
          component: SecurityPage,
        },
        {
          path: 'settings/notifications',
          component: NotificationsPage,
        },
        {
          path: 'settings/theme',
          component: ThemePage,
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      component: NotFoundPage,
    },
  ],
})

let _authInitialized = false

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (!_authInitialized) {
    _authInitialized = true
    await authStore.initialize()
  }

  const requiresAuth = to.path.startsWith('/app')
  const publicOnly = to.meta.publicOnly === true

  if (requiresAuth && !authStore.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (publicOnly && authStore.isAuthenticated) {
    return '/app/feed'
  }
})

export default router
