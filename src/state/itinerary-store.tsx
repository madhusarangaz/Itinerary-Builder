import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { blankTrip, catalogTrips, defaultHotels, sampleTrip } from '../data/sample-trip'
import { addDays, nightsBetween } from '../lib/dates'
import { alignedNightCount, applyJourneyDays, assignStayDays, redateDays, syncStays } from '../lib/journey'
import { activityOpsFilled, travellerFilled } from '../lib/day-glance'
import { uid } from '../lib/ids'
import type {
  Accommodation,
  StayChoice,
  Activity,
  ActivityType,
  Day,
  Hotel,
  SaveStatus,
  Trip,
} from '../types/itinerary'

const TRIP_KEY = 'travelbuilding.trip.v3'
const TRIPS_KEY = 'travelbuilding.trips.v1'
const HOTEL_KEY = 'travelbuilding.hotels.v3'

type Library = { trips: Trip[]; activeId: string }

type Action =
  | { type: 'replace'; trip: Trip }
  | { type: 'patch'; patch: Partial<Trip> }
  | { type: 'setDays'; days: Day[] }

function reducer(state: Trip, action: Action): Trip {
  const next =
    action.type === 'replace'
      ? action.trip
      : action.type === 'setDays'
        ? { ...state, days: action.days }
        : { ...state, ...action.patch }
  return { ...next, nights: nightsBetween(next.startDate, next.endDate), updatedAt: new Date().toISOString() }
}

function hydrateSampleOps(saved: Trip): Trip {
  if (saved.id !== sampleTrip.id) return saved
  return {
    ...saved,
    days: saved.days.map((d) => {
      const sample = sampleTrip.days.find((s) => s.id === d.id)
      if (!sample || travellerFilled(d)) return d
      return {
        ...d,
        travel: d.travel ?? sample.travel,
        hotelName: d.hotelName ?? sample.hotelName,
        meals: d.meals ?? sample.meals,
        tip: d.tip ?? sample.tip,
        pickup: d.pickup ?? sample.pickup,
        activities: d.activities.map((a) => {
          const sa = sample.activities.find((x) => x.id === a.id)
          if (!sa || activityOpsFilled(a)) return a
          return {
            ...a,
            time: a.time ?? sa.time,
            status: a.status ?? sa.status,
            notes: a.notes ?? sa.notes,
            extraCost: a.extraCost ?? sa.extraCost,
            bookingRef: a.bookingRef ?? sa.bookingRef,
            meetingPoint: a.meetingPoint ?? sa.meetingPoint,
          }
        }),
      }
    }),
  }
}

function loadTrip(): Trip {
  try {
    const raw = localStorage.getItem(TRIP_KEY)
    if (raw) return hydrateSampleOps({ ...sampleTrip, ...JSON.parse(raw) })
  } catch {
    /* ignore */
  }
  return sampleTrip
}

function loadLibrary(): Library {
  try {
    const raw = localStorage.getItem(TRIPS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Library>
      if (Array.isArray(parsed.trips)) {
        const trips = parsed.trips.map((trip) => normalizeTrip(trip))
        const activeId = trips.some((trip) => trip.id === parsed.activeId) ? parsed.activeId! : trips[0]?.id ?? ''
        return { trips, activeId }
      }
    }
  } catch {
    /* ignore */
  }
  const current = loadTrip()
  const extras = catalogTrips.filter((trip) => trip.id !== current.id && trip.tourId !== current.tourId)
  return { trips: [current, ...extras], activeId: current.id }
}

function normalizeTrip(trip: Trip): Trip {
  if (trip.id === sampleTrip.id) return hydrateSampleOps({ ...sampleTrip, ...trip })
  return hydrateSampleOps(trip)
}

function loadHotels(): Hotel[] {
  try {
    const raw = localStorage.getItem(HOTEL_KEY)
    if (raw) return JSON.parse(raw) as Hotel[]
  } catch {
    /* ignore */
  }
  return defaultHotels
}

