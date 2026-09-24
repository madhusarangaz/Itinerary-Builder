import type { ActivityPlacement, ActivityRecord, ActivityStatus } from '../types/activity'

export const ACTIVITY_CATEGORIES = [
  'Culture',
  'Heritage',
  'History',
  'Wildlife',
  'Nature',
  'Adventure',
  'Religious',
  'Beach',
  'Water Sports',
  'Food',
  'Wellness',
  'Photography',
  'Local Experience',
  'Shopping',
  'Entertainment',
  'Other',
]

export const ACTIVITY_TIMES = ['Morning', 'Afternoon', 'Evening', 'Any Time']

export const AIRPORT_BIA = { id: 'loc-bia', name: 'Airport / BIA' }

export const PLACEMENT_LABEL: Record<ActivityPlacement, string> = {
  within_destination: 'Within Destination',
  en_route: 'En Route',
}

export const ACTIVITY_STATUS_LABELS: Record<ActivityStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  inactive: 'Inactive',
}

export function formatUsd(amount: number) {
  if (!Number.isFinite(amount)) return '—'
  if (amount === 0) return 'Free'
  const rounded = Math.round(amount * 100) / 100
  return `USD ${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(2)}`
}

export function routeLabel(from: string, to: string) {
  if (!from && !to) return ''
  return `${from || '—'} → ${to || '—'}`
}

export function routeSummary(activity: Pick<ActivityRecord, 'type' | 'locationName' | 'applicableRoutes'>) {
  if (activity.type === 'within_destination') return activity.locationName || '—'
  const first = activity.applicableRoutes[0]
  if (!first) return 'En route'
  const label = routeLabel(first.fromLocationName, first.toLocationName)
  const extra = activity.applicableRoutes.length - 1
  return extra > 0 ? `${label} +${extra} more` : label
}

export function formatUpdated(iso: string) {
  const then = new Date(iso).getTime()
  if (!then) return ''
  const mins = Math.round((Date.now() - then) / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}
