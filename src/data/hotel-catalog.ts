import type { StarCategory } from '../types/hotel'

export const STAR_OPTIONS: { value: StarCategory; label: string }[] = [
  { value: 1, label: '1 Star' },
  { value: 2, label: '2 Star' },
  { value: 3, label: '3 Star' },
  { value: 4, label: '4 Star' },
  { value: 5, label: '5 Star' },
]

export function starLabel(star?: StarCategory) {
  if (!star) return '—'
  return `${star} Star`
}

export function starMarks(star?: StarCategory) {
  if (!star) return ''
  return '★'.repeat(star)
}

export function formatUpdated(iso: string) {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return ''
  const mins = Math.round((Date.now() - t) / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days < 14) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

export function isValidEmail(value: string) {
  const email = value.trim()
  if (!email) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
