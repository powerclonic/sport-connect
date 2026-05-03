// Utilities
import { defineStore } from 'pinia'

type RatingItem = {
  id: string
  author: string
  targetName: string
  eventId: string
  score: number
  comment: string
  createdAt: string
}

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80'

export const useAppStore = defineStore('app', {
  state: () => ({
    avatarUrl: DEFAULT_AVATAR,
    completedEventIds: ['event-football-01', 'event-basketball-01'] as string[],
    ratingsReceived: [
      {
        id: 'rr-1',
        author: 'Jamie T.',
        targetName: 'Alex Mercer',
        eventId: 'event-football-01',
        score: 4.9,
        comment: 'Great opponent. Showed up on time, played fair, and had a fantastic attitude.',
        createdAt: '2026-04-28T10:30:00Z',
      },
      {
        id: 'rr-2',
        author: 'Marcus L.',
        targetName: 'Alex Mercer',
        eventId: 'event-basketball-01',
        score: 4.8,
        comment: 'Solid team player. Great energy and reliable communication before the match.',
        createdAt: '2026-04-20T08:00:00Z',
      },
    ] as RatingItem[],
    ratingsGiven: [] as RatingItem[],
  }),
  getters: {
    averageRating (state) {
      if (state.ratingsReceived.length === 0) {
        return 0
      }
      const total = state.ratingsReceived.reduce((sum, item) => sum + item.score, 0)
      return total / state.ratingsReceived.length
    },
  },
  actions: {
    setAvatar (nextAvatarUrl: string) {
      if (!nextAvatarUrl.trim()) {
        return
      }
      this.avatarUrl = nextAvatarUrl
    },
    resetAvatar () {
      this.avatarUrl = DEFAULT_AVATAR
    },
    hasRatedEvent (eventId: string) {
      return this.ratingsGiven.some(item => item.eventId === eventId)
    },
    canRateEvent (eventId: string) {
      return this.completedEventIds.includes(eventId) && !this.hasRatedEvent(eventId)
    },
    submitRating (payload: Omit<RatingItem, 'id' | 'createdAt'>) {
      const rating: RatingItem = {
        ...payload,
        id: `rg-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }

      this.ratingsGiven.unshift(rating)
    },
  },
})
