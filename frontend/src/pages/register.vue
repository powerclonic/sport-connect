<template>
  <AuthShell card-max-width-class="max-w-2xl">
    <div aria-hidden="true" class="mb-4">
      <div class="h-1.5 w-full overflow-hidden rounded-full bg-[rgb(var(--v-theme-surface-variant))]">
        <div
          class="h-full rounded-full bg-linear-to-r from-[#a04100] to-[#ff6b00] transition-all duration-300"
          :style="{ width: `${progressWidth}%` }"
        />
      </div>

      <div class="mt-2.5 grid grid-cols-3 gap-2">
        <div
          v-for="step in 3"
          :key="step"
          class="flex items-center justify-center gap-1.5 sm:justify-start"
          :class="step <= currentStep ? 'text-[rgb(var(--v-theme-on-surface))]' : 'text-[rgb(var(--v-theme-on-surface-variant))]'"
        >
          <span
            class="inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold [font-family:var(--font-body)]"
            :class="step <= currentStep ? 'bg-[rgba(var(--v-theme-primary),0.18)] text-[rgb(var(--v-theme-primary-darken-1))]' : 'bg-[rgb(var(--v-theme-surface-variant))] text-[rgb(var(--v-theme-on-surface-variant))]'"
          >
            {{ step }}
          </span>

          <span class="hidden text-xs leading-tight font-semibold sm:inline [font-family:var(--font-body)]">
            {{ t(`auth.register.steps.${['account', 'sports', 'password'][step - 1]}`) }}
          </span>
        </div>
      </div>
    </div>

    <h1 class="m-0 text-3xl leading-tight text-[rgb(var(--v-theme-on-surface))] [font-family:var(--font-heading)]">
      {{ t('auth.register.title') }}
    </h1>

    <p class="mt-2 mb-0 text-base leading-relaxed text-[rgb(var(--v-theme-on-surface-variant))] [font-family:var(--font-body)]">
      {{ t('auth.register.subtitle') }}
    </p>

    <v-form class="mt-5 grid gap-3.5" @submit.prevent="handleSubmit">
      <div
        class="relative w-full min-w-0 overflow-x-clip overflow-y-hidden transition-all duration-300 ease-out motion-reduce:transition-none"
        :style="{ height: stepShellHeight }"
      >
        <transition
          enter-active-class="transition duration-300 ease-out motion-reduce:transition-none"
          enter-from-class="translate-y-2 scale-[0.995] opacity-0"
          leave-active-class="pointer-events-none absolute inset-0 w-full transition duration-300 ease-out motion-reduce:transition-none"
          leave-to-class="-translate-y-1.5 scale-[0.998] opacity-0"
        >
          <div :key="currentStep" ref="stepContentInner" class="grid w-full min-w-0 gap-2.5">
            <template v-if="currentStep === 1">
              <v-text-field
                v-model.trim="fullName"
                :label="t('auth.register.name')"
                :placeholder="t('auth.register.namePlaceholder')"
                type="text"
              />

              <v-text-field
                v-model.trim="email"
                :label="t('auth.register.email')"
                :placeholder="t('auth.register.emailPlaceholder')"
                type="email"
              />

              <div class="relative mt-1 flex items-center gap-3">
                <div class="h-px flex-1 bg-[rgba(var(--v-theme-on-surface),0.12)]" />
                <span class="text-xs text-[rgb(var(--v-theme-on-surface-variant))] [font-family:var(--font-body)]">
                  {{ t('auth.orContinueWith') }}
                </span>
                <div class="h-px flex-1 bg-[rgba(var(--v-theme-on-surface),0.12)]" />
              </div>

              <GoogleOAuthButton class="!w-full" @error="errorMessage = $event" />
            </template>

            <template v-else-if="currentStep === 2">
              <SportsPicker v-model="selectedSports" />
            </template>

            <template v-else>
              <div class="grid gap-2.5 md:grid-cols-2">
                <v-text-field
                  v-model="password"
                  :label="t('auth.register.password')"
                  :placeholder="t('auth.register.passwordPlaceholder')"
                  type="password"
                />

                <v-text-field
                  v-model="confirmPassword"
                  :error="showPasswordError"
                  :error-messages="showPasswordError ? t('auth.register.passwordMismatch') : ''"
                  :label="t('auth.register.confirmPassword')"
                  :placeholder="t('auth.register.confirmPasswordPlaceholder')"
                  type="password"
                />
              </div>
            </template>
          </div>
        </transition>
      </div>

      <div class="mt-1.5 flex flex-col gap-2.5 sm:flex-row">
        <v-btn-secondary
          v-if="currentStep > 1"
          class="!h-14 !w-full !text-sm !font-semibold !normal-case sm:!w-auto [font-family:var(--font-body)]"
          prepend-icon="mdi-arrow-left"
          @click="previousStep"
        >
          {{ t('auth.register.back') }}
        </v-btn-secondary>

        <v-btn-primary
          v-if="currentStep < 3"
          append-icon="mdi-arrow-right"
          class="!h-14 !w-full !text-base !shadow-[0_10px_26px_rgba(255,107,0,0.35)] disabled:!shadow-none sm:!flex-1 [font-family:var(--font-body)]"
          :disabled="!canGoNext"
          type="submit"
        >
          {{ t('auth.register.next') }}
        </v-btn-primary>

        <v-btn-primary
          v-else
          append-icon="mdi-arrow-right"
          class="!h-14 !w-full !text-base !shadow-[0_10px_26px_rgba(255,107,0,0.35)] disabled:!shadow-none sm:!flex-1 [font-family:var(--font-body)]"
          :disabled="!canSubmit || authStore.isLoading"
          :loading="authStore.isLoading"
          type="submit"
        >
          {{ t('auth.register.submit') }}
        </v-btn-primary>
      </div>

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
    </v-form>

    <p class="mt-4 mb-0 text-center text-sm text-[rgb(var(--v-theme-on-surface-variant))] [font-family:var(--font-body)]">
      {{ t('auth.register.hasAccount') }}
      <router-link class="ml-1.5 font-bold text-[rgb(var(--v-theme-primary-darken-1))] hover:underline" to="/login">
        {{ t('auth.register.signIn') }}
      </router-link>
    </p>
  </AuthShell>
