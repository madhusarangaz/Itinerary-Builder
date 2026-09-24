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
import { emptyHotel, sampleHotels } from '../data/hotel-sample'
import { uid } from '../lib/ids'
import type { HotelRecord } from '../types/hotel'
import type { SaveStatus } from '../types/itinerary'

const KEY = 'travelbuilding.hotel-master.v1'

type Ctx = {
  hotels: HotelRecord[]
  active: HotelRecord
  saveStatus: SaveStatus
  setActiveId: (id: string) => void
  patchActive: (patch: Partial<HotelRecord>) => void
  addHotel: (seed?: HotelRecord) => HotelRecord
  duplicateHotel: (id: string) => HotelRecord
  archiveHotel: (id: string) => void
  removeHotel: (id: string) => void
}

const HotelContext = createContext<Ctx | null>(null)

function loadAll(): HotelRecord[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as HotelRecord[]
      if (Array.isArray(parsed) && parsed.length) return parsed
    }
  } catch {
    /* ignore */
  }
  return sampleHotels
}

export function HotelMasterProvider({ children }: { children: ReactNode }) {
  const [hotels, setHotels] = useState<HotelRecord[]>(loadAll)
  const [activeId, setActiveId] = useState(() => loadAll()[0]?.id ?? sampleHotels[0].id)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const timer = useRef<number | null>(null)
  const active = hotels.find((h) => h.id === activeId) ?? hotels[0] ?? emptyHotel()

  useEffect(() => {
    setSaveStatus('saving')
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      localStorage.setItem(KEY, JSON.stringify(hotels))
      setSaveStatus('saved')
    }, 600)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [hotels])

  const patchActive = useCallback(
    (patch: Partial<HotelRecord>) => {
      setHotels((prev) =>
        prev.map((row) => (row.id === activeId ? { ...row, ...patch, updatedAt: new Date().toISOString() } : row)),
      )
    },
    [activeId],
  )

  const addHotel = useCallback((seed?: HotelRecord) => {
    const created = seed ?? emptyHotel()
    setHotels((prev) => [created, ...prev])
    setActiveId(created.id)
    return created
  }, [])

  const duplicateHotel = useCallback(
    (id: string) => {
      const source = hotels.find((h) => h.id === id) ?? emptyHotel()
      const copy: HotelRecord = {
        ...structuredClone(source),
        id: uid('hotel'),
        name: source.name ? `${source.name} copy` : '',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rooms: source.rooms.map((room) => ({ ...room, id: uid('room') })),
        contacts: {
          sales: source.contacts.sales.map((c) => ({ ...c, id: uid('ctc') })),
          reservations: source.contacts.reservations.map((c) => ({ ...c, id: uid('ctc') })),
        },
        images: source.images.map((img) => ({ ...img, id: uid('img') })),
      }
      setHotels((prev) => [copy, ...prev])
      setActiveId(copy.id)
      return copy
    },
    [hotels],
  )

  const archiveHotel = useCallback((id: string) => {
    setHotels((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, status: row.status === 'inactive' ? 'draft' : 'inactive', updatedAt: new Date().toISOString() }
          : row,
      ),
    )
  }, [])

  const removeHotel = useCallback((id: string) => {
    setHotels((prev) => prev.filter((row) => row.id !== id))
    setActiveId((current) => (current === id ? '' : current))
  }, [])

  const value = useMemo(
    () => ({ hotels, active, saveStatus, setActiveId, patchActive, addHotel, duplicateHotel, archiveHotel, removeHotel }),
    [hotels, active, saveStatus, patchActive, addHotel, duplicateHotel, archiveHotel, removeHotel],
  )

  return <HotelContext.Provider value={value}>{children}</HotelContext.Provider>
}

export function useHotelMaster() {
  const ctx = useContext(HotelContext)
  if (!ctx) throw new Error('useHotelMaster must be used within provider')
  return ctx
}