type Ctx = {
  trip: Trip
  trips: Trip[]
  hotels: Hotel[]
  saveStatus: SaveStatus
  patch: (patch: Partial<Trip>) => void
  createItinerary: () => string
  openItinerary: (id: string) => void
  removeItinerary: (id: string) => void
  saveNow: () => void
  setDays: (days: Day[]) => void
  updateDay: (id: string, patch: Partial<Day>) => void
  addDay: () => void
  duplicateDay: (id: string) => void
  removeDay: (id: string) => void
  addActivity: (dayId: string, type: ActivityType) => void
  addFromMaster: (dayId: string, source: { activityId: string; title: string; description: string }) => void
  updateActivity: (dayId: string, activityId: string, patch: Partial<Activity>) => void
  removeActivity: (dayId: string, activityId: string) => void
  reorderActivities: (dayId: string, activities: Activity[]) => void
  addSubActivity: (dayId: string, activityId: string) => void
  updateAccommodation: (id: string, patch: Partial<Accommodation>) => void
  setStayDestination: (id: string, destination: string, destinationId?: string, hotel?: Partial<Accommodation>, choice?: StayChoice) => void
  addAccommodation: () => void
  removeAccommodation: (id: string) => void
  addHotel: (hotel: Omit<Hotel, 'id'> & { id?: string }) => Hotel
  resetSample: () => void
}

const ItineraryContext = createContext<Ctx | null>(null)

