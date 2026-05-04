<template>
  <div class="mx-auto flex w-full max-w-xl min-w-0 flex-col gap-4 pb-safe-sm lg:max-w-4xl lg:pb-6">
    <AppPageIntro
      :back-label="t('common.back')"
      :back-to="`/app/chat/${eventId}`"
      :subtitle="t('rating.subtitle')"
      :title="t('rating.title')"
    />

    <section class="rounded-2xl border border-[rgba(var(--v-theme-on-surface),0.08)] bg-[rgba(var(--v-theme-on-surface),0.02)] p-4">
      <p class="m-0 text-sm opacity-80">{{ t('rating.eventLabel', { eventId }) }}</p>

      <v-alert
        v-if="!canRate && !alreadyRated"
        class="mt-3"
        color="warning"
        density="comfortable"
        icon="mdi-lock-outline"
        variant="tonal"
      >
        {{ t('rating.onlyAfterFinished') }}
      </v-alert>

      <v-alert
        v-else-if="alreadyRated"
        class="mt-3"
        color="success"
        density="comfortable"
        icon="mdi-check-circle-outline"
        variant="tonal"
      >
        {{ t('rating.alreadySubmitted') }}
      </v-alert>

      <template v-else>
        <div class="mt-4">
          <label class="mb-1.5 block text-sm font-semibold">{{ t('rating.selectTarget') }}</label>

          <v-select
            v-model="targetName"
            hide-details
            item-title="title"
            item-value="value"
            :items="targetOptions"
          />
        </div>

        <div class="mt-4">
          <label class="mb-1.5 block text-sm font-semibold">{{ t('rating.score') }}</label>
          <v-rating v-model="score" half-increments hover />
        </div>

        <div class="mt-4">
          <label class="mb-1.5 block text-sm font-semibold">{{ t('rating.commentLabel') }}</label>

          <v-textarea
            v-model="comment"
            auto-grow
            hide-details
            :placeholder="t('rating.commentPlaceholder')"
            rows="2"
          />
        </div>

        <v-alert
          v-if="errorMessage"
          class="mt-3"
          color="error"
          density="comfortable"
          icon="mdi-alert-circle-outline"
          variant="tonal"
        >
          {{ errorMessage }}
        </v-alert>

        <v-btn-primary class="mt-2 !normal-case !font-semibold" :disabled="isLoading || !targetName || !score" @click="submit">
          <span v-if="isLoading" class="mr-2">{{ t('common.loading') }}</span>
          {{ t('rating.submit') }}
        </v-btn-primary>
      </template>
    </section>

    <v-alert
      v-if="submitted"
      color="success"
      density="comfortable"
      icon="mdi-check-circle-outline"
      variant="tonal"
    >
      {{ t('rating.submitted') }}
    </v-alert>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute, useRouter } from 'vue-router'
  import AppPageIntro from '@/components/shared/AppPageIntro.vue'
  import { useAppStore } from '@/stores/app'
  import { ratingsApi } from '@/api/ratings'

  const route = useRoute()
  const router = useRouter()
  const appStore = useAppStore()
  const { t } = useI18n()

  const eventId = computed(() => String(route.params.id ?? ''))
  const canRate = computed(() => appStore.canRateEvent(eventId.value))
  const alreadyRated = computed(() => appStore.hasRatedEvent(eventId.value))

  const targetOptions = [
    { title: 'Marcus T.', value: 'Marcus T.' },
    { title: 'Ana R.', value: 'Ana R.' },
    { title: 'Leo B.', value: 'Leo B.' },
  ]

  const targetName = ref(targetOptions[0].value)
  const score = ref(4.5)
  const comment = ref('')
  const submitted = ref(false)
  const errorMessage = ref('')
  const isLoading = ref(false)

  async function submit() {
    if (!canRate.value) return
    if (!targetName.value || !score.value) return

    isLoading.value = true
    errorMessage.value = ''
    try {
      await ratingsApi.create({
        ratee_id: targetName.value,
        event_id: eventId.value,
        score: score.value,
        comment: comment.value || undefined
      })
      appStore.submitRating({
        author: 'Alex Mercer',
        targetName: targetName.value,
        eventId: eventId.value,
        score: score.value,
        comment: comment.value.trim() || t('rating.defaultComment'),
      })
      submitted.value = true
      router.push('/app/profile/ratings')
    } catch (e) {
      errorMessage.value = 'Error submitting rating'
    } finally {
      isLoading.value = false
    }
  }
</script>
