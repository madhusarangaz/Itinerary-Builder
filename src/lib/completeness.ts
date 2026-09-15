import type { Completeness, Day, SectionId, Trip } from '../types/itinerary'

export function dayRemaining(day: Day) {
  const missing: string[] = []
  if (!day.destination.trim()) missing.push('Add destination')
  if (!day.image) missing.push('Add destination image')
  if (day.activities.filter((a) => a.title.trim()).length === 0) missing.push('Add at least one activity')
  return missing
}

export function sectionStatus(trip: Trip, id: SectionId): Completeness {
  switch (id) {
    case 'details': {
      const ok = trip.title && trip.customer && trip.startDate && trip.endDate && trip.coverImage
      if (ok) return 'complete'
      if (trip.title || trip.customer) return 'progress'
      return 'empty'
    }
    case 'days': {
      if (!trip.days.length) return 'empty'
      const leftover = trip.days.some((d) => dayRemaining(d).length)
      return leftover ? 'attention' : 'complete'
    }
    case 'stay': {
      if (!trip.accommodations.length) return 'empty'
      const missingHotel = trip.accommodations.some((a) => !a.hotelId)
      return missingHotel ? 'attention' : 'complete'
    }
    case 'pricing':
      return trip.pricing.total > 0 ? 'complete' : 'attention'
    case 'terms':
      return trip.inclusions.length && trip.exclusions.length ? 'complete' : 'progress'
    case 'expert':
      return trip.travelExpert.name && trip.travelExpert.email ? 'complete' : 'empty'
  }
}

export const SECTION_META: { id: SectionId; n: string; label: string }[] = [
  { id: 'details', n: '01', label: 'Trip Details' },
  { id: 'days', n: '02', label: 'Day-by-Day' },
  { id: 'stay', n: '03', label: 'Accommodation' },
  { id: 'pricing', n: '04', label: 'Pricing' },
  { id: 'terms', n: '05', label: 'Terms' },
  { id: 'expert', n: '06', label: 'Travel Expert' },
]
