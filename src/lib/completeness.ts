import type { Completeness, Day, SectionId, Trip } from '../types/itinerary'
import { alignedNightCount } from './journey'

export type SendGap = {
  id: string
  label: string
  section: SectionId
  anchor: string
  dayId?: string
  stayId?: string
}

export function dayRemaining(day: Day) {
  const missing: string[] = []
  if (!day.destination.trim()) missing.push('Add destination')
  if (!day.image) missing.push('Add destination image')
  if (day.activities.filter((a) => a.title.trim()).length === 0) missing.push('Add at least one activity')
  return missing
}

function dayName(dayNumber: number) {
  return `Day ${String(dayNumber).padStart(2, '0')}`
}

/** What is still open before this itinerary can be sent. Empty means ready. */
export function sendGaps(trip: Trip): SendGap[] {
  const gaps: SendGap[] = []
  if (!trip.title.trim()) gaps.push({ id: 'title', label: 'Add a trip name', section: 'details', anchor: 'form-cover' })
  if (!trip.customer.trim()) gaps.push({ id: 'customer', label: 'Add a traveller', section: 'details', anchor: 'form-header' })
  if (!trip.startDate || !trip.endDate) gaps.push({ id: 'dates', label: 'Set the travel dates', section: 'details', anchor: 'form-dates' })
  if (!trip.coverImage) gaps.push({ id: 'cover', label: 'Add a cover image', section: 'details', anchor: 'form-cover' })

  if (!trip.days.length) {
    gaps.push({ id: 'days', label: 'Lay out the days', section: 'details', anchor: 'form-nights' })
  } else {
    const nights = alignedNightCount(trip.days.length, trip.startDate, trip.endDate)
    const nightIds = new Set(trip.days.slice(0, nights).map((day) => day.id))
    for (const day of trip.days) {
      for (const message of dayRemaining(day)) {
        const onSpine = message === 'Add destination' && nightIds.has(day.id)
        gaps.push({
          id: `day-${day.id}-${message}`,
          label: `${dayName(day.dayNumber)} · ${message}`,
          section: onSpine ? 'details' : 'days',
          anchor: onSpine ? `night-${day.id}` : `form-day-${day.id}`,
          dayId: onSpine ? undefined : day.id,
        })
      }
    }
  }

  if (!trip.accommodations.length) {
    gaps.push({ id: 'stay', label: 'Add a stay', section: 'stay', anchor: 'form-stay' })
  } else {
    for (const stay of trip.accommodations) {
      if (stay.hotelId) continue
      const place = stay.destination.trim() || 'Stay'
      gaps.push({
        id: `stay-${stay.id}-hotel`,
        label: `${place} · Select a hotel`,
        section: 'stay',
        anchor: `stay-${stay.id}`,
        stayId: stay.id,
      })
    }
  }

  if (trip.pricing.total <= 0) gaps.push({ id: 'pricing', label: 'Add a tour cost', section: 'pricing', anchor: 'form-pricing' })
  if (!trip.inclusions.some((item) => item.text.trim())) {
    gaps.push({ id: 'inclusions', label: 'Add an inclusion', section: 'terms', anchor: 'form-inclusions' })
  }
  if (!trip.exclusions.some((item) => item.text.trim())) {
    gaps.push({ id: 'exclusions', label: 'Add an exclusion', section: 'terms', anchor: 'form-exclusions' })
  }
  if (!trip.travelExpert.name.trim()) {
    gaps.push({ id: 'expert-name', label: "Add the travel expert's name", section: 'expert', anchor: 'expert-name' })
  }
  if (!trip.travelExpert.email.trim()) {
    gaps.push({ id: 'expert-email', label: "Add the travel expert's email", section: 'expert', anchor: 'expert-email' })
  }
  return gaps
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

function ratio(flags: boolean[]) {
  if (!flags.length) return 0
  return flags.filter(Boolean).length / flags.length
}

/** Share of the six itinerary sections that have their required data, 0–100. */
export function itineraryCompletion(trip: Trip) {
  const details = ratio([
    Boolean(trip.title.trim()),
    Boolean(trip.customer.trim()),
    Boolean(trip.startDate && trip.endDate),
    Boolean(trip.coverImage),
  ])
  const days = trip.days.length
    ? trip.days.reduce(
        (sum, day) =>
          sum +
          ratio([
            Boolean(day.destination.trim()),
            Boolean(day.image),
            day.activities.some((activity) => activity.title.trim()),
          ]),
        0,
      ) / trip.days.length
    : 0
  const stay = trip.accommodations.length
    ? trip.accommodations.filter((stay) => stay.hotelId).length / trip.accommodations.length
    : 0
  const pricing = trip.pricing.total > 0 ? 1 : 0
  const terms = ratio([
    trip.inclusions.some((item) => item.text.trim()),
    trip.exclusions.some((item) => item.text.trim()),
  ])
  const expert = ratio([Boolean(trip.travelExpert.name.trim()), Boolean(trip.travelExpert.email.trim())])
  return Math.round(((details + days + stay + pricing + terms + expert) / 6) * 100)
}

export const SECTION_META: { id: SectionId; n: string; label: string }[] = [
  { id: 'details', n: '01', label: 'Trip Details' },
  { id: 'days', n: '02', label: 'Day-by-Day' },
  { id: 'stay', n: '03', label: 'Accommodation' },
  { id: 'pricing', n: '04', label: 'Pricing' },
  { id: 'terms', n: '05', label: 'Terms' },
  { id: 'expert', n: '06', label: 'Travel Expert' },
]

/** The earliest section that still has to be finished before `id` can be edited. */
export function blockingSection(trip: Trip, id: SectionId) {
  const index = SECTION_META.findIndex((section) => section.id === id)
  return SECTION_META.slice(0, index).find((section) => sectionStatus(trip, section.id) !== 'complete')
}

/** Trip Details is always open. Each later section opens only after the one before it is complete. */
export function sectionUnlocked(trip: Trip, id: SectionId) {
  return !blockingSection(trip, id)
}
