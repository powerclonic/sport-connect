import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FeedEvent, OrganizerProfile } from '@/types/feed'
import { feedEventSeeds, organizerProfiles } from '@/mocks/feed/events'

export function useFeedCatalog () {
  const { t } = useI18n()

  const categories = computed(() => [
    { key: 'all', label: t('feed.allSports') },
    { key: 'football', label: t('feed.football') },
    { key: 'tennis', label: t('feed.tennis') },
    { key: 'running', label: t('feed.running') },
    { key: 'padel', label: 'Padel' },
  ])

  const events = computed<FeedEvent[]>(() => {
    return feedEventSeeds.map(seed => {
      const host = organizerProfiles[seed.hostId]

      return {
        id: seed.id,
        title: seed.title,
        summary: seed.summary,
        time: seed.time,
        schedule: seed.schedule,
        location: seed.location,
        distance: t('feed.away', { distance: seed.distanceKm.toFixed(1) }),
        spotsVacancies: seed.spotsVacancies,
        spotsLabel: t('feed.spotsLabel', seed.spotsVacancies),
        category: seed.category,
        icon: seed.icon,
        primaryAction: seed.primaryAction,
        participantsCount: seed.participantsCount,
        participantsPreview: seed.participantsPreview,
        chatId: seed.chatId,
        host: {
          id: host?.id ?? seed.hostId,
          image: host?.image ?? '',
          name: host?.name ?? 'Organizer',
          rating: host?.rating ?? '4.8',
          location: host?.location ?? '',
        },
      }
    })
  })

  const organizerById = computed<Record<string, OrganizerProfile>>(() => organizerProfiles)

  function getEventById (id: string) {
    return events.value.find(event => event.id === id) ?? null
  }

  function getOrganizerById (id: string) {
    return organizerById.value[id] ?? null
  }

  return {
    categories,
    events,
    getEventById,
    getOrganizerById,
  }
}
