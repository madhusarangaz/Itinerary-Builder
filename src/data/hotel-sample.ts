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

function record(id: string, partial: Omit<HotelRecord, 'id' | 'createdAt' | 'updatedAt'>): HotelRecord {
  const now = stamp()
  return { id, createdAt: now, updatedAt: now, ...partial }
}

function rooms(hotelId: string, rows: { name: string; count: number }[]) {
  return rows.map((room, sortOrder) =>
    newRoom({ id: `${hotelId}-room-${sortOrder}`, name: room.name, numberOfRooms: room.count, sortOrder }),
  )
}

export const sampleHotels: HotelRecord[] = [
  record('htl-amari', {
    name: 'Amari Colombo',
    starCategory: 5,
    address: 'Colombo, Sri Lanka',
    destinationName: 'Colombo',
    status: 'active',
    rooms: rooms('htl-amari', [
      { name: 'Standard', count: 20 },
      { name: 'Deluxe', count: 10 },
      { name: 'Suite', count: 3 },
    ]),
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
  record('htl-cinnamon', {
    name: 'Cinnamon Grand Colombo',
    starCategory: 5,
    address: 'Colombo, Sri Lanka',
    destinationName: 'Colombo',
    status: 'active',
    rooms: rooms('htl-cinnamon', [
      { name: 'Deluxe', count: 30 },
      { name: 'Club', count: 12 },
    ]),
    contacts: { sales: [], reservations: [] },
    images: [newHotelImage(photos.hotelColombo, 0, true)],
  }),
  record('htl-hidden', {
    name: 'Hidden Secrets',
    starCategory: 5,
    address: 'Sigiriya, Sri Lanka',
    destinationName: 'Sigiriya',
    destinationId: 'dest-sigiriya',
    status: 'active',
    rooms: rooms('htl-hidden', [
      { name: 'Cave Suite', count: 8 },
      { name: 'Deluxe', count: 16 },
    ]),
    contacts: { sales: [], reservations: [] },
    images: [newHotelImage(photos.hotelSigiriya, 0, true)],
  }),
  record('htl-aliya', {
    name: 'Aliya Resort',
    starCategory: 5,
    address: 'Sigiriya, Sri Lanka',
    destinationName: 'Sigiriya',
    destinationId: 'dest-sigiriya',
    status: 'active',
    rooms: rooms('htl-aliya', [
      { name: 'Deluxe', count: 22 },
      { name: 'Family', count: 6 },
    ]),
    contacts: { sales: [], reservations: [] },
    images: [newHotelImage(photos.hotelSigiriya, 0, true)],
  }),
  record('htl-earls', {
    name: "Earl's Regency",
    starCategory: 5,
    address: 'Kandy, Sri Lanka',
    destinationName: 'Kandy',
    destinationId: 'dest-kandy',
    status: 'active',
    rooms: rooms('htl-earls', [
      { name: 'Superior', count: 40 },
      { name: 'Deluxe', count: 18 },
    ]),
    contacts: { sales: [], reservations: [] },
    images: [newHotelImage(photos.hotelKandy, 0, true)],
  }),
  record('htl-mahaweli', {
    name: 'Mahaweli Reach',
    starCategory: 4,
    address: 'Kandy, Sri Lanka',
    destinationName: 'Kandy',
    destinationId: 'dest-kandy',
    status: 'active',
    rooms: rooms('htl-mahaweli', [
      { name: 'Deluxe', count: 28 },
      { name: 'Suite', count: 4 },
    ]),
    contacts: { sales: [], reservations: [] },
    images: [newHotelImage(photos.hotelKandy, 0, true)],
  }),
  record('htl-golden', {
    name: 'Golden Ridge',
    starCategory: 4,
    address: 'Nuwara Eliya, Sri Lanka',
    destinationName: 'Nuwara Eliya',
    destinationId: 'dest-nuwara',
    status: 'active',
    rooms: rooms('htl-golden', [
      { name: 'Deluxe', count: 18 },
      { name: 'Suite', count: 4 },
    ]),
    contacts: { sales: [], reservations: [] },
    images: [newHotelImage(photos.hotelNuwara, 0, true)],
  }),
  record('htl-heritance', {
    name: 'Heritance Tea Factory',
    starCategory: 5,
    address: 'Nuwara Eliya, Sri Lanka',
    destinationName: 'Nuwara Eliya',
    destinationId: 'dest-nuwara',
    status: 'active',
    rooms: rooms('htl-heritance', [
      { name: 'Superior', count: 24 },
      { name: 'Suite', count: 5 },
    ]),
    contacts: { sales: [], reservations: [] },
    images: [newHotelImage(photos.hotelNuwara, 0, true)],
  }),
  record('htl-marriott', {
    name: 'Weligama Bay Marriott',
    starCategory: 5,
    address: 'Weligama, Sri Lanka',
    destinationName: 'Mirissa',
    destinationId: 'dest-mirissa',
    status: 'active',
    rooms: rooms('htl-marriott', [
      { name: 'Ocean View', count: 24 },
      { name: 'Deluxe', count: 16 },
    ]),
    contacts: { sales: [], reservations: [] },
    images: [newHotelImage(photos.hotelMirissa, 0, true)],
  }),
  record('htl-cape', {
    name: 'Cape Weligama',
    starCategory: 5,
    address: 'Weligama, Sri Lanka',
    destinationName: 'Mirissa',
    destinationId: 'dest-mirissa',
    status: 'active',
    rooms: rooms('htl-cape', [
      { name: 'Ocean Pool', count: 12 },
      { name: 'Suite', count: 6 },
    ]),
    contacts: { sales: [], reservations: [] },
    images: [newHotelImage(photos.hotelMirissa, 0, true)],
  }),
]
