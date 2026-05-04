<template>
  <AuthShell card-max-width-class="max-w-xl">
    <h1 class="m-0 text-3xl leading-tight text-[rgb(var(--v-theme-on-surface))] [font-family:var(--font-heading)]">
      {{ t('auth.completeProfile.title') }}
    </h1>

    <p class="mt-2 mb-0 text-base leading-relaxed text-[rgb(var(--v-theme-on-surface-variant))] [font-family:var(--font-body)]">
      {{ t('auth.completeProfile.subtitle') }}
    </p>

    <v-form class="mt-5 grid gap-4" @submit.prevent="submit">
      <v-text-field
        v-model.trim="displayName"
        :label="t('auth.register.name')"
        :placeholder="t('auth.register.namePlaceholder')"
        type="text"
      />

      <SportsPicker v-model="selectedSports" />

      <v-text-field
        v-model.trim="location"
        :label="t('profile.location')"
        placeholder="e.g., Downtown"
        type="text"
      />

      <v-text-field
        v-model.trim="city"
        :label="t('profile.city')"
        placeholder="e.g., São Paulo"
        type="text"
      />

      <v-text-field
        v-model.trim="phone"
        :label="t('profile.phone')"
        placeholder="+55 11 99999-9999"
        type="tel"
      />

      <v-textarea
        v-model="bio"
        :label="t('profile.bio')"
        placeholder="Tell others about yourself"
        rows="3"
      />

      <v-btn-primary
        append-icon="mdi-arrow-right"
        class="mt-1 !h-14 !w-full !text-base !shadow-[0_10px_26px_rgba(255,107,0,0.35)] disabled:!shadow-none [font-family:var(--font-body)]"
        :disabled="!canSubmit || authStore.isLoading"
        :loading="authStore.isLoading"
        type="submit"
      >
        {{ t('auth.completeProfile.submit') }}
      </v-btn-primary>

      <v-alert
        v-if="errorMessage"
        color="error"
        density="compact"
        rounded="lg"
        type="error"
        variant="tonal"
      >
        {{ errorMessage }}
      </v-alert>
    </v-form>
  </AuthShell>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'
  import AuthShell from '@/components/auth/AuthShell.vue'
  import SportsPicker from '@/components/auth/SportsPicker.vue'
  import { ApiError } from '@/api/client'
  import { useAuthStore } from '@/stores/auth'

  const router = useRouter()
  const { t } = useI18n()
  const authStore = useAuthStore()

  const displayName = ref(authStore.user?.display_name ?? '')
  const selectedSports = ref<string[]>([])
  const location = ref(authStore.user?.location ?? '')
  const city = ref(authStore.user?.city ?? '')
  const phone = ref(authStore.user?.phone ?? '')
  const bio = ref(authStore.user?.bio ?? '')
  const errorMessage = ref('')

  const canSubmit = computed(
    () => displayName.value.length >= 3 && selectedSports.value.length >= 3,
  )

  onMounted(() => {
    if (!authStore.isAuthenticated) {
      router.push('/login')
      return
    }
    if (authStore.user?.profile_complete) {
      router.push('/app/feed')
    }
  })

  async function submit() {
    if (!canSubmit.value) return
    errorMessage.value = ''
    try {
      await authStore.updateProfile(
        displayName.value,
        selectedSports.value,
        location.value || undefined,
        city.value || undefined,
        phone.value || undefined,
        bio.value || undefined,
      )
      router.push('/app/feed')
    } catch (e) {
      if (e instanceof ApiError) {
        errorMessage.value = t('auth.errors.serverError')
      } else {
        errorMessage.value = t('auth.errors.networkError')
      }
    }
  }
</script>
