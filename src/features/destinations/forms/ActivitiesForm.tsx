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
import { ChoicePills, MultiChips } from '../../../components/ui/ChoicePills'
import { Drawer } from '../../../components/ui/Drawer'
import { ImageUploader } from '../../../components/ui/ImageUploader'
import { InputField } from '../../../components/ui/InputField'
import { StepperField } from '../../../components/ui/StepperField'
import { TextAreaField } from '../../../components/ui/TextAreaField'
import { ACTIVITY_CATEGORIES, MONTHS, SUITABLE_FOR, formatDuration } from '../../../data/destination-catalog'
import { emptyImage } from '../../../data/destination-sample'
import { uid } from '../../../lib/ids'
import { useDestinations } from '../../../state/destination-store'
import type { ActivityCostType, ActivityDifficulty, ActivityMasterType, DestinationActivity, ItineraryPoint, SuggestedTime } from '../../../types/destination'
import { DurationFields, MoreDetails, SectionHead, formatActivityCost, minutesToParts, partsToMinutes } from './shared'

const TIMES = ['Morning', 'Afternoon', 'Evening', 'Any Time']
const CURRENCIES = ['USD', 'EUR', 'GBP', 'AUD', 'LKR']
const COST_TYPES: { value: ActivityCostType; label: string }[] = [
  { value: 'per_person', label: 'Per person' },
  { value: 'per_group', label: 'Per group' },
  { value: 'per_vehicle', label: 'Per vehicle' },
  { value: 'flat', label: 'Flat rate' },
  { value: 'free', label: 'Free' },
  { value: 'unknown', label: 'Unknown' },
]
const QUICK_DURATION = [
  { label: '1 hour', minutes: 60 },
  { label: '2 hours', minutes: 120 },
  { label: 'Half day', minutes: 240 },
  { label: 'Full day', minutes: 480 },
]

function emptyActivity(): DestinationActivity {
  return {
    id: uid('act'),
    name: '',
    shortDescription: '',
    categories: [],
    durationMinutes: 120,
    recommendedTimes: ['Morning'],
    masterType: 'standard',
    cost: { currency: 'USD', type: 'per_person', amount: 0 },
    suitableFor: [],
    whatToBring: [],
    sortOrder: 0,
  }
}

function timeToSuggested(times: string[]): SuggestedTime {
  if (times.includes('Evening')) return 'evening'
  if (times.includes('Afternoon')) return 'afternoon'
  return 'morning'
}

