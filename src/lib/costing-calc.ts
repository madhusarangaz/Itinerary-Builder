import type {
  AccommodationCostRow,
  ActivityCost,
  AdditionalCost,
  Costing,
  DriverGuideCost,
  PricingTotals,
  RoomCost,
  TransportationCost,
} from '../types/costing'

export function calculateRoomCost(nights: number, room: RoomCost) {
  return nights * (room.rate || 0) * (room.quantity || 0)
}

export function calculateAccommodationDayTotal(row: AccommodationCostRow) {
  return row.rooms.reduce((sum, room) => sum + calculateRoomCost(row.nights, room), 0)
}

export function calculateGuideAccommodationDay(row: AccommodationCostRow) {
  return (row.guideRoomRate || 0) * (row.nights || 0)
}

export function calculateAccommodationTotal(rows: AccommodationCostRow[]) {
  return rows.reduce((sum, row) => sum + calculateAccommodationDayTotal(row), 0)
}

export function calculateGuideAccommodationTotal(rows: AccommodationCostRow[]) {
  return rows.reduce((sum, row) => sum + calculateGuideAccommodationDay(row), 0)
}

export function calculateRouteKm(rows: AccommodationCostRow[]) {
  return rows.reduce((sum, row) => sum + (row.routeKm || 0), 0)
}

export function calculateTotalMileage(t: TransportationCost, routeKm: number) {
  return (routeKm || t.routeKm || 0) + (t.grossMileage || 0) + (t.extraMileage || 0)
}

export function calculateTransportationLKR(t: TransportationCost, routeKm: number) {
  return calculateTotalMileage(t, routeKm) * (t.ratePerKmLKR || 0)
}

export function calculateTransportationCost(t: TransportationCost, routeKm: number, exchangeRate: number) {
  const lkr = calculateTransportationLKR(t, routeKm)
  const rate = exchangeRate > 0 ? exchangeRate : 1
  return lkr / rate
}

export function calculateDriverLKR(d: DriverGuideCost) {
  if (d.driverCalculationMode === 'manual') return d.driverManualTotalLKR || 0
  return (d.driverBataPerDayLKR || 0) * (d.driverDays || 0)
}

export function calculateGuideLKR(d: DriverGuideCost) {
  if (d.guideCalculationMode === 'manual') return d.guideManualTotalLKR || 0
  return (d.guideFeePerDayLKR || 0) * (d.guideDays || 0)
}

export function calculateDriverGuideLKR(d: DriverGuideCost) {
  return calculateDriverLKR(d) + calculateGuideLKR(d)
}

export function calculateDriverGuideCost(d: DriverGuideCost, exchangeRate: number) {
  const rate = exchangeRate > 0 ? exchangeRate : 1
  return calculateDriverGuideLKR(d) / rate
}

export function calculateActivityCost(activity: ActivityCost, numberOfPeople: number) {
  if (activity.adultQty != null || activity.childQty != null) {
    const adult = activity.overrideAdultRate ?? activity.masterAdultRate ?? activity.costPerPerson ?? 0
    const child = activity.overrideChildRate ?? activity.masterChildRate ?? 0
    return adult * (activity.adultQty ?? 0) + child * (activity.childQty ?? 0)
  }
  return (activity.costPerPerson || 0) * (activity.quantity || 0) * (numberOfPeople || 0)
}

export function calculateSightseeingTotal(activities: ActivityCost[], numberOfPeople: number) {
  return activities.reduce((sum, a) => sum + calculateActivityCost(a, numberOfPeople), 0)
}

export function calculateAdditionalCostsTotal(items: AdditionalCost[]) {
  return items.reduce((sum, i) => sum + (i.cost || 0), 0)
}

export function calculateProfitAmount(baseCost: number, percent: number) {
  return baseCost * (percent || 0) / 100
}

export function calculatePricing(c: Costing): PricingTotals {
  const routeKm = calculateRouteKm(c.accommodation)
  const accommodationTotal = calculateAccommodationTotal(c.accommodation)
  const guideAccommodationTotal = calculateGuideAccommodationTotal(c.accommodation)
  const totalMileage = calculateTotalMileage(c.transportation, routeKm)
  const transportationLKR = calculateTransportationLKR(c.transportation, routeKm)
  const transportationTotal = calculateTransportationCost(c.transportation, routeKm, c.exchangeRate)
  const driverGuideLKR = calculateDriverGuideLKR(c.driverGuide)
  const driverGuideTotal = calculateDriverGuideCost(c.driverGuide, c.exchangeRate)
  const activityTotal = calculateSightseeingTotal(c.activities, c.numberOfPeople)
  const additionalCostTotal = calculateAdditionalCostsTotal(c.additionalCosts)
  const baseCost =
    accommodationTotal +
    guideAccommodationTotal +
    transportationTotal +
    driverGuideTotal +
    activityTotal +
    additionalCostTotal
  const companyProfitAmount = calculateProfitAmount(baseCost, c.pricing.companyProfitPercent)
  const agentProfitAmount = calculateProfitAmount(baseCost, c.pricing.agentProfitPercent)
  const salesPersonProfitAmount = calculateProfitAmount(baseCost, c.pricing.salesPersonProfitPercent)
  const finalPackageCost = baseCost + companyProfitAmount + agentProfitAmount + salesPersonProfitAmount
  const pax = c.numberOfPeople > 0 ? c.numberOfPeople : 1
  const pricePerPerson = finalPackageCost / pax
  const quotedPricePerPerson = c.pricing.quotedPricePerPerson ?? pricePerPerson
  const quotedPackageTotal = quotedPricePerPerson * pax
  return {
    accommodationTotal,
    guideAccommodationTotal,
    transportationTotal,
    driverGuideTotal,
    activityTotal,
    additionalCostTotal,
    baseCost,
    companyProfitAmount,
    agentProfitAmount,
    salesPersonProfitAmount,
    finalPackageCost,
    pricePerPerson,
    quotedPricePerPerson,
    quotedPackageTotal,
    transportationLKR,
    driverGuideLKR,
    totalMileage,
    routeKm,
  }
}

export function formatMoney(amount: number, currency = 'USD') {
  const abs = Math.abs(amount)
  const whole = Math.abs(amount - Math.round(amount)) < 0.005
  const digits = abs >= 100 || whole ? 0 : 2
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(digits)}`
  }
}

export function formatLkr(amount: number) {
  return `LKR ${Math.round(amount).toLocaleString('en-US')}`
}

/** Customer-facing figures only — never includes buy rates or margins. */
export function sellingFigures(c: Costing) {
  const t = calculatePricing(c)
  return {
    currency: c.currency,
    travellerCount: c.numberOfPeople,
    total: Math.round(t.quotedPackageTotal),
    pricePerPerson: t.quotedPricePerPerson,
  }
}
