<template>
  <!-- Glass variant: on dark/image backgrounds (e.g. index.vue header) -->
  <div
    v-if="variant === 'glass'"
    :aria-label="ariaLabel"
    class="inline-flex items-center gap-1 rounded-full border border-[rgba(var(--v-theme-primary),0.24)] bg-[rgba(var(--v-theme-surface),0.16)] p-1 [backdrop-filter:blur(10px)] [-webkit-backdrop-filter:blur(10px)]"
    role="group"
  >
    <v-btn
      v-for="option in options"
      :key="option.value"
      class="!min-h-8 !min-w-10 !rounded-full !border-0 !px-2.5 !text-xs !font-bold !tracking-tight !normal-case !shadow-none !transition-colors !duration-200 focus-visible:!outline-2 focus-visible:!outline-offset-2 focus-visible:!outline-[rgb(var(--v-theme-primary))] [font-family:var(--font-body)]"
      :class="option.value === modelValue
        ? '!border !border-[rgba(255,255,255,0.3)] !bg-white !text-[#191c1e]'
        : '!bg-transparent !text-[rgba(var(--v-theme-on-surface),0.78)] hover:!bg-[rgba(var(--v-theme-surface),0.16)]'"
      size="x-small"
      variant="flat"
      @click="$emit('update:modelValue', option.value)"
    >
      <v-icon v-if="option.icon && !option.label" class="text-current!" :icon="option.icon" size="17" />
      <span v-if="option.label">{{ option.label }}</span>
    </v-btn>
  </div>

  <!-- Default variant: on surface backgrounds (e.g. settings.vue language toggle) -->
  <div
    v-else
    :aria-label="ariaLabel"
    :class="['grid gap-2', `grid-cols-${options.length}`]"
    role="group"
  >
    <v-btn
      v-for="option in options"
      :key="option.value"
      class="!h-12 !normal-case !text-sm !font-semibold !tracking-normal !transition-colors !duration-200 active:!scale-[0.99] focus-visible:!outline-2 focus-visible:!outline-offset-2 focus-visible:!outline-[rgb(var(--v-theme-primary))] [font-family:var(--font-body)]"
      :class="option.value === modelValue
        ? '!border-[rgb(var(--v-theme-primary))] !bg-[rgba(var(--v-theme-primary),0.14)] !text-[rgb(var(--v-theme-primary-darken-1))]'
        : '!border-transparent !bg-[rgb(var(--v-theme-surface-variant))] !text-[rgb(var(--v-theme-on-surface))] hover:!border-[rgba(var(--v-theme-primary),0.18)]'"
      rounded="xl"
      variant="flat"
      @click="$emit('update:modelValue', option.value)"
    >
      <v-icon v-if="option.icon" class="mr-1.5 text-current!" :icon="option.icon" size="18" />
      {{ option.label }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
  type SelectOption = {
    value: string
    label?: string
    icon?: string
  }

  defineProps<{
    options: SelectOption[]
    modelValue: string
    variant?: 'default' | 'glass'
    ariaLabel?: string
  }>()

  defineEmits<{
    'update:modelValue': [value: string]
  }>()
</script>
