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
import { costingFromTrip, emptyCosting, sampleCosting } from '../data/costing-sample'
import { calendarDays, nightsBetween } from '../lib/dates'
import { uid } from '../lib/ids'
import type { Costing } from '../types/costing'
import type { SaveStatus, Trip } from '../types/itinerary'

const KEY = 'travelbuilding.costing.v2'

type Ctx = {
  costings: Costing[]
  active: Costing
  saveStatus: SaveStatus
  setActiveId: (id: string) => void
  patchActive: (patch: Partial<Costing>) => void
  addCosting: (seed?: Costing) => Costing
  duplicateActive: () => Costing
  removeCosting: (id: string) => void
  createFromTrip: (trip: Trip) => Costing
}

const CostingContext = createContext<Ctx | null>(null)

function loadAll(): Costing[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Costing[]
      if (Array.isArray(parsed) && parsed.length) return parsed
    }
  } catch {
    /* ignore */
  }
  return [sampleCosting]
}

function withDates(c: Costing, arrival: string, departure: string): Costing {
  const nights = nightsBetween(arrival, departure)
  const tripDays = calendarDays(arrival, departure)
  const syncDriver = c.chargeableDriverDays === c.nights
  const syncGuide = c.chargeableGuideDays === c.nights
  return {
    ...c,
    arrivalDate: arrival,
    departureDate: departure,
    nights,
    tripDays,
    chargeableDriverDays: syncDriver ? nights : c.chargeableDriverDays,
    chargeableGuideDays: syncGuide ? nights : c.chargeableGuideDays,
    driverGuide: {
      ...c.driverGuide,
      driverDays: syncDriver ? nights : c.driverGuide.driverDays,
      guideDays: syncGuide ? nights : c.driverGuide.guideDays,
    },
  }
}

export function CostingProvider({ children }: { children: ReactNode }) {
  const [costings, setCostings] = useState<Costing[]>(loadAll)
  const [activeId, setActiveId] = useState<string>(() => loadAll()[0]?.id ?? sampleCosting.id)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const timer = useRef<number | null>(null)

  const active = costings.find((c) => c.id === activeId) ?? costings[0] ?? sampleCosting

  useEffect(() => {
    setSaveStatus('saving')
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      localStorage.setItem(KEY, JSON.stringify(costings))
      setSaveStatus('saved')
    }, 600)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [costings])

  const patchActive = useCallback(
    (patch: Partial<Costing>) => {
      setCostings((prev) => {
        const current = prev.find((c) => c.id === activeId) ?? prev[0]
        if (!current) return prev
        let next = { ...current, ...patch }
        if (patch.arrivalDate || patch.departureDate) {
          next = withDates(next, next.arrivalDate, next.departureDate)
        }
        if (patch.chargeableDriverDays != null) {
          next = {
            ...next,
            driverGuide: { ...next.driverGuide, driverDays: patch.chargeableDriverDays },
          }
        }
        if (patch.chargeableGuideDays != null) {
          next = {
            ...next,
            driverGuide: { ...next.driverGuide, guideDays: patch.chargeableGuideDays },
          }
        }
        const stamped = { ...next, updatedAt: new Date().toISOString() }
        const i = prev.findIndex((c) => c.id === current.id)
        if (i < 0) return [...prev, stamped]
        const copy = [...prev]
        copy[i] = stamped
        return copy
      })
    },
    [activeId],
  )

  const addCosting = useCallback(
    (seed?: Costing) => {
      const created = seed ?? emptyCosting()
      setCostings((prev) => [...prev, created])
      setActiveId(created.id)
      return created
    },
    [],
  )

  const duplicateActive = useCallback(() => {
    const copy: Costing = {
      ...structuredClone(active),
      id: uid('cost'),
      referenceNo: active.referenceNo ? `${active.referenceNo}-COPY` : '',
      status: 'draft',
    }
    setCostings((prev) => [...prev, copy])
    setActiveId(copy.id)
    return copy
  }, [active])

  const removeCosting = useCallback((id: string) => {
    setCostings((prev) => {
      const next = prev.filter((c) => c.id !== id)
      return next.length ? next : [emptyCosting()]
    })
  }, [])

  const createFromTrip = useCallback(
    (trip: Trip) => {
      const created = costingFromTrip(trip)
      setCostings((prev) => [...prev, created])
      setActiveId(created.id)
      return created
    },
    [],
  )

  const value = useMemo(
    () => ({
      costings,
      active,
      saveStatus,
      setActiveId,
      patchActive,
      addCosting,
      duplicateActive,
      removeCosting,
      createFromTrip,
    }),
    [costings, active, saveStatus, patchActive, addCosting, duplicateActive, removeCosting, createFromTrip],
  )

  return <CostingContext.Provider value={value}>{children}</CostingContext.Provider>
}

export function useCosting() {
  const ctx = useContext(CostingContext)
  if (!ctx) throw new Error('useCosting must be used within provider')
  return ctx
}
