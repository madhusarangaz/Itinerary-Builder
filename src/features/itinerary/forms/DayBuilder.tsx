import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, GripVertical, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { BaseButton } from '../../../components/ui/BaseButton'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { Modal } from '../../../components/ui/Modal'
import { photos } from '../../../data/images'
import { BaseSelect } from '../../../components/ui/BaseSelect'
import { FieldAttention } from '../../../components/ui/FieldAttention'
import { ImageSelect, type ImageChoice } from '../../../components/ui/ImageSelect'
import { InputField } from '../../../components/ui/InputField'
import { TextAreaField } from '../../../components/ui/TextAreaField'
import { addDays, formatLong, formatShort } from '../../../lib/dates'
import { dayRemaining } from '../../../lib/completeness'
import { revealFirstMissing } from '../missing-attention'
import { uid } from '../../../lib/ids'
import { liveDestinations, useDestinations } from '../../../state/destination-store'
import { SearchSelect } from '../../../components/ui/SearchSelect'
import {
  emptyMeals,
  emptyPickup,
  emptyTravel,
  TRANSPORT_OPTIONS,
  travellerFilled,
} from '../../../lib/day-glance'
import { useItinerary } from '../../../state/itinerary-store'
import type { Destination } from '../../../types/destination'
import type { Activity, ActivityType, Day, DayMeals } from '../../../types/itinerary'

const TYPE_LABEL: Record<ActivityType, string> = {
  activity: 'Activity',
  transfer: 'Transfer',
  meal: 'Meal',
  hotel: 'Hotel',
  note: 'Note',
}

const ITEM_PLACEHOLDER: Record<ActivityType, string> = {
  activity: 'Type activity name',
  transfer: 'Airport → Sigiriya',
  meal: 'Breakfast, lunch or dinner',
  hotel: 'Hotel name',
  note: 'Free-text note',
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="mb-2 mt-1 text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase dark:text-zinc-500">
      {children}
    </p>
  )
}

