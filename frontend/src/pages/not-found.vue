<template>
  <div class="mx-auto flex w-full max-w-xl min-w-0 flex-col gap-4 pb-safe-sm lg:max-w-4xl lg:pb-6">
    <AppPageIntro
      :subtitle="t('common.back')"
      title="404"
    />

    <section class="rounded-2xl border border-[rgba(var(--v-theme-on-surface),0.08)] bg-[rgba(var(--v-theme-on-surface),0.02)] p-5">
      <p class="m-0 text-base leading-relaxed opacity-80">
        {{ pageMessage }}
      </p>

      <div class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <v-btn-primary @click="router.push('/app/feed')">
          {{ t('nav.feed') }}
        </v-btn-primary>

        <v-btn-secondary @click="router.push('/welcome')">
          {{ t('common.back') }}
        </v-btn-secondary>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute, useRouter } from 'vue-router'
  import AppPageIntro from '@/components/shared/AppPageIntro.vue'

  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()

  const pageMessage = computed(() => {
    return t('common.back') === 'Voltar'
      ? `Pagina nao encontrada: ${route.fullPath}`
      : `Page not found: ${route.fullPath}`
  })
</script>
