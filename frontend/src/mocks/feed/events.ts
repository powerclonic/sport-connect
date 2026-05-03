import type { FeedEventCategory, OrganizerProfile } from '@/types/feed'

type FeedEventSeed = {
  id: string
  title: string
  summary: string
  time: string
  schedule: string
  location: string
  distanceKm: number
  spotsVacancies: number
  category: FeedEventCategory
  icon: string
  primaryAction: 'details' | 'join'
  participantsCount: number
  participantsPreview: string[]
  chatId: string
  hostId: string
}

export const organizerProfiles: Record<string, OrganizerProfile> = {
  'user-marcus': {
    id: 'user-marcus',
    name: 'Marcus Lee',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=220&q=80',
    rating: '4.8',
    location: 'Brooklyn, NY',
    gamesPlayed: 124,
    reliability: '98%',
    favoriteSports: ['Football', 'Padel', 'Running'],
    feedback: [
      { id: 'f1', author: 'Ana C.', score: 5, comment: 'Organized and always confirms lineup early.' },
      { id: 'f2', author: 'Leo T.', score: 4.7, comment: 'Keeps match pace balanced for all players.' },
    ],
  },
  'user-ana': {
    id: 'user-ana',
    name: 'Ana Ribeiro',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=220&q=80',
    rating: '4.9',
    location: 'Sao Paulo, BR',
    gamesPlayed: 176,
    reliability: '99%',
    favoriteSports: ['Tennis', 'Beach Tennis', 'Running'],
    feedback: [
      { id: 'f3', author: 'Sarah J.', score: 5, comment: 'Great communication in chat and on court.' },
      { id: 'f4', author: 'Rafa M.', score: 4.9, comment: 'Very respectful and punctual organizer.' },
    ],
  },
  'user-leo': {
    id: 'user-leo',
    name: 'Leo Costa',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=220&q=80',
    rating: '5.0',
    location: 'Porto, PT',
    gamesPlayed: 89,
    reliability: '97%',
    favoriteSports: ['Running', 'Football', 'Crossfit'],
    feedback: [
      { id: 'f5', author: 'Marta S.', score: 5, comment: 'Route and pace briefing were perfect.' },
      { id: 'f6', author: 'Joao L.', score: 5, comment: 'Supportive host for every pace level.' },
    ],
  },
}

export const feedEventSeeds: FeedEventSeed[] = [
  {
    id: 'event-football-01',
    title: '5v5 Casual Match',
    summary: 'Friday 5v5 match for intermediate players.',
    time: 'Today, 6:30 PM',
    schedule: 'Fri, 6:30 PM',
    location: 'Riverside Arena, Court 2',
    distanceKm: 1.2,
    spotsVacancies: 3,
    category: 'football',
    icon: 'mdi-soccer',
    primaryAction: 'join',
    participantsCount: 7,
    participantsPreview: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
      'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=160&q=80',
    ],
    chatId: 'event-football-01',
    hostId: 'user-marcus',
  },
  {
    id: 'event-tennis-01',
    title: 'Morning Rally Pair',
    summary: 'Fast rally drills with focus on consistency.',
    time: 'Tomorrow, 8:00 AM',
    schedule: 'Sat, 8:00 AM',
    location: 'Sunset Club, Court 4',
    distanceKm: 3.5,
    spotsVacancies: 1,
    category: 'tennis',
    icon: 'mdi-tennis',
    primaryAction: 'join',
    participantsCount: 3,
    participantsPreview: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
    ],
    chatId: 'event-tennis-01',
    hostId: 'user-ana',
  },
  {
    id: 'event-running-01',
    title: 'City Park 10K Pacing',
    summary: 'Tempo run in groups, warm-up and cooldown included.',
    time: 'Sat, 7:00 AM',
    schedule: 'Sat, 7:00 AM',
    location: 'City Park, North Gate',
    distanceKm: 5,
    spotsVacancies: 5,
    category: 'running',
    icon: 'mdi-run',
    primaryAction: 'details',
    participantsCount: 11,
    participantsPreview: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=160&q=80',
    ],
    chatId: 'event-running-01',
    hostId: 'user-leo',
  },
]
