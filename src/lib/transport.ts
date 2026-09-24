import { uid } from '../lib/ids'
import type { Transport, TransportCostingSource } from '../types/transport'

/** Costing should import this — Transport stores rules, Costing runs the maths. */
export function transportToCostingSource(t: Transport): TransportCostingSource {
  const methods: Array<'per_day' | 'per_km'> = []
  if (t.costing.perDayEnabled) methods.push('per_day')
  if (t.costing.perKmEnabled) methods.push('per_km')
  return {
    id: t.id,
    vehicleCategory: t.vehicleCategory,
    displayName: t.displayName || t.vehicleCategory,
    vehicleGroup: t.vehicleGroup,
    models: t.models.map((m) => m.name),
    capacity: t.capacity,
    supportedCostingMethods: methods,
    perDayRate: t.costing.perDayEnabled ? t.costing.perDayRate : undefined,
    perKmRate: t.costing.perKmEnabled ? t.costing.perKmRate : undefined,
    currency: t.costing.currency,
    driverBata: t.costing.driverBata,
    helperRate: t.costing.helperApplicable ? t.costing.helperRate : undefined,
    guideRate: t.costing.guideApplicable ? t.costing.guideRate : undefined,
    dailyRateInclusions: t.costing.dailyRateInclusions,
    mileageRules: t.mileageRules,
  }
}

export function perDayTransportCost(perDayRate: number, applicableDays: number) {
  return perDayRate * applicableDays
}

export function costableMileage(input: {
  baseRouteKm: number
  arrivalFromColomboOrNegombo: boolean
  departureToColomboOrNegombo: boolean
  arrivalDepartureOneWayKm: number
  leisureDays: number
  leisureDayKm: number
}) {
  const arrival = input.arrivalFromColomboOrNegombo ? input.arrivalDepartureOneWayKm : 0
  const departure = input.departureToColomboOrNegombo ? input.arrivalDepartureOneWayKm : 0
  return input.baseRouteKm + arrival + departure + input.leisureDays * input.leisureDayKm
}

export function perKmTransportCost(mileage: number, perKmRate: number) {
  return mileage * perKmRate
}

export function newModel(name: string) {
  return { id: uid('tm'), name }
}
