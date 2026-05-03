<template>
  <div class="flex flex-col gap-4 px-4 pt-3 pb-safe-xs">
    <header class="flex items-start justify-between gap-3 pb-2.5 border-b border-[rgba(var(--v-theme-on-surface),0.08)]">
      <div>
        <h2 class="m-0 text-lg font-bold leading-tight tracking-tight">{{ title }}</h2>
        <p class="mt-1 mb-0 text-sm leading-snug opacity-70">{{ subtitle }}</p>
      </div>

      <div class="-mr-0.5 flex items-center gap-1 rounded-full border border-[rgba(var(--v-theme-on-surface),0.08)] bg-[rgba(var(--v-theme-on-surface),0.04)] p-0.5">
        <v-btn
          :aria-label="markAllLabel"
          class="!h-8 !w-8 !min-w-0 !text-[rgba(var(--v-theme-on-surface),0.7)] hover:!text-[rgb(var(--v-theme-on-surface))]"
          density="compact"
          icon="mdi-check-all"
          variant="text"
          size="small"
          @click="markAllAsRead"
        />
        <v-btn
          :aria-label="settingsLabel"
          class="!h-8 !w-8 !min-w-0 !text-[rgba(var(--v-theme-on-surface),0.7)] hover:!text-[rgb(var(--v-theme-on-surface))]"
          density="compact"
          icon="mdi-cog-outline"
          variant="text"
          size="small"
          @click="openSettings"
        />
        <v-btn
          :aria-label="closeLabel"
          class="!h-8 !w-8 !min-w-0 !text-[rgba(var(--v-theme-on-surface),0.7)] hover:!text-[rgb(var(--v-theme-on-surface))]"
          density="compact"
          icon="mdi-close"
          variant="text"
          size="small"
          @click="emit('close')"
        />
      </div>
    </header>

    <div class="flex max-h-[min(64dvh,520px)] flex-col gap-4 overflow-y-auto pr-0.5">
      <section
        v-if="!hasTodayNotifications"
        class="flex items-start gap-3 rounded-xl border border-[rgba(var(--v-theme-on-surface),0.08)] bg-[rgba(var(--v-theme-on-surface),0.012)] px-3 py-3"
      >
        <div class="size-8 shrink-0 rounded-full bg-[rgba(var(--v-theme-primary),0.14)] text-[rgb(var(--v-theme-primary))] grid place-items-center">
          <v-icon icon="mdi-bell-sleep-outline" size="16" />
        </div>

        <div class="min-w-0 flex-1">
          <h3 class="m-0 text-base font-[650] leading-tight">{{ activeEasterEgg?.title ?? emptyLabel }}</h3>
          <p class="mt-1 mb-0 text-sm leading-normal opacity-75">{{ activeEasterEgg?.message ?? emptyLabel }}</p>
          <v-btn
            v-if="activeEasterEgg"
            class="mt-1 self-start !min-h-9 !px-4 !normal-case !tracking-normal !font-semibold"
            color="primary"
            size="small"
            rounded="pill"
            variant="tonal"
            @click="goTo(activeEasterEgg.route)"
          >
            <template #prepend>
              <v-icon :icon="activeEasterEgg.ctaIcon" size="16" class="mr-1" />
            </template>
            <span class="px-0.5">{{ activeEasterEgg.cta }}</span>
          </v-btn>
        </div>
      </section>

      <section v-if="groupedNotifications.today.length" class="flex flex-col gap-2">
        <h3 class="m-0 text-xs font-bold uppercase tracking-wider opacity-55">{{ groupTodayLabel }}</h3>
        <article
          v-for="item in groupedNotifications.today"
          :key="item.id"
          class="flex items-start gap-3 rounded-xl border border-[rgba(var(--v-theme-on-surface),0.08)] bg-[rgba(var(--v-theme-on-surface),0.012)] px-3 py-3"
          :class="{ 'border-[rgba(var(--v-theme-primary),0.22)] bg-[rgba(var(--v-theme-primary),0.055)]': !item.read }"
        >
          <div class="size-8 shrink-0 rounded-full bg-[rgba(var(--v-theme-primary),0.14)] text-[rgb(var(--v-theme-primary))] grid place-items-center">
            <v-icon :icon="item.icon" size="16" />
          </div>

          <div class="min-w-0 flex-1 flex flex-col gap-1.5">
            <div class="flex items-baseline justify-between gap-2.5">
              <strong class="text-base font-[650] leading-tight">{{ item.title }}</strong>
              <span class="shrink-0 whitespace-nowrap text-xs opacity-60">{{ item.time }}</span>
            </div>
            <p class="m-0 text-sm leading-normal opacity-75">{{ item.description }}</p>
            <v-chip
              v-if="!item.read"
              class="unread-chip self-start mt-0.5 w-fit text-xs tracking-normal"
              size="x-small"
              variant="tonal"
              color="primary"
              label
            >
              {{ unreadLabel }}
            </v-chip>
          </div>
        </article>
      </section>

      <section v-if="groupedNotifications.earlier.length" class="flex flex-col gap-2">
        <h3 class="m-0 text-xs font-bold uppercase tracking-wider opacity-55">{{ groupEarlierLabel }}</h3>
        <article
          v-for="item in groupedNotifications.earlier"
          :key="item.id"
          class="flex items-start gap-3 rounded-xl border border-[rgba(var(--v-theme-on-surface),0.08)] bg-[rgba(var(--v-theme-on-surface),0.012)] px-3 py-3"
        >
          <div class="size-8 shrink-0 rounded-full bg-[rgba(var(--v-theme-primary),0.14)] text-[rgb(var(--v-theme-primary))] grid place-items-center">
            <v-icon :icon="item.icon" size="16" />
          </div>

          <div class="min-w-0 flex-1 flex flex-col gap-1.5">
            <div class="flex items-baseline justify-between gap-2.5">
              <strong class="text-base font-[650] leading-tight">{{ item.title }}</strong>
              <span class="shrink-0 whitespace-nowrap text-xs opacity-60">{{ item.time }}</span>
            </div>
            <p class="m-0 text-sm leading-normal opacity-75">{{ item.description }}</p>
          </div>
        </article>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'

  type NotificationSection = 'today' | 'earlier'

  type NotificationItem = {
    id: string
    icon: string
    title: string
    description: string
    time: string
    section: NotificationSection
    read: boolean
  }

  type EasterEggOption = {
    title: string
    message: string
    cta: string
    route: string
    ctaIcon: string
  }

  const emit = defineEmits<{
    close: []
  }>()

  const { t, locale } = useI18n()
  const router = useRouter()

  const notifications = ref<NotificationItem[]>([])

  const baseNotifications = computed<NotificationItem[]>(() => {
    if (locale.value === 'pt-BR') {
      return [
        // {
        //   id: 'n1',
        //   icon: 'mdi-soccer',
        //   title: t('notificationsTray.items.matchConfirmedTitle'),
        //   description: t('notificationsTray.items.matchConfirmedDesc'),
        //   time: 'agora',
        //   section: 'today',
        //   read: false,
        // },
        // {
        //   id: 'n2',
        //   icon: 'mdi-chat-outline',
        //   title: t('notificationsTray.items.newChatTitle'),
        //   description: t('notificationsTray.items.newChatDesc'),
        //   time: '12 min',
        //   section: 'today',
        //   read: false,
        // },
        // {
        //   id: 'n3',
        //   icon: 'mdi-calendar-clock',
        //   title: t('notificationsTray.items.eventReminderTitle'),
        //   description: t('notificationsTray.items.eventReminderDesc'),
        //   time: '1 h',
        //   section: 'today',
        //   read: true,
        // },
        // {
        //   id: 'n4',
        //   icon: 'mdi-check-circle-outline',
        //   title: t('notificationsTray.items.eventFinishedTitle'),
        //   description: t('notificationsTray.items.eventFinishedDesc'),
        //   time: 'ontem',
        //   section: 'earlier',
        //   read: true,
        // },
      ]
    }

    return [
      {
        id: 'n1',
        icon: 'mdi-soccer',
        title: t('notificationsTray.items.matchConfirmedTitle'),
        description: t('notificationsTray.items.matchConfirmedDesc'),
        time: 'now',
        section: 'today',
        read: false,
      },
      {
        id: 'n2',
        icon: 'mdi-chat-outline',
        title: t('notificationsTray.items.newChatTitle'),
        description: t('notificationsTray.items.newChatDesc'),
        time: '12 min',
        section: 'today',
        read: false,
      },
      {
        id: 'n3',
        icon: 'mdi-calendar-clock',
        title: t('notificationsTray.items.eventReminderTitle'),
        description: t('notificationsTray.items.eventReminderDesc'),
        time: '1 h',
        section: 'today',
        read: true,
      },
      {
        id: 'n4',
        icon: 'mdi-check-circle-outline',
        title: t('notificationsTray.items.eventFinishedTitle'),
        description: t('notificationsTray.items.eventFinishedDesc'),
        time: 'yesterday',
        section: 'earlier',
        read: true,
      },
    ]
  })

  watch(
    baseNotifications,
    (next) => {
      notifications.value = next.map((item) => ({ ...item }))
    },
    { immediate: true },
  )

  const groupedNotifications = computed(() => {
    return {
      today: notifications.value.filter((item) => item.section === 'today'),
      earlier: notifications.value.filter((item) => item.section === 'earlier'),
    }
  })

  const hasTodayNotifications = computed(() => groupedNotifications.value.today.length > 0)

  const easterEggOptions = computed<EasterEggOption[]>(() => {
    return [
      {
        title: t('notificationsTray.easterEgg.searchTitle'),
        message: t('notificationsTray.easterEgg.searchMessage'),
        cta: t('notificationsTray.easterEgg.searchCta'),
        route: '/app/search',
        ctaIcon: 'mdi-magnify',
      },
      {
        title: t('notificationsTray.easterEgg.createTitle'),
        message: t('notificationsTray.easterEgg.createMessage'),
        cta: t('notificationsTray.easterEgg.createCta'),
        route: '/app/create',
        ctaIcon: 'mdi-plus-circle-outline',
      },
      {
        title: t('notificationsTray.easterEgg.chatTitle'),
        message: t('notificationsTray.easterEgg.chatMessage'),
        cta: t('notificationsTray.easterEgg.chatCta'),
        route: '/app/chat',
        ctaIcon: 'mdi-chat-outline',
      },
    ]
  })

  const activeEasterEgg = computed(() => {
    const options = easterEggOptions.value
    if (options.length === 0) return null
    const seed = new Date().getDate()
    return options[seed % options.length]
  })

  const title = computed(() => t('notificationsTray.title'))
  const subtitle = computed(() => t('notificationsTray.subtitle'))
  const groupTodayLabel = computed(() => t('notificationsTray.today'))
  const groupEarlierLabel = computed(() => t('notificationsTray.earlier'))
  const unreadLabel = computed(() => t('notificationsTray.unread'))
  const emptyLabel = computed(() => t('notificationsTray.empty'))
  const markAllLabel = computed(() => t('notificationsTray.markAll'))
  const settingsLabel = computed(() => t('notificationsTray.settings'))
  const closeLabel = computed(() => t('notificationsTray.close'))

  function markAllAsRead () {
    notifications.value = notifications.value.map((item) => ({
      ...item,
      read: true,
    }))
  }

  function goTo (path: string) {
    router.push(path)
    emit('close')
  }

  function openSettings () {
    goTo('/app/settings/notifications')
  }
</script>

<style scoped>
  .unread-chip :deep(.v-chip__content) {
    padding-inline: 0.42rem;
  }
</style>
