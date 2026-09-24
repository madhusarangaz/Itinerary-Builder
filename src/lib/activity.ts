import { uid } from './ids'
import type { ActivityRecord, ActivityRoute } from '../types/activity'
import type { DestinationActivity as LegacyActivity } from '../types/destination'

export function newRoute(partial?: Partial<ActivityRoute>): ActivityRoute {
  return {
    id: uid('route'),
    fromLocationName: '',
    toLocationName: '',
    ...partial,
  }
}

export function emptyActivity(partial?: Partial<ActivityRecord>): ActivityRecord {
  const now = new Date().toISOString()
  return {
    id: uid('actm'),
    name: '',
    locationName: '',
    type: 'within_destination',
    applicableRoutes: [],
    adultRateUsd: 0,
    childRateUsd: 0,
    categories: [],
    recommendedTimes: [],
    suitableFor: [],
    whatToBring: [],
    status: 'draft',
    rateSource: 'demo',
    createdAt: now,
    updatedAt: now,
    ...partial,
  }
}

export function legacyActivityToRecord(activity: LegacyActivity, location: { id?: string; name: string }): ActivityRecord {
  const adult = activity.cost?.type === 'free' ? 0 : activity.cost?.amount ?? 0
  return {
    id: activity.id,
    name: activity.name,
    locationId: location.id,
    locationName: location.name,
    type: 'within_destination',
    applicableRoutes: [],
    adultRateUsd: adult,
    childRateUsd: 0,
    description: activity.shortDescription,
    categories: activity.categories ?? [],
    image: activity.image?.url ? { id: activity.image.id, url: activity.image.url } : undefined,
    durationMinutes: activity.durationMinutes,
    recommendedTimes: activity.recommendedTimes ?? [],
    difficulty: activity.difficulty,
    suitableFor: activity.suitableFor ?? [],
    whatToBring: activity.whatToBring ?? [],
    dressRequirements: activity.dressRequirements,
    accessibilityNotes: activity.accessibilityNotes,
    bookingRequired: activity.bookingRequired,
    entranceTicketRequired: activity.entranceFeeRequired,
    seasonal: activity.seasonal,
    availableMonths: activity.availableMonths,
    internalNotes: activity.internalNotes,
    rateSource: 'demo',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function isLegacyActivityList(value: unknown): value is LegacyActivity[] {
  return Array.isArray(value) && value.some((item) => item && typeof item === 'object' && 'name' in item && 'categories' in item)
}

export function effectiveAdultRate(master: number, override?: number) {
  return override ?? master
}

export function effectiveChildRate(master: number, override?: number) {
  return override ?? master
}

export function entranceTotal(adultRate: number, adultQty: number, childRate: number, childQty: number) {
  return adultRate * adultQty + childRate * childQty
}
