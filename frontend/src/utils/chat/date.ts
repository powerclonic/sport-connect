export function formatThreadTime(iso: string | undefined, yesterdayLabel: string): string {
  if (!iso) return ''

  const date = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)

  if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return yesterdayLabel
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' })

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function formatDayLabel(iso: string, todayLabel: string, yesterdayLabel: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)

  if (diffDays === 0) return todayLabel
  if (diffDays === 1) return yesterdayLabel

  return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
}
