import { photos } from './images'
import { newContact, newHotelImage, newRoom } from '../lib/hotel'
import { uid } from '../lib/ids'
import type { HotelRecord } from '../types/hotel'

function stamp() {
  return new Date().toISOString()
}

export function emptyHotel(): HotelRecord {
  const now = stamp()
  return {
    id: uid('hotel'),
    name: '',
    address: '',
    rooms: [],
    contacts: { sales: [], reservations: [] },
    images: [],
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  }
}

function record(partial: Omit<HotelRecord, 'id' | 'createdAt' | 'updatedAt'>): HotelRecord {
  const now = stamp()
  return { id: uid('hotel'), createdAt: now, updatedAt: now, ...partial }
}

export const sampleHotels: HotelRecord[] = [
  record({
    name: 'Amari Colombo',
    starCategory: 5,
    address: 'Colombo, Sri Lanka',
    destinationName: 'Colombo',
    status: 'active',
    rooms: [
      newRoom({ name: 'Standard', numberOfRooms: 20, sortOrder: 0 }),
      newRoom({ name: 'Deluxe', numberOfRooms: 10, sortOrder: 1 }),
      newRoom({ name: 'Suite', numberOfRooms: 3, sortOrder: 2 }),
    ],
    contacts: {
      sales: [
        newContact({
          contactPerson: 'Nimal Perera',
          designation: 'Sales Manager',
          email: 'sales@amaricolombo.example',
          contactNumber: '+94 77 000 0000',
        }),
      ],
      reservations: [
        newContact({
          contactPerson: 'Kasuni Silva',
          designation: 'Reservations Manager',
          email: 'reservations@amaricolombo.example',
          contactNumber: '+94 77 000 0001',
        }),
      ],
    },
    images: [newHotelImage(photos.hotelColombo, 0, true)],
  }),
  record({
    name: "Earl's Regency",
    starCategory: 5,
    address: 'Kandy, Sri Lanka',
    destinationName: 'Kandy',
    destinationId: 'dest-kandy',
    status: 'active',
    rooms: [
      newRoom({ name: 'Superior', numberOfRooms: 40, sortOrder: 0 }),
      newRoom({ name: 'Deluxe', numberOfRooms: 18, sortOrder: 1 }),
    ],
    contacts: { sales: [], reservations: [] },
    images: [newHotelImage(photos.hotelKandy, 0, true)],
  }),
  record({
    name: 'Weligama Bay Marriott',
    starCategory: 5,
    address: 'Weligama, Sri Lanka',
    destinationName: 'Mirissa',
    status: 'draft',
    rooms: [newRoom({ name: 'Ocean View', numberOfRooms: 24, sortOrder: 0 })],
    contacts: { sales: [], reservations: [] },
    images: [newHotelImage(photos.hotelMirissa, 0, true)],
  }),
]
