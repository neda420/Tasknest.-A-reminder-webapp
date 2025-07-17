import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const target = new Date(date)
  const diffInMs = target.getTime() - now.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))

  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} from now`
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} from now`
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} from now`
  } else if (diffInMs > 0) {
    return 'In a few moments'
  } else {
    return 'Overdue'
  }
}

export function getPriorityColor(priority: string) {
  switch (priority) {
    case 'LOW':
      return 'text-green-600 bg-green-100'
    case 'MEDIUM':
      return 'text-yellow-600 bg-yellow-100'
    case 'HIGH':
      return 'text-orange-600 bg-orange-100'
    case 'URGENT':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export function getPriorityIcon(priority: string) {
  switch (priority) {
    case 'LOW':
      return '🟢'
    case 'MEDIUM':
      return '🟡'
    case 'HIGH':
      return '🟠'
    case 'URGENT':
      return '🔴'
    default:
      return '📋'
  }
} 