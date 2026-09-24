export type ActivityPlacement = 'within_destination' | 'en_route'

export type ActivityStatus = 'draft' | 'active' | 'inactive'

export type ActivitySectionId = 'activity' | 'location' | 'fees' | 'details'

export type ActivityDifficulty = 'easy' | 'moderate' | 'challenging'

export type ActivityRateSource = 'demo' | 'recorded'

export type ActivityRoute = {
  id: string
  fromLocationId?: string
  fromLocationName: string
  toLocationId?: string
  toLocationName: string
}

export type ActivityImage = {
  id: string
  url: string
  fileName?: string
}

/** Reusable sightseeing / entrance-fee record. Not an itinerary-day activity. */
export type ActivityRecord = {
  id: string
  name: string
  locationId?: string
  locationName: string
  type: ActivityPlacement
  applicableRoutes: ActivityRoute[]
  adultRateUsd: number
  childRateUsd: number
  description?: string
  categories: string[]
  image?: ActivityImage
  durationMinutes?: number
  recommendedTimes: string[]
  difficulty?: ActivityDifficulty
  suitableFor: string[]
  whatToBring: string[]
  dressRequirements?: string
  accessibilityNotes?: string
  bookingRequired?: boolean
  entranceTicketRequired?: boolean
  seasonal?: boolean
  availableMonths?: number[]
  internalNotes?: string
  /** Demo rates are prototype figures, not verified live entrance fees. */
  rateSource?: ActivityRateSource
  status: ActivityStatus
  createdAt: string
  updatedAt: string
}

export type ItineraryActivityLink = {
  activityId: string
  status: 'included' | 'optional' | 'additional_cost'
  customDescription?: string
}

export type CostingActivityLink = {
  activityId: string
  adultQty: number
  childQty: number
  masterAdultRate: number
  masterChildRate: number
  overrideAdultRate?: number
  overrideChildRate?: number
}
