import type { Completeness } from '../types/itinerary'
import type { Destination, DestinationSectionId, DestinationStatus } from '../types/destination'

export const DESTINATION_STATUS_LABELS: Record<DestinationStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  archived: 'Archived',
}

export const DESTINATION_SECTIONS: { id: DestinationSectionId; n: string; label: string }[] = [
  { id: 'basics', n: '01', label: 'Basics' },
  { id: 'media', n: '02', label: 'Media' },
  { id: 'travel', n: '03', label: 'Travel' },
  { id: 'activities', n: '04', label: 'Activities' },
  { id: 'itinerary', n: '05', label: 'Itinerary' },
  { id: 'tips', n: '06', label: 'Traveller Info' },
]

export function requiredDestinationIssues(d: Destination) {
  const missing: string[] = []
  if (!d.name.trim()) missing.push('Add a destination name')
  if (!d.province.trim()) missing.push('Choose a province')
  if (!d.shortDescription.trim()) missing.push('Write a short description')
  return missing
}

export function recommendedDestinationIssues(d: Destination) {
  const missing: string[] = []
  if (!d.coverImage?.url) missing.push('Add a cover image')
  if (d.gallery.filter((g) => g.url).length < 3) missing.push('Add at least 3 gallery images')
  if (d.climate.averageHighC == null || d.climate.averageLowC == null) missing.push('Add average temperatures')
  const air = d.airportConnections[0]
  if (!air || !air.distanceKm) missing.push('Add airport distance and travel time')
  if (!d.activities.length) missing.push('Add at least one activity')
  if (!d.itineraryPoints.length) missing.push('Add at least one itinerary point')
  if (!d.travellerTips.length) missing.push('Add at least one traveller tip')
  return missing
}

const CHECKS = 10

export function destinationProgress(d: Destination) {
  let filled = 0
  if (d.name.trim()) filled += 1
  if (d.province.trim()) filled += 1
  if (d.shortDescription.trim()) filled += 1
  if (d.coverImage?.url) filled += 1
  if (d.gallery.filter((g) => g.url).length >= 3) filled += 1
  if (d.climate.averageHighC != null && d.climate.averageLowC != null) filled += 1
  if (d.airportConnections[0]?.distanceKm) filled += 1
  if (d.activities.length) filled += 1
  if (d.itineraryPoints.length) filled += 1
  if (d.travellerTips.length) filled += 1
  const percent = Math.round((filled / CHECKS) * 100)
  const remaining = recommendedDestinationIssues(d).length
  return { percent, remaining, filled, total: CHECKS }
}

export function destinationSectionStatus(d: Destination, id: DestinationSectionId): Completeness {
  switch (id) {
    case 'basics': {
      const req = requiredDestinationIssues(d)
      if (!req.length && d.experienceTypes.length) return 'complete'
      if (!req.length) return 'progress'
      if (d.name || d.province || d.shortDescription) return 'attention'
      return 'empty'
    }
    case 'media': {
      const gallery = d.gallery.filter((g) => g.url).length
      if (d.coverImage?.url && gallery >= 3) return 'complete'
      if (d.coverImage?.url || gallery) return 'progress'
      return 'empty'
    }
    case 'travel': {
      const climate = d.climate.averageHighC != null && d.climate.averageLowC != null
      const air = Boolean(d.airportConnections[0]?.distanceKm)
      const links = d.destinationConnections.length > 0
      if (climate && air) return 'complete'
      if (climate || air || links) return 'progress'
      return 'empty'
    }
    case 'activities':
      return d.activities.length ? 'complete' : 'empty'
    case 'itinerary':
      return d.itineraryPoints.length ? 'complete' : 'empty'
    case 'tips':
      return d.travellerTips.length ? 'complete' : 'empty'
  }
}

export function canActivateDestination(d: Destination) {
  return requiredDestinationIssues(d).length === 0
}
