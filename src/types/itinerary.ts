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
  /** Stable label. Existing highlights keep theirs when a new one is added at the top. */
  number?: number
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
  /** Picture chosen for this day item. */
  image?: string
  subActivities: SubActivity[]
  sortOrder: number
  time?: string
  status?: ActivityStatus | ''
  activityId?: string
  /** A highlight dropped onto the day, rather than an activity. */
  kind?: 'highlight'
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
  /** Board for this night: BB, HB, or FB. Falls back to the stay when unset. */
  mealPlan?: string
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

/** Option 1 uses each stay's own hotel fields. Further options store a StayChoice. */
export const primaryStayOption = 'stay-option-1'

export type StayChoice = {
  optionId: string
  /** Night this hotel belongs to. Option 1 uses the stay's own hotel instead. */
  dayId: string
  hotelId: string
  hotelName: string
  roomCategoryId?: string
  roomCategoryName?: string
  starCategory: number
  mealPlan: string
  image: string
  /** Selected hotel photos, in carousel order. `image` stays the first one. */
  images?: string[]
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
  /** Selected hotel photos, in carousel order. `image` stays the first one. */
  images?: string[]
  /** Overnight days that share this stay, in journey order. */
  dayIds?: string[]
  /** Extra hotels for one night. Option 1 is this stay's own hotel. */
  nightOptions?: { dayId: string; optionIds: string[] }[]
  /** Hotels for options after Option 1, one night at a time. */
  choices?: StayChoice[]
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
  /** Where the journey begins. Defaults to Bandaranaike International Airport. */
  startPoint: string
  /** Where the journey ends. Chosen on trip details. */
  endPoint: string
  /** Traveller interests, including any added beyond the preset list. */
  interests: string[]
  adults: number
  children: number
  infants: number
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