function MealChecks({ meals, onChange }: { meals: DayMeals; onChange: (next: DayMeals) => void }) {
  return (
    <div className="mb-3">
      <p className="mb-1.5 text-sm font-normal text-gray-800 dark:text-zinc-100">Meals</p>
      <div className="flex flex-wrap gap-4 text-sm text-gray-800 dark:text-zinc-100">
        {(['breakfast', 'lunch', 'dinner'] as const).map((key) => (
          <label key={key} className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={meals[key]}
              onChange={(e) => onChange({ ...meals, [key]: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 accent-[var(--accent)] focus:ring-[var(--accent)] dark:border-zinc-600 dark:bg-zinc-800"
            />
            {key[0].toUpperCase() + key.slice(1)}
          </label>
        ))}
      </div>
    </div>
  )
}

const ACTIVITY_IMAGES: ImageChoice[] = [
  { src: photos.temple, alt: 'Temple of the Tooth' },
  { src: photos.sigiriya, alt: 'Sigiriya' },
  { src: photos.tea, alt: 'Tea country' },
]

function SortableActivity({
  activity,
  onChange,
  onRemove,
  attention = false,
}: {
  activity: Activity
  onChange: (p: Partial<Activity>) => void
  onRemove: () => void
  attention?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: activity.id })
  const [open, setOpen] = useState(false)
  const label = activity.kind === 'highlight' ? 'Highlight' : TYPE_LABEL[activity.type]

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="rounded-xl border border-gray-200 bg-gray-50 p-2.5 dark:border-[#2C2A2A] dark:bg-zinc-900"
    >
      <div className="flex items-center gap-2">
        <button type="button" className="cursor-grab text-gray-400" {...attributes} {...listeners}>
          <GripVertical size={16} />
        </button>
        <span className="w-20 shrink-0 text-[10px] font-medium tracking-[0.12em] text-gray-400 uppercase">{label}</span>
        <InputField
          className="mb-0 min-w-0 flex-1"
          dense
          attention={attention}
          aria-label={`${label} title`}
          placeholder={ITEM_PLACEHOLDER[activity.type]}
          value={activity.title}
          onChange={(e) => onChange({ title: e.target.value })}
          startIcon={<Pencil size={14} strokeWidth={1.75} />}
        />
        <button
          type="button"
          className="text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200"
          aria-expanded={open}
          aria-label={open ? `Collapse ${activity.title || label}` : `Expand ${activity.title || label}`}
          onClick={() => setOpen((value) => !value)}
        >
          <ChevronDown size={16} className={`transition ${open ? 'rotate-180' : ''}`} />
        </button>
        <button type="button" className="text-gray-400 hover:text-red-500" aria-label={`Remove ${activity.title || label}`} onClick={onRemove}>
          <Trash2 size={14} />
        </button>
      </div>
      {open ? (
        <div className="mt-2">
          <TextAreaField
            className="mb-2"
            rows={2}
            aria-label={`${label} description`}
            placeholder="A short description"
            value={activity.description}
            onChange={(e) => onChange({ description: e.target.value })}
          />
          <ImageSelect value={activity.image ?? ''} options={ACTIVITY_IMAGES} onChange={(image) => onChange({ image })} />
        </div>
      ) : null}
    </div>
  )
}

function TravellerInfo({ day }: { day: Day }) {
  const { trip, updateDay } = useItinerary()
  const filled = travellerFilled(day)
  const [open, setOpen] = useState(false)
  const [pickupOpen, setPickupOpen] = useState(Boolean(day.pickup && Object.values(day.pickup).some((v) => v.trim())))
  const travel = day.travel ?? emptyTravel()
  const meals = day.meals ?? emptyMeals()
  const pickup = day.pickup ?? emptyPickup()
  const hotels = useMemo(() => {
    const names = trip.accommodations.map((a) => a.hotelName).filter((n) => n.trim())
    return Array.from(new Set(names))
  }, [trip.accommodations])

  return (
    <div className="mt-4 border-t border-gray-100 pt-3 dark:border-[#2C2A2A]">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between text-left">
        <span className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Traveller info</span>
        <span className="flex items-center gap-2">
          <span className="text-xs font-normal text-gray-400">{filled ? 'Added' : 'Optional'}</span>
          <ChevronDown size={16} className={`text-gray-400 transition ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>
      {open && (
        <div className="mt-3">
          <SectionLabel>Travel</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <InputField
              className="mb-2"
              label="From"
              optional
              placeholder="Sigiriya"
              value={travel.from}
              onChange={(e) => updateDay(day.id, { travel: { ...travel, from: e.target.value } })}
            />
            <InputField
              className="mb-2"
              label="To"
              optional
              placeholder="Kandy"
              value={travel.to}
              onChange={(e) => updateDay(day.id, { travel: { ...travel, to: e.target.value } })}
            />
            <BaseSelect
              className="mb-2"
              label="Transport"
              optional
              placeholder="Select"
              options={TRANSPORT_OPTIONS}
              value={travel.transport}
              onChange={(e) => updateDay(day.id, { travel: { ...travel, transport: e.target.value } })}
            />
            <InputField
              className="mb-2"
              label="Travel time"
              optional
              placeholder="2h 30m"
              value={travel.duration}
              onChange={(e) => updateDay(day.id, { travel: { ...travel, duration: e.target.value } })}
            />
          </div>
          <SectionLabel>Stay & meals</SectionLabel>
          {hotels.length > 0 ? (
            <BaseSelect
              className="mb-2"
              label="Hotel"
              optional
              placeholder="Select hotel"
              options={hotels.map((name) => ({ value: name, label: name }))}
              value={day.hotelName ?? ''}
              onChange={(e) => updateDay(day.id, { hotelName: e.target.value })}
            />
          ) : (
            <InputField
              className="mb-2"
              label="Hotel"
              optional
              placeholder="Hotel name"
              value={day.hotelName ?? ''}
              onChange={(e) => updateDay(day.id, { hotelName: e.target.value })}
            />
          )}
          <MealChecks meals={meals} onChange={(next) => updateDay(day.id, { meals: next })} />
          <SectionLabel>Good to know</SectionLabel>
          <TextAreaField
            className="mb-2"
            optional
            rows={2}
            placeholder="Comfortable shoes recommended..."
            value={day.tip ?? ''}
            onChange={(e) => updateDay(day.id, { tip: e.target.value })}
          />
          {pickupOpen ? (
            <div className="mt-1">
              <SectionLabel>Pickup / meeting</SectionLabel>
              <InputField
                className="mb-2"
                label="Meeting point"
                optional
                placeholder="Arrivals hall, name board"
                value={pickup.meetingPoint}
                onChange={(e) => updateDay(day.id, { pickup: { ...pickup, meetingPoint: e.target.value } })}
              />
              <div className="grid grid-cols-2 gap-3">
                <InputField
                  className="mb-2"
                  label="Pickup time"
                  optional
                  placeholder="On landing"
                  value={pickup.pickupTime}
                  onChange={(e) => updateDay(day.id, { pickup: { ...pickup, pickupTime: e.target.value } })}
                />
                <InputField
                  className="mb-2"
                  label="Driver / guide"
                  optional
                  placeholder="Name"
                  value={pickup.contactName}
                  onChange={(e) => updateDay(day.id, { pickup: { ...pickup, contactName: e.target.value } })}
                />
              </div>
              <InputField
                className="mb-2"
                label="Contact phone"
                optional
                placeholder="+94 …"
                value={pickup.contactPhone}
                onChange={(e) => updateDay(day.id, { pickup: { ...pickup, contactPhone: e.target.value } })}
              />
              <TextAreaField
                className="mb-0"
                label="If they cannot locate the driver"
                optional
                rows={2}
                placeholder="Remain at the information desk and call…"
                value={pickup.ifLost}
                onChange={(e) => updateDay(day.id, { pickup: { ...pickup, ifLost: e.target.value } })}
              />
            </div>
          ) : (
            <button
              type="button"
              className="mt-1 text-xs text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-100"
              onClick={() => setPickupOpen(true)}
            >
              + Add pickup / meeting details
            </button>
          )}
        </div>
      )}
    </div>
  )
}

type LibraryCard = {
  id: string
  title: string
  description: string
  image: string
  kind: 'activity' | 'highlight'
}

const LIBRARY_ACTIVITIES: LibraryCard[] = [
  { id: 'proto-tooth', title: 'Temple of the Tooth', description: 'Visit the Temple of the Sacred Tooth Relic in Kandy.', image: photos.temple, kind: 'activity' },
  { id: 'proto-garden', title: 'Royal Botanical Garden', description: 'A slow walk through the lawns and orchids at Peradeniya.', image: photos.tea, kind: 'activity' },
  { id: 'proto-show', title: 'Kandyan Cultural Show', description: 'An evening of Kandyan dance and drumming.', image: photos.kandy, kind: 'activity' },
  { id: 'proto-puja', title: 'Evening puja', description: 'The evening ritual at the temple.', image: photos.temple, kind: 'activity' },
  { id: 'proto-lake', title: 'Kandy Lake walk', description: 'A walk around the lake as the light fades.', image: photos.kandy, kind: 'activity' },
]

const LIBRARY_HIGHLIGHTS: LibraryCard[] = [
  { id: 'proto-hl-sunrise', title: 'Sunrise over the lake', description: 'The lake catches the first light before the city wakes.', image: photos.kandy, kind: 'highlight' },
  { id: 'proto-hl-dancers', title: 'Dancers at dusk', description: 'Kandyan dancers take the stage as the day cools.', image: photos.tea, kind: 'highlight' },
  { id: 'proto-hl-spice', title: 'Spice garden aromas', description: 'Cinnamon, clove, and cardamom still warm from the sun.', image: photos.sigiriya, kind: 'highlight' },
  { id: 'proto-hl-train', title: 'Hill-country train', description: 'Tea hills sliding past the carriage window.', image: photos.train, kind: 'highlight' },
  { id: 'proto-hl-tea', title: 'Tea pluckers on the slope', description: 'Baskets filling along the bright green rows.', image: photos.tea, kind: 'highlight' },
]

function generatedDayTitle(day: Day) {
  const written = day.title.trim()
  if (written) return written
  const place = day.destination.trim()
  if (place) return `A day in ${place}`
  return 'Generated from the destination'
}

function destinationImages(destination: Destination | undefined): ImageChoice[] {
  const picked: ImageChoice[] = []
  const seen = new Set<string>()
  function push(src?: string, alt?: string) {
    if (!src || seen.has(src) || picked.length >= 3) return
    seen.add(src)
    picked.push({ src, alt })
  }
  if (destination) {
    push(destination.coverImage?.url, destination.coverImage?.alt || destination.name)
    for (const image of destination.gallery) push(image.url, image.alt || image.caption || destination.name)
  }
  push(photos.kandy, 'Kandy')
  push(photos.sigiriya, 'Sigiriya')
  push(photos.temple, 'Temple of the Tooth')
  return picked
}

function LibraryChip({ item, taken }: { item: LibraryCard; taken: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `lib:${item.id}`,
    data: { library: item },
    disabled: taken,
  })
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex min-w-0 items-center gap-2 rounded-xl border px-2.5 py-2.5 text-sm ${
        taken
          ? 'cursor-default border-gray-100 bg-gray-50 text-gray-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500'
          : 'cursor-grab border-gray-200 bg-white text-gray-800 active:cursor-grabbing dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100'
      } ${isDragging ? 'opacity-40' : ''}`}
    >
      <GripVertical size={14} className="shrink-0 text-gray-400" />
      <span className="min-w-0 truncate">{item.title}</span>
    </div>
  )
}

function LibraryRow({ label, items, taken }: { label: string; items: LibraryCard[]; taken: Set<string> }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase dark:text-zinc-500">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <LibraryChip key={item.id} item={item} taken={taken.has(item.id)} />
        ))}
      </div>
    </div>
  )
}

