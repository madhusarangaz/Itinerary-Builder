import { ARRIVAL_LOCATIONS, defaultLeisureKm, inferVehicleGroup } from './transport-catalog'
import { newModel } from '../lib/transport'
import { uid } from '../lib/ids'
import type { Transport, TransportCosting, MileageRules, VehicleGroup } from '../types/transport'

function stamp() {
  return new Date().toISOString()
}

function defaultsForGroup(group: VehicleGroup): Pick<Transport, 'costing' | 'mileageRules'> {
  return {
    costing: {
      perDayEnabled: true,
      perKmEnabled: true,
      currency: 'LKR',
      helperApplicable: false,
      guideApplicable: false,
      dailyRateInclusions: { driverBata: true, parking: true, highwayCharges: true, meals: true },
    },
    mileageRules: {
      arrivalDepartureEnabled: true,
      applicableLocations: [...ARRIVAL_LOCATIONS],
      arrivalDepartureOneWayKm: 80,
      leisureDayEnabled: true,
      leisureDayKm: defaultLeisureKm(group),
    },
  }
}

export function emptyTransport(): Transport {
  const now = stamp()
  const group: VehicleGroup = 'van'
  const d = defaultsForGroup(group)
  return {
    id: uid('tr'),
    vehicleCategory: '',
    displayName: '',
    vehicleGroup: group,
    models: [],
    description: '',
    capacity: {
      minAdults: 1,
      maxAdults: 0,
      allowAdditionalChild: false,
    },
    costing: d.costing,
    mileageRules: d.mileageRules,
    images: {},
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  }
}

function record(partial: Omit<Transport, 'id' | 'createdAt' | 'updatedAt' | 'images' | 'mileageRules' | 'vehicleGroup'> & {
  vehicleGroup?: VehicleGroup
  mileageRules?: Partial<MileageRules>
  costing: TransportCosting
}): Transport {
  const now = stamp()
  const group = partial.vehicleGroup ?? inferVehicleGroup(partial.vehicleCategory)
  const d = defaultsForGroup(group)
  return {
    id: uid('tr'),
    createdAt: now,
    updatedAt: now,
    images: {},
    vehicleGroup: group,
    ...partial,
    costing: {
      ...d.costing,
      ...partial.costing,
      dailyRateInclusions: partial.costing.dailyRateInclusions ?? d.costing.dailyRateInclusions,
    },
    mileageRules: {
      ...d.mileageRules,
      ...partial.mileageRules,
    },
  }
}

const inclusions = { driverBata: true, parking: true, highwayCharges: true, meals: true } as const

export const sampleTransports: Transport[] = [
  record({
    vehicleCategory: 'Car',
    displayName: 'Car',
    vehicleGroup: 'car',
    models: [newModel('Honda Shuttle'), newModel('Toyota Prius'), newModel('Axio')],
    description: 'Compact cars for couples or a small family, including a young child when needed.',
    status: 'active',
    capacity: {
      minAdults: 1,
      maxAdults: 2,
      allowAdditionalChild: true,
      maxAdditionalChildren: 1,
      childAgeLimit: 5,
    },
    costing: {
      currency: 'LKR',
      perDayEnabled: true,
      perDayRate: 17000,
      perKmEnabled: true,
      perKmRate: 90,
      driverBata: 2500,
      helperApplicable: false,
      guideApplicable: false,
      dailyRateInclusions: { ...inclusions },
    },
    mileageRules: { leisureDayKm: 80 },
  }),
  record({
    vehicleCategory: 'Flat Roof Van',
    displayName: 'Flat Roof Van',
    vehicleGroup: 'van',
    models: [newModel('KDH Flat Roof')],
    description: 'Low-roof van for small groups who still want private touring.',
    status: 'active',
    capacity: { minAdults: 3, maxAdults: 5, allowAdditionalChild: false },
    costing: {
      currency: 'LKR',
      perDayEnabled: true,
      perDayRate: 19000,
      perKmEnabled: true,
      perKmRate: 120,
      driverBata: 2500,
      helperApplicable: false,
      guideApplicable: false,
      dailyRateInclusions: { ...inclusions },
    },
    mileageRules: { leisureDayKm: 80 },
  }),
  record({
    vehicleCategory: 'High Roof Van',
    displayName: 'High Roof Van',
    vehicleGroup: 'van',
    models: [newModel('KDH High Roof')],
    description: 'High-roof van with standing room and space for a mid-size group.',
    status: 'active',
    capacity: { minAdults: 6, maxAdults: 8, allowAdditionalChild: false },
    costing: {
      currency: 'LKR',
      perDayEnabled: true,
      perDayRate: 23000,
      perKmEnabled: true,
      perKmRate: 130,
      driverBata: 2500,
      helperApplicable: false,
      guideApplicable: false,
      dailyRateInclusions: { ...inclusions },
    },
    mileageRules: { leisureDayKm: 80 },
  }),
  record({
    vehicleCategory: 'Mini Coach',
    displayName: 'Mini Coach',
    vehicleGroup: 'coach',
    models: [newModel('Coach')],
    description: 'Mini coach for groups that have outgrown a van.',
    status: 'active',
    capacity: { minAdults: 9, maxAdults: 14, allowAdditionalChild: false },
    costing: {
      currency: 'LKR',
      perDayEnabled: false,
      perKmEnabled: true,
      perKmRate: 160,
      driverBata: 2000,
      helperApplicable: true,
      helperRate: 2000,
      guideApplicable: true,
      guideRate: 9000,
      dailyRateInclusions: { ...inclusions },
    },
    mileageRules: { leisureDayKm: 100 },
  }),
  record({
    vehicleCategory: '33 Seater Coach',
    displayName: '33 Seater Coach',
    vehicleGroup: 'coach',
    models: [newModel('Coach')],
    description: 'Mid-size coach for touring groups.',
    status: 'active',
    capacity: { minAdults: 15, maxAdults: 20, allowAdditionalChild: false },
    costing: {
      currency: 'LKR',
      perDayEnabled: false,
      perKmEnabled: true,
      perKmRate: 240,
      driverBata: 2000,
      helperApplicable: true,
      helperRate: 2000,
      guideApplicable: true,
      guideRate: 9000,
      dailyRateInclusions: { ...inclusions },
    },
    mileageRules: { leisureDayKm: 100 },
  }),
  record({
    vehicleCategory: '45 Seater Coach',
    displayName: '45 Seater Coach',
    vehicleGroup: 'coach',
    models: [newModel('Coach')],
    description: 'Full-size coach for larger groups.',
    status: 'active',
    capacity: { minAdults: 21, maxAdults: 40, allowAdditionalChild: false },
    costing: {
      currency: 'LKR',
      perDayEnabled: false,
      perKmEnabled: true,
      perKmRate: 330,
      driverBata: 2000,
      helperApplicable: true,
      helperRate: 2000,
      guideApplicable: true,
      guideRate: 9000,
      dailyRateInclusions: { ...inclusions },
    },
    mileageRules: { leisureDayKm: 100 },
  }),
]
