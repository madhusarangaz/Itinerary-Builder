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
import { emptyTransport, sampleTransports } from '../data/transport-sample'
import { uid } from '../lib/ids'
import type { SaveStatus } from '../types/itinerary'
import type { Transport } from '../types/transport'

const KEY = 'travelbuilding.transport.v1'

type Ctx = {
  transports: Transport[]
  active: Transport
  saveStatus: SaveStatus
  setActiveId: (id: string) => void
  patchActive: (patch: Partial<Transport>) => void
  addTransport: (seed?: Transport) => Transport
  duplicateTransport: (id: string) => Transport
  archiveTransport: (id: string) => void
  removeTransport: (id: string) => void
}

const TransportContext = createContext<Ctx | null>(null)

function loadAll(): Transport[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Transport[]
      if (Array.isArray(parsed) && parsed.length) return parsed
    }
  } catch {
    /* ignore */
  }
  return sampleTransports
}

export function TransportProvider({ children }: { children: ReactNode }) {
  const [transports, setTransports] = useState<Transport[]>(loadAll)
  const [activeId, setActiveId] = useState<string>(() => loadAll()[0]?.id ?? sampleTransports[0].id)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const timer = useRef<number | null>(null)

  const active = transports.find((t) => t.id === activeId) ?? transports[0] ?? emptyTransport()

  useEffect(() => {
    setSaveStatus('saving')
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      localStorage.setItem(KEY, JSON.stringify(transports))
      setSaveStatus('saved')
    }, 600)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [transports])

  const patchActive = useCallback(
    (patch: Partial<Transport>) => {
      setTransports((prev) =>
        prev.map((row) => (row.id === activeId ? { ...row, ...patch, updatedAt: new Date().toISOString() } : row)),
      )
    },
    [activeId],
  )

  const addTransport = useCallback((seed?: Transport) => {
    const created = seed ?? emptyTransport()
    setTransports((prev) => [created, ...prev])
    setActiveId(created.id)
    return created
  }, [])

  const duplicateTransport = useCallback((id: string) => {
    const source = transports.find((t) => t.id === id) ?? emptyTransport()
    const copy: Transport = {
      ...structuredClone(source),
      id: uid('tr'),
      displayName: source.displayName ? `${source.displayName} copy` : '',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      models: source.models.map((m) => ({ ...m, id: uid('tm') })),
      images: {
        front: source.images.front ? { ...source.images.front, id: uid('img') } : undefined,
        interior: source.images.interior ? { ...source.images.interior, id: uid('img') } : undefined,
        side: source.images.side ? { ...source.images.side, id: uid('img') } : undefined,
        luggage: source.images.luggage ? { ...source.images.luggage, id: uid('img') } : undefined,
      },
    }
    setTransports((prev) => [copy, ...prev])
    setActiveId(copy.id)
    return copy
  }, [transports])

  const archiveTransport = useCallback((id: string) => {
    setTransports((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              status: row.status === 'inactive' ? 'draft' : 'inactive',
              updatedAt: new Date().toISOString(),
            }
          : row,
      ),
    )
  }, [])

  const removeTransport = useCallback((id: string) => {
    setTransports((prev) => prev.filter((row) => row.id !== id))
    setActiveId((current) => (current === id ? '' : current))
  }, [])

  const value = useMemo(
    () => ({
      transports,
      active,
      saveStatus,
      setActiveId,
      patchActive,
      addTransport,
      duplicateTransport,
      archiveTransport,
      removeTransport,
    }),
    [transports, active, saveStatus, patchActive, addTransport, duplicateTransport, archiveTransport, removeTransport],
  )

  return <TransportContext.Provider value={value}>{children}</TransportContext.Provider>
}

export function useTransport() {
  const ctx = useContext(TransportContext)
  if (!ctx) throw new Error('useTransport must be used within provider')
  return ctx
}
