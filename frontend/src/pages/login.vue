<template>
  <AuthShell card-max-width-class="max-w-lg">
    <h1 class="m-0 text-3xl leading-tight text-[rgb(var(--v-theme-on-surface))] [font-family:var(--font-heading)]">
      {{ t('auth.login.title') }}
    </h1>

    <p class="mt-2 mb-0 text-base leading-relaxed text-[rgb(var(--v-theme-on-surface-variant))] [font-family:var(--font-body)]">
      {{ t('auth.login.subtitle') }}
    </p>

    <v-form class="mt-5 grid gap-2.5" @submit.prevent="submitLogin">
      <v-text-field
        v-model.trim="email"
        hide-details
        :label="t('auth.login.email')"
        :placeholder="t('auth.login.emailPlaceholder')"
        type="email"
      />

      <div class="mt-1.5 flex items-center justify-between">
        <span class="text-xs font-semibold tracking-wider text-[rgb(var(--v-theme-primary-darken-1))] uppercase [font-family:var(--font-body)]">
          {{ t('auth.login.password') }}
        </span>

        <v-btn-ghost
          class="!text-xs !font-semibold !normal-case !text-[rgb(var(--v-theme-primary-darken-1))] [font-family:var(--font-body)]"
          size="x-small"
        >
          {{ t('auth.login.forgot') }}
        </v-btn-ghost>
      </div>

      <v-text-field
        v-model="password"
        hide-details
        :placeholder="t('auth.login.passwordPlaceholder')"
        type="password"
      />

      <v-alert
        v-if="errorMessage"
        class="mt-1"
        color="error"
        density="compact"
        rounded="lg"
        type="error"
        variant="tonal"
      >
        {{ errorMessage }}
      </v-alert>

      <v-btn-primary
        append-icon="mdi-arrow-right"
        block
        class="mt-2.5 !text-base !shadow-[0_10px_26px_rgba(255,107,0,0.35)] disabled:!shadow-none [font-family:var(--font-body)]"
        :disabled="!canSubmit"
        :loading="authStore.isLoading"
        min-height="52"
        type="submit"
      >
        {{ t('auth.login.submit') }}
      </v-btn-primary>

      <div class="relative mt-3 flex items-center gap-3">
        <div class="h-px flex-1 bg-[rgba(var(--v-theme-on-surface),0.12)]" />
        <span class="text-xs text-[rgb(var(--v-theme-on-surface-variant))] [font-family:var(--font-body)]">
          {{ t('auth.orContinueWith') }}
        </span>
        <div class="h-px flex-1 bg-[rgba(var(--v-theme-on-surface),0.12)]" />
      </div>

      <GoogleOAuthButton
        block
        class="!w-full"
        min-height="48"
        @error="errorMessage = $event"
      />
    </v-form>

    <p class="mt-4 mb-0 text-center text-sm text-[rgb(var(--v-theme-on-surface-variant))] [font-family:var(--font-body)]">
      {{ t('auth.login.noAccount') }}
      <router-link class="ml-1.5 font-bold text-[rgb(var(--v-theme-primary-darken-1))] hover:underline" to="/register">
        {{ t('auth.login.createAccount') }}
      </router-link>
    </p>
  </AuthShell>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute, useRouter } from 'vue-router'
  import AuthShell from '@/components/auth/AuthShell.vue'
  import GoogleOAuthButton from '@/components/auth/GoogleOAuthButton.vue'
  import { ApiError } from '@/api/client'
  import { useAuthStore } from '@/stores/auth'

  const router = useRouter()
  const route = useRoute()
  const { t } = useI18n()
  const authStore = useAuthStore()

  const email = ref('')
  const password = ref('')
  const errorMessage = ref('')

  const canSubmit = computed(() =>
    email.value.length > 4 && password.value.length > 5 && !authStore.isLoading,
  )

  async function submitLogin () {
    if (!canSubmit.value) return
    errorMessage.value = ''
    try {
      await authStore.login(email.value, password.value)
      const redirect = route.query.redirect as string | undefined
      router.push(redirect ?? '/app/feed')
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 401 || e.status === 422) {
          errorMessage.value = t('auth.errors.invalidCredentials')
        } else if (e.status === 429) {
          errorMessage.value = t('auth.errors.tooManyAttempts')
        } else {
          errorMessage.value = t('auth.errors.serverError')
        }
      } else {
        errorMessage.value = t('auth.errors.networkError')
      }
    }
  }
</script>
