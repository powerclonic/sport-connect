<template>
  <main
    class="relative flex min-h-dvh flex-col overflow-x-hidden overflow-y-auto p-5 pb-safe-md"
  >
    <div
      aria-hidden="true"
      class="absolute inset-0 z-0 bg-cover bg-center"
      style="background-image: url('https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1400&q=80');"
    >
      <div
        class="absolute inset-0 bg-linear-to-b from-[rgba(0,0,0,0.78)] via-[rgba(0,0,0,0.42)] to-[rgba(0,0,0,0.78)] [backdrop-filter:blur(2px)]"
      />
    </div>

    <header class="relative z-[2] flex items-center justify-between gap-3">
      <v-btn
        class="!rounded-full !border !border-[rgba(var(--v-theme-on-surface),0.2)] !bg-[rgba(var(--v-theme-surface),0.18)] !px-3 !text-sm !normal-case !text-[color:color-mix(in_srgb,rgb(var(--v-theme-on-background))_18%,white_82%)] !shadow-none [font-family:var(--font-body)]"
        prepend-icon="mdi-arrow-left"
        size="small"
        variant="flat"
        @click="router.push(backTo)"
      >
        {{ t('auth.backToWelcome') }}
      </v-btn>

      <AppBrandMark
        class="text-xl"
        :label="t('app.brand')"
        sport-tone="inverse"
      />
    </header>

    <section class="relative z-[2] mt-auto flex w-full justify-center pb-safe-md">
      <div :class="['w-full rounded-3xl bg-[rgb(var(--v-theme-surface))] px-6 py-7 shadow-[0_20px_48px_rgba(0,0,0,0.2)]', cardMaxWidthClass]">
        <slot />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'
  import AppBrandMark from '@/components/shared/AppBrandMark.vue'

  withDefaults(
    defineProps<{
      backTo?: string
      cardMaxWidthClass?: string
    }>(),
    {
      backTo: '/welcome',
      cardMaxWidthClass: 'max-w-lg',
    },
  )

  const router = useRouter()
  const { t } = useI18n()
</script>
