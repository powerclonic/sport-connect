<template>
  <section
    class="relative overflow-hidden rounded-xl border border-[rgba(var(--v-theme-on-surface),0.2)] bg-[rgba(var(--v-theme-surface),0.72)] p-6 [backdrop-filter:blur(12px)] [-webkit-backdrop-filter:blur(12px)] after:pointer-events-none after:absolute after:inset-0 after:rounded-xl after:bg-[rgba(var(--v-theme-surface),0.08)] after:content-['']"
  >
    <div class="mb-2 flex items-center justify-between gap-3">
      <div class="flex items-center gap-2 text-[rgba(var(--v-theme-on-surface),0.9)]">
        <v-icon class="text-current!" :icon="icon" size="22" />

        <h2
          class="m-0 text-xl leading-snug font-semibold text-current [font-family:var(--font-heading)]"
        >
          {{ title }}
        </h2>
      </div>

      <span
        class="whitespace-nowrap rounded-full bg-[rgb(var(--v-theme-surface-variant))] px-3 py-1.5 text-xs font-semibold tracking-wider text-[rgb(var(--v-theme-on-surface-variant))] uppercase [font-family:var(--font-body)]"
      >
        {{ badge }}
      </span>
    </div>

    <p class="m-0 text-base leading-relaxed font-normal text-[rgba(var(--v-theme-on-surface),0.82)] [font-family:var(--font-body)]">
      {{ description }}
    </p>
  </section>
</template>

<script setup lang="ts">
  withDefaults(
    defineProps<{
      title: string
      badge: string
      description: string
      icon?: string
    }>(),
    {
      icon: 'mdi-stadium',
    },
  )
</script>
