<template>
  <FormSectionCard :title="title">
    <v-text-field
      class="mb-3"
      :error="!!locationError"
      :error-messages="locationError"
      hide-details
      :model-value="location"
      :placeholder="locationPlaceholder"
      prepend-inner-icon="mdi-map-marker-outline"
      type="text"
      @update:model-value="$emit('update:location', $event ?? '')"
    />

    <div class="grid gap-3 sm:grid-cols-2">
      <v-text-field
        :aria-label="dateLabel"
        :error="!!dateError"
        :error-messages="dateError"
        hide-details
        :model-value="date"
        prepend-inner-icon="mdi-calendar-outline"
        type="date"
        @update:model-value="$emit('update:date', $event ?? '')"
      />

      <v-text-field
        :aria-label="timeLabel"
        :error="!!timeError"
        :error-messages="timeError"
        hide-details
        :model-value="time"
        prepend-inner-icon="mdi-clock-outline"
        type="time"
        @update:model-value="$emit('update:time', $event ?? '')"
      />
    </div>
  </FormSectionCard>
</template>

<script setup lang="ts">
  import FormSectionCard from '@/components/shared/FormSectionCard.vue'

  defineProps<{
    title: string
    locationPlaceholder: string
    timeLabel: string
    dateLabel: string
    location: string
    time: string
    date: string
    locationError?: string
    timeError?: string
    dateError?: string
  }>()

  defineEmits<{
    'update:location': [value: string]
    'update:time': [value: string]
    'update:date': [value: string]
  }>()
</script>
