import { closestCenter, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { BaseButton } from '../../../components/ui/BaseButton'
import { Drawer } from '../../../components/ui/Drawer'
import { InputField } from '../../../components/ui/InputField'
import { formatDuration } from '../../../data/destination-catalog'
import { formatUsd } from '../../../data/activity-catalog'
import { emptyActivity } from '../../../lib/activity'
import { uid } from '../../../lib/ids'
import { useActivities } from '../../../state/activity-store'
import { useDestinations } from '../../../state/destination-store'
import { useHotelMaster } from '../../../state/hotel-store'
import type { ActivityRecord } from '../../../types/activity'
import type { ItineraryPoint, SuggestedTime } from '../../../types/destination'
import { SectionHead } from './shared'

function timeToSuggested(times: string[]): SuggestedTime {
  if (times.includes('Evening')) return 'evening'
  if (times.includes('Afternoon')) return 'afternoon'
  return 'morning'
}

function SortableLink({ activity, onRemove, onAddToItinerary }: { activity: ActivityRecord; onRemove: () => void; onAddToItinerary: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: activity.id })
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className="flex gap-3 rounded-xl border border-gray-100 p-3 dark:border-[#2C2A2A]">
      <button type="button" className="mt-2 text-gray-300" {...attributes} {...listeners}><GripVertical size={16} /></button>
      <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-zinc-800">
        {activity.image?.url ? <img src={activity.image.url} alt="" className="h-full w-full object-cover" /> : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{activity.name}</p>
        <p className="truncate text-xs text-gray-500">{activity.categories.join(' · ') || 'Uncategorised'}</p>
        <p className="text-xs text-gray-400">{formatDuration(activity.durationMinutes) || 'Duration TBD'} · {formatUsd(activity.adultRateUsd)} adult</p>
        <button type="button" className="mt-1 text-[11px] text-gray-500 underline" onClick={onAddToItinerary}>Add to itinerary content</button>
      </div>
      <button type="button" className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500" onClick={onRemove}><Trash2 size={14} /></button>
    </div>
  )
}

export function ActivitiesForm() {
  const { active: d, patchActive } = useDestinations()
  const { hotels } = useHotelMaster()
  const { activities, addActivity, patchActive: patchActivity, removeActivity } = useActivities()
  const [q, setQ] = useState('')
  const [creatingId, setCreatingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const linked = activities.filter((activity) => d.activityIds.includes(activity.id))
  const suggestions = useMemo(() => {
    const term = q.toLowerCase().trim()
    return activities
      .filter((activity) => !d.activityIds.includes(activity.id) && activity.status !== 'inactive')
      .filter((activity) => !term || `${activity.name} ${activity.locationName} ${activity.categories.join(' ')}`.toLowerCase().includes(term))
      .sort((a, b) => Number(b.locationId === d.id) - Number(a.locationId === d.id))
  }, [activities, d.activityIds, d.id, q])

  function link(id: string) {
    if (d.activityIds.includes(id)) return
    patchActive({ activityIds: [...d.activityIds, id] })
    setQ('')
  }

  function addToItinerary(activity: ActivityRecord) {
    const point: ItineraryPoint = {
      id: uid('pt'),
      title: activity.name,
      description: activity.description || '',
      suggestedTime: timeToSuggested(activity.recommendedTimes),
      relatedActivityId: activity.id,
      durationMinutes: activity.durationMinutes,
      optional: false,
      sortOrder: d.itineraryPoints.length,
    }
    patchActive({ itineraryPoints: [...d.itineraryPoints, point] })
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const ids = d.activityIds
    patchActive({ activityIds: arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))) })
  }

  function startCreate() {
    const created = addActivity(emptyActivity({ locationId: d.id, locationName: d.name, type: 'within_destination', status: 'draft' }))
    setCreatingId(created.id)
    setDraftName('')
  }

  function saveCreated() {
    if (!creatingId || !draftName.trim()) return
    patchActivity({ name: draftName.trim(), status: 'active' })
    link(creatingId)
    setCreatingId(null)
  }

  return (
    <div id="form-activities" className="scroll-mt-3 space-y-1 px-6 py-4">
      <SectionHead title="Activities" helper="Link reusable activities from Activities & Entrance Fees. Hotels linked to this destination appear automatically." />
      <div className="mb-4 rounded-xl border border-gray-100 p-3 dark:border-[#2C2A2A]">
        <p className="text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase">Hotels here</p>
        {hotels.filter((hotel) => hotel.destinationId === d.id && hotel.status !== 'inactive').length ? (
          <ul className="mt-2 space-y-1 text-sm">
            {hotels.filter((hotel) => hotel.destinationId === d.id && hotel.status !== 'inactive').map((hotel) => (
              <li key={hotel.id}>{hotel.name} · {hotel.starCategory ? `${hotel.starCategory} Star` : 'Unrated'}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-gray-400">No hotels linked to {d.name || 'this destination'} yet. Add one in Hotels and choose this destination.</p>
        )}
      </div>
      <div className="relative mb-3">
        <InputField label="Search & add activity" placeholder="Search activity..." startIcon={<Search size={16} />} value={q} onChange={(e) => setQ(e.target.value)} />
        {q.trim() ? (
          <div className="absolute z-20 max-h-56 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            {suggestions.slice(0, 8).map((activity) => (
              <button key={activity.id} type="button" className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-zinc-700" onClick={() => link(activity.id)}>
                <span>
                  <span className="block text-gray-900 dark:text-zinc-100">{activity.name}</span>
                  <span className="text-[11px] text-gray-400">{activity.categories.slice(0, 2).join(' · ') || activity.locationName}</span>
                </span>
                <span className="text-xs text-gray-400">{formatUsd(activity.adultRateUsd)} adult</span>
              </button>
            ))}
            {suggestions.length === 0 ? <p className="px-3 py-2 text-sm text-gray-400">No matching activities</p> : null}
          </div>
        ) : null}
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={linked.map((a) => a.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {linked.map((activity) => (
              <SortableLink key={activity.id} activity={activity} onRemove={() => patchActive({ activityIds: d.activityIds.filter((id) => id !== activity.id) })} onAddToItinerary={() => addToItinerary(activity)} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <BaseButton variant="secondary" className="mt-3" onClick={startCreate}><Plus size={14} /> Create New Activity</BaseButton>
      <Drawer
        open={!!creatingId}
        title="Create activity"
        subtitle={`Location is set to ${d.name || 'this destination'} and type is Within Destination.`}
        onClose={() => {
          if (creatingId) removeActivity(creatingId)
          setCreatingId(null)
        }}
        footer={<div className="flex justify-end gap-2"><BaseButton variant="secondary" onClick={() => { if (creatingId) removeActivity(creatingId); setCreatingId(null) }}>Cancel</BaseButton><BaseButton disabled={!draftName.trim()} onClick={saveCreated}>Save and link</BaseButton></div>}
      >
        <InputField label="Sightseeing / Activity Name *" placeholder="Sigiriya Rock Fortress" value={draftName} onChange={(e) => setDraftName(e.target.value)} />
        <p className="text-xs text-gray-400">Adult and child rates start at 0. Open Activities & Entrance Fees to add fees, routes and the longer description.</p>
      </Drawer>
    </div>
  )
}
