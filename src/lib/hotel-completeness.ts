import { isValidEmail } from '../data/hotel-catalog'
import type { Completeness } from '../types/itinerary'
import type { HotelRecord, HotelSectionId, HotelStatus } from '../types/hotel'

export const HOTEL_STATUS_LABELS: Record<HotelStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  inactive: 'Inactive',
}

export const HOTEL_SECTIONS: { id: HotelSectionId; n: string; label: string }[] = [
  { id: 'details', n: '01', label: 'Hotel Details' },
  { id: 'rooms', n: '02', label: 'Rooms' },
  { id: 'contacts', n: '03', label: 'Contacts' },
  { id: 'media', n: '04', label: 'Media' },
]

export type HotelIssue = { message: string; section: HotelSectionId }

export function requiredHotelIssues(hotel: HotelRecord): HotelIssue[] {
  const missing: HotelIssue[] = []
  if (!hotel.name.trim()) missing.push({ message: 'Enter the hotel name.', section: 'details' })
  if (!hotel.starCategory) missing.push({ message: 'Select a star category.', section: 'details' })
  if (!hotel.address.trim()) missing.push({ message: 'Enter the hotel address.', section: 'details' })
  const named = hotel.rooms.filter((room) => room.name.trim())
  if (!named.length) missing.push({ message: 'Add at least one room category.', section: 'rooms' })
  hotel.rooms.forEach((room, index) => {
    if (!room.name.trim() && hotel.rooms.length > 1) {
      missing.push({ message: `Name room category ${index + 1}.`, section: 'rooms' })
    }
    if (room.name.trim() && (!Number.isInteger(room.numberOfRooms) || room.numberOfRooms < 0)) {
      missing.push({ message: `Enter a room count for ${room.name}.`, section: 'rooms' })
    }
  })
  const contacts = [...hotel.contacts.sales, ...hotel.contacts.reservations]
  contacts.forEach((contact) => {
    if (contact.email.trim() && !isValidEmail(contact.email)) {
      missing.push({
        message: `Enter a valid email address${contact.contactPerson ? ` for ${contact.contactPerson}` : ''}.`,
        section: 'contacts',
      })
    }
  })
  return missing
}

export function recommendedHotelIssues(hotel: HotelRecord) {
  const missing: string[] = []
  if (!hotel.destinationId && !hotel.destinationName) missing.push('Link a destination')
  if (!hotel.contacts.sales.length) missing.push('Add a sales contact')
  if (!hotel.contacts.reservations.length) missing.push('Add a reservations contact')
  if (!hotel.images.some((img) => img.url)) missing.push('Add a hotel image')
  return missing
}

export function hotelProgress(hotel: HotelRecord) {
  let filled = 0
  const checks = 8
  if (hotel.name.trim()) filled += 1
  if (hotel.starCategory) filled += 1
  if (hotel.address.trim()) filled += 1
  if (hotel.destinationId || hotel.destinationName) filled += 1
  if (hotel.rooms.some((room) => room.name.trim())) filled += 1
  if (hotel.contacts.sales.some((c) => c.contactPerson.trim())) filled += 1
  if (hotel.contacts.reservations.some((c) => c.contactPerson.trim())) filled += 1
  if (hotel.images.some((img) => img.url)) filled += 1
  return {
    percent: Math.round((filled / checks) * 100),
    remaining: recommendedHotelIssues(hotel).length,
  }
}

export function hotelSectionStatus(hotel: HotelRecord, id: HotelSectionId): Completeness {
  const issues = requiredHotelIssues(hotel).filter((issue) => issue.section === id)
  switch (id) {
    case 'details':
      if (hotel.name.trim() && hotel.starCategory && hotel.address.trim()) return 'complete'
      if (hotel.name || hotel.address || hotel.starCategory) return issues.length ? 'attention' : 'progress'
      return 'empty'
    case 'rooms':
      if (hotel.rooms.some((room) => room.name.trim()) && !issues.length) return 'complete'
      if (hotel.rooms.length) return issues.length ? 'attention' : 'progress'
      return 'empty'
    case 'contacts': {
      const has = hotel.contacts.sales.length + hotel.contacts.reservations.length > 0
      if (issues.length) return 'attention'
      if (hotel.contacts.sales.length && hotel.contacts.reservations.length) return 'complete'
      if (has) return 'progress'
      return 'empty'
    }
    case 'media':
      if (hotel.images.filter((img) => img.url).length >= 3) return 'complete'
      if (hotel.images.some((img) => img.url)) return 'progress'
      return 'empty'
  }
}
