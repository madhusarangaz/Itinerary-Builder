import type { Completeness } from '../types/itinerary'
import type { ActivityRecord, ActivitySectionId } from '../types/activity'

export const ACTIVITY_SECTIONS: { id: ActivitySectionId; n: string; label: string }[] = [
  { id: 'activity', n: '01', label: 'Activity' },
  { id: 'location', n: '02', label: 'Location & Route' },
  { id: 'fees', n: '03', label: 'Entrance Fees' },
  { id: 'details', n: '04', label: 'Details' },
]

function rateMissing(value: number | undefined) {
  return value == null || Number.isNaN(value) || value < 0
}

export function requiredActivityIssues(activity: ActivityRecord) {
  const missing: { section: ActivitySectionId; message: string }[] = []
  if (!activity.name.trim()) missing.push({ section: 'activity', message: 'Enter an activity name.' })
  if (!activity.locationName.trim() && !activity.locationId) missing.push({ section: 'location', message: 'Select a location.' })
  if (activity.type !== 'within_destination' && activity.type !== 'en_route') {
    missing.push({ section: 'location', message: 'Select whether this activity is within a destination or en route.' })
  }
  if (activity.type === 'en_route') {
    const routes = activity.applicableRoutes.filter((r) => r.fromLocationName.trim() && r.toLocationName.trim())
    if (!routes.length) missing.push({ section: 'location', message: 'Add at least one applicable route.' })
  }
  if (rateMissing(activity.adultRateUsd)) missing.push({ section: 'fees', message: 'Enter the adult entrance rate.' })
  if (rateMissing(activity.childRateUsd)) missing.push({ section: 'fees', message: 'Enter the child entrance rate.' })
  return missing
}

export function activityProgress(activity: ActivityRecord) {
  const checks = [
    activity.name.trim(),
    activity.locationName.trim() || activity.locationId,
    activity.type === 'within_destination' || activity.applicableRoutes.some((r) => r.fromLocationName && r.toLocationName),
    !rateMissing(activity.adultRateUsd),
    !rateMissing(activity.childRateUsd),
    activity.description?.trim(),
    activity.categories.length,
    activity.image?.url,
  ]
  const filled = checks.filter(Boolean).length
  const percent = Math.round((filled / checks.length) * 100)
  const recommended = [!activity.description?.trim() && 'description', !activity.categories.length && 'category', !activity.image?.url && 'image'].filter(Boolean)
  return { percent, remaining: recommended.length, filled, total: checks.length }
}

export function activitySectionStatus(activity: ActivityRecord, id: ActivitySectionId): Completeness {
  const issues = requiredActivityIssues(activity).filter((issue) => issue.section === id)
  if (id === 'activity') {
    if (activity.name.trim() && activity.categories.length) return 'complete'
    if (activity.name.trim()) return 'progress'
    return issues.length ? 'attention' : 'empty'
  }
  if (id === 'location') {
    if (issues.length && (activity.locationName || activity.type === 'en_route')) return 'attention'
    if (activity.type === 'within_destination' && (activity.locationId || activity.locationName.trim())) return 'complete'
    if (activity.type === 'en_route' && activity.applicableRoutes.some((r) => r.fromLocationName && r.toLocationName)) return 'complete'
    if (activity.locationName || activity.applicableRoutes.length) return 'progress'
    return 'empty'
  }
  if (id === 'fees') {
    if (issues.length) return activity.adultRateUsd || activity.childRateUsd ? 'attention' : 'empty'
    return 'complete'
  }
  if (activity.description?.trim() || activity.image?.url || activity.durationMinutes) return 'complete'
  if (activity.categories.length) return 'progress'
  return 'empty'
}

export function canActivateActivity(activity: ActivityRecord) {
  return requiredActivityIssues(activity).length === 0
}
