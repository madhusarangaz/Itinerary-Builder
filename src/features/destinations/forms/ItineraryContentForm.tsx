import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { BaseButton } from '../../../components/ui/BaseButton'
import { BaseSelect } from '../../../components/ui/BaseSelect'
import { CheckboxField } from '../../../components/ui/CheckboxField'
import { Drawer } from '../../../components/ui/Drawer'
import { InputField } from '../../../components/ui/InputField'
import { SearchSelect } from '../../../components/ui/SearchSelect'
import { TextAreaField } from '../../../components/ui/TextAreaField'
import { formatDuration } from '../../../data/destination-catalog'
import { uid } from '../../../lib/ids'
import { useDestinations } from '../../../state/destination-store'
import type { ItineraryPoint, SuggestedTime } from '../../../types/destination'
import { DurationFields, MoreDetails, SectionHead, minutesToParts, partsToMinutes } from './shared'

const TIMES: { value: SuggestedTime; label: string }[] = [
  { value: 'early_morning', label: 'Early morning' },
  { value: 'morning', label: 'Morning' },
  { value: 'late_morning', label: 'Late morning' },
  { value: 'midday', label: 'Midday' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'late_afternoon', label: 'Late afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'night', label: 'Night' },
  { value: 'flexible', label: 'Flexible' },
]

const GROUPS: { id: 'morning' | 'afternoon' | 'evening'; label: string; times: SuggestedTime[]; defaultTime: SuggestedTime }[] = [
  { id: 'morning', label: 'Morning', times: ['early_morning', 'morning', 'late_morning'], defaultTime: 'morning' },
  { id: 'afternoon', label: 'Afternoon', times: ['midday', 'afternoon', 'late_afternoon', 'flexible'], defaultTime: 'afternoon' },
  { id: 'evening', label: 'Evening', times: ['evening', 'night'], defaultTime: 'evening' },
]

function periodOf(t: SuggestedTime) {
  if (GROUPS[0].times.includes(t)) return 'morning'
  if (GROUPS[2].times.includes(t)) return 'evening'
  return 'afternoon'
}

function emptyPoint(suggestedTime: SuggestedTime): ItineraryPoint {
  return {
    id: uid('pt'),
    title: '',
    description: '',
    suggestedTime,
    optional: false,
    sortOrder: 0,
  }
}

function SortablePoint({
  point,
  onEdit,
  onRemove,
}: {
  point: ItineraryPoint
  onEdit: () => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: point.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex gap-3 rounded-xl border border-gray-100 px-3 py-3 dark:border-[#2C2A2A]"
    >
      <button type="button" className="text-gray-300" {...attributes} {...listeners}>
        <GripVertical size={16} />
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">
          {point.title}
          {point.optional ? <span className="ml-2 text-[10px] font-normal text-gray-400">Optional</span> : null}
        </p>
        <p className="line-clamp-2 text-xs text-gray-500">{point.description}</p>
      </div>
      <button type="button" className="rounded-lg p-2 text-gray-400 hover:bg-gray-50" onClick={onEdit}>
        <Pencil size={14} />
      </button>
      <button type="button" className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500" onClick={onRemove}>
        <Trash2 size={14} />
      </button>
    </div>
  )
}

export function ItineraryContentForm() {
  const { active: d, patchActive } = useDestinations()
  const [draft, setDraft] = useState<ItineraryPoint | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const dur = minutesToParts(draft?.durationMinutes)

  function save() {
    if (!draft?.title.trim() || !draft.description.trim()) return
    const exists = d.itineraryPoints.some((p) => p.id === draft.id)
    patchActive({
      itineraryPoints: exists
        ? d.itineraryPoints.map((p) => (p.id === draft.id ? draft : p))
        : [...d.itineraryPoints, { ...draft, sortOrder: d.itineraryPoints.length }],
    })
    setDraft(null)
  }

  function reorderGroup(groupId: 'morning' | 'afternoon' | 'evening', event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const items = d.itineraryPoints.filter((p) => periodOf(p.suggestedTime) === groupId)
    const ids = items.map((p) => p.id)
    const moved = arrayMove(items, ids.indexOf(String(active.id)), ids.indexOf(String(over.id)))
    const rebuilt = GROUPS.flatMap((g) => (g.id === groupId ? moved : d.itineraryPoints.filter((p) => periodOf(p.suggestedTime) === g.id)))
    patchActive({ itineraryPoints: rebuilt.map((p, i) => ({ ...p, sortOrder: i })) })
  }

  return (
    <div id="form-itinerary" className="scroll-mt-3 space-y-5 px-6 py-4">
      <SectionHead
        title="Reusable Itinerary Content"
        helper="Create suggested itinerary points that can be reused when this destination is added to a trip. These are narrative beats — not the same as activities."
      />

      {GROUPS.map((group) => {
        const items = d.itineraryPoints.filter((p) => periodOf(p.suggestedTime) === group.id)
        return (
          <section key={group.id}>
            <p className="mb-2 text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase">{group.label}</p>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => reorderGroup(group.id, e)}>
              <SortableContext items={items.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {items.map((point) => (
                    <SortablePoint
                      key={point.id}
                      point={point}
                      onEdit={() => setDraft({ ...point })}
                      onRemove={() => patchActive({ itineraryPoints: d.itineraryPoints.filter((p) => p.id !== point.id) })}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            <button
              type="button"
              className="mt-2 text-sm text-gray-500 hover:text-gray-800"
              onClick={() => setDraft(emptyPoint(group.defaultTime))}
            >
              <Plus size={12} className="mr-1 inline" /> Add {group.label.toLowerCase()} point
            </button>
          </section>
        )
      })}

      <Drawer
        open={!!draft}
        title={draft && d.itineraryPoints.some((p) => p.id === draft.id) ? 'Edit itinerary point' : 'Add itinerary point'}
        onClose={() => setDraft(null)}
        footer={
          <div className="flex justify-end gap-2">
            <BaseButton variant="secondary" onClick={() => setDraft(null)}>
              Cancel
            </BaseButton>
            <BaseButton disabled={!draft?.title.trim() || !draft.description.trim()} onClick={save}>
              Save itinerary point
            </BaseButton>
          </div>
        }
      >
        {draft ? (
          <>
            <InputField
              label="Title *"
              placeholder="Sigiriya Rock Exploration"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
            <TextAreaField
              label="Description *"
              rows={4}
              placeholder="After breakfast, climb the iconic Sigiriya Rock Fortress…"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
            <BaseSelect
              label="Suggested time"
              value={draft.suggestedTime}
              options={TIMES}
              onChange={(e) => setDraft({ ...draft, suggestedTime: e.target.value as SuggestedTime })}
            />
            <SearchSelect
              label="Related activity"
              optional
              placeholder="Optional"
              value={draft.relatedActivityId ?? ''}
              options={d.activities.map((a) => ({ value: a.id, label: a.name }))}
              onChange={(relatedActivityId) => setDraft({ ...draft, relatedActivityId })}
            />
            <DurationFields
              label="Typical duration"
              hours={dur.hours}
              minutes={dur.minutes}
              onChange={(h, m) => setDraft({ ...draft, durationMinutes: partsToMinutes(h, m) || undefined })}
            />
            {formatDuration(draft.durationMinutes) ? (
              <p className="mb-3 -mt-2 text-[11px] text-gray-400">{formatDuration(draft.durationMinutes)}</p>
            ) : null}
            <MoreDetails>
              <CheckboxField
                label="Mark as optional suggestion"
                checked={draft.optional}
                onChange={(optional) => setDraft({ ...draft, optional })}
              />
              <TextAreaField
                label="Internal note"
                optional
                rows={2}
                placeholder="Not customer-facing."
                value={draft.internalNote ?? ''}
                onChange={(e) => setDraft({ ...draft, internalNote: e.target.value })}
              />
            </MoreDetails>
          </>
        ) : null}
      </Drawer>
    </div>
  )
}
