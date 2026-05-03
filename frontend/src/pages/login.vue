<template>
  <AuthShell card-max-width-class="max-w-lg">
    <h1 class="m-0 text-3xl leading-tight text-[#191c1e] [font-family:var(--font-heading)]">
      {{ t('auth.login.title') }}
    </h1>

    <p class="mt-2 mb-0 text-base leading-relaxed text-[#565e74] [font-family:var(--font-body)]">
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

      <v-btn-primary
        append-icon="mdi-arrow-right"
        block
        class="mt-2.5 !text-base !shadow-[0_10px_26px_rgba(255,107,0,0.35)] disabled:!shadow-none [font-family:var(--font-body)]"
        :disabled="!canSubmit"
        min-height="52"
        type="submit"
      >
        {{ t('auth.login.submit') }}
      </v-btn-primary>
    </v-form>

    <p class="mt-4 mb-0 text-center text-sm text-[#5a4136] [font-family:var(--font-body)]">
      {{ t('auth.login.noAccount') }}
      <router-link class="ml-1.5 font-bold text-[#a04100] hover:underline" to="/register">
        {{ t('auth.login.createAccount') }}
      </router-link>
    </p>
  </AuthShell>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'
  import AuthShell from '@/components/auth/AuthShell.vue'

  const router = useRouter()
  const { t } = useI18n()

  const email = ref('')
  const password = ref('')

  const canSubmit = computed(() => email.value.length > 4 && password.value.length > 5)

  function submitLogin () {
    if (!canSubmit.value) return
    router.push('/app/feed')
  }
</script>
