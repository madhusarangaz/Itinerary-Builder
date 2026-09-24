export type DestinationStatus = 'draft' | 'active' | 'archived'

export type DestinationSectionId = 'basics' | 'media' | 'travel' | 'activities' | 'itinerary' | 'tips'

export type VisitType = 'day_trip' | 'overnight' | 'multi_day'

export type TypicalPace = 'relaxed' | 'moderate' | 'active'

export type ClimateType = 'tropical' | 'coastal' | 'dry' | 'humid' | 'hill_country' | 'mixed' | 'other'

export type AirportTransport =
  | 'private_car'
  | 'van'
  | 'coach'
  | 'train'
  | 'domestic_flight'
  | 'boat'
  | 'mixed'
  | 'other'

export type ConnectionTransport = 'road' | 'train' | 'flight' | 'boat' | 'mixed'

export type ActivityMasterType = 'standard' | 'optional' | 'addon'

export type ActivityDifficulty = 'easy' | 'moderate' | 'challenging'

export type ActivityCostType = 'per_person' | 'per_group' | 'per_vehicle' | 'flat' | 'free' | 'unknown'

export type SuggestedTime =
  | 'early_morning'
  | 'morning'
  | 'late_morning'
  | 'midday'
  | 'afternoon'
  | 'late_afternoon'
  | 'evening'
  | 'night'
  | 'flexible'

export type TipCategory =
  | 'weather'
  | 'clothing'
  | 'culture'
  | 'safety'
  | 'walking'
  | 'accessibility'
  | 'photography'
  | 'wildlife'
  | 'health'
  | 'food'
  | 'money'
  | 'transport'
  | 'packing'
  | 'family'
  | 'other'

export type TipImportance = 'useful' | 'recommended' | 'important'

export type DestinationImage = {
  id: string
  url: string
  caption?: string
  alt?: string
  isCover?: boolean
  sortOrder: number
  focalY?: number
}

export type MonthlyClimate = {
  month: number
  highC?: number
  lowC?: number
}

export type DestinationClimate = {
  averageHighC?: number
  averageLowC?: number
  climateType?: ClimateType
  note?: string
  monthlyClimate?: MonthlyClimate[]
}

export type AirportConnection = {
  id: string
  airportCode: string
  airportName: string
  distanceKm: number
  travelHours: number
  travelMinutes: number
  transportType: AirportTransport
  note?: string
}

export type DestinationConnection = {
  id: string
  destinationId: string
  destinationName: string
  distanceKm: number
  travelHours: number
  travelMinutes: number
  transportType: ConnectionTransport
  note?: string
  bidirectional: boolean
}

export type ActivityCost = {
  currency: string
  type: ActivityCostType
  amount?: number
}

export type DestinationActivity = {
  id: string
  name: string
  shortDescription?: string
  image?: DestinationImage
  categories: string[]
  durationMinutes?: number
  recommendedTimes: string[]
  masterType: ActivityMasterType
  cost?: ActivityCost
  difficulty?: ActivityDifficulty
  suitableFor: string[]
  whatToBring?: string[]
  dressRequirements?: string
  accessibilityNotes?: string
  bookingRequired?: boolean
  entranceFeeRequired?: boolean
  seasonal?: boolean
  availableMonths?: number[]
  internalNotes?: string
  sortOrder: number
}

export type ItineraryPoint = {
  id: string
  title: string
  description: string
  suggestedTime: SuggestedTime
  relatedActivityId?: string
  durationMinutes?: number
  optional: boolean
  internalNote?: string
  sortOrder: number
}

export type TravellerTip = {
  id: string
  category: TipCategory
  title: string
  information: string
  importance: TipImportance
  showInItinerary: boolean
  internalOnly: boolean
}

export type Destination = {
  id: string
  name: string
  province: string
  district?: string
  shortDescription: string
  experienceTypes: string[]
  bestVisitMonths: number[]
  visitType: VisitType
  minimumNights?: number
  idealNights?: number
  typicalPace?: TypicalPace
  coverImage?: DestinationImage
  gallery: DestinationImage[]
  climate: DestinationClimate
  airportConnections: AirportConnection[]
  destinationConnections: DestinationConnection[]
  /** Links into Activities & Entrance Fees. Full records live on the activity master. */
  activityIds: string[]
  itineraryPoints: ItineraryPoint[]
  travellerTips: TravellerTip[]
  status: DestinationStatus
  createdAt: string
  updatedAt: string
}