export function ItineraryProvider({ children }: { children: ReactNode }) {
  const [library, setLibrary] = useState<Library>(loadLibrary)
  const fallbackTrip = useRef<Trip>(blankTrip())
  const trip = library.trips.find((item) => item.id === library.activeId) ?? library.trips[0] ?? fallbackTrip.current
  const [hotels, setHotels] = useState<Hotel[]>(loadHotels)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const timer = useRef<number | null>(null)

  const dispatch = useCallback((action: Action) => {
    setLibrary((prev) => {
      const current = prev.trips.find((item) => item.id === prev.activeId) ?? prev.trips[0]
      if (!current) return prev
      const next = reducer(current, action)
      return { ...prev, trips: prev.trips.map((item) => (item.id === current.id ? next : item)) }
    })
  }, [])

  const writeLibrary = useCallback((next: Library, hotelList: Hotel[]) => {
    localStorage.setItem(TRIPS_KEY, JSON.stringify(next))
    const current = next.trips.find((item) => item.id === next.activeId)
    if (current) localStorage.setItem(TRIP_KEY, JSON.stringify(current))
    localStorage.setItem(HOTEL_KEY, JSON.stringify(hotelList))
  }, [])

  useEffect(() => {
    setSaveStatus('saving')
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      writeLibrary(library, hotels)
      setSaveStatus('saved')
    }, 600)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [library, hotels, writeLibrary])

  const patch = useCallback((p: Partial<Trip>) => {
    dispatch({ type: 'patch', patch: p })
  }, [dispatch])

  const createItinerary = useCallback(() => {
    const created = blankTrip()
    setLibrary((prev) => ({ activeId: created.id, trips: [created, ...prev.trips] }))
    return created.id
  }, [])

  const openItinerary = useCallback((id: string) => {
    setLibrary((prev) => (prev.trips.some((item) => item.id === id) ? { ...prev, activeId: id } : prev))
  }, [])

  const removeItinerary = useCallback((id: string) => {
    setLibrary((prev) => {
      const trips = prev.trips.filter((item) => item.id !== id)
      const activeId = trips.some((item) => item.id === prev.activeId) ? prev.activeId : trips[0]?.id ?? ''
      return { trips, activeId }
    })
  }, [])

  const saveNow = useCallback(() => {
    writeLibrary(library, hotels)
    setSaveStatus('saved')
  }, [hotels, library, writeLibrary])

  const setDays = useCallback((days: Day[]) => dispatch({ type: 'setDays', days }), [])

  const updateDay = useCallback(
    (id: string, p: Partial<Day>) => {
      const days = trip.days.map((d) => (d.id === id ? { ...d, ...p } : d))
      if ('destination' in p || 'destinationId' in p) {
        const nightCount = alignedNightCount(days.length, trip.startDate, trip.endDate)
        patch({ days, accommodations: syncStays(days, trip.accommodations, nightCount) })
        return
      }
      setDays(days)
    },
    [patch, setDays, trip.accommodations, trip.days, trip.endDate, trip.startDate],
  )

  const addDay = useCallback(() => {
    if (!trip.startDate) return
    const currentNights = Math.max(trip.days.length - 1, 0)
    const fromDates = trip.days.length === 0 ? nightsBetween(trip.startDate, trip.endDate) : 0
    const nightCount = trip.days.length === 0 ? Math.max(fromDates, 1) : currentNights + 1
    const days = applyJourneyDays(trip.days, trip.startDate, nightCount)
    patch({
      endDate: addDays(trip.startDate, nightCount),
      days,
      accommodations: syncStays(days, trip.accommodations, nightCount),
    })
  }, [patch, trip.accommodations, trip.days, trip.endDate, trip.startDate])

  const duplicateDay = useCallback(
    (id: string) => {
      const idx = trip.days.findIndex((d) => d.id === id)
      if (idx < 0 || !trip.startDate) return
      const source = trip.days[idx]
      const copy: Day = {
        ...structuredClone(source),
        id: uid('day'),
        activities: source.activities.map((a) => ({
          ...a,
          id: uid('act'),
          subActivities: a.subActivities.map((s) => ({ ...s, id: uid('sub') })),
        })),
      }
      const inserted = [...trip.days]
      inserted.splice(idx + 1, 0, copy)
      const days = redateDays(inserted, trip.startDate)
      const nightCount = Math.max(days.length - 1, 0)
      patch({
        endDate: addDays(trip.startDate, nightCount),
        days,
        accommodations: syncStays(days, trip.accommodations, nightCount),
      })
    },
    [patch, trip.accommodations, trip.days, trip.startDate],
  )

  const removeDay = useCallback(
    (id: string) => {
      if (!trip.startDate) return
      const days = redateDays(
        trip.days.filter((d) => d.id !== id),
        trip.startDate,
      )
      const nightCount = Math.max(days.length - 1, 0)
      patch({
        endDate: days.length ? addDays(trip.startDate, nightCount) : trip.endDate,
        days,
        accommodations: syncStays(days, trip.accommodations, nightCount),
      })
    },
    [patch, trip.accommodations, trip.days, trip.endDate, trip.startDate],
  )

  const addActivity = useCallback(
    (dayId: string, type: ActivityType) => {
      const labels: Record<ActivityType, string> = {
        activity: 'New activity',
        transfer: 'Transfer',
        meal: 'Meal',
        hotel: 'Hotel',
        note: 'Note',
      }
      updateDay(dayId, {
        activities: [
          ...(trip.days.find((d) => d.id === dayId)?.activities ?? []),
          {
            id: uid('act'),
            type,
            title: labels[type],
            description: '',
            subActivities: [],
            sortOrder: 99,
          },
        ].map((a, i) => ({ ...a, sortOrder: i })),
      })
    },
    [trip.days, updateDay],
  )

  const addFromMaster = useCallback(
    (dayId: string, source: { activityId: string; title: string; description: string }) => {
      const day = trip.days.find((d) => d.id === dayId)
      if (!day || day.activities.some((a) => a.activityId === source.activityId)) return
      updateDay(dayId, {
        activities: [
          ...day.activities,
          {
            id: uid('act'),
            type: 'activity' as const,
            title: source.title,
            description: source.description,
            activityId: source.activityId,
            status: 'included' as const,
            subActivities: [],
            sortOrder: day.activities.length,
          },
        ],
      })
    },
    [trip.days, updateDay],
  )

  const updateActivity = useCallback(
    (dayId: string, activityId: string, p: Partial<Activity>) => {
      const day = trip.days.find((d) => d.id === dayId)
      if (!day) return
      updateDay(dayId, {
        activities: day.activities.map((a) => (a.id === activityId ? { ...a, ...p } : a)),
      })
    },
    [trip.days, updateDay],
  )

  const removeActivity = useCallback(
    (dayId: string, activityId: string) => {
      const day = trip.days.find((d) => d.id === dayId)
      if (!day) return
      updateDay(dayId, { activities: day.activities.filter((a) => a.id !== activityId) })
    },
    [trip.days, updateDay],
  )

  const reorderActivities = useCallback(
    (dayId: string, activities: Activity[]) => {
      updateDay(dayId, { activities: activities.map((a, i) => ({ ...a, sortOrder: i })) })
    },
    [updateDay],
  )

  const addSubActivity = useCallback(
    (dayId: string, activityId: string) => {
      const day = trip.days.find((d) => d.id === dayId)
      const act = day?.activities.find((a) => a.id === activityId)
      if (!act) return
      updateActivity(dayId, activityId, {
        subActivities: [...act.subActivities, { id: uid('sub'), title: '' }],
      })
    },
    [trip.days, updateActivity],
  )

  const updateAccommodation = useCallback(
    (id: string, p: Partial<Accommodation>) => {
      patch({ accommodations: trip.accommodations.map((a) => (a.id === id ? { ...a, ...p } : a)) })
    },
    [patch, trip.accommodations],
  )

  const setStayDestination = useCallback(
    (id: string, destination: string, destinationId?: string, hotel?: Partial<Accommodation>, choice?: StayChoice) => {
      const nightCount = alignedNightCount(trip.days.length, trip.startDate, trip.endDate)
      const linked = assignStayDays(trip.days.slice(0, nightCount), trip.accommodations)
      const stay = linked.find((item) => item.id === id)
      if (!stay) return
      const ids = new Set(stay.dayIds ?? [])
      const days = trip.days.map((day) => (ids.has(day.id) ? { ...day, destination, destinationId } : day))
      let accommodations = syncStays(days, linked, nightCount)
      accommodations = accommodations.map((item) => {
        const linkedIds = item.dayIds ?? []
        const sameGroup = linkedIds.length === ids.size && linkedIds.every((dayId) => ids.has(dayId))
        if (!sameGroup) return item
        const choices = choice
          ? [...(item.choices ?? []).filter((row) => !(row.optionId === choice.optionId && row.dayId === choice.dayId)), choice]
          : item.choices
        return { ...item, ...(hotel ?? {}), destination, dayIds: item.dayIds, ...(choices ? { choices } : {}) }
      })
      patch({ days, accommodations })
    },
    [patch, trip.accommodations, trip.days, trip.endDate, trip.startDate],
  )

  const addAccommodation = useCallback(() => {
    addDay()
  }, [addDay])

  const removeAccommodation = useCallback(
    (id: string) => {
      if (!trip.startDate) return
      const nightCount = alignedNightCount(trip.days.length, trip.startDate, trip.endDate)
      const linked = assignStayDays(trip.days.slice(0, nightCount), trip.accommodations)
      const stay = linked.find((item) => item.id === id)
      const drop = new Set(stay?.dayIds ?? [])
      if (!drop.size) {
        patch({ accommodations: trip.accommodations.filter((item) => item.id !== id) })
        return
      }
      const days = redateDays(
        trip.days.filter((day) => !drop.has(day.id)),
        trip.startDate,
      )
      const nextNights = Math.max(days.length - 1, 0)
      patch({
        endDate: days.length ? addDays(trip.startDate, nextNights) : trip.endDate,
        days,
        accommodations: syncStays(
          days,
          linked.filter((item) => item.id !== id),
          nextNights,
        ),
      })
    },
    [patch, trip.accommodations, trip.days, trip.endDate, trip.startDate],
  )

  const addHotel = useCallback((hotel: Omit<Hotel, 'id'> & { id?: string }) => {
    const record: Hotel = { ...hotel, id: hotel.id ?? uid('htl') }
    setHotels((prev) => [...prev, record])
    return record
  }, [])

  const resetSample = useCallback(() => dispatch({ type: 'replace', trip: sampleTrip }), [dispatch])

  const value = useMemo(
    () => ({
      trip,
      trips: library.trips,
      hotels,
      saveStatus,
      patch,
      createItinerary,
      openItinerary,
      removeItinerary,
      saveNow,
      setDays,
      updateDay,
      addDay,
      duplicateDay,
      removeDay,
      addActivity,
      addFromMaster,
      updateActivity,
      removeActivity,
      reorderActivities,
      addSubActivity,
      updateAccommodation,
      setStayDestination,
      addAccommodation,
      removeAccommodation,
      addHotel,
      resetSample,
    }),
    [
      trip,
      library.trips,
      hotels,
      saveStatus,
      patch,
      createItinerary,
      openItinerary,
      removeItinerary,
      saveNow,
      setDays,
      updateDay,
      addDay,
      duplicateDay,
      removeDay,
      addActivity,
      addFromMaster,
      updateActivity,
      removeActivity,
      reorderActivities,
      addSubActivity,
      updateAccommodation,
      setStayDestination,
      addAccommodation,
      removeAccommodation,
      addHotel,
      resetSample,
    ],
  )

  return <ItineraryContext.Provider value={value}>{children}</ItineraryContext.Provider>
}

export function useItinerary() {
  const ctx = useContext(ItineraryContext)
  if (!ctx) throw new Error('useItinerary must be used within provider')
  return ctx
}

/** Guest/share view can render without throwing if the provider is mid-reload. */
export function useOptionalItinerary() {
  return useContext(ItineraryContext)
}

export function readStoredTrip(shareId?: string): Trip {
  const library = loadLibrary()
  if (shareId) {
    const match = library.trips.find((item) => item.shareId === shareId)
    if (match) return match
  }
  return library.trips.find((item) => item.id === library.activeId) ?? library.trips[0] ?? loadTrip()
}
