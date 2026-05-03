import type { ChatEvent, ChatMessage, ChatParticipant, ChatThread } from '@/types/chat'

export const CURRENT_USER_ID = 'user-me'

export const currentUser: ChatParticipant = {
  id: CURRENT_USER_ID,
  name: 'You',
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
  isCurrentUser: true,
  isOnline: true,
}

const participants: Record<string, ChatParticipant> = {
  [CURRENT_USER_ID]: currentUser,
  'user-marcus': {
    id: 'user-marcus',
    name: 'Marcus T.',
    avatar: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=160&q=80',
    isOnline: true,
  },
  'user-ana': {
    id: 'user-ana',
    name: 'Ana R.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
    isOnline: false,
  },
  'user-leo': {
    id: 'user-leo',
    name: 'Leo B.',
    avatar: undefined,
    isOnline: true,
  },
  'user-sofia': {
    id: 'user-sofia',
    name: 'Sofia M.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=160&q=80',
    isOnline: false,
  },
}

export const mockEvents: ChatEvent[] = [
  {
    id: 'event-football-01',
    name: 'Sunday Morning Football',
    sport: 'football',
    sportIcon: 'mdi-soccer',
    date: '2025-01-12T08:00:00',
    location: 'Central Park Turf, Field 3',
  },
  {
    id: 'event-basketball-01',
    name: 'Friday Night Hoops',
    sport: 'basketball',
    sportIcon: 'mdi-basketball',
    date: '2025-01-10T19:00:00',
    location: 'Riverside Community Gym',
  },
  {
    id: 'event-run-01',
    name: 'Morning Trail Run 5k',
    sport: 'running',
    sportIcon: 'mdi-run',
    date: '2025-01-11T06:30:00',
    location: 'Sunset Park Trail',
  },
  {
    id: 'event-tennis-01',
    name: 'Mixed Doubles Tennis',
    sport: 'tennis',
    sportIcon: 'mdi-tennis',
    date: '2025-01-09T10:00:00',
    location: 'North Club Court 2',
  },
]

const footballHistoryParticipants = [
  participants['user-marcus'],
  participants['user-ana'],
  participants['user-leo'],
  currentUser,
]

const footballHistoryMessages: ChatMessage[] = Array.from({ length: 36 }, (_, index) => {
  const sender = footballHistoryParticipants[index % footballHistoryParticipants.length]
  const createdAt = new Date(Date.UTC(2025, 0, 10, 14, 0 + index * 6)).toISOString().slice(0, 19)

  return {
    id: `msg-f-h-${String(index + 1).padStart(2, '0')}`,
    event_id: 'event-football-01',
    sender_id: sender.id,
    sender,
    content: `Pre-game planning note ${index + 1}`,
    created_at: createdAt,
    status: 'read',
  }
})