</template>

<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'
  import AuthShell from '@/components/auth/AuthShell.vue'
  import GoogleOAuthButton from '@/components/auth/GoogleOAuthButton.vue'
  import SportsPicker from '@/components/auth/SportsPicker.vue'
  import { ApiError } from '@/api/client'
  import { useAuthStore } from '@/stores/auth'

  const router = useRouter()
  const { t } = useI18n()
  const authStore = useAuthStore()

  const fullName = ref('')
  const email = ref('')
  const password = ref('')
  const confirmPassword = ref('')
  const selectedSports = ref<string[]>([])
  const currentStep = ref(1)
  const errorMessage = ref('')
  const stepContentInner = ref<HTMLElement | null>(null)
  const stepShellHeight = ref('0px')

  let stepResizeObserver: ResizeObserver | null = null

  const passwordsMatch = computed(() => password.value.length > 0 && password.value === confirmPassword.value)
  const showPasswordError = computed(() => confirmPassword.value.length > 0 && !passwordsMatch.value)

  const isStepOneValid = computed(() => {
    const emailIsValid = /^\S+@\S+\.\S+$/.test(email.value)
    return fullName.value.length >= 3 && emailIsValid
  })

  const isStepTwoValid = computed(() => selectedSports.value.length >= 3)
  const isStepThreeValid = computed(() => password.value.length >= 6 && passwordsMatch.value)

  const canGoNext = computed(() => {
    if (currentStep.value === 1) return isStepOneValid.value
    if (currentStep.value === 2) return isStepTwoValid.value
    return false
  })

  const canSubmit = computed(() => isStepOneValid.value && isStepTwoValid.value && isStepThreeValid.value)

  const progressWidth = computed(() => (currentStep.value / 3) * 100)

  function previousStep() {
    currentStep.value = Math.max(1, currentStep.value - 1)
  }

  function nextStep() {
    if (!canGoNext.value) return
    currentStep.value = Math.min(3, currentStep.value + 1)
  }

  function handleSubmit() {
    if (currentStep.value < 3) {
      nextStep()
      return
    }
    submitRegister()
  }

  async function submitRegister() {
    if (!canSubmit.value) return
    errorMessage.value = ''
    try {
      await authStore.register(email.value, password.value, fullName.value || undefined, selectedSports.value)
      router.push('/app/feed')
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 409) {
          errorMessage.value = t('auth.errors.emailTaken')
        } else if (e.status === 429) {
          errorMessage.value = t('auth.errors.tooManyAttempts')
        } else if (e.status === 422) {
          errorMessage.value = t('auth.errors.weakPassword')
        } else {
          errorMessage.value = t('auth.errors.serverError')
        }
      } else {
        errorMessage.value = t('auth.errors.networkError')
      }
    }
  }

  function syncStepHeight() {
    if (!stepContentInner.value) return
    stepShellHeight.value = `${stepContentInner.value.scrollHeight}px`
  }

  watch(currentStep, async () => {
    await nextTick()
    syncStepHeight()
  })

  watch(stepContentInner, (nextEl, previousEl) => {
    if (previousEl && stepResizeObserver) stepResizeObserver.unobserve(previousEl)
    if (nextEl && stepResizeObserver) {
      stepResizeObserver.observe(nextEl)
      syncStepHeight()
    }
  })

  onMounted(async () => {
    await nextTick()
    syncStepHeight()

    stepResizeObserver = new ResizeObserver(() => syncStepHeight())
    if (stepContentInner.value) stepResizeObserver.observe(stepContentInner.value)
    window.addEventListener('resize', syncStepHeight)
  })

  onBeforeUnmount(() => {
    if (stepResizeObserver && stepContentInner.value) stepResizeObserver.unobserve(stepContentInner.value)
    stepResizeObserver?.disconnect()
    window.removeEventListener('resize', syncStepHeight)
  })
</script>
