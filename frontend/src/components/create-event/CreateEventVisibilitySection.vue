<template>
  <FormSectionCard :title="title">
    <div class="mb-3 grid grid-cols-2 gap-3">
      <v-btn
        class="!h-16 !w-full !normal-case !text-sm !font-semibold !rounded-full !transition !duration-200 active:!scale-95 [font-family:var(--font-body)]"
        :class="visibility === 'public'
          ? '!border-[rgb(var(--v-theme-primary-darken-1))] !bg-[rgba(var(--v-theme-primary),0.2)] !text-[rgb(var(--v-theme-primary-darken-1))] !shadow-[0_8px_20px_rgba(var(--v-theme-primary),0.15)]'
          : '!border-transparent !bg-[rgb(var(--v-theme-surface-variant))] !text-[rgb(var(--v-theme-primary-darken-1))]'"
        variant="flat"
        @click="$emit('update:visibility', 'public')"
      >
        <v-icon icon="mdi-earth" size="20" />
        <span class="text-lg font-semibold [font-family:var(--font-body)]">{{ publicLabel }}</span>
      </v-btn>

      <v-btn
        class="!h-16 !w-full !normal-case !text-sm !font-semibold !rounded-full !transition !duration-200 active:!scale-95 [font-family:var(--font-body)]"
        :class="visibility === 'private'
          ? '!border-[rgb(var(--v-theme-primary-darken-1))] !bg-[rgba(var(--v-theme-primary),0.2)] !text-[rgb(var(--v-theme-primary-darken-1))] !shadow-[0_8px_20px_rgba(var(--v-theme-primary),0.15)]'
          : '!border-transparent !bg-[rgb(var(--v-theme-surface-variant))] !text-[rgb(var(--v-theme-primary-darken-1))]'"
        variant="flat"
        @click="$emit('update:visibility', 'private')"
      >
        <v-icon icon="mdi-lock-outline" size="20" />
        <span class="text-lg font-semibold [font-family:var(--font-body)]">{{ privateLabel }}</span>
      </v-btn>
    </div>

    <div class="rounded-3xl bg-[rgb(var(--v-theme-surface-variant))] px-4 py-4">
      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0">
          <div class="text-xl leading-tight font-bold text-[rgb(var(--v-theme-on-surface))] [font-family:var(--font-heading)]">
            {{ recurringLabel }}
          </div>

          <p class="mt-1 mb-0 text-base text-[rgb(var(--v-theme-on-surface-variant))] [font-family:var(--font-body)]">
            {{ recurringHint }}
          </p>
        </div>

        <v-switch
          :model-value="recurring"
          @update:model-value="$emit('update:recurring', Boolean($event))"
        />
      </div>
    </div>
  </FormSectionCard>
</template>

<script setup lang="ts">
  import FormSectionCard from '@/components/shared/FormSectionCard.vue'

  withDefaults(defineProps<{
    title: string
    publicLabel: string
    privateLabel: string
    recurringLabel: string
    recurringHint?: string
    visibility: 'public' | 'private'
    recurring: boolean
  }>(), {
    recurringHint: 'Automatically repeat this schedule',
  })

  defineEmits<{
    'update:visibility': [value: 'public' | 'private']
    'update:recurring': [value: boolean]
  }>()
</script>
