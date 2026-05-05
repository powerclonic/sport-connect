<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
    <v-progress-circular v-if="!errorMessage" color="primary" indeterminate size="48" />

    <v-alert
      v-if="errorMessage"
      color="error"
      max-width="480"
      rounded="lg"
      type="error"
      variant="tonal"
    >
      {{ errorMessage }}
      <template #append>
        <v-btn color="error" size="small" variant="text" @click="router.push('/login')">
          {{ t('auth.login.submit') }}
        </v-btn>
      </template>
    </v-alert>

    <p v-if="!errorMessage" class="text-sm opacity-70 [font-family:var(--font-body)]">
      {{ locale === 'pt-BR' ? 'Finalizando autenticação...' : 'Finishing sign in...' }}
    </p>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'

  const router = useRouter()
  const { t, locale } = useI18n()
  const authStore = useAuthStore()
  const errorMessage = ref('')

  onMounted(async () => {
    // Token is passed as URL hash fragment: #access_token=...
    const hash = window.location.hash.slice(1)
    const params = new URLSearchParams(hash)
    const accessToken = params.get('access_token')

    if (!accessToken) {
      errorMessage.value = t('auth.errors.serverError')
      return
    }

    try {
      await authStore.hydrateFromOAuth({ access_token: accessToken })
      // Clear tokens from URL before navigating
      history.replaceState(null, '', window.location.pathname)
      if (!authStore.user?.profile_complete) {
        router.push('/complete-profile')
      } else {
        router.push('/app/feed')
      }
    } catch {
      errorMessage.value = t('auth.errors.serverError')
    }
  })
</script>
