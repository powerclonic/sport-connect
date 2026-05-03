export type FeedEventCategory = 'football' | 'tennis' | 'running' | 'padel'

export interface FeedEventHost {
  id: string
  image: string
  name: string
  rating: string
  location: string
}

export interface FeedEvent {
  id: string
  title: string
  summary: string
  time: string
  schedule: string
  location: string
  distance: string
  spotsVacancies: number
  spotsLabel: string
  category: FeedEventCategory
  icon: string
  primaryAction: 'details' | 'join'
  participantsCount: number
  participantsPreview: string[]
  chatId: string
  host: FeedEventHost
}

export interface OrganizerFeedback {
  id: string
  author: string
  score: number
  comment: string
}

export interface OrganizerProfile {
  id: string
  name: string
  image: string
  rating: string
  location: string
  gamesPlayed: number
  reliability: string
  favoriteSports: string[]
  feedback: OrganizerFeedback[]
}
