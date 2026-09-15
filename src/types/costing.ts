export type CostingStatus = 'draft' | 'in_progress' | 'completed' | 'approved'

export type CostingSectionId =
  | 'tour'
  | 'stay'
  | 'transport'
  | 'crew'
  | 'activities'
  | 'extras'
  | 'pricing'

export type RoomType = 'SGL' | 'DBL' | 'TRPL' | 'TWIN' | 'FAMILY' | 'SUITE' | 'VILLA' | 'CUSTOM'

export type CalcMode = 'daily' | 'manual'

export type CostingCurrency = 'USD' | 'EUR' | 'GBP' | 'AUD' | 'LKR'

export type RoomCost = {
  id: string
  type: RoomType
  label?: string
  rate: number
  quantity: number
}

export type AccommodationCostRow = {
  id: string
  date: string
  dayNumber: number
  destinationId?: string
  destinationName: string
  hotelId?: string
  hotelName?: string
  starClass?: string
  mealPlan?: string
  roomType?: string
  nights: number
  routeKm: number
  rooms: RoomCost[]
  guideRoomRate: number
  notes?: string
}

export type TransportationCost = {
  routeKm: number
  grossMileage: number
  extraMileage: number
  googleMapsLink?: string
  ratePerKmLKR: number
}

export type DriverGuideCost = {
  driverCalculationMode: CalcMode
  driverBataPerDayLKR: number
  driverDays: number
  driverManualTotalLKR?: number
  guideCalculationMode: CalcMode
  guideFeePerDayLKR: number
  guideDays: number
  guideManualTotalLKR?: number
}

export type ActivityCost = {
  id: string
  activityId?: string
  name: string
  destinationId?: string
  destinationName?: string
  costPerPerson: number
  quantity: number
  notes?: string
}

export type AdditionalCost = {
  id: string
  name: string
  cost: number
  notes?: string
}

export type PricingSettings = {
  companyProfitPercent: number
  agentProfitPercent: number
  salesPersonProfitPercent: number
  quotedPricePerPerson?: number
}

export type PricingTotals = {
  accommodationTotal: number
  guideAccommodationTotal: number
  transportationTotal: number
  driverGuideTotal: number
  activityTotal: number
  additionalCostTotal: number
  baseCost: number
  companyProfitAmount: number
  agentProfitAmount: number
  salesPersonProfitAmount: number
  finalPackageCost: number
  pricePerPerson: number
  quotedPricePerPerson: number
  quotedPackageTotal: number
  transportationLKR: number
  driverGuideLKR: number
  totalMileage: number
  routeKm: number
}

export type Costing = {
  id: string
  referenceNo: string
  enquiryId?: string
  itineraryId?: string
  status: CostingStatus
  agentName: string
  clientName: string
  nationality: string
  numberOfPeople: number
  arrivalDate: string
  departureDate: string
  tripDays: number
  nights: number
  chargeableDriverDays: number
  chargeableGuideDays: number
  starCategory: string
  tourExecutive: string
  currency: CostingCurrency
  exchangeRate: number
  accommodation: AccommodationCostRow[]
  transportation: TransportationCost
  driverGuide: DriverGuideCost
  activities: ActivityCost[]
  additionalCosts: AdditionalCost[]
  pricing: PricingSettings
  updatedAt: string
}

export type ActivityLibraryItem = {
  id: string
  name: string
  costPerPerson: number
  destinationName?: string
  tags?: string[]
}
