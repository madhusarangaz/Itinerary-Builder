export type ActivityType = 'activity' | 'transfer' | 'meal' | 'hotel' | 'note'

export type SectionId =
  | 'details'
  | 'days'
  | 'stay'
  | 'pricing'
  | 'terms'
  | 'expert'

/** Where a preview click should land in the CRM editor. */
export type EditorTarget = {
  section: SectionId
  field?: string
  dayId?: string
}

export type Completeness = 'complete' | 'progress' | 'empty' | 'attention'

export type Highlight = {
  id: string
  name: string
  description: string
  image: string
}

export type Facility = {
  id: string
  label: string
  custom?: boolean
}

export type SubActivity = {
  id: string
  title: string
}

export type ActivityStatus = 'included' | 'optional' | 'extra'

export type Activity = {
  id: string
  type: ActivityType
  title: string
  description: string
  subActivities: SubActivity[]
  sortOrder: number
  time?: string
  status?: ActivityStatus | ''
  activityId?: string
  /** Trip-only wording. Does not write back to the activity master. */
  customDescription?: string
  notes?: string
  extraCost?: string
  bookingRef?: string
  meetingPoint?: string
}

export type DayTravel = {
  from: string
  to: string
  transport: string
  duration: string
}

export type DayMeals = {
  breakfast: boolean
  lunch: boolean
  dinner: boolean
}

export type DayPickup = {
  meetingPoint: string
  pickupTime: string
  contactName: string
  contactPhone: string
  ifLost: string
}

export type Day = {
  id: string
  dayNumber: number
  date: string
  destination: string
  destinationId?: string
  title: string
  image: string
  activities: Activity[]
  travel?: DayTravel
  hotelName?: string
  meals?: DayMeals
  tip?: string
  pickup?: DayPickup
}

export type Hotel = {
  id: string
  name: string
  destination: string
  starRating: number
  mealPlans: string[]
  image: string
  notes: string
}

export type Accommodation = {
  id: string
  destination: string
  hotelId: string
  hotelName: string
  roomCategoryId?: string
  roomCategoryName?: string
  nights: number
  starCategory: number
  mealPlan: string
  image: string
}

export type Pricing = {
  currency: 'USD' | 'EUR' | 'GBP' | 'AUD' | 'LKR'
  travellerCount: number
  total: number
  occupancyNote: string
}

export type PolicyRow = {
  id: string
  window: string
  detail: string
}

export type TravelExpert = {
  name: string
  role: string
  photo: string
  email: string
  phone: string
  bio: string
}

export type Trip = {
  id: string
  shareId: string
  tourId: string
  title: string
  option: string
  customer: string
  country: string
  startDate: string
  endDate: string
  adults: number
  children: number
  nights: number
  coverImage: string
  coverPosition: number
  /** YouTube URL or id. Plays muted, looping behind the header title. */
  heroVideoUrl: string
  highlights: Highlight[]
  facilities: Facility[]
  days: Day[]
  accommodations: Accommodation[]
  pricing: Pricing
  inclusions: { id: string; text: string }[]
  exclusions: { id: string; text: string }[]
  cancellationPolicies: PolicyRow[]
  cancellationNote: string
  accommodationNote: string
  travelExpert: TravelExpert
  /** Selected transport type for the whole trip. A day can still describe its own route. */
  transportId?: string
  transportName?: string
  supplierId?: string
  supplierName?: string
  vehicleRegistration?: string
  driverName?: string
  /** Linked internal costing record. Customer itinerary never shows buy rates or margins. */
  costingId?: string
  updatedAt: string
}

export type SaveStatus = 'saving' | 'saved' | 'idle'
