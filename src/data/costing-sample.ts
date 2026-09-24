import { uid } from '../lib/ids'
import { calendarDays, nightsBetween } from '../lib/dates'
import type { AccommodationCostRow, Costing, RoomCost } from '../types/costing'
import type { Trip } from '../types/itinerary'
import type { ActivityRecord } from '../types/activity'
import type { Transport } from '../types/transport'

function rooms(sgl: [number, number], dbl: [number, number], trpl: [number, number]): RoomCost[] {
  return [
    { id: uid('rm'), type: 'SGL', rate: sgl[0], quantity: sgl[1] },
    { id: uid('rm'), type: 'DBL', rate: dbl[0], quantity: dbl[1] },
    { id: uid('rm'), type: 'TRPL', rate: trpl[0], quantity: trpl[1] },
  ]
}

function stay(partial: Omit<AccommodationCostRow, 'rooms' | 'guideRoomRate'> & { rooms: RoomCost[]; guideRoomRate?: number }): AccommodationCostRow {
  return { guideRoomRate: 0, ...partial }
}

const arrival = '2026-08-18'
const departure = '2026-08-25'
const nights = nightsBetween(arrival, departure)
const days = calendarDays(arrival, departure)

export const TOUR_EXECUTIVES = ['N/A', 'Hiruni Shehara', 'Nimesh Perera', 'Shehara']

export const sampleCosting: Costing = {
  id: 'cost-idrees-2026',
  referenceNo: 'INQ-GB-26-102',
  itineraryId: 'trip-idrees-2026',
  status: 'draft',
  agentName: 'Shehara',
  clientName: 'Idrees',
  nationality: 'Pakistan',
  numberOfPeople: 5,
  arrivalDate: arrival,
  departureDate: departure,
  tripDays: days,
  nights,
  chargeableDriverDays: nights,
  chargeableGuideDays: nights,
  starCategory: '5 Star',
  tourExecutive: 'N/A',
  currency: 'USD',
  exchangeRate: 330,
  accommodation: [
    stay({
      id: 'cst-d1',
      date: '2026-08-18',
      dayNumber: 1,
      destinationName: 'Colombo',
      hotelName: 'Amari',
      starClass: '5 Star',
      mealPlan: 'HB',
      nights: 1,
      routeKm: 40,
      rooms: rooms([0, 0], [120, 1], [167, 1]),
    }),
    stay({
      id: 'cst-d2',
      date: '2026-08-19',
      dayNumber: 2,
      destinationName: 'Sigiriya',
      hotelName: 'Hidden Secret',
      starClass: '5 Star',
      mealPlan: 'HB',
      nights: 1,
      routeKm: 40,
      rooms: rooms([0, 0], [90, 1], [130, 1]),
    }),
    stay({
      id: 'cst-d3',
      date: '2026-08-20',
      dayNumber: 3,
      destinationName: 'Kandy',
      hotelName: 'Earls Regency',
      starClass: '5 Star',
      mealPlan: 'HB',
      nights: 1,
      routeKm: 40,
      rooms: rooms([0, 0], [125, 1], [175, 1]),
    }),
    stay({
      id: 'cst-d4',
      date: '2026-08-21',
      dayNumber: 4,
      destinationName: 'Nuwara Eliya',
      hotelName: 'Araliya Green City',
      starClass: '5 Star',
      mealPlan: 'HB',
      nights: 1,
      routeKm: 40,
      rooms: rooms([0, 0], [180, 1], [215, 1]),
    }),
    stay({
      id: 'cst-d5',
      date: '2026-08-22',
      dayNumber: 5,
      destinationName: 'Mirissa',
      hotelName: 'Weligama Bay Marriott',
      starClass: '5 Star',
      mealPlan: 'HB',
      nights: 1,
      routeKm: 80,
      rooms: rooms([0, 0], [225, 1], [295, 1]),
    }),
    stay({
      id: 'cst-d6',
      date: '2026-08-23',
      dayNumber: 6,
      destinationName: 'Mirissa',
      hotelName: 'Weligama Bay Marriott',
      starClass: '5 Star',
      mealPlan: 'HB',
      nights: 1,
      routeKm: 40,
      rooms: rooms([0, 0], [225, 1], [295, 1]),
    }),
    stay({
      id: 'cst-d7',
      date: '2026-08-24',
      dayNumber: 7,
      destinationName: 'Colombo',
      hotelName: 'Pegasus Reef',
      starClass: '4 Star',
      mealPlan: 'HB',
      nights: 1,
      routeKm: 40,
      rooms: rooms([0, 0], [65, 1], [90, 1]),
    }),
    stay({
      id: 'cst-d8',
      date: '2026-08-25',
      dayNumber: 8,
      destinationName: 'Departure',
      hotelName: '',
      starClass: '',
      mealPlan: '',
      nights: 0,
      routeKm: 0,
      rooms: rooms([0, 0], [0, 0], [0, 0]),
    }),
  ],
  transportation: {
    routeKm: 320,
    grossMileage: 780,
    extraMileage: 80,
    googleMapsLink: '',
    ratePerKmLKR: 120,
  },
  driverGuide: {
    driverCalculationMode: 'daily',
    driverBataPerDayLKR: 2500,
    driverDays: nights,
    driverManualTotalLKR: 18000,
    guideCalculationMode: 'daily',
    guideFeePerDayLKR: 0,
    guideDays: nights,
    guideManualTotalLKR: 0,
  },
  activities: [],
  additionalCosts: [
    { id: 'add-water', name: 'Water', cost: 6, notes: '' },
    { id: 'add-garlands', name: 'Garlands', cost: 6, notes: '' },
  ],
  pricing: {
    companyProfitPercent: 28.3,
    agentProfitPercent: 0,
    salesPersonProfitPercent: 0,
  },
  updatedAt: new Date().toISOString(),
}

