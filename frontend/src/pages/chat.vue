<template>
  <div class="mx-auto w-full max-w-7xl min-w-0">
    <div class="grid gap-4 lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-6">
      <section class="flex min-w-0 flex-col gap-4 lg:h-[calc(100dvh-128px)]">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-black" style="color: rgb(var(--v-theme-on-surface))">
            {{ t('chat.inbox') }}
          </h1>

          <v-avatar color="primary" size="40" variant="tonal">
            <v-icon icon="mdi-chat-outline" size="20" />
          </v-avatar>
        </div>

        <ChatInboxFilters
          :active-filter="activeFilter"
          :search="search"
          @update:active-filter="activeFilter = $event"
          @update:search="search = $event"
        />

        <div class="min-h-0 flex-1">
          <ChatThreadList
            :has-more="chatStore.hasMoreThreads"
            :is-loading="chatStore.isLoadingThreads"
            :is-loading-more="chatStore.isLoadingMoreThreads"
            :threads="visibleThreads"
            @load-more="chatStore.loadMoreThreads"
            @open-thread="openChat"
          />
        </div>
      </section>

      <section
        v-if="isDesktop"
        class="hidden rounded-3xl border border-[rgba(var(--v-theme-on-surface),0.08)] bg-[rgba(var(--v-theme-on-surface),0.02)] p-6 lg:flex lg:min-h-96 lg:flex-col lg:items-center lg:justify-center"
      >
        <v-icon class="opacity-60" icon="mdi-forum-outline" size="40" />

        <h2 class="mt-3 mb-1 text-center text-xl font-bold [font-family:var(--font-heading)]">
          {{ t('chat.openChat') }}
        </h2>

        <p class="m-0 max-w-sm text-center text-sm leading-normal opacity-75">
          {{ t('chat.noMessages') }}
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'
  import { useDisplay } from 'vuetify'
  import ChatInboxFilters from '@/components/chat/ChatInboxFilters.vue'
  import ChatThreadList from '@/components/chat/ChatThreadList.vue'
  import { useChatStore } from '@/stores/chat'

  const { t } = useI18n()
  const display = useDisplay()
  const router = useRouter()
  const chatStore = useChatStore()
  const isDesktop = computed(() => display.lgAndUp.value)

  const search = ref('')
  const activeFilter = ref<'all' | 'unread' | 'muted'>('all')

  const visibleThreads = computed(() => {
    let list = chatStore.sortedThreads
    if (activeFilter.value === 'unread') list = list.filter(t => t.unread_count > 0)
    if (activeFilter.value === 'muted') list = list.filter(t => t.is_muted)
    if (search.value.trim()) {
      const q = search.value.toLowerCase()
      list = list.filter(t => t.event.name.toLowerCase().includes(q))
    }
    return list
  })

  function openChat (eventId: string) {
    router.push(`/app/chat/${eventId}`)
  }

  onMounted(() => {
    chatStore.loadThreads()
  })
</script>
