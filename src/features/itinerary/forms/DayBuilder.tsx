import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, Copy, GripVertical, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { BaseButton } from '../../../components/ui/BaseButton'
import { Modal } from '../../../components/ui/Modal'
import { useToast } from '../../../components/ui/Toast'
import { PLACEMENT_LABEL, routeSummary } from '../../../data/activity-catalog'
import { BaseSelect } from '../../../components/ui/BaseSelect'
import { ImageUploader } from '../../../components/ui/ImageUploader'
import { InputField } from '../../../components/ui/InputField'
import { TextAreaField } from '../../../components/ui/TextAreaField'
import { formatLong, formatShort } from '../../../lib/dates'
import { dayRemaining } from '../../../lib/completeness'
import { uid } from '../../../lib/ids'
import { useActivities } from '../../../state/activity-store'
import { useDestinations } from '../../../state/destination-store'
import { useHotelMaster } from '../../../state/hotel-store'
import { SearchSelect } from '../../../components/ui/SearchSelect'
import {
  activityOpsFilled,
  emptyMeals,
  emptyPickup,
  emptyTravel,
  mealsFilled,
  STATUS_OPTIONS,
  TRANSPORT_OPTIONS,
  travelFilled,
  travellerFilled,
} from '../../../lib/day-glance'
import { useItinerary } from '../../../state/itinerary-store'
import type { ActivityRecord } from '../../../types/activity'
import type { HotelRecord } from '../../../types/hotel'
import type { Activity, ActivityStatus, ActivityType, Day, DayMeals } from '../../../types/itinerary'

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
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800"
            />
            {key[0].toUpperCase() + key.slice(1)}
          </label>
        ))}
      </div>
    </div>
  )
}