export function emptyCosting(): Costing {
  const start = new Date().toISOString().slice(0, 10)
  return {
    id: uid('cost'),
    referenceNo: '',
    status: 'draft',
    agentName: '',
    clientName: '',
    nationality: '',
    numberOfPeople: 2,
    arrivalDate: start,
    departureDate: start,
    tripDays: 0,
    nights: 0,
    chargeableDriverDays: 0,
    chargeableGuideDays: 0,
    starCategory: '5 Star',
    tourExecutive: 'N/A',
    currency: 'USD',
    exchangeRate: 330,
    accommodation: [],
    transportation: {
      routeKm: 0,
      grossMileage: 0,
      extraMileage: 0,
      googleMapsLink: '',
      ratePerKmLKR: 120,
    },
    driverGuide: {
      driverCalculationMode: 'daily',
      driverBataPerDayLKR: 2500,
      driverDays: 0,
      guideCalculationMode: 'daily',
      guideFeePerDayLKR: 0,
      guideDays: 0,
    },
    activities: [],
    additionalCosts: [],
    pricing: {
      companyProfitPercent: 28.3,
      agentProfitPercent: 0,
      salesPersonProfitPercent: 0,
    },
    updatedAt: new Date().toISOString(),
  }
}

export function costingFromTrip(trip: Trip, extras?: { activities?: ActivityRecord[]; transport?: Transport | null }): Costing {
  const nights = nightsBetween(trip.startDate, trip.endDate)
  const tripDays = calendarDays(trip.startDate, trip.endDate)
  const stayByDest = new Map(trip.accommodations.map((a) => [a.destination.trim().toLowerCase(), a]))
  const accommodation: AccommodationCostRow[] = trip.days.map((day, i) => {
    const isLast = i === trip.days.length - 1
    const stay = stayByDest.get(day.destination.trim().toLowerCase())
    const hotelName = day.hotelName || stay?.hotelName || ''
    const departure = /depart/i.test(day.destination) || isLast && !hotelName
    return {
      id: uid('cst'),
      date: day.date,
      dayNumber: day.dayNumber,
      destinationName: day.destination,
      hotelId: stay?.hotelId,
      hotelName: departure ? '' : hotelName,
      starClass: stay ? `${stay.starCategory} Star` : trip.accommodations[0] ? '5 Star' : '',
      mealPlan: stay?.mealPlan || (departure ? '' : 'HB'),
      nights: departure ? 0 : 1,
      routeKm: departure ? 0 : 40,
      roomType: stay?.roomCategoryName,
      rooms: stay?.roomCategoryName
        ? [{ id: uid('rm'), type: 'CUSTOM' as const, label: stay.roomCategoryName, rate: 0, quantity: 1 }]
        : rooms([0, 0], [0, 1], [0, 0]),
      guideRoomRate: 0,
    }
  })
  const activityRows = trip.days.flatMap((day) =>
    day.activities
      .filter((item) => item.type === 'activity' && item.title.trim())
      .map((item) => {
        const master = extras?.activities?.find((row) => row.id === item.activityId)
        const optional = item.status === 'optional'
        return {
          id: uid('ac'),
          activityId: item.activityId,
          name: item.title,
          destinationName: day.destination,
          costPerPerson: master?.adultRateUsd ?? 0,
          quantity: optional ? 0 : trip.adults || 1,
          adultQty: optional ? 0 : trip.adults || 1,
          childQty: optional ? 0 : trip.children || 0,
          masterAdultRate: master?.adultRateUsd ?? 0,
          masterChildRate: master?.childRateUsd ?? 0,
          notes: optional ? 'Optional — not in the base package until a quantity is entered.' : item.status === 'extra' ? 'Additional cost' : undefined,
        }
      }),
  )
  const transport = extras?.transport
  const perKm = transport?.costing.perKmRate
  const base = emptyCosting()
  return {
    ...base,
    referenceNo: trip.tourId || '',
    itineraryId: trip.id,
    clientName: trip.customer,
    nationality: trip.country,
    numberOfPeople: trip.adults || trip.pricing.travellerCount || 1,
    arrivalDate: trip.startDate,
    departureDate: trip.endDate,
    tripDays,
    nights,
    chargeableDriverDays: nights,
    chargeableGuideDays: nights,
    currency: trip.pricing.currency,
    accommodation,
    activities: activityRows,
    transportation: {
      ...base.transportation,
      transportId: trip.transportId,
      transportName: trip.transportName,
      supplierId: trip.supplierId,
      supplierName: trip.supplierName,
      ratePerKmLKR: perKm ?? base.transportation.ratePerKmLKR,
      masterRatePerKmLKR: perKm,
    },
    driverGuide: {
      ...base.driverGuide,
      driverDays: nights,
      guideDays: nights,
    },
  }
}
