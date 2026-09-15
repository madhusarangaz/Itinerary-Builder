import type { Destination } from '../types/destination'

/** Later itinerary/costing can look up a destination and choose which fields to pull. */
export function findDestination(destinations: Destination[], id: string) {
  return destinations.find((d) => d.id === id)
}

export function connectionBetween(from: Destination, toId: string) {
  return from.destinationConnections.find((c) => c.destinationId === toId)
}
