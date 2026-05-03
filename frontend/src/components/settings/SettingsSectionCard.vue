<template>
  <section class="rounded-3xl border border-[rgba(var(--v-theme-primary),0.12)] bg-[rgb(var(--v-theme-surface))] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
    <header v-if="title" class="mb-3">
      <h2 class="m-0 text-sm font-bold tracking-wider text-[rgb(var(--v-theme-primary-darken-1))] uppercase [font-family:var(--font-body)]">
        {{ title }}
      </h2>
      <p
        v-if="description"
        class="mt-1 mb-0 text-sm leading-normal text-[rgb(var(--v-theme-on-surface-variant))] [font-family:var(--font-body)]"
      >
        {{ description }}
      </p>
    </header>

    <slot />
  </section>
</template>

<script setup lang="ts">
  withDefaults(defineProps<{
    title?: string
    description?: string
  }>(), {
    title: '',
    description: '',
  })
</script>
