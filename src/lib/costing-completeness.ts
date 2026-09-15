import { calculateAccommodationDayTotal } from './costing-calc'
import type { Completeness } from '../types/itinerary'
import type { Costing, CostingSectionId, CostingStatus } from '../types/costing'

export const COSTING_STATUS_LABELS: Record<CostingStatus, string> = {
  draft: 'Draft',
  in_progress: 'In Progress',
  completed: 'Completed',
  approved: 'Approved',
}

export function costingIssues(c: Costing) {
  const missing: string[] = []
  if (!c.referenceNo.trim()) missing.push('Add a tour reference')
  if (!c.clientName.trim()) missing.push('Add a client name')
  if (!c.numberOfPeople) missing.push('Add number of people')
  if (!c.exchangeRate) missing.push('Add an exchange rate')
  if (!c.transportation.ratePerKmLKR) missing.push('Add a transportation KM rate')
  c.accommodation.forEach((row) => {
    const needsHotel = row.nights > 0 && !/depart/i.test(row.destinationName)
    if (needsHotel && !row.hotelName?.trim()) missing.push(`Hotel missing for Day ${row.dayNumber}`)
    if (needsHotel && calculateAccommodationDayTotal(row) <= 0) missing.push(`Room rates missing for Day ${row.dayNumber}`)
  })
  return missing
}

export function costingSectionStatus(c: Costing, id: CostingSectionId): Completeness {
  switch (id) {
    case 'tour':
      if (c.referenceNo && c.clientName && c.numberOfPeople && c.exchangeRate) return 'complete'
      if (c.referenceNo || c.clientName) return 'progress'
      return 'empty'
    case 'stay': {
      if (!c.accommodation.length) return 'empty'
      const gap = c.accommodation.some(
        (row) => row.nights > 0 && !/depart/i.test(row.destinationName) && (!row.hotelName?.trim() || calculateAccommodationDayTotal(row) <= 0),
      )
      return gap ? 'attention' : 'complete'
    }
    case 'transport':
      return c.transportation.ratePerKmLKR > 0 ? 'complete' : 'attention'
    case 'crew':
      return c.driverGuide.driverBataPerDayLKR > 0 || c.driverGuide.driverCalculationMode === 'manual' ? 'complete' : 'progress'
    case 'activities':
      return c.activities.length ? 'complete' : 'empty'
    case 'extras':
      return c.additionalCosts.length ? 'complete' : 'empty'
    case 'pricing':
      return c.pricing.companyProfitPercent >= 0 ? 'complete' : 'attention'
  }
}

export const COSTING_SECTIONS: { id: CostingSectionId; n: string; label: string }[] = [
  { id: 'tour', n: '01', label: 'Tour Details' },
  { id: 'stay', n: '02', label: 'Accommodation' },
  { id: 'transport', n: '03', label: 'Transportation' },
  { id: 'crew', n: '04', label: 'Driver & Guide' },
  { id: 'activities', n: '05', label: 'Activities' },
  { id: 'extras', n: '06', label: 'Additional Costs' },
  { id: 'pricing', n: '07', label: 'Pricing' },
]
