import type { ActivityLibraryItem } from '../types/costing'

export const ACTIVITY_LIBRARY: ActivityLibraryItem[] = [
  { id: 'act-airport', name: 'Airport Charges', costPerPerson: 10, tags: ['colombo', 'airport'] },
  { id: 'act-garlands', name: 'Garlands Welcome', costPerPerson: 2, tags: ['colombo', 'airport'] },
  { id: 'act-sigiriya', name: 'Sigiriya Rock Visit', costPerPerson: 30, destinationName: 'Sigiriya', tags: ['sigiriya'] },
  { id: 'act-dambulla', name: 'Dambulla Caves Temple', costPerPerson: 12, destinationName: 'Dambulla', tags: ['sigiriya', 'dambulla'] },
  { id: 'act-polonnaruwa', name: 'Polonnaruwa City', costPerPerson: 25, destinationName: 'Polonnaruwa', tags: ['polonnaruwa'] },
  { id: 'act-avukana', name: 'Avukana Temple', costPerPerson: 12, tags: ['anuradhapura'] },
  { id: 'act-elephant', name: 'Elephant Ride', costPerPerson: 20, tags: ['sigiriya'] },
  { id: 'act-village', name: 'Village Tour', costPerPerson: 10, destinationName: 'Sigiriya', tags: ['sigiriya'] },
  { id: 'act-anuradhapura', name: 'Anuradhapura City', costPerPerson: 25, destinationName: 'Anuradhapura', tags: ['anuradhapura'] },
  { id: 'act-mihintale', name: 'Mihintale (Anuradhapura)', costPerPerson: 5, tags: ['anuradhapura'] },
  { id: 'act-minneriya', name: 'Minneriya National Park', costPerPerson: 28, destinationName: 'Minneriya', tags: ['sigiriya', 'minneriya'] },
  { id: 'act-yala', name: 'Yala National Park', costPerPerson: 28, destinationName: 'Yala', tags: ['yala'] },
  { id: 'act-udawalawe', name: 'Udawalawe National Park', costPerPerson: 28, destinationName: 'Udawalawe', tags: ['udawalawe'] },
  { id: 'act-tooth', name: 'Kandy Temple of Tooth', costPerPerson: 12, destinationName: 'Kandy', tags: ['kandy'] },
  { id: 'act-dance', name: 'Kandy Cultural Dance', costPerPerson: 5, destinationName: 'Kandy', tags: ['kandy'] },
  { id: 'act-botanical', name: 'Kandy Botanical Garden', costPerPerson: 12, destinationName: 'Kandy', tags: ['kandy'] },
  { id: 'act-embekke', name: 'Embekke Temple (Kandy)', costPerPerson: 5, destinationName: 'Kandy', tags: ['kandy'] },
  { id: 'act-horton', name: 'Horton Plains (Nuwara Eliya)', costPerPerson: 28, destinationName: 'Nuwara Eliya', tags: ['nuwara'] },
  { id: 'act-hakgala', name: 'Hakgala Botanical Garden', costPerPerson: 12, destinationName: 'Nuwara Eliya', tags: ['nuwara'] },
  { id: 'act-rafting', name: 'White Water Rafting', costPerPerson: 12, tags: ['kithulgala'] },
  { id: 'act-turtle', name: 'Turtle Hatchery', costPerPerson: 3, tags: ['south'] },
  { id: 'act-snorkel', name: 'Snorkelling (Hikkaduwa)', costPerPerson: 30, tags: ['hikkaduwa'] },
  { id: 'act-madu', name: 'Madu Ganga / River Boat Ride', costPerPerson: 15, tags: ['south'] },
  { id: 'act-whale', name: 'Whale Watching (Mirissa)', costPerPerson: 80, destinationName: 'Mirissa', tags: ['mirissa'] },
  { id: 'act-museum', name: 'Museum of Colombo', costPerPerson: 12, destinationName: 'Colombo', tags: ['colombo'] },
  { id: 'act-airfare', name: 'Airfare', costPerPerson: 0 },
  { id: 'act-custom-1', name: 'Custom Extra 1', costPerPerson: 0 },
  { id: 'act-custom-2', name: 'Custom Extra 2', costPerPerson: 0 },
  { id: 'act-custom-3', name: 'Custom Extra 3', costPerPerson: 0 },
  { id: 'act-custom-4', name: 'Custom Extra 4', costPerPerson: 0 },
  { id: 'act-custom-5', name: 'Custom Extra 5', costPerPerson: 0 },
]

export const DESTINATION_ACTIVITY_TAGS: Record<string, string[]> = {
  colombo: ['colombo', 'airport'],
  sigiriya: ['sigiriya', 'dambulla', 'minneriya'],
  kandy: ['kandy'],
  'nuwara eliya': ['nuwara'],
  ne: ['nuwara'],
  mirissa: ['mirissa', 'south'],
  departure: ['airport', 'colombo'],
}

export function suggestedActivities(destination: string) {
  const key = destination.trim().toLowerCase()
  const tags = DESTINATION_ACTIVITY_TAGS[key] ?? []
  if (!tags.length) return []
  return ACTIVITY_LIBRARY.filter((a) => a.tags?.some((t) => tags.includes(t)))
}
