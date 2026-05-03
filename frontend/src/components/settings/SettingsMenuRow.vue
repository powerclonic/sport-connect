<template>
  <component
    :is="componentTag"
    :to="disabled ? undefined : to"
    class="flex w-full items-center gap-3 rounded-2xl border-0 px-3 py-3 text-left outline-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--v-theme-primary))]"
    :class="disabled
      ? 'cursor-not-allowed bg-[rgb(var(--v-theme-surface-variant))]/55 opacity-65'
      : 'cursor-pointer bg-[rgb(var(--v-theme-surface-variant))] hover:bg-[rgba(var(--v-theme-primary),0.14)]'"
    type="button"
    :disabled="componentTag === 'button' && disabled"
  >
    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(var(--v-theme-primary),0.16)] text-[rgb(var(--v-theme-primary-darken-1))]">
      <v-icon :icon="icon" size="22" />
    </div>

    <div class="min-w-0 flex-1">
      <div class="text-base font-semibold text-[rgb(var(--v-theme-on-surface))] [font-family:var(--font-body)]">
        {{ title }}
      </div>
      <p v-if="subtitle" class="mt-0.5 mb-0 text-sm text-[rgb(var(--v-theme-on-surface-variant))] [font-family:var(--font-body)]">
        {{ subtitle }}
      </p>
    </div>

    <div class="shrink-0 text-[rgb(var(--v-theme-on-surface-variant))]">
      <v-icon :icon="disabled ? 'mdi-lock-outline' : 'mdi-chevron-right'" size="20" />
    </div>
  </component>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const props = withDefaults(defineProps<{
    title: string
    subtitle?: string
    icon: string
    to?: string
    disabled?: boolean
  }>(), {
    subtitle: '',
    to: '',
    disabled: false,
  })

  const componentTag = computed(() => (props.to && !props.disabled ? 'router-link' : 'button'))
</script>
