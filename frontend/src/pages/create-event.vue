<template>
  <div class="mx-auto flex w-full max-w-xl min-w-0 flex-col gap-4 pb-safe-lg lg:max-w-7xl lg:pb-6">
    <AppPageIntro :subtitle="t('create.subtitle')" :title="t('create.title')" />

    <CreateEventSportSection
      v-model="sport"
      v-model:custom-sport="customSport"
      :custom-sport-error="customSportError"
      :custom-sport-label="t('create.customSportLabel')"
      :custom-sport-placeholder="t('create.customSportPlaceholder')"
      :options="sportOptions"
      :title="`1. ${t('create.sport')}`"
    />

    <CreateEventScheduleSection
      :date="date"
      :date-error="dateError"
      date-label="Date"
      :location="location"
      :location-error="locationError"
      :location-placeholder="locationPlaceholder"
      :time="time"
      :time-error="timeError"
      :time-label="t('create.time')"
      :title="`2. ${t('create.location')} & ${t('create.time')}`"
      @update:date="date = $event"
      @update:location="location = $event"
      @update:time="time = $event"
    />

    <CreateEventVisibilitySection
      v-model:recurring="recurring"
      v-model:visibility="visibility"
      :private-label="t('create.private')"
      :public-label="t('create.public')"
      :recurring-hint="t('create.recurringHint')"
      :recurring-label="t('create.recurring')"
      :title="`3. ${t('create.settings')}`"
    />

    <div class="pointer-events-none fixed right-0 bottom-[calc(72px+env(safe-area-inset-bottom))] left-0 z-40 px-4 lg:pointer-events-auto lg:static lg:z-auto lg:px-0">
      <div class="mx-auto w-full max-w-xl rounded-3xl bg-[color-mix(in_srgb,rgb(var(--v-theme-background))_74%,transparent)] p-2 [backdrop-filter:blur(6px)] lg:max-w-2xl lg:rounded-none lg:bg-transparent lg:p-0 lg:[backdrop-filter:none]">
        <v-btn-primary
          class="pointer-events-auto !h-14 !w-full !text-base !tracking-wide disabled:!bg-[rgb(var(--v-theme-surface-variant))] disabled:!text-[rgb(var(--v-theme-on-surface-variant))] [font-family:var(--font-body)]"
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          {{ t('create.submit') }}
          <v-icon end icon="mdi-arrow-right" />
        </v-btn-primary>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import CreateEventScheduleSection from '@/components/create-event/CreateEventScheduleSection.vue'
  import CreateEventSportSection from '@/components/create-event/CreateEventSportSection.vue'
  import CreateEventVisibilitySection from '@/components/create-event/CreateEventVisibilitySection.vue'
  import AppPageIntro from '@/components/shared/AppPageIntro.vue'

  const { t } = useI18n()

  const sport = ref('football')
  const customSport = ref('')
  const location = ref('')
  const time = ref('')
  const date = ref('')
  const visibility = ref<'public' | 'private'>('public')
  const recurring = ref(false)
  const attemptedSubmit = ref(false)

  const createPrefillStorageKey = 'sportconnect-create-prefill-v1'

  const locationPlaceholder = computed(() => t('create.locationPlaceholder'))

  const usesCustomSport = computed(() => sport.value === 'more')

  const locationError = computed(() => {
    if (!attemptedSubmit.value) return ''
    return location.value.trim() ? '' : t('create.errors.locationRequired')
  })

  const dateError = computed(() => {
    if (!attemptedSubmit.value) return ''
    if (!date.value) return t('create.errors.dateRequired')
    const [yearStr, monthStr, dayStr] = date.value.split('-')
    const year = Number(yearStr)
    const month = Number(monthStr)
    const day = Number(dayStr)
    const parsedDate = new Date(`${date.value}T00:00:00`)
    const isValid = Number.isInteger(year)
      && Number.isInteger(month)
      && Number.isInteger(day)
      && !Number.isNaN(parsedDate.getTime())
    if (!isValid) return t('create.errors.dateInvalid')
    return ''
  })

  const timeError = computed(() => {
    if (!attemptedSubmit.value) return ''
    if (!time.value) return t('create.errors.timeRequired')
    const [hoursStr, minutesStr] = time.value.split(':')
    const hours = Number(hoursStr)
    const minutes = Number(minutesStr)
    const isValid = Number.isInteger(hours) && Number.isInteger(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
    return isValid ? '' : t('create.errors.timeInvalid')
  })

  const customSportError = computed(() => {
    if (!attemptedSubmit.value || !usesCustomSport.value) return ''
    return customSport.value.trim() ? '' : t('create.errors.customSportRequired')
  })

  const canSubmit = computed(() => {
    if (!location.value.trim() || !date.value || !time.value) return false
    if (usesCustomSport.value && !customSport.value.trim()) return false
    return true
  })

  function getSmartNowTime () {
    const now = new Date()
    const rounded = new Date(now)
    const minutes = now.getMinutes()
    const nextSlot = Math.ceil(minutes / 30) * 30
    rounded.setMinutes(nextSlot, 0, 0)
    if (nextSlot === 60) {
      rounded.setHours(rounded.getHours() + 1)
      rounded.setMinutes(0)
    }
    return `${String(rounded.getHours()).padStart(2, '0')}:${String(rounded.getMinutes()).padStart(2, '0')}`
  }

  function getTodayDate () {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  function applySmartPrefillOnFirstAccess () {
    if (typeof window === 'undefined') return
    const hasPrefilledBefore = window.localStorage.getItem(createPrefillStorageKey) === '1'
    if (hasPrefilledBefore) return

    if (!date.value) {
      date.value = getTodayDate()
    }

    if (!time.value) {
      time.value = getSmartNowTime()
    }

    window.localStorage.setItem(createPrefillStorageKey, '1')
  }

  function handleSubmit () {
    attemptedSubmit.value = true
    if (!canSubmit.value) return
  }

  onMounted(() => {
    applySmartPrefillOnFirstAccess()
  })

  const sportOptions = computed(() => [
    { value: 'football', label: t('create.sports.soccer'), icon: 'mdi-soccer' },
    { value: 'basket', label: t('create.sports.basket'), icon: 'mdi-basketball' },
    { value: 'tennis', label: t('create.sports.tennis'), icon: 'mdi-tennis' },
    { value: 'swim', label: t('create.sports.swim'), icon: 'mdi-swim' },
    { value: 'running', label: t('create.sports.run'), icon: 'mdi-run' },
    { value: 'more', label: t('create.sports.more'), icon: 'mdi-dots-horizontal' },
  ])
</script>