function SortableActivity({
  activity,
  onEdit,
  onRemove,
  onAddToItinerary,
}: {
  activity: DestinationActivity
  onEdit: () => void
  onRemove: () => void
  onAddToItinerary: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: activity.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex gap-3 rounded-xl border border-gray-100 p-3 dark:border-[#2C2A2A]"
    >
      <button type="button" className="mt-2 text-gray-300" {...attributes} {...listeners}>
        <GripVertical size={16} />
      </button>
      <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-zinc-800">
        {activity.image?.url ? <img src={activity.image.url} alt="" className="h-full w-full object-cover" /> : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{activity.name}</p>
        <p className="truncate text-xs text-gray-500">{activity.categories.join(' · ') || 'Uncategorised'}</p>
        <p className="text-xs text-gray-400">
          {formatDuration(activity.durationMinutes) || 'Duration TBD'}
          {activity.difficulty ? ` · ${activity.difficulty[0].toUpperCase()}${activity.difficulty.slice(1)}` : ''}
        </p>
        {activity.cost ? <p className="text-xs text-gray-600 dark:text-zinc-300">Typical cost {formatActivityCost(activity.cost)}</p> : null}
        <button type="button" className="mt-1 text-[11px] text-gray-500 underline" onClick={onAddToItinerary}>
          Add to itinerary content
        </button>
      </div>
      <div className="flex flex-col gap-1">
        <button type="button" className="rounded-lg p-2 text-gray-400 hover:bg-gray-50" onClick={onEdit}>
          <Pencil size={14} />
        </button>
        <button type="button" className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500" onClick={onRemove}>
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

export function ActivitiesForm() {
  const { active: d, patchActive } = useDestinations()
  const [draft, setDraft] = useState<DestinationActivity | null>(null)
  const [bring, setBring] = useState('')
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const dur = minutesToParts(draft?.durationMinutes)

  function save() {
    if (!draft?.name.trim()) return
    const exists = d.activities.some((a) => a.id === draft.id)
    const next = exists ? d.activities.map((a) => (a.id === draft.id ? draft : a)) : [...d.activities, { ...draft, sortOrder: d.activities.length }]
    patchActive({ activities: next })
    setDraft(null)
  }

  function addToItinerary(activity: DestinationActivity) {
    const point: ItineraryPoint = {
      id: uid('pt'),
      title: activity.name,
      description: activity.shortDescription || '',
      suggestedTime: timeToSuggested(activity.recommendedTimes),
      relatedActivityId: activity.id,
      durationMinutes: activity.durationMinutes,
      optional: activity.masterType !== 'standard',
      sortOrder: d.itineraryPoints.length,
    }
    patchActive({ itineraryPoints: [...d.itineraryPoints, point] })
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const ids = d.activities.map((a) => a.id)
    patchActive({
      activities: arrayMove(d.activities, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))).map((a, i) => ({
        ...a,
        sortOrder: i,
      })),
    })
  }

  return (
    <div id="form-activities" className="scroll-mt-3 space-y-1 px-6 py-4">
      <SectionHead title="Activities & Experiences" helper="Add reusable experiences travellers can do at this destination." />

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={d.activities.map((a) => a.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {d.activities.map((activity) => (
              <SortableActivity
                key={activity.id}
                activity={activity}
                onEdit={() => setDraft({ ...activity })}
                onRemove={() => patchActive({ activities: d.activities.filter((a) => a.id !== activity.id) })}
                onAddToItinerary={() => addToItinerary(activity)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <BaseButton variant="secondary" className="mt-3" onClick={() => setDraft(emptyActivity())}>
        <Plus size={14} /> Add activity
      </BaseButton>

      <Drawer
        open={!!draft}
        title={draft && d.activities.some((a) => a.id === draft.id) ? 'Edit activity' : 'Add activity'}
        subtitle="Keep the essentials first — extra practical notes sit under More details."
        onClose={() => setDraft(null)}
        footer={
          <div className="flex justify-end gap-2">
            <BaseButton variant="secondary" onClick={() => setDraft(null)}>
              Cancel
            </BaseButton>
            <BaseButton disabled={!draft?.name.trim()} onClick={save}>
              Save activity
            </BaseButton>
          </div>
        }
      >
        {draft ? (
          <>
            <InputField
              label="Activity name *"
              placeholder="Sigiriya Rock Fortress"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
            <TextAreaField
              label="Short description"
              optional
              rows={3}
              placeholder="Climb the ancient rock fortress and explore its frescoes, landscaped gardens and panoramic summit views."
              value={draft.shortDescription ?? ''}
              onChange={(e) => setDraft({ ...draft, shortDescription: e.target.value })}
            />
            <p className="mb-1.5 text-sm text-gray-800 dark:text-zinc-100">Activity image</p>
            <ImageUploader
              value={draft.image?.url ?? ''}
              aspect="aspect-[16/9]"
              onChange={(url) => setDraft({ ...draft, image: emptyImage(url, { id: draft.image?.id }) })}
              onRemove={() => setDraft({ ...draft, image: undefined })}
            />
            <MultiChips
              label="Category"
              value={draft.categories}
              onChange={(categories) => setDraft({ ...draft, categories })}
              options={ACTIVITY_CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
            <p className="mb-1.5 text-sm text-gray-800">Typical duration</p>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {QUICK_DURATION.map((q) => (
                <button
                  key={q.minutes}
                  type="button"
                  onClick={() => setDraft({ ...draft, durationMinutes: q.minutes })}
                  className={`rounded-full px-3 py-1.5 text-sm ${
                    draft.durationMinutes === q.minutes
                      ? 'bg-gray-900 text-white dark:bg-[#7A3714]'
                      : 'border border-gray-200 text-gray-600 dark:border-[#2C2A2A]'
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
            <DurationFields
              hours={dur.hours}
              minutes={dur.minutes}
              onChange={(h, m) => setDraft({ ...draft, durationMinutes: partsToMinutes(h, m) })}
            />
            <MultiChips
              label="Recommended time"
              value={draft.recommendedTimes}
              onChange={(recommendedTimes) => setDraft({ ...draft, recommendedTimes })}
              options={TIMES.map((t) => ({ value: t, label: t }))}
            />
            <ChoicePills
              label="Availability type"
              value={draft.masterType}
              onChange={(masterType) => setDraft({ ...draft, masterType: masterType as ActivityMasterType })}
              options={[
                { value: 'standard', label: 'Standard' },
                { value: 'optional', label: 'Optional' },
                { value: 'addon', label: 'Add-on' },
              ]}
            />
            <p className="mb-1 text-sm font-medium text-gray-800 dark:text-zinc-100">Typical cost</p>
            <p className="mb-2 text-[11px] text-gray-400">Master rate only — costing can override this later for a specific trip.</p>
            <div className="grid grid-cols-2 gap-3">
              <BaseSelect
                label="Currency"
                value={draft.cost?.currency ?? 'USD'}
                options={CURRENCIES.map((c) => ({ value: c, label: c }))}
                onChange={(e) => setDraft({ ...draft, cost: { ...(draft.cost ?? { type: 'per_person' }), currency: e.target.value } })}
              />
              <BaseSelect
                label="Cost type"
                value={draft.cost?.type ?? 'per_person'}
                options={COST_TYPES}
                onChange={(e) =>
                  setDraft({ ...draft, cost: { currency: draft.cost?.currency ?? 'USD', type: e.target.value as ActivityCostType, amount: draft.cost?.amount } })
                }
              />
            </div>
            {draft.cost?.type !== 'free' && draft.cost?.type !== 'unknown' ? (
              <StepperField
                label="Amount"
                value={draft.cost?.amount ?? 0}
                min={0}
                max={5000}
                step={5}
                onChange={(amount) => setDraft({ ...draft, cost: { currency: draft.cost?.currency ?? 'USD', type: draft.cost?.type ?? 'per_person', amount } })}
              />
            ) : null}
            {formatActivityCost(draft.cost) ? (
              <p className="mb-3 -mt-1 text-xs text-gray-500">{formatActivityCost(draft.cost)}</p>
            ) : null}

            <MoreDetails>
              <ChoicePills
                label="Difficulty"
                optional
                value={draft.difficulty ?? ''}
                onChange={(difficulty) => setDraft({ ...draft, difficulty: (difficulty || undefined) as ActivityDifficulty | undefined })}
                options={[
                  { value: 'easy', label: 'Easy' },
                  { value: 'moderate', label: 'Moderate' },
                  { value: 'challenging', label: 'Challenging' },
                ]}
              />
              <p className="mb-1.5 text-sm text-gray-800">Suitable for</p>
              <div className="mb-3 grid grid-cols-2 gap-1">
                {SUITABLE_FOR.map((s) => (
                  <CheckboxField
                    key={s}
                    className="mb-1"
                    label={s}
                    checked={draft.suitableFor.includes(s)}
                    onChange={(on) =>
                      setDraft({
                        ...draft,
                        suitableFor: on ? [...draft.suitableFor, s] : draft.suitableFor.filter((x) => x !== s),
                      })
                    }
                  />
                ))}
              </div>
              <p className="mb-1.5 text-sm text-gray-800">What to bring</p>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {(draft.whatToBring ?? []).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700 dark:bg-white/10 dark:text-zinc-200"
                    onClick={() => setDraft({ ...draft, whatToBring: (draft.whatToBring ?? []).filter((t) => t !== tag) })}
                  >
                    {tag} ×
                  </button>
                ))}
              </div>
              <InputField
                placeholder="Comfortable shoes"
                value={bring}
                onChange={(e) => setBring(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && bring.trim()) {
                    e.preventDefault()
                    setDraft({ ...draft, whatToBring: [...(draft.whatToBring ?? []), bring.trim()] })
                    setBring('')
                  }
                }}
              />
              <TextAreaField
                label="Dress requirements"
                optional
                rows={2}
                value={draft.dressRequirements ?? ''}
                onChange={(e) => setDraft({ ...draft, dressRequirements: e.target.value })}
              />
              <TextAreaField
                label="Accessibility notes"
                optional
                rows={2}
                value={draft.accessibilityNotes ?? ''}
                onChange={(e) => setDraft({ ...draft, accessibilityNotes: e.target.value })}
              />
              <CheckboxField
                label="Advance booking required"
                checked={!!draft.bookingRequired}
                onChange={(bookingRequired) => setDraft({ ...draft, bookingRequired })}
              />
              <CheckboxField
                label="Entrance ticket required"
                checked={!!draft.entranceFeeRequired}
                onChange={(entranceFeeRequired) => setDraft({ ...draft, entranceFeeRequired })}
              />
              <CheckboxField
                label="Seasonal activity"
                checked={!!draft.seasonal}
                onChange={(seasonal) => setDraft({ ...draft, seasonal })}
              />
              {draft.seasonal ? (
                <MultiChips
                  label="Available months"
                  value={(draft.availableMonths ?? []).map(String)}
                  onChange={(vals) => setDraft({ ...draft, availableMonths: vals.map(Number).sort((a, b) => a - b) })}
                  options={MONTHS.map((m) => ({ value: String(m.n), label: m.label }))}
                />
              ) : null}
              <TextAreaField
                label="Internal notes"
                optional
                rows={2}
                placeholder="Not shown to travellers."
                value={draft.internalNotes ?? ''}
                onChange={(e) => setDraft({ ...draft, internalNotes: e.target.value })}
              />
            </MoreDetails>
          </>
        ) : null}
      </Drawer>
    </div>
  )
}
