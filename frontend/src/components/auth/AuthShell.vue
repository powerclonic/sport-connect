<template>
  <main class="flex min-h-dvh w-full flex-col overflow-hidden lg:flex-row">
    <!-- Left visual panel — desktop only -->
    <div class="relative flex shrink-0 flex-col overflow-hidden max-lg:hidden lg:w-[500px] xl:w-[560px]">
      <div
        aria-hidden="true"
        class="absolute inset-0 bg-cover bg-center"
        style="background-image: url('https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1400&q=80');"
      >
        <div class="absolute inset-0 bg-linear-to-b from-[rgba(0,0,0,0.82)] via-[rgba(0,0,0,0.36)] to-[rgba(0,0,0,0.80)]" />
      </div>

      <div class="relative z-10 flex flex-1 flex-col justify-between p-8 xl:p-10">
        <v-btn
          class="!w-fit !rounded-full !border !border-[rgba(255,255,255,0.22)] !bg-[rgba(255,255,255,0.1)] !px-3 !text-sm !normal-case !text-white !shadow-none [font-family:var(--font-body)]"
          prepend-icon="mdi-arrow-left"
          size="small"
          variant="flat"
          @click="router.push(backTo)"
        >
          {{ t('auth.backToWelcome') }}
        </v-btn>

        <div class="flex flex-col gap-3">
          <AppBrandMark
            align="start"
            hero-shadow
            :label="t('app.brand')"
            size="hero"
            sport-tone="inverse"
          />
          <p class="m-0 text-base leading-relaxed text-white/65 [font-family:var(--font-body)] [text-shadow:0_1px_4px_rgba(0,0,0,0.4)]">
            {{ t('entry.subtitle') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Right form panel -->
    <div class="relative flex min-h-dvh flex-1 flex-col overflow-y-auto lg:min-h-0 lg:bg-[rgb(var(--v-theme-background))]">
      <!-- Mobile: background photo -->
      <div
        aria-hidden="true"
        class="absolute inset-0 z-0 bg-cover bg-center lg:hidden"
        style="background-image: url('https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1400&q=80');"
      >
        <div class="absolute inset-0 bg-linear-to-b from-[rgba(0,0,0,0.78)] via-[rgba(0,0,0,0.42)] to-[rgba(0,0,0,0.78)] [backdrop-filter:blur(2px)] [-webkit-backdrop-filter:blur(2px)]" />
      </div>

      <!-- Mobile header -->
      <header class="relative z-[2] flex items-center justify-between gap-3 p-5 lg:hidden">
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

      <!-- Form area -->
      <section class="relative z-[2] flex flex-1 flex-col items-center justify-end p-5 pb-safe-md lg:justify-center lg:p-8 xl:p-12">
        <div
          :class="[
            'w-full rounded-3xl bg-[rgb(var(--v-theme-surface))] px-6 py-7 shadow-[0_20px_48px_rgba(0,0,0,0.2)]',
            'lg:rounded-2xl lg:border lg:border-[rgba(var(--v-theme-on-surface),0.08)] lg:shadow-[0_2px_20px_rgba(0,0,0,0.06)]',
            cardMaxWidthClass,
          ]"
        >
          <slot />
        </div>
      </section>
    </div>
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
