import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { emptySupplier, sampleSuppliers } from '../data/supplier-sample'
import type { Supplier } from '../types/supplier'
import type { SaveStatus } from '../types/itinerary'

const KEY = 'travelbuilding.suppliers.v1'

type Ctx = {
  suppliers: Supplier[]
  active: Supplier
  saveStatus: SaveStatus
  setActiveId: (id: string) => void
  patchActive: (patch: Partial<Supplier>) => void
  addSupplier: (seed?: Supplier) => Supplier
  archiveSupplier: (id: string) => void
  removeSupplier: (id: string) => void
}

const SupplierContext = createContext<Ctx | null>(null)

function loadAll(): Supplier[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Supplier[]
      if (Array.isArray(parsed) && parsed.length) return parsed
    }
  } catch {
    /* ignore */
  }
  return sampleSuppliers
}

export function SupplierProvider({ children }: { children: ReactNode }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(loadAll)
  const [activeId, setActiveId] = useState(() => loadAll()[0]?.id ?? sampleSuppliers[0].id)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const timer = useRef<number | null>(null)
  const active = suppliers.find((row) => row.id === activeId) ?? suppliers[0] ?? emptySupplier()

  useEffect(() => {
    setSaveStatus('saving')
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      localStorage.setItem(KEY, JSON.stringify(suppliers))
      setSaveStatus('saved')
    }, 600)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [suppliers])

  const patchActive = useCallback((patch: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((row) => (row.id === activeId ? { ...row, ...patch, updatedAt: new Date().toISOString() } : row)))
  }, [activeId])

  const addSupplier = useCallback((seed?: Supplier) => {
    const created = seed ?? emptySupplier()
    setSuppliers((prev) => [created, ...prev])
    setActiveId(created.id)
    return created
  }, [])

  const archiveSupplier = useCallback((id: string) => {
    setSuppliers((prev) =>
      prev.map((row) => (row.id === id ? { ...row, status: row.status === 'inactive' ? 'draft' : 'inactive', updatedAt: new Date().toISOString() } : row)),
    )
  }, [])

  const removeSupplier = useCallback((id: string) => {
    setSuppliers((prev) => prev.filter((row) => row.id !== id))
    setActiveId((current) => (current === id ? '' : current))
  }, [])

  const value = useMemo(
    () => ({ suppliers, active, saveStatus, setActiveId, patchActive, addSupplier, archiveSupplier, removeSupplier }),
    [suppliers, active, saveStatus, patchActive, addSupplier, archiveSupplier, removeSupplier],
  )

  return <SupplierContext.Provider value={value}>{children}</SupplierContext.Provider>
}

export function useSuppliers() {
  const ctx = useContext(SupplierContext)
  if (!ctx) throw new Error('useSuppliers must be used within provider')
  return ctx
}
