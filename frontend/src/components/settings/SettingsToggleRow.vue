<template>
  <div class="flex items-center gap-3 rounded-2xl bg-[rgb(var(--v-theme-surface-variant))] px-3 py-3" :class="disabled ? 'opacity-65' : ''">
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

    <v-switch
      :disabled="disabled"
      true-icon="mdi-check"
      false-icon="mdi-minus"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', Boolean($event))"
    />
  </div>
</template>

<script setup lang="ts">
  withDefaults(defineProps<{
    icon: string
    title: string
    subtitle?: string
    modelValue: boolean
    disabled?: boolean
  }>(), {
    subtitle: '',
    disabled: false,
  })

  defineEmits<{
    'update:modelValue': [value: boolean]
  }>()
</script>
