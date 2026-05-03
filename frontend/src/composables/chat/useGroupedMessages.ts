import { computed, type ComputedRef } from 'vue'
import type { ChatMessage } from '@/types/chat'
import { formatDayLabel } from '@/utils/chat/date'

export interface MessageGroup {
  date: string
  label: string
  messages: ChatMessage[]
}

export function useGroupedMessages(
  messages: ComputedRef<ChatMessage[]>,
  todayLabel: ComputedRef<string>,
  yesterdayLabel: ComputedRef<string>
) {
  return computed<MessageGroup[]>(() => {
    const groups: MessageGroup[] = []
    let currentDate = ''

    for (const message of messages.value) {
      const messageDate = message.created_at.slice(0, 10)

      if (messageDate !== currentDate) {
        currentDate = messageDate
        groups.push({
          date: messageDate,
          label: formatDayLabel(message.created_at, todayLabel.value, yesterdayLabel.value),
          messages: [],
        })
      }

      groups[groups.length - 1].messages.push(message)
    }

    return groups
  })
}
