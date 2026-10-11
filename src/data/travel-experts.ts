import { photos } from './images'
import type { TravelExpert } from '../types/itinerary'

export type TravelExpertOption = TravelExpert & { id: string }

/** Prototype staff the itinerary can assign. Selecting one copies their details onto the trip. */
export const TRAVEL_EXPERTS: TravelExpertOption[] = [
  {
    id: 'expert-hiruni',
    name: 'Hiruni Shehara',
    role: 'Destination Expert',
    photo: photos.expert,
    email: 'hello@ovianaholidays.com',
    phone: '+94 71 5930244',
    bio: 'Hiruni designs slow, considered journeys across Sri Lanka — from tea country dawns to south-coast evenings — with the care of someone who still walks every route herself.',
  },
  {
    id: 'expert-naveen',
    name: 'Naveen Fernando',
    role: 'Travel Designer',
    photo: photos.expertNaveen,
    email: 'naveen@ovianaholidays.com',
    phone: '+94 77 2148801',
    bio: 'Naveen plans cultural routes through the triangle and the hills, with time kept for the drives, the temples, and a quiet hour at the hotel.',
  },
  {
    id: 'expert-amaya',
    name: 'Amaya Silva',
    role: 'Guest Experience',
    photo: photos.expertAmaya,
    email: 'amaya@ovianaholidays.com',
    phone: '+94 76 9083312',
    bio: 'Amaya looks after families on the south coast — beach days, easy transfers, and the small details that make a long journey feel unrushed.',
  },
]
