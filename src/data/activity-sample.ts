import { photos } from './images'
import type { ActivityRecord } from '../types/activity'
import { emptyActivity, newRoute } from '../lib/activity'

const now = '2026-09-14T10:00:00.000Z'

function demo(partial: Partial<ActivityRecord> & Pick<ActivityRecord, 'id' | 'name'>): ActivityRecord {
  return emptyActivity({
    status: 'active',
    rateSource: 'demo',
    createdAt: now,
    updatedAt: now,
    ...partial,
  })
}

export const sampleActivities: ActivityRecord[] = [
  demo({
    id: 'act-sigiriya-rock',
    name: 'Sigiriya Rock Fortress',
    locationId: 'dest-sigiriya',
    locationName: 'Sigiriya',
    type: 'within_destination',
    adultRateUsd: 30,
    childRateUsd: 0,
    description: 'Explore the ancient Sigiriya Rock Fortress and its historic gardens, frescoes and panoramic viewpoints. Demo entrance rates from the existing prototype library — not a verified live fee.',
    categories: ['Culture', 'Heritage', 'History'],
    image: { id: 'img-act-rock', url: photos.sigiriya },
    durationMinutes: 150,
    recommendedTimes: ['Morning'],
    difficulty: 'moderate',
    suitableFor: ['Solo Travellers', 'Couples', 'Families', 'Groups'],
    whatToBring: ['Comfortable shoes', 'Water', 'Sun protection'],
    bookingRequired: true,
    entranceTicketRequired: true,
  }),
  demo({
    id: 'act-village',
    name: 'Village Experience',
    locationId: 'dest-sigiriya',
    locationName: 'Sigiriya',
    type: 'within_destination',
    adultRateUsd: 10,
    childRateUsd: 0,
    description: 'A traditional village visit with local crafts, a bullock cart ride and a simple countryside meal. Demo rate from the existing prototype library.',
    categories: ['Local Experience'],
    image: { id: 'img-act-village', url: photos.tea },
    durationMinutes: 240,
    recommendedTimes: ['Afternoon'],
    difficulty: 'easy',
    suitableFor: ['Couples', 'Families', 'Groups'],
  }),
  demo({
    id: 'act-pinnawala',
    name: 'Pinnawala',
    locationName: 'Pinnawala',
    type: 'en_route',
    applicableRoutes: [
      newRoute({ id: 'route-pin-kandy', fromLocationId: 'loc-bia', fromLocationName: 'Airport / BIA', toLocationId: 'dest-kandy', toLocationName: 'Kandy' }),
      newRoute({ id: 'route-pin-sig', fromLocationId: 'loc-bia', fromLocationName: 'Airport / BIA', toLocationId: 'dest-sigiriya', toLocationName: 'Sigiriya' }),
    ],
    adultRateUsd: 0,
    childRateUsd: 0,
    description: 'Elephant orphanage stop between the airport and the cultural triangle. No approved entrance rate is stored yet, so both fees are 0.',
    categories: ['Wildlife', 'Nature'],
    image: { id: 'img-act-pin', url: photos.tea },
  }),
  demo({
    id: 'act-tooth',
    name: 'Temple of the Tooth',
    locationId: 'dest-kandy',
    locationName: 'Kandy',
    type: 'within_destination',
    adultRateUsd: 12,
    childRateUsd: 0,
    description: 'Visit the Temple of the Sacred Tooth Relic in Kandy. Adult figure is a demo rate from the existing costing library.',
    categories: ['Religious', 'Culture', 'Heritage'],
    durationMinutes: 90,
    recommendedTimes: ['Morning'],
    difficulty: 'easy',
    entranceTicketRequired: true,
  }),
  demo({
    id: 'act-botanical',
    name: 'Royal Botanical Garden',
    locationId: 'dest-kandy',
    locationName: 'Kandy',
    type: 'within_destination',
    adultRateUsd: 12,
    childRateUsd: 0,
    description: 'Peradeniya gardens. Adult figure is a demo rate from the existing costing library.',
    categories: ['Nature'],
    durationMinutes: 120,
    recommendedTimes: ['Afternoon'],
    difficulty: 'easy',
  }),
  demo({
    id: 'act-dance',
    name: 'Kandyan Cultural Show',
    locationId: 'dest-kandy',
    locationName: 'Kandy',
    type: 'within_destination',
    adultRateUsd: 5,
    childRateUsd: 0,
    description: 'Evening Kandyan dance performance. Adult figure is a demo rate from the existing costing library.',
    categories: ['Culture', 'Entertainment'],
    durationMinutes: 60,
    recommendedTimes: ['Evening'],
    difficulty: 'easy',
  }),
]

export { emptyActivity }
