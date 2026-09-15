import { AIRPORT, isTerminalDestination, resolveKnownPlace, type GeoPoint } from '../data/destinations'
import type { Trip } from '../types/itinerary'

export type JourneyStop = {
  id: string
  label: string
  query: string
  kind: 'airport' | 'place'
  known: GeoPoint | null
}

export function buildJourneyStops(trip: Trip): JourneyStop[] {
  const dests: string[] = []
  const seen = new Set<string>()

  for (const day of trip.days) {
    const raw = day.destination.trim()
    let label = raw
    if (!raw || isTerminalDestination(raw)) {
      const fromTitle = resolveKnownPlace(day.title)
      if (!fromTitle || fromTitle.label === AIRPORT.label) continue
      label = fromTitle.label
    }
    const key = label.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    dests.push(label)
  }
  if (dests.length === 0) return []

  const places: JourneyStop[] = dests.map((name, i) => {
    const known = resolveKnownPlace(name)
    return {
      id: `place-${i}-${name.toLowerCase()}`,
      label: known?.label ?? name,
      query: name,
      kind: 'place',
      known: known ? { lat: known.lat, lng: known.lng } : null,
    }
  })

  const airport: JourneyStop = {
    id: 'airport',
    label: AIRPORT.label,
    query: AIRPORT.label,
    kind: 'airport',
    known: { lat: AIRPORT.lat, lng: AIRPORT.lng },
  }

  return [airport, ...places, { ...airport, id: 'airport-return' }]
}