function DayPlan({
  day,
  markMissing,
  needsActivity,
}: {
  day: Day
  markMissing: boolean
  needsActivity: boolean
}) {
  const { updateActivity, removeActivity } = useItinerary()
  const { setNodeRef, isOver } = useDroppable({ id: `day-drop-${day.id}` })
  return (
    <div className="mt-4">
      <p className="mb-2 text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase dark:text-zinc-500">On this day</p>
      <FieldAttention on={markMissing && needsActivity}>
        <div
          ref={setNodeRef}
          className={`rounded-xl ${isOver ? 'bg-[#F9FBFF] ring-2 ring-[#E7EFFF] dark:bg-[#5b93ff]/10 dark:ring-[#5b93ff]/30' : ''}`}
        >
          <SortableContext items={day.activities.map((activity) => activity.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {day.activities.length === 0 ? (
                <p className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-400 dark:border-[#2C2A2A]">
                  Drop an activity or highlight here.
                </p>
              ) : null}
              {day.activities.map((activity) => (
                <SortableActivity
                  key={activity.id}
                  activity={activity}
                  attention={markMissing && needsActivity && !activity.title.trim()}
                  onChange={(patch) => updateActivity(day.id, activity.id, patch)}
                  onRemove={() => removeActivity(day.id, activity.id)}
                />
              ))}
              {day.activities.length > 0 ? (
                <p className="rounded-lg border border-dashed border-gray-200 px-3 py-2 text-center text-xs text-gray-400 dark:border-[#2C2A2A]">
                  Drag another activity or highlight here.
                </p>
              ) : null}
            </div>
          </SortableContext>
        </div>
      </FieldAttention>
    </div>
  )
}

function DayWorkspace({ day, markMissing }: { day: Day; markMissing: boolean }) {
  const { updateDay, reorderActivities } = useItinerary()
  const { destinations } = useDestinations()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const [dragging, setDragging] = useState<LibraryCard | null>(null)
  const missing = dayRemaining(day)
  const needsActivity = day.activities.every((activity) => !activity.title.trim())
  const destination = destinations.find((row) => row.id === day.destinationId || row.name === day.destination)
  const taken = new Set(day.activities.map((activity) => activity.activityId).filter((id): id is string => Boolean(id)))

  function onDragStart(event: DragStartEvent) {
    const library = event.active.data.current?.library as LibraryCard | undefined
    setDragging(library ?? null)
  }

  function onDragEnd(event: DragEndEvent) {
    setDragging(null)
    const library = event.active.data.current?.library as LibraryCard | undefined
    const overId = event.over ? String(event.over.id) : ''
    if (library) {
      const onDay = overId === `day-drop-${day.id}` || day.activities.some((activity) => activity.id === overId)
      if (!onDay || taken.has(library.id)) return
      updateDay(day.id, {
        activities: [
          ...day.activities,
          {
            id: uid('act'),
            type: 'activity',
            title: library.title,
            description: library.description,
            image: library.image,
            activityId: library.id,
            kind: library.kind === 'highlight' ? 'highlight' : undefined,
            status: 'included',
            subActivities: [],
            sortOrder: day.activities.length,
          },
        ],
      })
      return
    }
    if (!event.over || event.active.id === event.over.id) return
    const ids = day.activities.map((activity) => activity.id)
    const oldIndex = ids.indexOf(String(event.active.id))
    const newIndex = ids.indexOf(String(event.over.id))
    if (oldIndex < 0 || newIndex < 0) return
    reorderActivities(day.id, arrayMove(day.activities, oldIndex, newIndex))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setDragging(null)}
    >
      <div id={`form-day-${day.id}`} className="flex min-h-0 min-w-0 flex-1 flex-col lg:flex-row">
        <div className="min-h-0 w-full overflow-y-auto border-b border-gray-100 px-5 py-4 lg:w-1/2 lg:border-r lg:border-b-0 dark:border-[#2C2A2A]">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase dark:text-zinc-500">
                Day {String(day.dayNumber).padStart(2, '0')}
              </p>
              <h3 className="mt-1 text-base font-semibold text-gray-900 dark:text-white">{day.destination || 'Add destination'}</h3>
              <p className="text-xs text-gray-400">{formatLong(day.date)}</p>
            </div>
            {missing.length === 0 ? (
              <span className="text-sm text-emerald-600">✓</span>
            ) : (
              <span className="text-xs text-gray-400">{missing.length} remaining</span>
            )}
          </div>
          <SearchSelect
            label="Destination"
            placeholder="Search destinations…"
            attention={markMissing && !day.destination.trim()}
            value={day.destinationId || day.destination}
            options={liveDestinations(destinations).map((row) => ({ value: row.id, label: row.name }))}
            onChange={(value) => {
              const match = destinations.find((row) => row.id === value)
              updateDay(day.id, { destinationId: match?.id, destination: match?.name || value })
            }}
          />
          <div className="mb-3">
            <p className="mb-1.5 text-sm font-normal text-gray-800 dark:text-zinc-100">Day title</p>
            <p className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-400/15 to-blue-500/15 px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-zinc-200">
              <Sparkles size={12} className="shrink-0 text-pink-400" />
              <span className="truncate">{generatedDayTitle(day)}</span>
            </p>
          </div>
          <p className="mb-2 text-sm text-gray-800 dark:text-zinc-100">Destination image</p>
          <FieldAttention on={markMissing && !day.image}>
            <ImageSelect value={day.image} options={destinationImages(destination)} onChange={(image) => updateDay(day.id, { image })} />
          </FieldAttention>
          <DayPlan day={day} markMissing={markMissing} needsActivity={needsActivity} />
          <TravellerInfo day={day} />
        </div>
        <div className="min-h-0 w-full space-y-5 overflow-y-auto px-5 py-4 lg:w-1/2">
          <LibraryRow label="Activities" items={LIBRARY_ACTIVITIES} taken={taken} />
          <LibraryRow label="Highlights" items={LIBRARY_HIGHLIGHTS} taken={taken} />
        </div>
      </div>
      <DragOverlay>
        {dragging ? (
          <div className="flex w-40 items-center gap-2 rounded-xl border border-gray-200 bg-white px-2.5 py-2 text-sm text-gray-800 shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
            <GripVertical size={14} className="shrink-0 text-gray-400" />
            <span className="truncate">{dragging.title}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export function DayBuilder({
  focusDayId,
  attentionToken = 0,
  onAttentionHandled,
  onNightsAdded,
}: {
  focusDayId?: string
  attentionToken?: number
  onAttentionHandled?: () => void
  onNightsAdded?: () => void
}) {
  const { trip, addDay, removeDay } = useItinerary()
  const [openId, setOpenId] = useState<string | null>(focusDayId ?? trip.days[0]?.id ?? null)
  const [markMissing, setMarkMissing] = useState(false)
  const [dayPending, setDayPending] = useState<{ id: string; label: string } | null>(null)
  const [addPrompt, setAddPrompt] = useState(false)
  const nextEnd = trip.startDate ? addDays(trip.startDate, Math.max(trip.days.length - 1, 0) + 1) : ''

  function requestAddDay() {
    if (trip.days.length === 0) {
      addDay()
      return
    }
    setAddPrompt(true)
  }

  function confirmAddDay() {
    addDay()
    setAddPrompt(false)
    onNightsAdded?.()
  }

  useEffect(() => {
    if (!attentionToken) return
    const first = trip.days.find((day) => dayRemaining(day).length)
    if (!first) {
      onAttentionHandled?.()
      return
    }
    setOpenId(first.id)
    setMarkMissing(true)
    const handle = window.setTimeout(() => {
      revealFirstMissing(document.getElementById(`form-day-${first.id}`))
      onAttentionHandled?.()
    }, 80)
    return () => window.clearTimeout(handle)
  }, [attentionToken, onAttentionHandled, trip.days])

  useEffect(() => {
    if (focusDayId) setOpenId(focusDayId)
  }, [focusDayId])

  useEffect(() => {
    if (openId && trip.days.some((day) => day.id === openId)) return
    setOpenId(trip.days[0]?.id ?? null)
  }, [trip.days, openId])

  const selected = trip.days.find((day) => day.id === openId) ?? null

  return (
    <div className="flex h-full min-h-0">
      <div className="flex w-[220px] shrink-0 flex-col border-r border-gray-100 dark:border-[#2C2A2A]">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <p className="text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase dark:text-zinc-500">Days</p>
          <button
            type="button"
            onClick={requestAddDay}
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-950 dark:text-zinc-200 dark:hover:text-white"
          >
            <Plus size={13} /> Add
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-4">
          {trip.days.length === 0 ? (
            <div className="px-2 py-6 text-center">
              <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">No days yet</p>
              <p className="mt-1 text-xs text-gray-500">Start the journey.</p>
              <BaseButton className="mt-3" size="sm" onClick={addDay}>
                <Plus size={14} /> Add first day
              </BaseButton>
            </div>
          ) : (
            trip.days.map((day) => {
              const selectedDay = day.id === openId
              const dayLabel = `Day ${String(day.dayNumber).padStart(2, '0')}`
              return (
                <div
                  key={day.id}
                  className={`flex items-start rounded-lg ${selectedDay ? 'bg-[#E7EFFF] text-[#14357A] dark:bg-white/10 dark:text-white' : 'hover:bg-[#F3F7FF] dark:hover:bg-white/5'}`}
                >
                  <button type="button" onClick={() => setOpenId(day.id)} className="min-w-0 flex-1 px-3 py-2.5 text-left">
                    <span className={`text-[11px] tracking-wide ${selectedDay ? 'text-[#14357A]/70 dark:text-white/70' : 'text-gray-400'}`}>
                      {dayLabel.toUpperCase()}
                    </span>
                    <div className={`mt-0.5 truncate text-sm ${selectedDay ? 'text-[#14357A] dark:text-white' : 'text-gray-900 dark:text-zinc-100'}`}>
                      {day.destination || 'Add destination'}
                    </div>
                    <div className={`text-[11px] ${selectedDay ? 'text-[#14357A]/60 dark:text-white/60' : 'text-gray-400'}`}>{formatShort(day.date)}</div>
                  </button>
                  <div className="mt-1.5 mr-1 flex shrink-0 items-center">
                    <button
                      type="button"
                      aria-label={`Delete ${dayLabel}`}
                      className={`rounded p-1 ${selectedDay ? 'text-[#14357A]/60 hover:bg-[#14357A]/10 hover:text-[#14357A] dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white' : 'text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40'}`}
                      onClick={() => setDayPending({ id: day.id, label: dayLabel })}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
          {trip.days.length > 0 ? (
            <button
              type="button"
              onClick={requestAddDay}
              className="mt-1 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-gray-200 py-2 text-xs font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-200"
            >
              <Plus size={13} /> Add
            </button>
          ) : null}
        </div>
      </div>
      {selected ? (
        <DayWorkspace day={selected} markMissing={markMissing} />
      ) : (
        <div className="flex flex-1 items-center justify-center text-sm text-gray-400">Select a day to edit it.</div>
      )}
      <Modal
        open={addPrompt}
        title="Add a day"
        size="sm"
        onClose={() => setAddPrompt(false)}
        footer={
          <>
            <BaseButton variant="secondary" onClick={() => setAddPrompt(false)}>
              Not now
            </BaseButton>
            <BaseButton onClick={confirmAddDay}>Update dates</BaseButton>
          </>
        }
      >
        <p className="text-sm text-gray-600 dark:text-zinc-300">
          This adds one night and moves the trip end date{nextEnd ? ` to ${formatLong(nextEnd)}` : ''}. The new night shows in Trip Details, where its meal plan still needs a look.
        </p>
      </Modal>
      <ConfirmDialog
        open={dayPending != null}
        title="Delete day"
        message={`${dayPending?.label ?? 'This day'} will be removed from this trip.`}
        onClose={() => setDayPending(null)}
        onConfirm={() => {
          if (!dayPending) return
          removeDay(dayPending.id)
          setDayPending(null)
        }}
      />
    </div>
  )
}