function SortableActivity({
  activity,
  onChange,
  onRemove,
  onAddSub,
}: {
  activity: Activity
  onChange: (p: Partial<Activity>) => void
  onRemove: () => void
  onAddSub: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: activity.id })
  const hasOps = activityOpsFilled(activity)
  const [open, setOpen] = useState(false)
  const [more, setMore] = useState(
    Boolean(activity.extraCost?.trim() || activity.bookingRef?.trim() || activity.meetingPoint?.trim()),
  )

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
        <span className="w-16 shrink-0 text-[10px] font-medium tracking-[0.12em] text-gray-400 uppercase">{TYPE_LABEL[activity.type]}</span>
        <InputField
          className="mb-0 min-w-0 flex-1"
          dense
          aria-label={`${TYPE_LABEL[activity.type]} title`}
          placeholder={ITEM_PLACEHOLDER[activity.type]}
          value={activity.title}
          onChange={(e) => onChange({ title: e.target.value })}
          startIcon={<Pencil size={14} strokeWidth={1.75} />}
        />
        <button
          type="button"
          className="text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200"
          aria-expanded={open}
          aria-label="Activity details"
          onClick={() => setOpen((v) => !v)}
        >
          <ChevronDown size={16} className={`transition ${open ? 'rotate-180' : ''} ${hasOps ? 'text-blue-500' : ''}`} />
        </button>
        <button type="button" className="text-gray-400 hover:text-red-500" onClick={onRemove}>
          <Trash2 size={14} />
        </button>
      </div>
      {activity.type === 'meal' ? (
        <div className="mt-1 ml-7 flex flex-wrap gap-1">
          {['Breakfast', 'Lunch', 'Dinner'].map((label) => (
            <button
              key={label}
              type="button"
              className={`rounded-full border px-2 py-0.5 text-[11px] ${activity.title === label ? 'border-gray-900 text-gray-900 dark:border-zinc-200 dark:text-zinc-100' : 'border-gray-200 text-gray-500 dark:border-[#2C2A2A] dark:text-zinc-400'}`}
              onClick={() => onChange({ title: label })}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}
      {activity.type === 'activity' || activity.subActivities.length > 0 ? (
        <div className="ml-7 space-y-0.5">
          {activity.subActivities.map((s, i) => (
            <InputField
              key={s.id}
              className="mb-0"
              dense
              aria-label="Sub activity"
              placeholder="Type here"
              value={s.title}
              onChange={(e) => {
                const next = activity.subActivities.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x))
                onChange({ subActivities: next })
              }}
              startIcon={<Pencil size={13} strokeWidth={1.75} />}
            />
          ))}
        </div>
      ) : null}
      {activity.type === 'activity' ? (
        <button
          type="button"
          className="ml-7 mt-1 text-xs text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-100"
          onClick={onAddSub}
        >
          + Add sub activity
        </button>
      ) : null}
      {open && (
        <div className="mt-2 ml-7 border-t border-gray-200 pt-2 dark:border-[#2C2A2A]">
          <div className="grid grid-cols-2 gap-3">
            <InputField
              className="mb-2"
              label="Time"
              optional
              placeholder="8:30 AM"
              value={activity.time ?? ''}
              onChange={(e) => onChange({ time: e.target.value })}
            />
            <BaseSelect
              className="mb-2"
              label="Status"
              optional
              placeholder="Select"
              options={STATUS_OPTIONS}
              value={activity.status ?? ''}
              onChange={(e) => onChange({ status: e.target.value as ActivityStatus | '' })}
            />
          </div>
          <TextAreaField
            className="mb-2"
            label="Notes"
            optional
            rows={2}
            placeholder="Morning climb before travelling to Kandy"
            value={activity.notes ?? ''}
            onChange={(e) => onChange({ notes: e.target.value })}
          />
          {more ? (
            <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-3">
              <InputField
                className="mb-2"
                label="Additional cost"
                optional
                placeholder="From USD 40"
                value={activity.extraCost ?? ''}
                onChange={(e) => onChange({ extraCost: e.target.value })}
              />
              <InputField
                className="mb-2"
                label="Booking reference"
                optional
                placeholder="Confirmation no."
                value={activity.bookingRef ?? ''}
                onChange={(e) => onChange({ bookingRef: e.target.value })}
              />
              <InputField
                className="mb-0 sm:col-span-2"
                label="Meeting point"
                optional
                placeholder="Hotel lobby"
                value={activity.meetingPoint ?? ''}
                onChange={(e) => onChange({ meetingPoint: e.target.value })}
              />
            </div>
          ) : (
            <button
              type="button"
              className="text-xs text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-100"
              onClick={() => setMore(true)}
            >
              + More details
            </button>
          )}
        </div>
      )}
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

function ActivityPicker({
  day,
  master,
  open,
  onClose,
  onAdd,
  onCustom,
}: {
  day: Day
  master: ActivityRecord[]
  open: boolean
  onClose: () => void
  onAdd: (source: { activityId: string; title: string; description: string }) => void
  onCustom: () => void
}) {
  const { notify } = useToast()
  const [query, setQuery] = useState('')
  const place = day.destination.trim().toLowerCase()
  const taken = new Set(day.activities.map((item) => item.activityId).filter(Boolean))
  const available = master.filter((item) => item.status === 'active' && !taken.has(item.id))
  const suggested = available.filter(
    (item) => item.type === 'within_destination' && (item.locationId === day.destinationId || item.locationName.toLowerCase() === place),
  )
  const q = query.trim().toLowerCase()
  const results = (q
    ? available.filter((item) =>
        [item.name, item.locationName, PLACEMENT_LABEL[item.type], routeSummary(item)].join(' ').toLowerCase().includes(q),
      )
    : suggested
  ).slice().sort((a, b) => {
    const aHere = suggested.some((item) => item.id === a.id) ? 0 : 1
    const bHere = suggested.some((item) => item.id === b.id) ? 0 : 1
    return aHere - bHere || a.name.localeCompare(b.name)
  })
  const destinationLabel = day.destination.trim() || 'this destination'

  useEffect(() => {
    if (open) setQuery('')
  }, [open])

  function choose(item: ActivityRecord) {
    onAdd({ activityId: item.id, title: item.name, description: item.description || '' })
    notify(`Activity added to Day ${String(day.dayNumber).padStart(2, '0')}.`)
    onClose()
  }

  return (
    <Modal
      open={open}
      title="Add activity"
      subtitle={day.destination.trim() ? `Day ${String(day.dayNumber).padStart(2, '0')} · ${day.destination}` : `Day ${String(day.dayNumber).padStart(2, '0')}`}
      onClose={onClose}
      footer={
        <button type="button" className="text-sm font-medium text-gray-800 hover:text-gray-950 dark:text-zinc-100" onClick={() => { onCustom(); onClose() }}>
          + Add Custom Activity
        </button>
      }
    >
      <div className="relative mb-4">
        <Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search activities..."
          className="h-10 w-full rounded-lg border border-gray-200 bg-white pr-3 pl-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-transparent dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <p className="mb-2 text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase">
        {q ? 'Activity master' : `Suggested for ${destinationLabel}`}
      </p>
      {results.length ? (
        <ul className="space-y-1">
          {results.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-white/5"
                onClick={() => choose(item)}
              >
                <span>
                  <span className="block text-sm text-gray-900 dark:text-zinc-100">{item.name}</span>
                  <span className="block text-xs text-gray-400">{routeSummary(item)}</span>
                </span>
                <span className="shrink-0 text-[11px] text-gray-400">{PLACEMENT_LABEL[item.type]}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-6 text-center text-sm text-gray-400">
          {q ? 'No activities match that search.' : `No activities for ${destinationLabel}. Search the full library above.`}
        </p>
      )}
    </Modal>
  )
}

function HotelPicker({
  day,
  hotels,
  open,
  onClose,
  onAdd,
  onCustom,
}: {
  day: Day
  hotels: HotelRecord[]
  open: boolean
  onClose: () => void
  onAdd: (hotel: HotelRecord) => void
  onCustom: () => void
}) {
  const { notify } = useToast()
  const [query, setQuery] = useState('')
  const place = day.destination.trim().toLowerCase()
  const taken = new Set(day.activities.filter((item) => item.type === 'hotel').map((item) => item.title.trim().toLowerCase()))
  const available = hotels.filter((hotel) => hotel.status === 'active' && hotel.name.trim() && !taken.has(hotel.name.trim().toLowerCase()))
  const here = available.filter(
    (hotel) =>
      (Boolean(day.destinationId) && hotel.destinationId === day.destinationId) ||
      (Boolean(place) && (hotel.destinationName ?? '').toLowerCase() === place),
  )
  const q = query.trim().toLowerCase()
  const results = (q
    ? available.filter((hotel) => [hotel.name, hotel.destinationName, hotel.address].join(' ').toLowerCase().includes(q))
    : here
  ).slice().sort((a, b) => {
    const aHere = here.some((hotel) => hotel.id === a.id) ? 0 : 1
    const bHere = here.some((hotel) => hotel.id === b.id) ? 0 : 1
    return aHere - bHere || a.name.localeCompare(b.name)
  })
  const destinationLabel = day.destination.trim() || 'this destination'

  useEffect(() => {
    if (open) setQuery('')
  }, [open])

  return (
    <Modal
      open={open}
      title="Add hotel"
      subtitle={day.destination.trim() ? `Day ${String(day.dayNumber).padStart(2, '0')} · ${day.destination}` : `Day ${String(day.dayNumber).padStart(2, '0')}`}
      onClose={onClose}
      footer={
        <button type="button" className="text-sm font-medium text-gray-800 hover:text-gray-950 dark:text-zinc-100" onClick={() => { onCustom(); onClose() }}>
          + Add Custom Hotel
        </button>
      }
    >
      <div className="relative mb-4">
        <Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search hotels..."
          className="h-10 w-full rounded-lg border border-gray-200 bg-white pr-3 pl-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-transparent dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <p className="mb-2 text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase">
        {q ? 'Hotel master' : `Hotels in ${destinationLabel}`}
      </p>
      {results.length ? (
        <ul className="space-y-1">
          {results.map((hotel) => (
            <li key={hotel.id}>
              <button
                type="button"
                className="flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-white/5"
                onClick={() => {
                  onAdd(hotel)
                  notify(`Hotel added to Day ${String(day.dayNumber).padStart(2, '0')}.`)
                  onClose()
                }}
              >
                <span>
                  <span className="block text-sm text-gray-900 dark:text-zinc-100">{hotel.name}</span>
                  <span className="block text-xs text-gray-400">{hotel.destinationName || hotel.address.split('\n')[0] || '—'}</span>
                </span>
                <span className="shrink-0 text-[11px] text-gray-400">{hotel.starCategory ? `${hotel.starCategory} Star` : ''}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-6 text-center text-sm text-gray-400">
          {q ? 'No hotels match that search.' : `No hotels for ${destinationLabel}. Search the full library above.`}
        </p>
      )}
    </Modal>
  )
}

function ActivitySuggestions({
  day,
  master,
  onAdd,
}: {
  day: Day
  master: ActivityRecord[]
  onAdd: (source: { activityId: string; title: string; description: string }) => void
}) {
  const place = day.destination.trim().toLowerCase()
  const taken = new Set(day.activities.map((a) => a.activityId).filter(Boolean))
  const here = master.filter((a) => a.status === 'active' && a.type === 'within_destination' && (a.locationId === day.destinationId || a.locationName.toLowerCase() === place) && !taken.has(a.id))
  const from = (day.travel?.from || '').trim().toLowerCase()
  const to = (day.travel?.to || day.destination).trim().toLowerCase()
  const enRoute = master.filter(
    (a) =>
      a.status === 'active' &&
      a.type === 'en_route' &&
      !taken.has(a.id) &&
      a.applicableRoutes.some((route) => {
        const start = route.fromLocationName.toLowerCase()
        const end = route.toLocationName.toLowerCase()
        return !!from && start.includes(from) && end.includes(to)
      }),
  )
  if (!here.length && !enRoute.length) return null
  return (
    <div className="mt-3 space-y-2">
      {here.length ? (
        <div>
          <p className="mb-1 text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase">Suggested activities</p>
          <div className="flex flex-wrap gap-2">
            {here.slice(0, 6).map((a) => (
              <button key={a.id} type="button" className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-700 dark:border-[#2C2A2A] dark:text-zinc-200" onClick={() => onAdd({ activityId: a.id, title: a.name, description: a.description || '' })}>
                {a.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {enRoute.length ? (
        <div>
          <p className="mb-1 text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase">En-route experiences</p>
          <div className="flex flex-wrap gap-2">
            {enRoute.slice(0, 4).map((a) => (
              <button key={a.id} type="button" className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-700 dark:border-[#2C2A2A] dark:text-zinc-200" onClick={() => onAdd({ activityId: a.id, title: a.name, description: a.description || '' })}>
                {a.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function DayCard({ day, open, onToggle }: { day: Day; open: boolean; onToggle: () => void }) {
  const { updateDay, duplicateDay, removeDay, addActivity, addFromMaster, updateActivity, removeActivity, reorderActivities, addSubActivity } =
    useItinerary()
  const { activities: master } = useActivities()
  const { destinations } = useDestinations()
  const { hotels } = useHotelMaster()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [hotelPickerOpen, setHotelPickerOpen] = useState(false)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const missing = dayRemaining(day)

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const ids = day.activities.map((a) => a.id)
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    reorderActivities(day.id, arrayMove(day.activities, oldIndex, newIndex))
  }

  return (
    <div id={`form-day-${day.id}`} className="scroll-mt-3 overflow-hidden rounded-xl border border-gray-100 dark:border-[#2C2A2A]">
      <div className="flex w-full items-start">
        <button type="button" onClick={onToggle} className="flex min-w-0 flex-1 items-start px-4 py-3 text-left">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-zinc-100">
              DAY {String(day.dayNumber).padStart(2, '0')}
              {missing.length === 0 ? (
                <span className="text-emerald-600">✓</span>
              ) : (
                <span className="text-xs font-normal text-gray-400">{missing.length} details remaining</span>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-zinc-400">{formatShort(day.date)}</div>
            <div className="mt-1 text-sm tracking-wide text-gray-900 uppercase dark:text-zinc-100">{day.destination || 'Add destination'}</div>
            <div className="text-xs text-gray-400">
              {day.activities.length} {day.activities.length === 1 ? 'item' : 'items'} {day.image ? '• Image added' : ''}
              {travelFilled(day.travel) || mealsFilled(day.meals) || day.hotelName?.trim() || day.tip?.trim() ? ' • Traveller info' : ''}
            </div>
          </div>
        </button>
        <div className="flex items-center gap-1 pr-3 pt-3">
          <button
            type="button"
            aria-label={`Delete day ${String(day.dayNumber).padStart(2, '0')}`}
            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
            onClick={() => {
              const label = `Day ${String(day.dayNumber).padStart(2, '0')}`
              if (!window.confirm(`Delete ${label}?`)) return
              removeDay(day.id)
            }}
          >
            <Trash2 size={14} />
          </button>
          <button type="button" onClick={onToggle} aria-label={open ? 'Collapse day' : 'Expand day'} className="rounded p-1 text-gray-400">
            <ChevronDown size={16} className={`transition ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-gray-100 px-4 py-3 dark:border-[#2C2A2A]">
          <div className="grid grid-cols-2 gap-4">
            <SearchSelect
              label="Destination"
              placeholder="Search destinations…"
              value={day.destinationId || day.destination}
              options={destinations.filter((row) => row.status !== 'archived').map((row) => ({ value: row.id, label: row.name }))}
              onChange={(value) => {
                const match = destinations.find((row) => row.id === value)
                updateDay(day.id, { destinationId: match?.id, destination: match?.name || value })
              }}
            />
            <InputField label="Day title" value={day.title} onChange={(e) => updateDay(day.id, { title: e.target.value })} />
          </div>
          <p className="mb-2 text-xs text-gray-400">{formatLong(day.date)}</p>
          <ImageUploader
            label="Upload destination image"
            className="mb-2"
            aspect="h-[250px]"
            value={day.image}
            onChange={(url) => updateDay(day.id, { image: url })}
            onRemove={() => updateDay(day.id, { image: '' })}
          />
          <div className="flex flex-wrap gap-2">
            <BaseButton size="sm" variant="secondary" onClick={() => setPickerOpen(true)}>
              + Activity
            </BaseButton>
            <BaseButton size="sm" variant="secondary" onClick={() => addActivity(day.id, 'transfer')}>
              + Transfer
            </BaseButton>
            <BaseButton size="sm" variant="secondary" onClick={() => addActivity(day.id, 'meal')}>
              + Meal
            </BaseButton>
            <BaseButton size="sm" variant="secondary" onClick={() => setHotelPickerOpen(true)}>
              + Hotel
            </BaseButton>
            <BaseButton size="sm" variant="secondary" onClick={() => addActivity(day.id, 'note')}>
              + Note
            </BaseButton>
          </div>
          <ActivityPicker
            day={day}
            master={master}
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            onAdd={(source) => addFromMaster(day.id, source)}
            onCustom={() => addActivity(day.id, 'activity')}
          />
          <HotelPicker
            day={day}
            hotels={hotels}
            open={hotelPickerOpen}
            onClose={() => setHotelPickerOpen(false)}
            onAdd={(hotel) => {
              updateDay(day.id, {
                activities: [
                  ...day.activities,
                  {
                    id: uid('act'),
                    type: 'hotel',
                    title: hotel.name,
                    description: '',
                    subActivities: [],
                    sortOrder: day.activities.length,
                  },
                ],
              })
            }}
            onCustom={() => addActivity(day.id, 'hotel')}
          />
          <ActivitySuggestions day={day} master={master} onAdd={(source) => addFromMaster(day.id, source)} />
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={day.activities.map((a) => a.id)} strategy={verticalListSortingStrategy}>
              <div className="mt-3 space-y-2">
                {day.activities.map((activity) => (
                  <SortableActivity
                    key={activity.id}
                    activity={activity}
                    onChange={(p) => updateActivity(day.id, activity.id, p)}
                    onRemove={() => removeActivity(day.id, activity.id)}
                    onAddSub={() => addSubActivity(day.id, activity.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <TravellerInfo day={day} />
          <div className="mt-4 flex justify-between">
            <BaseButton size="sm" variant="secondary" onClick={() => duplicateDay(day.id)}>
              <Copy size={14} /> Duplicate day
            </BaseButton>
            <BaseButton size="sm" variant="danger" onClick={() => removeDay(day.id)}>
              <Trash2 size={14} /> Delete day
            </BaseButton>
          </div>
        </div>
      )}
    </div>
  )
}

export function DayBuilder({ focusDayId }: { focusDayId?: string }) {
  const { trip, addDay } = useItinerary()
  const [openId, setOpenId] = useState<string | null>(focusDayId ?? trip.days[0]?.id ?? null)

  useEffect(() => {
    if (!focusDayId) return
    setOpenId(focusDayId)
  }, [focusDayId])

  return (
    <div className="space-y-3 px-6 py-4">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">Day-by-day</h3>
      {trip.days.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center">
          <p className="font-medium">No itinerary days yet</p>
          <p className="mt-1 text-sm text-gray-500">Start building your customer’s journey.</p>
          <BaseButton className="mt-4" onClick={addDay}>
            <Plus size={14} /> Add first day
          </BaseButton>
        </div>
      )}
      {trip.days.map((day) => (
        <DayCard
          key={day.id}
          day={day}
          open={openId === day.id}
          onToggle={() => setOpenId((id) => (id === day.id ? null : day.id))}
        />
      ))}
      {trip.days.length > 0 && (
        <BaseButton variant="secondary" onClick={addDay}>
          + Add another day
        </BaseButton>
      )}
    </div>
  )
}
