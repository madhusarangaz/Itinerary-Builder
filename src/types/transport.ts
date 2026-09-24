export type TransportStatus = 'draft' | 'active' | 'inactive'

export type VehicleGroup = 'car' | 'van' | 'coach' | 'other'

export type TransportSectionId = 'vehicle' | 'capacity' | 'rates' | 'mileage' | 'media'

export type TransportImageSlot = 'front' | 'interior' | 'side' | 'luggage'

export type TransportModel = {
  id: string
  name: string
}

export type TransportImage = {
  id: string
  url: string
  fileName?: string
}

export type TransportCapacity = {
  minAdults?: number
  maxAdults: number
  allowAdditionalChild: boolean
  maxAdditionalChildren?: number
  childAgeLimit?: number
  largeBags?: number
  cabinBags?: number
}

export type DailyRateInclusions = {
  driverBata: boolean
  parking: boolean
  highwayCharges: boolean
  meals: boolean
}

export type TransportCosting = {
  perDayEnabled: boolean
  perDayRate?: number
  perKmEnabled: boolean
  perKmRate?: number
  currency: 'LKR'
  driverBata?: number
  helperApplicable: boolean
  helperRate?: number
  guideApplicable: boolean
  guideRate?: number
  dailyRateInclusions: DailyRateInclusions
}

export type MileageRules = {
  arrivalDepartureEnabled: boolean
  applicableLocations: string[]
  arrivalDepartureOneWayKm?: number
  leisureDayEnabled: boolean
  leisureDayKm?: number
  internalNotes?: string
}

export type TransportImages = {
  front?: TransportImage
  interior?: TransportImage
  side?: TransportImage
  luggage?: TransportImage
}

export type Transport = {
  id: string
  vehicleCategory: string
  displayName: string
  vehicleGroup: VehicleGroup
  models: TransportModel[]
  description?: string
  capacity: TransportCapacity
  costing: TransportCosting
  mileageRules: MileageRules
  images: TransportImages
  status: TransportStatus
  createdAt: string
  updatedAt: string
}

/** Shape Costing can consume later — Transport stores rules, Costing applies them. */
export type TransportCostingSource = {
  id: string
  vehicleCategory: string
  displayName: string
  vehicleGroup: VehicleGroup
  models: string[]
  capacity: TransportCapacity
  supportedCostingMethods: Array<'per_day' | 'per_km'>
  perDayRate?: number
  perKmRate?: number
  currency: 'LKR'
  driverBata?: number
  helperRate?: number
  guideRate?: number
  dailyRateInclusions: DailyRateInclusions
  mileageRules: MileageRules
}
