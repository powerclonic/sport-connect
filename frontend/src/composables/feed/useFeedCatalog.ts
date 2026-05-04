import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FeedEvent, OrganizerProfile } from '@/types/feed'
import { organizerProfiles } from '@/mocks/feed/events'
import { eventsApi } from '@/api/events'

export function useFeedCatalog () {
  const { t } = useI18n()

  const categories = computed(() => [
    { key: 'all', label: t('feed.allSports') },
    { key: 'football', label: t('feed.football') },
    { key: 'tennis', label: t('feed.tennis') },
    { key: 'running', label: t('feed.running') },
    { key: 'padel', label: 'Padel' },
  ])

  const events = ref<FeedEvent[]>([])

  async function loadEvents () {
    try {
      const data = await eventsApi.list()
      events.value = data.map(e => {
        const host = organizerProfiles[e.organizer_id]
        const spotsVacancies = e.max_participants ? e.max_participants - e.participant_count : 0

        return {
          id: e.id,
          title: e.title,
          summary: e.description ?? '',
          time: new Date(e.date_start).toLocaleTimeString(),
          schedule: new Date(e.date_start).toLocaleDateString(),
          location: e.location ?? e.city,
          distance: t('feed.away', { distance: '0.0' }),
          spotsVacancies,
          spotsLabel: t('feed.spotsLabel', spotsVacancies),
          category: (e.sport as any) ?? 'football',
          icon: '⚽',
          primaryAction: 'join',
          participantsCount: e.participant_count,
          participantsPreview: [],
          chatId: `event-${e.id}`,
          host: {
            id: host?.id ?? e.organizer_id,
            image: host?.image ?? '',
            name: host?.name ?? 'Organizer',
            rating: host?.rating ?? '4.8',
            location: host?.location ?? e.city,
          },
        }
      })
    } catch (e) {
      console.error('Failed to load events:', e)
    }
  }

  async function filterByCity (city: string) {
    try {
      const data = await eventsApi.list(undefined, city)
      events.value = data.map(e => {
        const host = organizerProfiles[e.organizer_id]
        const spotsVacancies = e.max_participants ? e.max_participants - e.participant_count : 0

        return {
          id: e.id,
          title: e.title,
          summary: e.description ?? '',
          time: new Date(e.date_start).toLocaleTimeString(),
          schedule: new Date(e.date_start).toLocaleDateString(),
          location: e.location ?? e.city,
          distance: t('feed.away', { distance: '0.0' }),
          spotsVacancies,
          spotsLabel: t('feed.spotsLabel', spotsVacancies),
          category: (e.sport as any) ?? 'football',
          icon: '⚽',
          primaryAction: 'join',
          participantsCount: e.participant_count,
          participantsPreview: [],
          chatId: `event-${e.id}`,
          host: {
            id: host?.id ?? e.organizer_id,
            image: host?.image ?? '',
            name: host?.name ?? 'Organizer',
            rating: host?.rating ?? '4.8',
            location: host?.location ?? e.city,
          },
        }
      })
    } catch (e) {
      console.error('Failed to filter by city:', e)
    }
  }

  async function filterBySport (sport: string) {
    try {
      const data = await eventsApi.list(sport)
      events.value = data.map(e => {
        const host = organizerProfiles[e.organizer_id]
        const spotsVacancies = e.max_participants ? e.max_participants - e.participant_count : 0

        return {
          id: e.id,
          title: e.title,
          summary: e.description ?? '',
          time: new Date(e.date_start).toLocaleTimeString(),
          schedule: new Date(e.date_start).toLocaleDateString(),
          location: e.location ?? e.city,
          distance: t('feed.away', { distance: '0.0' }),
          spotsVacancies,
          spotsLabel: t('feed.spotsLabel', spotsVacancies),
          category: (e.sport as any) ?? 'football',
          icon: '⚽',
          primaryAction: 'join',
          participantsCount: e.participant_count,
          participantsPreview: [],
          chatId: `event-${e.id}`,
          host: {
            id: host?.id ?? e.organizer_id,
            image: host?.image ?? '',
            name: host?.name ?? 'Organizer',
            rating: host?.rating ?? '4.8',
            location: host?.location ?? e.city,
          },
        }
      })
    } catch (e) {
      console.error('Failed to filter by sport:', e)
    }
  }

  onMounted(() => {
    loadEvents()
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
    loadEvents,
    filterByCity,
    filterBySport,
    getEventById,
    getOrganizerById,
  }
}
