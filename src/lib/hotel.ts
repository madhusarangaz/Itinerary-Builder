import { uid } from './ids'
import type { Hotel } from '../types/itinerary'
import type { HotelContact, HotelImage, HotelItinerarySource, HotelRecord, HotelRoomCategory } from '../types/hotel'

export function newRoom(partial?: Partial<HotelRoomCategory>): HotelRoomCategory {
  return {
    id: uid('room'),
    name: '',
    numberOfRooms: 0,
    sortOrder: 0,
    ...partial,
  }
}

export function newContact(partial?: Partial<HotelContact>): HotelContact {
  return {
    id: uid('ctc'),
    contactPerson: '',
    designation: '',
    email: '',
    contactNumber: '',
    ...partial,
  }
}

export function newHotelImage(url: string, sortOrder: number, isCover = false): HotelImage {
  return { id: uid('img'), url, isCover, sortOrder, source: 'upload' }
}

export function coverImage(hotel: HotelRecord) {
  return hotel.images.find((img) => img.isCover && img.url) ?? hotel.images.find((img) => img.url)
}

/** Itinerary can keep using its lighter hotel shape without copying master fields into the trip. */
export function toItineraryHotel(hotel: HotelRecord): Hotel {
  return {
    id: hotel.id,
    name: hotel.name,
    destination: hotel.destinationName ?? '',
    starRating: hotel.starCategory ?? 0,
    mealPlans: [],
    image: coverImage(hotel)?.url ?? '',
    notes: hotel.address,
  }
}

export function toItinerarySource(hotel: HotelRecord): HotelItinerarySource {
  return {
    id: hotel.id,
    name: hotel.name,
    starCategory: hotel.starCategory,
    address: hotel.address,
    destinationId: hotel.destinationId,
    destinationName: hotel.destinationName,
    coverUrl: coverImage(hotel)?.url,
    rooms: hotel.rooms.map((room) => ({ id: room.id, name: room.name, numberOfRooms: room.numberOfRooms })),
  }
}
