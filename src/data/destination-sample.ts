import { photos } from './images'
import { uid } from '../lib/ids'
import type {
  Destination,
  DestinationConnection,
  DestinationImage,
  ItineraryPoint,
  TravellerTip,
} from '../types/destination'

export function emptyImage(url = '', extra?: Partial<DestinationImage>): DestinationImage {
  return {
    id: uid('img'),
    url,
    sortOrder: 0,
    ...extra,
  }
}

export function emptyDestination(): Destination {
  const now = new Date().toISOString()
  return {
    id: uid('dest'),
    name: '',
    province: '',
    district: '',
    shortDescription: '',
    experienceTypes: [],
    bestVisitMonths: [],
    visitType: 'overnight',
    minimumNights: 1,
    idealNights: 2,
    typicalPace: 'moderate',
    gallery: [],
    climate: {},
    airportConnections: [
      {
        id: uid('air'),
        airportCode: 'CMB',
        airportName: 'Bandaranaike International Airport (CMB)',
        distanceKm: 0,
        travelHours: 0,
        travelMinutes: 0,
        transportType: 'private_car',
      },
    ],
    destinationConnections: [],
    activityIds: [],
    itineraryPoints: [],
    travellerTips: [],
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  }
}

const cover: DestinationImage = {
  id: 'img-sig-cover',
  url: photos.sigiriya,
  alt: 'Sigiriya rock fortress',
  isCover: true,
  sortOrder: 0,
  focalY: 40,
}

const morningPoint: ItineraryPoint = {
  id: 'pt-sig-morning',
  title: 'Sigiriya Rock Exploration',
  description:
    'After breakfast, climb the iconic Sigiriya Rock Fortress and explore its ancient frescoes, Mirror Wall, royal gardens and panoramic views.',
  suggestedTime: 'morning',
  relatedActivityId: 'act-sigiriya-rock',
  durationMinutes: 150,
  optional: false,
  sortOrder: 0,
}

const afternoonPoint: ItineraryPoint = {
  id: 'pt-sig-afternoon',
  title: 'Village Experience',
  description: 'Enjoy a traditional village experience followed by a relaxed return to your hotel.',
  suggestedTime: 'afternoon',
  relatedActivityId: 'act-village',
  durationMinutes: 240,
  optional: true,
  sortOrder: 1,
}

const eveningPoint: ItineraryPoint = {
  id: 'pt-sig-evening',
  title: 'Sunset / Relaxation',
  description: 'Return to your hotel and enjoy the evening at a slower pace after a full day exploring Sigiriya.',
  suggestedTime: 'evening',
  optional: false,
  sortOrder: 2,
}

const tips: TravellerTip[] = [
  {
    id: 'tip-dress',
    category: 'culture',
    title: 'Temple Dress Code',
    information: 'Shoulders and knees should be covered when visiting temples.',
    importance: 'important',
    showInItinerary: true,
    internalOnly: false,
  },
  {
    id: 'tip-shoes',
    category: 'walking',
    title: 'Comfortable Shoes',
    information: 'Comfortable walking shoes are recommended for the Sigiriya climb.',
    importance: 'recommended',
    showInItinerary: true,
    internalOnly: false,
  },
]

const kandyConn: DestinationConnection = {
  id: 'conn-sig-kandy',
  destinationId: 'dest-kandy',
  destinationName: 'Kandy',
  distanceKm: 90,
  travelHours: 2,
  travelMinutes: 30,
  transportType: 'road',
  note: 'Scenic road through Matale.',
  bidirectional: true,
}

const nuwaraConn: DestinationConnection = {
  id: 'conn-sig-nuwara',
  destinationId: 'dest-nuwara',
  destinationName: 'Nuwara Eliya',
  distanceKm: 155,
  travelHours: 4,
  travelMinutes: 0,
  transportType: 'road',
  bidirectional: true,
}

export const sampleSigiriya: Destination = {
  id: 'dest-sigiriya',
  name: 'Sigiriya',
  province: 'Central Province',
  district: 'Matale',
  shortDescription:
    'Sigiriya is one of Sri Lanka’s most iconic cultural destinations, famous for its ancient rock fortress, landscaped gardens and panoramic views. It is an important stop within Sri Lanka’s Cultural Triangle.',
  experienceTypes: ['Culture', 'Heritage', 'History', 'Adventure', 'Photography'],
  bestVisitMonths: [1, 2, 3],
  visitType: 'overnight',
  minimumNights: 1,
  idealNights: 2,
  typicalPace: 'active',
  coverImage: cover,
  gallery: [
    { ...cover, isCover: true },
    emptyImage(photos.hotelSigiriya, { id: 'img-sig-g2', caption: 'Stay nearby', sortOrder: 1 }),
    emptyImage(photos.tea, { id: 'img-sig-g3', caption: 'Countryside around Sigiriya', sortOrder: 2 }),
    emptyImage(photos.temple, { id: 'img-sig-g4', caption: 'Cultural sites nearby', sortOrder: 3 }),
  ],
  climate: {
    averageHighC: 30,
    averageLowC: 22,
    climateType: 'dry',
    note: 'Warm and dry during the main travel season, with cooler evenings during some months.',
  },
  airportConnections: [
    {
      id: 'air-sig-cmb',
      airportCode: 'CMB',
      airportName: 'Bandaranaike International Airport (CMB)',
      distanceKm: 150,
      travelHours: 3,
      travelMinutes: 30,
      transportType: 'private_car',
      note: 'Travel time may vary depending on Colombo traffic.',
    },
  ],
  destinationConnections: [kandyConn, nuwaraConn],
  activityIds: ['act-sigiriya-rock', 'act-village'],
  itineraryPoints: [morningPoint, afternoonPoint, eveningPoint],
  travellerTips: tips,
  status: 'active',
  createdAt: '2026-09-01T08:00:00.000Z',
  updatedAt: '2026-09-14T10:00:00.000Z',
}