// Messages keyed by event ID
export const mockMessages: Record<string, ChatMessage[]> = {
  'event-football-01': [
    ...footballHistoryMessages,
    {
      id: 'msg-f-01',
      event_id: 'event-football-01',
      sender_id: 'user-marcus',
      sender: participants['user-marcus'],
      content: 'Hey team! Are we still on for the 5 PM match at the North Pitch?',
      created_at: '2025-01-11T16:00:00',
      status: 'read',
    },
    {
      id: 'msg-f-02',
      event_id: 'event-football-01',
      sender_id: 'user-ana',
      sender: participants['user-ana'],
      content: 'Yes! I\'m heading over now. Traffic looks clear.',
      created_at: '2025-01-11T16:05:00',
      status: 'read',
    },
    {
      id: 'msg-f-03',
      event_id: 'event-football-01',
      sender_id: CURRENT_USER_ID,
      sender: currentUser,
      content: 'Perfect. I\'ll bring the match ball. See you all in 20 mins!',
      created_at: '2025-01-11T16:10:00',
      status: 'read',
    },
    {
      id: 'msg-f-04',
      event_id: 'event-football-01',
      sender_id: 'user-leo',
      sender: participants['user-leo'],
      content: 'Running late. Start without me, I\'ll join in 2nd half 🙈',
      created_at: '2025-01-12T07:45:00',
      status: 'read',
    },
    {
      id: 'msg-f-05',
      event_id: 'event-football-01',
      sender_id: 'user-marcus',
      sender: participants['user-marcus'],
      content: 'Classic Leo 😂',
      created_at: '2025-01-12T07:46:00',
      status: 'read',
      pinned_at: '2025-01-12T07:50:00',
    },
    {
      id: 'msg-f-06',
      event_id: 'event-football-01',
      sender_id: CURRENT_USER_ID,
      sender: currentUser,
      content: 'Don\'t worry, we got a sub. See you there!',
      created_at: '2025-01-12T07:50:00',
      status: 'delivered',
      reply_to: {
        id: 'msg-f-04',
        sender: participants['user-leo'],
        content: 'Running late. Start without me, I\'ll join in 2nd half 🙈',
      },
    },
  ],

  'event-basketball-01': [
    {
      id: 'msg-b-01',
      event_id: 'event-basketball-01',
      sender_id: 'user-sofia',
      sender: participants['user-sofia'],
      content: 'Gym is booked till 8pm so we start sharp at 7. No latecomers!',
      created_at: '2025-01-10T09:00:00',
      status: 'read',
    },
    {
      id: 'msg-b-02',
      event_id: 'event-basketball-01',
      sender_id: CURRENT_USER_ID,
      sender: currentUser,
      content: 'Got it. I\'ll warm up beforehand.',
      created_at: '2025-01-10T09:15:00',
      status: 'read',
      edited_at: '2025-01-10T09:16:00',
    },
    {
      id: 'msg-b-03',
      event_id: 'event-basketball-01',
      sender_id: 'user-marcus',
      sender: participants['user-marcus'],
      content: 'Can we bring +1? My cousin plays point guard.',
      created_at: '2025-01-10T10:00:00',
      status: 'read',
    },
    {
      id: 'msg-b-04',
      event_id: 'event-basketball-01',
      sender_id: 'user-sofia',
      sender: participants['user-sofia'],
      content: 'This message was deleted',
      created_at: '2025-01-10T10:05:00',
      status: 'read',
      deleted_at: '2025-01-10T10:06:00',
    },
    {
      id: 'msg-b-05',
      event_id: 'event-basketball-01',
      sender_id: 'user-sofia',
      sender: participants['user-sofia'],
      content: 'Sure, bring them! We need 10 players.',
      created_at: '2025-01-10T10:07:00',
      status: 'read',
    },
  ],

  'event-run-01': [
    {
      id: 'msg-r-01',
      event_id: 'event-run-01',
      sender_id: 'user-ana',
      sender: participants['user-ana'],
      content: 'Pace target: 5:30/km. Anyone slower can take the 3k loop instead.',
      created_at: '2025-01-11T05:00:00',
      status: 'read',
    },
    {
      id: 'msg-r-02',
      event_id: 'event-run-01',
      sender_id: CURRENT_USER_ID,
      sender: currentUser,
      content: 'I\'ll go for the 3k loop today, recovering from a cold.',
      created_at: '2025-01-11T05:15:00',
      status: 'sent',
    },
  ],

  'event-tennis-01': [
    {
      id: 'msg-t-01',
      event_id: 'event-tennis-01',
      sender_id: 'user-leo',
      sender: participants['user-leo'],
      content: 'Bring your own rackets. Balls are provided.',
      created_at: '2025-01-09T08:00:00',
      status: 'read',
    },
    {
      id: 'msg-t-02',
      event_id: 'event-tennis-01',
      sender_id: 'user-marcus',
      sender: participants['user-marcus'],
      content: 'What\'s the format? Best of 3 sets?',
      created_at: '2025-01-09T08:10:00',
      status: 'read',
    },
    {
      id: 'msg-t-03',
      event_id: 'event-tennis-01',
      sender_id: 'user-leo',
      sender: participants['user-leo'],
      content: 'Best of 3 sets, tiebreak at 6-6. Mixed pairs.',
      created_at: '2025-01-09T08:12:00',
      status: 'read',
    },
  ],
}

export const mockThreads: ChatThread[] = [
  {
    event_id: 'event-football-01',
    event: mockEvents[0],
    participants: [currentUser, participants['user-marcus'], participants['user-ana'], participants['user-leo']],
    online_count: 3,
    unread_count: 2,
    last_message: {
      id: 'msg-f-06',
      sender: currentUser,
      content: 'Don\'t worry, we got a sub. See you there!',
      created_at: '2025-01-12T07:50:00',
    },
    is_muted: false,
  },
  {
    event_id: 'event-basketball-01',
    event: mockEvents[1],
    participants: [currentUser, participants['user-sofia'], participants['user-marcus']],
    online_count: 1,
    unread_count: 0,
    last_message: {
      id: 'msg-b-05',
      sender: participants['user-sofia'],
      content: 'Sure, bring them! We need 10 players.',
      created_at: '2025-01-10T10:07:00',
    },
    is_muted: false,
  },
  {
    event_id: 'event-run-01',
    event: mockEvents[2],
    participants: [currentUser, participants['user-ana']],
    online_count: 1,
    unread_count: 5,
    last_message: {
      id: 'msg-r-02',
      sender: currentUser,
      content: 'I\'ll go for the 3k loop today, recovering from a cold.',
      created_at: '2025-01-11T05:15:00',
    },
    is_muted: true,
  },
  {
    event_id: 'event-tennis-01',
    event: mockEvents[3],
    participants: [currentUser, participants['user-leo'], participants['user-marcus']],
    online_count: 2,
    unread_count: 0,
    last_message: {
      id: 'msg-t-03',
      sender: participants['user-leo'],
      content: 'Best of 3 sets, tiebreak at 6-6. Mixed pairs.',
      created_at: '2025-01-09T08:12:00',
    },
    is_muted: false,
  },
]
