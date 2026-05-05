import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAppStore } from '../app'
import type { RatingResponse } from '@/api/ratings'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockRating = (overrides: Partial<RatingResponse> = {}): RatingResponse => ({
  id: 'rating-1',
  rater_id: 'user-1',
  ratee_id: 'user-2',
  event_id: 'event-1',
  score: 4.0,
  comment: 'Good game',
  created_at: '2026-01-01T00:00:00Z',
  ...overrides,
})

vi.mock('@/api/ratings', () => ({
  ratingsApi: {
    getReceived: vi.fn(),
    getGiven: vi.fn(),
    create: vi.fn(),
  },
}))

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useAppStore', () => {
  let ratingsApi: any
  let store: ReturnType<typeof useAppStore>

  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    const mod = await import('@/api/ratings')
    ratingsApi = mod.ratingsApi

    store = useAppStore()
  })

  // ── Initial state ────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('should start with a default avatar', () => {
      expect(store.avatarUrl).toContain('unsplash')
    })

    it('should start with empty ratings', () => {
      expect(store.ratingsReceived).toEqual([])
      expect(store.ratingsGiven).toEqual([])
    })

    it('averageRating should be 0 when no ratings received', () => {
      expect(store.averageRating).toBe(0)
    })
  })

  // ── Avatar ───────────────────────────────────────────────────────────────

  describe('setAvatar', () => {
    it('should update the avatar URL', () => {
      store.setAvatar('https://example.com/avatar.jpg')
      expect(store.avatarUrl).toBe('https://example.com/avatar.jpg')
    })

    it('should not update avatar when given an empty string', () => {
      const originalAvatar = store.avatarUrl
      store.setAvatar('   ')
      expect(store.avatarUrl).toBe(originalAvatar)
    })
  })

  describe('resetAvatar', () => {
    it('should restore the default avatar', () => {
      store.setAvatar('https://example.com/other.jpg')
      store.resetAvatar()
      expect(store.avatarUrl).toContain('unsplash')
    })
  })

  // ── averageRating getter ─────────────────────────────────────────────────

  describe('averageRating', () => {
    it('should compute the average of received ratings', async () => {
      ratingsApi.getReceived.mockResolvedValue([
        mockRating({ score: 4.0 }),
        mockRating({ score: 2.0 }),
      ])

      await store.loadRatingsReceived()

      expect(store.averageRating).toBe(3.0)
    })

    it('should return 0 when ratings array is empty', () => {
      expect(store.averageRating).toBe(0)
    })
  })

  // ── hasRatedEvent / canRateEvent ─────────────────────────────────────────

  describe('hasRatedEvent', () => {
    it('should return false when no ratings have been given', () => {
      expect(store.hasRatedEvent('event-football-01')).toBe(false)
    })

    it('should return true when user has rated an event', async () => {
      ratingsApi.getGiven.mockResolvedValue([mockRating({ event_id: 'event-football-01' })])
      await store.loadRatingsGiven()

      expect(store.hasRatedEvent('event-football-01')).toBe(true)
    })
  })

  describe('canRateEvent', () => {
    it('should return true for a completed event that has not been rated', () => {
      // 'event-football-01' and 'event-basketball-01' are seeded as completed
      expect(store.canRateEvent('event-football-01')).toBe(true)
    })

    it('should return false for an event not in completedEventIds', () => {
      expect(store.canRateEvent('unknown-event')).toBe(false)
    })

    it('should return false when the event has already been rated', async () => {
      ratingsApi.getGiven.mockResolvedValue([mockRating({ event_id: 'event-football-01' })])
      await store.loadRatingsGiven()

      expect(store.canRateEvent('event-football-01')).toBe(false)
    })
  })

  // ── loadRatingsReceived ──────────────────────────────────────────────────

  describe('loadRatingsReceived', () => {
    it('should populate ratingsReceived on success', async () => {
      const ratings = [mockRating(), mockRating({ id: 'rating-2', score: 5.0 })]
      ratingsApi.getReceived.mockResolvedValue(ratings)

      await store.loadRatingsReceived()

      expect(store.ratingsReceived).toEqual(ratings)
    })

    it('should not throw when the API call fails', async () => {
      ratingsApi.getReceived.mockRejectedValue(new Error('Network error'))

      await expect(store.loadRatingsReceived()).resolves.toBeUndefined()
    })
  })

  // ── loadRatingsGiven ─────────────────────────────────────────────────────

  describe('loadRatingsGiven', () => {
    it('should populate ratingsGiven on success', async () => {
      const ratings = [mockRating()]
      ratingsApi.getGiven.mockResolvedValue(ratings)

      await store.loadRatingsGiven()

      expect(store.ratingsGiven).toEqual(ratings)
    })
  })

  // ── submitRating ─────────────────────────────────────────────────────────

  describe('submitRating', () => {
    it('should prepend new rating to ratingsGiven', async () => {
      const existing = mockRating({ id: 'existing' })
      const created = mockRating({ id: 'new-rating', score: 5.0 })

      ratingsApi.getGiven.mockResolvedValue([existing])
      await store.loadRatingsGiven()

      ratingsApi.create.mockResolvedValue(created)
      await store.submitRating({ event_id: 'event-1', ratee_id: 'user-2', score: 5.0 })

      expect(store.ratingsGiven[0]).toEqual(created)
      expect(store.ratingsGiven).toHaveLength(2)
    })

    it('should not throw when the API call fails', async () => {
      ratingsApi.create.mockRejectedValue(new Error('Forbidden'))

      await expect(store.submitRating({ event_id: 'event-1', ratee_id: 'user-2', score: 3.0 })).resolves.toBeUndefined()
    })
  })

  // ── loadAllRatings ───────────────────────────────────────────────────────

  describe('loadAllRatings', () => {
    it('should load both received and given ratings concurrently', async () => {
      const received = [mockRating({ id: 'r1' })]
      const given = [mockRating({ id: 'r2' })]

      ratingsApi.getReceived.mockResolvedValue(received)
      ratingsApi.getGiven.mockResolvedValue(given)

      await store.loadAllRatings()

      expect(store.ratingsReceived).toEqual(received)
      expect(store.ratingsGiven).toEqual(given)
    })
  })
})
