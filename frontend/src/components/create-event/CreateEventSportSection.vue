<template>
  <FormSectionCard :title="title">
    <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      <v-btn
        v-for="option in options"
        :key="option.value"
        class="!h-28 !w-full !flex-col !items-center !justify-center !gap-2 !rounded-3xl !p-3 !text-center !normal-case !transition !duration-200 active:!scale-95 [font-family:var(--font-body)]"
        :class="modelValue === option.value
          ? '!border-[rgb(var(--v-theme-primary-darken-1))] !bg-[rgba(var(--v-theme-primary),0.2)] !text-[rgb(var(--v-theme-primary-darken-1))] !shadow-[0_10px_24px_rgba(var(--v-theme-primary),0.18)]'
          : '!border-transparent !bg-[rgb(var(--v-theme-surface-variant))] !text-[rgb(var(--v-theme-primary-darken-1))] hover:!border-[rgba(var(--v-theme-primary),0.24)]'"
        variant="flat"
        @click="$emit('update:modelValue', option.value)"
      >
        <v-icon :icon="option.icon" size="30" />
        <span class="text-base leading-none font-semibold tracking-wide [font-family:var(--font-body)]">{{ option.label }}</span>
      </v-btn>
    </div>

    <div v-if="modelValue === customSportTriggerValue" class="mt-3">
      <v-text-field
        id="custom-sport-input"
        :error="!!customSportError"
        :error-messages="customSportError"
        hide-details
        :label="customSportLabel"
        :model-value="customSport"
        :placeholder="customSportPlaceholder"
        type="text"
        @update:model-value="$emit('update:customSport', $event ?? '')"
      />
    </div>
  </FormSectionCard>
</template>

<script setup lang="ts">
  import FormSectionCard from '@/components/shared/FormSectionCard.vue'

  type Option = {
    value: string
    label: string
    icon: string
  }

  withDefaults(defineProps<{
    title: string
    modelValue: string
    options: Option[]
    customSport: string
    customSportLabel: string
    customSportPlaceholder: string
    customSportError?: string
    customSportTriggerValue?: string
  }>(), {
    customSportError: '',
    customSportTriggerValue: 'more',
  })

  defineEmits<{
    'update:modelValue': [value: string]
    'update:customSport': [value: string]
  }>()
</script>
