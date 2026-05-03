<template>
  <AuthShell card-max-width-class="max-w-2xl">
    <div aria-hidden="true" class="mb-4">
      <div class="h-1.5 w-full overflow-hidden rounded-full bg-[rgb(var(--v-theme-surface-variant))]">
        <div
          class="h-full rounded-full bg-linear-to-r from-[#a04100] to-[#ff6b00] transition-all duration-300"
          :style="{ width: `${progressWidth}%` }"
        />
      </div>

      <div class="mt-2.5 grid gap-2" :style="{ gridTemplateColumns: `repeat(${totalSteps}, minmax(0, 1fr))` }">
        <div
          class="flex items-center justify-center gap-1.5 sm:justify-start"
          :class="1 <= currentStep ? 'text-[rgb(var(--v-theme-on-surface))]' : 'text-[rgb(var(--v-theme-on-surface-variant))]'"
        >
          <span
            class="inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold [font-family:var(--font-body)]"
            :class="1 <= currentStep ? 'bg-[rgba(var(--v-theme-primary),0.18)] text-[rgb(var(--v-theme-primary-darken-1))]' : 'bg-[rgb(var(--v-theme-surface-variant))] text-[rgb(var(--v-theme-on-surface-variant))]'"
          >
            1
          </span>

          <span class="hidden text-xs leading-tight font-semibold sm:inline [font-family:var(--font-body)]">
            {{ t('auth.register.steps.account') }}
          </span>
        </div>

        <div
          class="flex items-center justify-center gap-1.5 sm:justify-start"
          :class="2 <= currentStep ? 'text-[rgb(var(--v-theme-on-surface))]' : 'text-[rgb(var(--v-theme-on-surface-variant))]'"
        >
          <span
            class="inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold [font-family:var(--font-body)]"
            :class="2 <= currentStep ? 'bg-[rgba(var(--v-theme-primary),0.18)] text-[rgb(var(--v-theme-primary-darken-1))]' : 'bg-[rgb(var(--v-theme-surface-variant))] text-[rgb(var(--v-theme-on-surface-variant))]'"
          >
            2
          </span>

          <span class="hidden text-xs leading-tight font-semibold sm:inline [font-family:var(--font-body)]">
            {{ t('auth.register.steps.sports') }}
          </span>
        </div>

        <div
          v-if="!isGoogleSignup"
          class="flex items-center justify-center gap-1.5 sm:justify-start"
          :class="3 <= currentStep ? 'text-[rgb(var(--v-theme-on-surface))]' : 'text-[rgb(var(--v-theme-on-surface-variant))]'"
        >
          <span
            class="inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold [font-family:var(--font-body)]"
            :class="3 <= currentStep ? 'bg-[rgba(var(--v-theme-primary),0.18)] text-[rgb(var(--v-theme-primary-darken-1))]' : 'bg-[rgb(var(--v-theme-surface-variant))] text-[rgb(var(--v-theme-on-surface-variant))]'"
          >
            3
          </span>

          <span class="hidden text-xs leading-tight font-semibold sm:inline [font-family:var(--font-body)]">
            {{ t('auth.register.steps.password') }}
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
          <div :key="`${currentStep}-${isGoogleSignup}`" ref="stepContentInner" class="grid w-full min-w-0 gap-2.5">
            <template v-if="currentStep === 1">
              <v-text-field
                v-model.trim="fullName"
                :label="t('auth.register.name')"
                :placeholder="t('auth.register.namePlaceholder')"
                type="text"
              />

              <template v-if="!isGoogleSignup">
                <v-text-field
                  v-model.trim="email"
                  :label="t('auth.register.email')"
                  :placeholder="t('auth.register.emailPlaceholder')"
                  type="email"
                />

                <v-btn-secondary
                  class="mt-2 !h-12 !w-full !text-sm !font-semibold !normal-case [font-family:var(--font-body)]"
                  prepend-icon="mdi-google"
                  @click="activateGoogleSignup"
                >
                  {{ t('auth.register.continueWithGoogle') }}
                </v-btn-secondary>
              </template>

              <template v-else>
                <p class="mt-2 mb-0 text-sm text-[rgb(var(--v-theme-on-surface-variant))] [font-family:var(--font-body)]">
                  {{ t('auth.register.googleConnected') }}
                </p>

                <v-btn-ghost
                  class="mt-0.5 !w-fit !p-0 !text-sm !font-bold !normal-case !text-[rgb(var(--v-theme-primary-darken-1))] [font-family:var(--font-body)]"
                  size="small"
                  @click="deactivateGoogleSignup"
                >
                  {{ t('auth.register.useEmailInstead') }}
                </v-btn-ghost>
              </template>
            </template>

            <template v-else-if="currentStep === 2">
              <div class="rounded-xl border border-[rgba(var(--v-theme-on-surface),0.12)] bg-[rgb(var(--v-theme-surface-variant))] p-4">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <h2 class="m-0 text-xl text-[rgb(var(--v-theme-on-surface))] [font-family:var(--font-heading)]">
                      {{ t('auth.register.sportsTitle') }}
                    </h2>

                    <p class="mt-1 mb-0 text-sm text-[rgb(var(--v-theme-on-surface-variant))] [font-family:var(--font-body)]">
                      {{ t('auth.register.sportsHint') }}
                    </p>
                  </div>

                  <span
                    class="whitespace-nowrap rounded-full bg-[rgba(var(--v-theme-primary),0.18)] px-2.5 py-1.5 text-xs font-semibold text-[rgb(var(--v-theme-primary-darken-1))] [font-family:var(--font-body)]"
                  >
                    {{ t('auth.register.selectedCount', selectedSports.length) }}
                  </span>
                </div>

                <v-chip-group
                  class="mt-3"
                  :model-value="selectedSports"
                  multiple
                  @update:model-value="selectedSports = $event"
                >
                  <v-chip
                    v-for="sport in sports"
                    :key="sport.key"
                    class="!text-sm !font-semibold [font-family:var(--font-body)]"
                    color="primary"
                    filter
                    rounded="pill"
                    :value="sport.key"
                    variant="outlined"
                  >
                    {{ sport.label }}
                  </v-chip>
                </v-chip-group>
              </div>
            </template>

            <template v-else-if="!isGoogleSignup">
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
          v-if="currentStep < totalSteps"
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
          :disabled="!canSubmit"
          type="submit"
        >
          {{ isGoogleSignup ? t('auth.register.submitGoogle') : t('auth.register.submit') }}
        </v-btn-primary>
      </div>
    </v-form>

    <p class="mt-4 mb-0 text-center text-sm text-[#5a4136] [font-family:var(--font-body)]">
      {{ t('auth.register.hasAccount') }}
      <router-link class="ml-1.5 font-bold text-[#a04100] hover:underline" to="/login">
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

  const router = useRouter()
  const { t } = useI18n()

  const fullName = ref('')
  const email = ref('')
  const password = ref('')
  const confirmPassword = ref('')
  const selectedSports = ref<string[]>([])
  const currentStep = ref(1)
  const isGoogleSignup = ref(false)
  const stepContentInner = ref<HTMLElement | null>(null)
  const stepShellHeight = ref('0px')

  let stepResizeObserver: ResizeObserver | null = null

  const sports = computed(() => [
    { key: 'football', label: t('auth.sports.football') },
    { key: 'volleyball', label: t('auth.sports.volleyball') },
    { key: 'tennis', label: t('auth.sports.tennis') },
    { key: 'basketball', label: t('auth.sports.basketball') },
    { key: 'running', label: t('auth.sports.running') },
    { key: 'swimming', label: t('auth.sports.swimming') },
    { key: 'crossfit', label: t('auth.sports.crossfit') },
    { key: 'yoga', label: t('auth.sports.yoga') },
    { key: 'beachTennis', label: t('auth.sports.beachTennis') },
  ])

  const passwordsMatch = computed(() => password.value.length > 0 && password.value === confirmPassword.value)
  const showPasswordError = computed(() => confirmPassword.value.length > 0 && !passwordsMatch.value)

  const isStepOneValid = computed(() => {
    if (isGoogleSignup.value) return fullName.value.length >= 3
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

  const totalSteps = computed(() => (isGoogleSignup.value ? 2 : 3))

  const canSubmit = computed(() => {
    if (isGoogleSignup.value) {
      return isStepOneValid.value && isStepTwoValid.value
    }
    return isStepOneValid.value && isStepTwoValid.value && isStepThreeValid.value
  })

  const progressWidth = computed(() => {
    return (currentStep.value / totalSteps.value) * 100
  })

  function previousStep () {
    currentStep.value = Math.max(1, currentStep.value - 1)
  }

  function nextStep () {
    if (!canGoNext.value) return
    currentStep.value = Math.min(totalSteps.value, currentStep.value + 1)
  }

  function handleSubmit () {
    if (currentStep.value < totalSteps.value) {
      nextStep()
      return
    }
    submitRegister()
  }

  function activateGoogleSignup () {
    isGoogleSignup.value = true
    email.value = ''
    password.value = ''
    confirmPassword.value = ''
  }

  function deactivateGoogleSignup () {
    isGoogleSignup.value = false
    if (currentStep.value > 1) {
      currentStep.value = 1
    }
  }

  function submitRegister () {
    if (!canSubmit.value) return
    router.push('/app/feed')
  }

  function syncStepHeight () {
    if (!stepContentInner.value) return
    stepShellHeight.value = `${stepContentInner.value.scrollHeight}px`
  }

  watch([currentStep, isGoogleSignup], async () => {
    await nextTick()
    syncStepHeight()
  })

  watch(stepContentInner, (nextEl, previousEl) => {
    if (previousEl && stepResizeObserver) {
      stepResizeObserver.unobserve(previousEl)
    }

    if (nextEl && stepResizeObserver) {
      stepResizeObserver.observe(nextEl)
      syncStepHeight()
    }
  })

  onMounted(async () => {
    await nextTick()
    syncStepHeight()

    stepResizeObserver = new ResizeObserver(() => {
      syncStepHeight()
    })

    if (stepContentInner.value) {
      stepResizeObserver.observe(stepContentInner.value)
    }

    window.addEventListener('resize', syncStepHeight)
  })

  onBeforeUnmount(() => {
    if (stepResizeObserver && stepContentInner.value) {
      stepResizeObserver.unobserve(stepContentInner.value)
    }
    stepResizeObserver?.disconnect()
    window.removeEventListener('resize', syncStepHeight)
  })
</script>
