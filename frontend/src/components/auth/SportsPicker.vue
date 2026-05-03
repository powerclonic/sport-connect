<template>
  <div class="rounded-xl border border-[rgba(var(--v-theme-on-surface),0.12)] bg-[rgb(var(--v-theme-surface-variant))] p-4">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h2 class="m-0 text-base font-semibold text-[rgb(var(--v-theme-on-surface))] [font-family:var(--font-heading)]">
          {{ t('auth.register.sportsTitle') }}
        </h2>
        <p class="mt-0.5 mb-0 text-xs text-[rgb(var(--v-theme-on-surface-variant))] [font-family:var(--font-body)]">
          {{ t('auth.register.sportsHint') }}
        </p>
      </div>

      <span
        class="shrink-0 rounded-full bg-[rgba(var(--v-theme-primary),0.18)] px-2.5 py-1 text-xs font-semibold text-[rgb(var(--v-theme-primary-darken-1))] [font-family:var(--font-body)]"
      >
        {{ t('auth.register.selectedCount', modelValue.length) }}
      </span>
    </div>

    <div class="mt-3 flex flex-wrap gap-2">
      <v-chip
        v-for="sport in primarySports"
        :key="sport.key"
        class="!text-sm !font-semibold [font-family:var(--font-body)]"
        :color="modelValue.includes(sport.key) ? 'primary' : undefined"
        rounded="pill"
        :variant="modelValue.includes(sport.key) ? 'tonal' : 'outlined'"
        @click="toggle(sport.key)"
      >
        <template v-if="modelValue.includes(sport.key)" #prepend>
          <v-icon size="14" class="mr-1">mdi-check</v-icon>
        </template>
        {{ sport.label }}
      </v-chip>
    </div>

    <transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div v-if="expanded" class="mt-2 flex flex-wrap gap-2">
        <v-chip
          v-for="sport in secondarySports"
          :key="sport.key"
          class="!text-sm !font-semibold [font-family:var(--font-body)]"
          :color="modelValue.includes(sport.key) ? 'primary' : undefined"
          rounded="pill"
          :variant="modelValue.includes(sport.key) ? 'tonal' : 'outlined'"
          @click="toggle(sport.key)"
        >
          <template v-if="modelValue.includes(sport.key)" #prepend>
            <v-icon size="14" class="mr-1">mdi-check</v-icon>
          </template>
          {{ sport.label }}
        </v-chip>
      </div>
    </transition>

    <button
      class="mt-3 flex cursor-pointer items-center gap-1.5 rounded-full border border-[rgba(var(--v-theme-on-surface),0.18)] bg-transparent px-3 py-1 text-xs font-semibold text-[rgb(var(--v-theme-on-surface-variant))] transition-colors hover:border-[rgba(var(--v-theme-primary),0.4)] hover:text-[rgb(var(--v-theme-primary-darken-1))] [font-family:var(--font-body)]"
      type="button"
      @click="expanded = !expanded"
    >
      <v-icon size="13">{{ expanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
      {{ expanded ? t('auth.completeProfile.showLess') : t('auth.completeProfile.showMore') }}
    </button>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  const props = defineProps<{ modelValue: string[] }>()
  const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>()

  const { t } = useI18n()
  const expanded = ref(false)

  const primarySports = computed(() => [
    { key: 'football', label: t('auth.sports.football') },
    { key: 'basketball', label: t('auth.sports.basketball') },
    { key: 'volleyball', label: t('auth.sports.volleyball') },
    { key: 'tennis', label: t('auth.sports.tennis') },
    { key: 'running', label: t('auth.sports.running') },
  ])

  const secondarySports = computed(() => [
    { key: 'swimming', label: t('auth.sports.swimming') },
    { key: 'crossfit', label: t('auth.sports.crossfit') },
    { key: 'yoga', label: t('auth.sports.yoga') },
    { key: 'beachTennis', label: t('auth.sports.beachTennis') },
  ])

  function toggle(key: string) {
    const current = props.modelValue
    const next = current.includes(key)
      ? current.filter((k) => k !== key)
      : [...current, key]
    emit('update:modelValue', next)
  }
</script>
