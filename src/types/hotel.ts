/** Hotel Master. Distinct from the lighter itinerary `Hotel` used on a single trip. */

export type HotelStatus = 'draft' | 'active' | 'inactive'

export type StarCategory = 1 | 2 | 3 | 4 | 5

export type HotelSectionId = 'details' | 'rooms' | 'contacts' | 'media'

export type HotelRoomCategory = {
  id: string
  name: string
  numberOfRooms: number
  sortOrder: number
}

export type HotelContact = {
  id: string
  contactPerson: string
  designation: string
  email: string
  contactNumber: string
}

/** `provider` is reserved for a future authorised image source. Manual upload stays the default. */
export type HotelImageSource = 'upload' | 'provider'

export type HotelImage = {
  id: string
  url: string
  fileName?: string
  isCover: boolean
  sortOrder: number
  source?: HotelImageSource
}

export type HotelRecord = {
  id: string
  name: string
  starCategory?: StarCategory
  address: string
  destinationId?: string
  destinationName?: string
  rooms: HotelRoomCategory[]
  contacts: {
    sales: HotelContact[]
    reservations: HotelContact[]
  }
  images: HotelImage[]
  status: HotelStatus
  createdAt: string
  updatedAt: string
}

/** What Itinerary and Costing can read later. Rates stay on the trip costing, not on the hotel. */
export type HotelItinerarySource = {
  id: string
  name: string
  starCategory?: StarCategory
  address: string
  destinationId?: string
  destinationName?: string
  coverUrl?: string
  rooms: { id: string; name: string; numberOfRooms: number }[]
}
