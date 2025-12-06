import { format, formatDistanceToNow } from 'date-fns'

export function formatDate(date) {
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatRelativeTime(date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

