<template>
  <div
    :aria-label="label"
    :class="[
      'inline-flex items-baseline leading-none uppercase',
      alignClass,
      shadowClass,
    ]"
    role="img"
  >
    <span :class="sportClass">SPORT</span>
    <span :class="connectClass">CONNECT</span>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  type BrandSize = 'compact' | 'hero'
  type SportTone = 'default' | 'inverse' | 'shell'
  type BrandAlign = 'center' | 'start'

  const props = withDefaults(
    defineProps<{
      label: string
      size?: BrandSize
      sportTone?: SportTone
      align?: BrandAlign
      heroShadow?: boolean
    }>(),
    {
      size: 'compact',
      sportTone: 'default',
      align: 'center',
      heroShadow: false,
    },
  )

  const alignClass = computed(() => {
    return props.align === 'start' ? 'justify-start gap-px' : 'justify-center gap-0.5'
  })

  const shadowClass = computed(() => {
    return props.heroShadow ? '[text-shadow:0_8px_24px_rgba(0,0,0,0.42)]' : ''
  })

  const sportColorClass = computed(() => {
    if (props.sportTone === 'inverse') {
      return 'text-[color:color-mix(in_srgb,rgb(var(--v-theme-on-background))_18%,white_82%)]'
    }

    if (props.sportTone === 'shell') {
      return 'text-[var(--brand-sport-color)]'
    }

    return 'text-[rgb(var(--v-theme-on-surface))]'
  })

  const sizeClass = computed(() => {
    return props.size === 'hero'
      ? 'text-[clamp(40px,9.8vw,58px)] font-black tracking-tighter [font-family:var(--font-heading)]'
      : 'text-[clamp(18px,4.4vw,28px)] font-black tracking-[-0.02em] [font-family:var(--font-heading)]'
  })

  const sportClass = computed(() => {
    return [sizeClass.value, sportColorClass.value].join(' ')
  })

  const connectClass = computed(() => {
    return [sizeClass.value, 'text-[rgb(var(--v-theme-primary))]'].join(' ')
  })
</script>
