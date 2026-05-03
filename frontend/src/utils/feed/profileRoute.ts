export function resolveOrganizerProfileRoute (organizerId: string, currentUserId = 'user-me') {
  if (organizerId === currentUserId) {
    return '/app/profile'
  }

  return `/app/profile/${organizerId}`
}