export const sampleKandy: Destination = {
  id: 'dest-kandy',
  name: 'Kandy',
  province: 'Central Province',
  district: 'Kandy',
  shortDescription:
    'Kandy is Sri Lanka’s cultural capital, set around a lake and home to the Temple of the Sacred Tooth Relic.',
  experienceTypes: ['Culture', 'Heritage', 'Religious'],
  bestVisitMonths: [1, 2, 3, 4, 7, 8],
  visitType: 'overnight',
  minimumNights: 1,
  idealNights: 2,
  typicalPace: 'moderate',
  coverImage: emptyImage(photos.kandy, { id: 'img-kandy-cover', isCover: true }),
  gallery: [emptyImage(photos.kandy, { id: 'img-kandy-g1' }), emptyImage(photos.temple, { id: 'img-kandy-g2', sortOrder: 1 })],
  climate: { averageHighC: 28, averageLowC: 20, climateType: 'hill_country' },
  airportConnections: [
    {
      id: 'air-kandy-cmb',
      airportCode: 'CMB',
      airportName: 'Bandaranaike International Airport (CMB)',
      distanceKm: 115,
      travelHours: 3,
      travelMinutes: 0,
      transportType: 'private_car',
    },
  ],
  destinationConnections: [
    {
      id: 'conn-kandy-sig',
      destinationId: 'dest-sigiriya',
      destinationName: 'Sigiriya',
      distanceKm: 90,
      travelHours: 2,
      travelMinutes: 30,
      transportType: 'road',
      note: 'Scenic road through Matale.',
      bidirectional: true,
    },
  ],
  activityIds: [],
  itineraryPoints: [],
  travellerTips: [],
  status: 'active',
  createdAt: '2026-08-20T08:00:00.000Z',
  updatedAt: '2026-09-10T09:00:00.000Z',
}

export const sampleNuwara: Destination = {
  id: 'dest-nuwara',
  name: 'Nuwara Eliya',
  province: 'Central Province',
  district: 'Nuwara Eliya',
  shortDescription: 'A cool hill-country town of tea estates, colonial architecture and misty mornings.',
  experienceTypes: ['Tea Country', 'Nature', 'Photography'],
  bestVisitMonths: [1, 2, 3, 4, 12],
  visitType: 'overnight',
  minimumNights: 1,
  idealNights: 2,
  typicalPace: 'relaxed',
  coverImage: emptyImage(photos.tea, { id: 'img-nuwara-cover', isCover: true }),
  gallery: [],
  climate: { averageHighC: 20, averageLowC: 12, climateType: 'hill_country' },
  airportConnections: [
    {
      id: 'air-nuwara-cmb',
      airportCode: 'CMB',
      airportName: 'Bandaranaike International Airport (CMB)',
      distanceKm: 180,
      travelHours: 5,
      travelMinutes: 0,
      transportType: 'private_car',
    },
  ],
  destinationConnections: [
    {
      id: 'conn-nuwara-sig',
      destinationId: 'dest-sigiriya',
      destinationName: 'Sigiriya',
      distanceKm: 155,
      travelHours: 4,
      travelMinutes: 0,
      transportType: 'road',
      bidirectional: true,
    },
  ],
  activityIds: [],
  itineraryPoints: [],
  travellerTips: [],
  status: 'draft',
  createdAt: '2026-09-05T08:00:00.000Z',
  updatedAt: '2026-09-12T09:00:00.000Z',
}

export const sampleMirissa: Destination = {
  id: 'dest-mirissa',
  name: 'Mirissa',
  province: 'Southern Province',
  district: 'Matara',
  shortDescription: 'A south-coast beach town known for whale watching, surfing and relaxed seaside evenings.',
  experienceTypes: ['Beach', 'Water Sports', 'Honeymoon'],
  bestVisitMonths: [11, 12, 1, 2, 3, 4],
  visitType: 'overnight',
  minimumNights: 2,
  idealNights: 3,
  typicalPace: 'relaxed',
  coverImage: emptyImage(photos.mirissa, { id: 'img-mirissa-cover', isCover: true }),
  gallery: [emptyImage(photos.beach, { id: 'img-mirissa-g1' })],
  climate: { averageHighC: 31, averageLowC: 25, climateType: 'coastal' },
  airportConnections: [
    {
      id: 'air-mirissa-cmb',
      airportCode: 'CMB',
      airportName: 'Bandaranaike International Airport (CMB)',
      distanceKm: 170,
      travelHours: 3,
      travelMinutes: 30,
      transportType: 'private_car',
    },
  ],
  destinationConnections: [],
  activityIds: [],
  itineraryPoints: [],
  travellerTips: [],
  status: 'draft',
  createdAt: '2026-09-08T08:00:00.000Z',
  updatedAt: '2026-09-13T09:00:00.000Z',
}

export const sampleDestinations: Destination[] = [sampleSigiriya, sampleKandy, sampleNuwara, sampleMirissa]
