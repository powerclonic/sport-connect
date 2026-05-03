<template>
  <section class="flex flex-col gap-1.5" :class="center ? 'text-center' : ''">
    <router-link
      v-if="backTo"
      :to="backTo"
      class="mb-1 inline-flex w-fit items-center gap-1 rounded-full px-2 py-1 text-sm font-semibold text-[rgb(var(--v-theme-primary-darken-1))] transition-colors duration-150 hover:bg-[rgba(var(--v-theme-primary),0.14)] [font-family:var(--font-body)]"
    >
      <v-icon icon="mdi-arrow-left" size="16" />
      <span>{{ backLabel }}</span>
    </router-link>

    <h1 class="m-0 text-2xl lg:text-3xl leading-tight font-bold text-[rgb(var(--v-theme-on-surface))] [font-family:var(--font-heading)]">
      {{ title }}
    </h1>
    <p
      v-if="subtitle"
      class="m-0 text-base leading-normal text-[rgb(var(--v-theme-on-surface-variant))] [font-family:var(--font-body)]"
    >
      {{ subtitle }}
    </p>
  </section>
</template>

<script setup lang="ts">
  withDefaults(defineProps<{
    title: string
    subtitle?: string
    center?: boolean
    backTo?: string
    backLabel?: string
  }>(), {
    subtitle: '',
    center: false,
    backTo: '',
    backLabel: 'Back',
  })
</script>
