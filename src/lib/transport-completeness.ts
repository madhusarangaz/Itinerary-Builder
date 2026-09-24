import type { Completeness } from '../types/itinerary'
import type { Transport, TransportSectionId, TransportStatus } from '../types/transport'

export const TRANSPORT_STATUS_LABELS: Record<TransportStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  inactive: 'Inactive',
}

export const TRANSPORT_SECTIONS: { id: TransportSectionId; n: string; label: string }[] = [
  { id: 'vehicle', n: '01', label: 'Vehicle' },
  { id: 'capacity', n: '02', label: 'Capacity' },
  { id: 'rates', n: '03', label: 'Rates' },
  { id: 'mileage', n: '04', label: 'Mileage Rules' },
  { id: 'media', n: '05', label: 'Media' },
]

export type TransportIssue = { message: string; section: TransportSectionId }

export function requiredTransportIssues(t: Transport): TransportIssue[] {
  const missing: TransportIssue[] = []
  if (!t.vehicleCategory.trim()) missing.push({ message: 'Choose a vehicle category', section: 'vehicle' })
  if (!t.models.some((m) => m.name.trim())) missing.push({ message: 'Add at least one vehicle model', section: 'vehicle' })
  if (!t.capacity.maxAdults) missing.push({ message: 'Enter maximum passenger capacity', section: 'capacity' })
  if (t.capacity.minAdults != null && t.capacity.maxAdults && t.capacity.minAdults > t.capacity.maxAdults) {
    missing.push({ message: 'Maximum passengers must be greater than or equal to minimum passengers', section: 'capacity' })
  }
  if (!t.costing.perDayEnabled && !t.costing.perKmEnabled) {
    missing.push({ message: 'Enable Per Day or Per KM costing', section: 'rates' })
  }
  if (t.costing.perDayEnabled && (t.costing.perDayRate == null || t.costing.perDayRate <= 0)) {
    missing.push({ message: 'Enter a Per Day rate because Per Day costing is enabled', section: 'rates' })
  }
  if (t.costing.perKmEnabled && (t.costing.perKmRate == null || t.costing.perKmRate <= 0)) {
    missing.push({ message: 'Enter a Per KM rate because Per KM costing is enabled', section: 'rates' })
  }
  return missing
}

export function recommendedTransportIssues(t: Transport) {
  const missing: string[] = []
  if (!t.description?.trim()) missing.push('Add a short vehicle description')
  if (t.costing.driverBata == null) missing.push('Add driver bata')
  const imgs = [t.images.front, t.images.interior, t.images.side, t.images.luggage].filter((i) => i?.url)
  if (imgs.length < 4) missing.push('Add the four standard vehicle images')
  if (t.capacity.largeBags == null && t.capacity.cabinBags == null) missing.push('Add luggage capacity')
  return missing
}

const CHECKS = 10

export function transportProgress(t: Transport) {
  let filled = 0
  if (t.vehicleCategory.trim()) filled += 1
  if (t.models.some((m) => m.name.trim())) filled += 1
  if (t.displayName.trim()) filled += 1
  if (t.capacity.maxAdults > 0) filled += 1
  if (requiredTransportIssues(t).every((i) => i.section !== 'rates')) filled += 1
  if (t.costing.driverBata != null) filled += 1
  if (t.description?.trim()) filled += 1
  if (t.capacity.largeBags != null || t.capacity.cabinBags != null) filled += 1
  if (t.images.front?.url) filled += 1
  if ([t.images.front, t.images.interior, t.images.side, t.images.luggage].every((i) => i?.url)) filled += 1
  const percent = Math.round((filled / CHECKS) * 100)
  return { percent, remaining: recommendedTransportIssues(t).length, filled, total: CHECKS }
}

export function canActivateTransport(t: Transport) {
  return requiredTransportIssues(t).length === 0
}

export function transportSectionStatus(t: Transport, id: TransportSectionId): Completeness {
  switch (id) {
    case 'vehicle': {
      if (t.vehicleCategory && t.models.some((m) => m.name.trim()) && t.displayName.trim()) return 'complete'
      if (t.vehicleCategory || t.models.length) return 'progress'
      return 'empty'
    }
    case 'capacity': {
      if (!t.capacity.maxAdults) return t.capacity.minAdults ? 'progress' : 'empty'
      if (t.capacity.minAdults != null && t.capacity.minAdults > t.capacity.maxAdults) return 'attention'
      return 'complete'
    }
    case 'rates': {
      const req = requiredTransportIssues(t).filter((i) => i.section === 'rates')
      if (!req.length && (t.costing.perDayEnabled || t.costing.perKmEnabled)) return 'complete'
      if (t.costing.perDayEnabled || t.costing.perKmEnabled || t.costing.driverBata) return req.length ? 'attention' : 'progress'
      return 'empty'
    }
    case 'mileage': {
      if (!t.costing.perKmEnabled) return t.mileageRules.arrivalDepartureEnabled || t.mileageRules.leisureDayEnabled ? 'complete' : 'empty'
      if (t.mileageRules.arrivalDepartureEnabled || t.mileageRules.leisureDayEnabled) return 'complete'
      return 'progress'
    }
    case 'media': {
      const n = [t.images.front, t.images.interior, t.images.side, t.images.luggage].filter((i) => i?.url).length
      if (n === 4) return 'complete'
      if (n) return 'progress'
      return 'empty'
    }
  }
}
