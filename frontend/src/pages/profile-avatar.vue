<template>
  <div class="mx-auto flex w-full max-w-xl min-w-0 flex-col gap-4 pb-safe-sm lg:max-w-4xl lg:pb-6">
    <AppPageIntro
      :back-label="t('common.back')"
      back-to="/app/profile"
      :subtitle="t('avatar.subtitle')"
      :title="t('avatar.title')"
    />

    <section class="rounded-2xl border border-[rgba(var(--v-theme-on-surface),0.08)] bg-[rgba(var(--v-theme-on-surface),0.02)] p-4">
      <div class="flex flex-col items-center gap-3 text-center">
        <v-avatar
          class="border-4 border-[rgb(var(--v-theme-surface))] shadow-[0_16px_36px_rgba(15,23,42,0.18)]"
          :image="previewAvatar"
          size="118"
        />

        <p class="m-0 text-sm leading-snug opacity-75">{{ t('avatar.helper') }}</p>
      </div>

      <div class="mt-4 flex flex-wrap justify-center gap-2.5">
        <button
          v-for="item in avatarOptions"
          :key="item"
          class="rounded-full border-2 p-0.5 transition"
          :class="selectedAvatar === item
            ? 'border-[rgb(var(--v-theme-primary))]'
            : 'border-transparent hover:border-[rgba(var(--v-theme-primary),0.4)]'"
          type="button"
          @click="selectedAvatar = item"
        >
          <v-avatar :image="item" size="56" />
        </button>
      </div>

      <div class="mt-4 grid gap-2.5 sm:grid-cols-2">
        <v-btn-primary class="!normal-case !font-semibold" @click="saveAvatar">
          {{ t('common.save') }}
        </v-btn-primary>

        <v-btn-secondary class="!normal-case !font-semibold" @click="resetAvatar">
          {{ t('avatar.reset') }}
        </v-btn-secondary>
      </div>

      <v-alert
        v-if="showSaved"
        class="mt-3"
        color="success"
        density="comfortable"
        icon="mdi-check-circle-outline"
        variant="tonal"
      >
        {{ t('avatar.saved') }}
      </v-alert>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import AppPageIntro from '@/components/shared/AppPageIntro.vue'
  import { useAppStore } from '@/stores/app'

  const appStore = useAppStore()
  const { t } = useI18n()

  const avatarOptions = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=240&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80',
  ]

  const selectedAvatar = ref(appStore.avatarUrl)
  const showSaved = ref(false)

  const previewAvatar = computed(() => selectedAvatar.value || appStore.avatarUrl)

  function saveAvatar () {
    appStore.setAvatar(selectedAvatar.value)
    showSaved.value = true
  }

  function resetAvatar () {
    appStore.resetAvatar()
    selectedAvatar.value = appStore.avatarUrl
    showSaved.value = true
  }
</script>
