// Utilities
import { defineStore } from 'pinia'
import { ratingsApi, type RatingResponse } from '@/api/ratings'

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80'

export const useAppStore = defineStore('app', {
  state: () => ({
    avatarUrl: DEFAULT_AVATAR,
    completedEventIds: ['event-football-01', 'event-basketball-01'] as string[],
    ratingsReceived: [] as RatingResponse[],
    ratingsGiven: [] as RatingResponse[],
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
    async loadRatingsReceived () {
      try {
        const data = await ratingsApi.getReceived()
        this.ratingsReceived = data
      } catch (error) {
        console.error('Failed to load ratings received:', error)
      }
    },
    async loadRatingsGiven () {
      try {
        const data = await ratingsApi.getGiven()
        this.ratingsGiven = data
      } catch (error) {
        console.error('Failed to load ratings given:', error)
      }
    },
    async loadAllRatings () {
      await Promise.all([this.loadRatingsReceived(), this.loadRatingsGiven()])
    },
    async submitRating (payload: any) {
      try {
        const result = await ratingsApi.create(payload)
        this.ratingsGiven.unshift(result)
      } catch (error) {
        console.error('Failed to submit rating:', error)
      }
    },
  },
})
