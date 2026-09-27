import { calculateAccommodationDayTotal } from './costing-calc'
import type { Completeness } from '../types/itinerary'
import type { Costing, CostingSectionId, CostingStatus } from '../types/costing'

export const COSTING_STATUS_LABELS: Record<CostingStatus, string> = {
  draft: 'Draft',
  in_progress: 'In Progress',
  completed: 'Completed',
  approved: 'Approved',
}

function stayNeedsHotel(row: Costing['accommodation'][number]) {
  return row.nights > 0 && !/depart/i.test(row.destinationName)
}

function crewIsSet(c: Costing) {
  return c.driverGuide.driverBataPerDayLKR > 0 || c.driverGuide.driverCalculationMode === 'manual'
}

export type CostingGap = {
  id: string
  label: string
  section: CostingSectionId
  anchor: string
}

/** What is still open before this costing can be completed. Empty means ready. */
export function costingGaps(c: Costing): CostingGap[] {
  const gaps: CostingGap[] = []
  if (!c.referenceNo.trim()) gaps.push({ id: 'reference', label: 'Add a tour reference', section: 'tour', anchor: 'cost-tour' })
  if (!c.clientName.trim()) gaps.push({ id: 'client', label: 'Add a client name', section: 'tour', anchor: 'cost-tour' })
  if (!c.numberOfPeople) gaps.push({ id: 'pax', label: 'Add the number of people', section: 'tour', anchor: 'cost-tour' })
  if (!c.exchangeRate) gaps.push({ id: 'rate', label: 'Add an exchange rate', section: 'tour', anchor: 'cost-tour' })
  if (!c.accommodation.length) {
    gaps.push({ id: 'stays', label: 'Add the stays', section: 'stay', anchor: 'cost-stay' })
  } else {
    for (const row of c.accommodation) {
      if (!stayNeedsHotel(row)) continue
      if (!row.hotelName?.trim()) {
        gaps.push({ id: `hotel-${row.id}`, label: `Add the hotel for day ${row.dayNumber}`, section: 'stay', anchor: 'cost-stay' })
      }
      if (calculateAccommodationDayTotal(row) <= 0) {
        gaps.push({ id: `rates-${row.id}`, label: `Add room rates for day ${row.dayNumber}`, section: 'stay', anchor: 'cost-stay' })
      }
    }
  }
  if (!c.transportation.ratePerKmLKR) {
    gaps.push({ id: 'km', label: 'Add a transportation KM rate', section: 'transport', anchor: 'cost-transport' })
  }
  if (!crewIsSet(c)) gaps.push({ id: 'crew', label: 'Set the driver pay', section: 'crew', anchor: 'cost-crew' })
  if (!c.activities.length) gaps.push({ id: 'activities', label: 'Add activities', section: 'activities', anchor: 'cost-activities' })
  if (!c.additionalCosts.length) gaps.push({ id: 'extras', label: 'Add additional costs', section: 'extras', anchor: 'cost-extras' })
  return gaps
}

export function costingIssues(c: Costing) {
  return costingGaps(c).map((gap) => gap.label)
}

export function costingCompletion(c: Costing) {
  const checks: boolean[] = [
    Boolean(c.referenceNo.trim()),
    Boolean(c.clientName.trim()),
    Boolean(c.numberOfPeople),
    Boolean(c.exchangeRate),
    c.accommodation.length > 0,
    Boolean(c.transportation.ratePerKmLKR),
    crewIsSet(c),
    c.activities.length > 0,
    c.additionalCosts.length > 0,
  ]
  for (const row of c.accommodation) {
    if (!stayNeedsHotel(row)) continue
    checks.push(Boolean(row.hotelName?.trim()), calculateAccommodationDayTotal(row) > 0)
  }
  if (!checks.length) return 0
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
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
