import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { sampleActivities } from '../data/activity-sample'
import { emptyActivity } from '../lib/activity'
import { uid } from '../lib/ids'
import type { ActivityRecord } from '../types/activity'
import type { SaveStatus } from '../types/itinerary'

export const ACTIVITY_KEY = 'travelbuilding.activities.v1'

type Ctx = {
  activities: ActivityRecord[]
  active: ActivityRecord
  saveStatus: SaveStatus
  setActiveId: (id: string) => void
  patchActive: (patch: Partial<ActivityRecord>) => void
  addActivity: (seed?: ActivityRecord) => ActivityRecord
  duplicateActivity: (id: string) => ActivityRecord
  archiveActivity: (id: string) => void
  removeActivity: (id: string) => void
}

const ActivityContext = createContext<Ctx | null>(null)

export function loadActivities(): ActivityRecord[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as ActivityRecord[]
      if (Array.isArray(parsed) && parsed.length) return parsed
    }
  } catch {
    /* ignore */
  }
  return sampleActivities
}

export function mergeActivities(incoming: ActivityRecord[]) {
  const current = loadActivities()
  const byId = new Map(current.map((row) => [row.id, row]))
  incoming.forEach((row) => {
    if (!byId.has(row.id)) byId.set(row.id, row)
  })
  const next = [...byId.values()]
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(next))
  return next
}

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<ActivityRecord[]>(loadActivities)
  const [activeId, setActiveId] = useState(() => loadActivities()[0]?.id ?? sampleActivities[0].id)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const timer = useRef<number | null>(null)
  const active = activities.find((row) => row.id === activeId) ?? activities[0] ?? emptyActivity()

  useEffect(() => {
    setSaveStatus('saving')
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities))
      setSaveStatus('saved')
    }, 600)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [activities])

  const patchActive = useCallback(
    (patch: Partial<ActivityRecord>) => {
      setActivities((prev) => prev.map((row) => (row.id === activeId ? { ...row, ...patch, updatedAt: new Date().toISOString() } : row)))
    },
    [activeId],
  )

  const addActivity = useCallback((seed?: ActivityRecord) => {
    const created = seed ?? emptyActivity()
    setActivities((prev) => [created, ...prev])
    setActiveId(created.id)
    return created
  }, [])

  const duplicateActivity = useCallback(
    (id: string) => {
      const source = activities.find((row) => row.id === id) ?? emptyActivity()
      const copy: ActivityRecord = {
        ...structuredClone(source),
        id: uid('actm'),
        name: source.name ? `${source.name} copy` : '',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        applicableRoutes: source.applicableRoutes.map((route) => ({ ...route, id: uid('route') })),
        image: source.image ? { ...source.image, id: uid('img') } : undefined,
      }
      setActivities((prev) => [copy, ...prev])
      setActiveId(copy.id)
      return copy
    },
    [activities],
  )

  const archiveActivity = useCallback((id: string) => {
    setActivities((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, status: row.status === 'inactive' ? 'draft' : 'inactive', updatedAt: new Date().toISOString() } : row,
      ),
    )
  }, [])

  const removeActivity = useCallback((id: string) => {
    setActivities((prev) => prev.filter((row) => row.id !== id))
    setActiveId((current) => (current === id ? '' : current))
  }, [])

  const value = useMemo(
    () => ({ activities, active, saveStatus, setActiveId, patchActive, addActivity, duplicateActivity, archiveActivity, removeActivity }),
    [activities, active, saveStatus, patchActive, addActivity, duplicateActivity, archiveActivity, removeActivity],
  )

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>
}

export function useActivities() {
  const ctx = useContext(ActivityContext)
  if (!ctx) throw new Error('useActivities must be used within provider')
  return ctx
}
