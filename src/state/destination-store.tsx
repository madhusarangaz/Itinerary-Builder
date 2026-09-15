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
import { emptyDestination, sampleDestinations } from '../data/destination-sample'
import { uid } from '../lib/ids'
import type { Destination, DestinationConnection } from '../types/destination'
import type { SaveStatus } from '../types/itinerary'

const KEY = 'travelbuilding.destinations.v1'

type Ctx = {
  destinations: Destination[]
  active: Destination
  saveStatus: SaveStatus
  setActiveId: (id: string) => void
  patchActive: (patch: Partial<Destination>) => void
  addDestination: (seed?: Destination) => Destination
  duplicateActive: () => Destination
  duplicateDestination: (id: string) => Destination
  archiveDestination: (id: string) => void
}

const DestinationContext = createContext<Ctx | null>(null)

function loadAll(): Destination[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Destination[]
      if (Array.isArray(parsed) && parsed.length) return parsed
    }
  } catch {
    /* ignore */
  }
  return sampleDestinations
}

function reverseConnection(source: Destination, conn: DestinationConnection): DestinationConnection {
  return {
    ...conn,
    id: uid('conn'),
    destinationId: source.id,
    destinationName: source.name || 'Untitled destination',
  }
}

/** Keep bidirectional pairs in sync without requiring a second manual entry. */
function syncBidirectional(list: Destination[], source: Destination): Destination[] {
  return list.map((dest) => {
    if (dest.id === source.id) return source
    const wanted = source.destinationConnections.filter((c) => c.bidirectional && c.destinationId === dest.id)
    let next = dest.destinationConnections.filter((c) => c.destinationId !== source.id || !c.bidirectional)
    wanted.forEach((conn) => {
      const existing = dest.destinationConnections.find((c) => c.destinationId === source.id)
      if (existing) {
        next = next.map((c) =>
          c.destinationId === source.id
            ? {
                ...c,
                destinationName: source.name || c.destinationName,
                distanceKm: conn.distanceKm,
                travelHours: conn.travelHours,
                travelMinutes: conn.travelMinutes,
                transportType: conn.transportType,
                bidirectional: true,
              }
            : c,
        )
      } else {
        next = [...next, reverseConnection(source, conn)]
      }
    })
    if (next === dest.destinationConnections) return dest
    return { ...dest, destinationConnections: next, updatedAt: new Date().toISOString() }
  })
}

export function DestinationProvider({ children }: { children: ReactNode }) {
  const [destinations, setDestinations] = useState<Destination[]>(loadAll)
  const [activeId, setActiveId] = useState<string>(() => loadAll()[0]?.id ?? sampleDestinations[0].id)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const timer = useRef<number | null>(null)

  const active = destinations.find((d) => d.id === activeId) ?? destinations[0] ?? emptyDestination()

  useEffect(() => {
    setSaveStatus('saving')
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      localStorage.setItem(KEY, JSON.stringify(destinations))
      setSaveStatus('saved')
    }, 600)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [destinations])

  const patchActive = useCallback(
    (patch: Partial<Destination>) => {
      setDestinations((prev) => {
        const current = prev.find((d) => d.id === activeId) ?? prev[0]
        if (!current) return prev
        const stamped: Destination = { ...current, ...patch, updatedAt: new Date().toISOString() }
        return syncBidirectional(prev, stamped)
      })
    },
    [activeId],
  )

  const addDestination = useCallback((seed?: Destination) => {
    const created = seed ?? emptyDestination()
    setDestinations((prev) => [created, ...prev])
    setActiveId(created.id)
    return created
  }, [])

  const duplicateDestination = useCallback((id: string) => {
    const source = destinations.find((d) => d.id === id)
    const origin = source ?? emptyDestination()
    const copy: Destination = {
      ...structuredClone(origin),
      id: uid('dest'),
      name: origin.name ? `${origin.name} copy` : '',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activities: origin.activities.map((a) => ({ ...a, id: uid('act') })),
      itineraryPoints: origin.itineraryPoints.map((p) => ({ ...p, id: uid('pt') })),
      travellerTips: origin.travellerTips.map((t) => ({ ...t, id: uid('tip') })),
      destinationConnections: origin.destinationConnections.map((c) => ({ ...c, id: uid('conn') })),
      airportConnections: origin.airportConnections.map((c) => ({ ...c, id: uid('air') })),
      gallery: origin.gallery.map((g) => ({ ...g, id: uid('img') })),
      coverImage: origin.coverImage ? { ...origin.coverImage, id: uid('img') } : undefined,
    }
    setDestinations((prev) => [copy, ...prev])
    setActiveId(copy.id)
    return copy
  }, [destinations])

  const duplicateActive = useCallback(() => duplicateDestination(active.id), [active.id, duplicateDestination])

  const archiveDestination = useCallback((id: string) => {
    setDestinations((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status: d.status === 'archived' ? 'draft' : 'archived', updatedAt: new Date().toISOString() }
          : d,
      ),
    )
  }, [])

  const value = useMemo(
    () => ({
      destinations,
      active,
      saveStatus,
      setActiveId,
      patchActive,
      addDestination,
      duplicateActive,
      duplicateDestination,
      archiveDestination,
    }),
    [destinations, active, saveStatus, patchActive, addDestination, duplicateActive, duplicateDestination, archiveDestination],
  )

  return <DestinationContext.Provider value={value}>{children}</DestinationContext.Provider>
}

export function useDestinations() {
  const ctx = useContext(DestinationContext)
  if (!ctx) throw new Error('useDestinations must be used within provider')
  return ctx
}
