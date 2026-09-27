import type { Accommodation, Day } from '../types/itinerary'
import { addDays, nightsBetween } from './dates'
import { uid } from './ids'

/** Nights taken from the dates when the day list already matches arrival through departure. */
export function alignedNightCount(dayCount: number, start: string, end: string) {
  const fromDates = nightsBetween(start, end)
  if (fromDates > 0 && dayCount === fromDates + 1) return fromDates
  return Math.max(dayCount - 1, 0)
}

/** How many days the itinerary must gain or lose so it matches the dates. */
export function journeyDelta(dayCount: number, start: string, end: string) {
  const nights = nightsBetween(start, end)
  if (nights <= 0) return 0
  return nights + 1 - dayCount
}

export function redateDays(days: Day[], startDate: string): Day[] {
  return days.map((day, index) => ({
    ...day,
    dayNumber: index + 1,
    date: addDays(startDate, index),
  }))
}

function blankDay(date: string): Day {
  return {
    id: uid('day'),
    dayNumber: 1,
    date,
    destination: '',
    title: '',
    image: '',
    activities: [],
  }
}

/**
 * Fit the day list to a night count. The last day is the departure day.
 * Added nights are inserted before departure. Removed nights come off the end of the stays.
 */
export function applyJourneyDays(days: Day[], startDate: string, nightCount: number): Day[] {
  if (nightCount <= 0) return []
  const nightSlots = days.length > 0 ? days.slice(0, -1) : []
  const departure = days.length > 0 ? days[days.length - 1] : blankDay(startDate)
  const nights =
    nightSlots.length >= nightCount
      ? nightSlots.slice(0, nightCount)
      : [...nightSlots, ...Array.from({ length: nightCount - nightSlots.length }, () => blankDay(startDate))]
  return redateDays([...nights, departure], startDate)
}

export function nightsToRemove(days: Day[], nextNightCount: number): Day[] {
  const nights = days.slice(0, Math.max(days.length - 1, 0))
  if (nights.length <= nextNightCount) return []
  return nights.slice(nextNightCount)
}

export function addedNightDates(startDate: string, days: Day[], nextNightCount: number): string[] {
  const current = Math.max(days.length - 1, 0)
  const dates: string[] = []
  for (let index = current; index < nextNightCount; index += 1) dates.push(addDays(startDate, index))
  return dates
}

function placeKey(day: Day) {
  return day.destination.trim().toLowerCase() || (day.destinationId ?? '').trim().toLowerCase()
}

export function assignStayDays(nightDays: Day[], stays: Accommodation[]): Accommodation[] {
  let cursor = 0
  return stays.map((stay) => {
    if (stay.dayIds?.length) return stay
    const count = Math.max(stay.nights || 1, 1)
    const dayIds = nightDays.slice(cursor, cursor + count).map((day) => day.id)
    cursor += dayIds.length
    return { ...stay, dayIds }
  })
}

function emptyStay(): Accommodation {
  return {
    id: uid('acc'),
    destination: '',
    hotelId: '',
    hotelName: '',
    nights: 1,
    starCategory: 5,
    mealPlan: 'HB',
    image: '',
  }
}

function overlapCount(stay: Accommodation, ids: string[]) {
  const linked = new Set(stay.dayIds ?? [])
  return ids.filter((id) => linked.has(id)).length
}

/** Group overnight days into stays. Consecutive nights in the same place share one stay. */
export function syncStays(days: Day[], stays: Accommodation[], nightCount: number): Accommodation[] {
  const nightDays = days.slice(0, Math.max(nightCount, 0))
  const linked = assignStayDays(nightDays, stays)
  const groups: Day[][] = []
  for (const day of nightDays) {
    const key = placeKey(day)
    const prev = groups[groups.length - 1]
    const prevKey = prev ? placeKey(prev[0]) : ''
    if (prev && key && key === prevKey) prev.push(day)
    else groups.push([day])
  }

  const used = new Set<string>()
  return groups.map((group) => {
    const ids = group.map((day) => day.id)
    const destination = group[0].destination
    const key = placeKey(group[0])
    const overlap = linked
      .filter((stay) => !used.has(stay.id) && overlapCount(stay, ids) > 0)
      .sort((a, b) => {
        const byOverlap = overlapCount(b, ids) - overlapCount(a, ids)
        if (byOverlap) return byOverlap
        const aMatch = a.destination.trim().toLowerCase() === destination.trim().toLowerCase() ? 1 : 0
        const bMatch = b.destination.trim().toLowerCase() === destination.trim().toLowerCase() ? 1 : 0
        return bMatch - aMatch
      })[0]
    const sameName =
      !overlap && key
        ? linked.find(
            (stay) => !used.has(stay.id) && stay.destination.trim().toLowerCase() === destination.trim().toLowerCase(),
          )
        : undefined
    const keep = overlap ?? sameName
    if (keep) used.add(keep.id)
    const destinationChanged = Boolean(keep && keep.destination.trim().toLowerCase() !== destination.trim().toLowerCase())
    return {
      ...(keep ?? emptyStay()),
      id: keep?.id ?? uid('acc'),
      destination,
      nights: group.length,
      dayIds: ids,
      ...(destinationChanged
        ? { hotelId: '', hotelName: '', image: '', roomCategoryId: undefined, roomCategoryName: undefined }
        : {}),
    }
  })
}
