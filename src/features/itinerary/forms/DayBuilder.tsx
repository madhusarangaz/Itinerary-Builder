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
import { ChevronDown, Copy, GripVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { BaseButton } from '../../../components/ui/BaseButton'
import { BaseSelect } from '../../../components/ui/BaseSelect'
import { ImageUploader } from '../../../components/ui/ImageUploader'
import { InputField } from '../../../components/ui/InputField'
import { TextAreaField } from '../../../components/ui/TextAreaField'
import { formatLong, formatShort } from '../../../lib/dates'
import { dayRemaining } from '../../../lib/completeness'
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
import type { Activity, ActivityStatus, ActivityType, Day, DayMeals } from '../../../types/itinerary'

const QUICK: { type: ActivityType; label: string }[] = [
  { type: 'activity', label: '+ Activity' },
  { type: 'transfer', label: '+ Transfer' },
  { type: 'meal', label: '+ Meal' },
  { type: 'hotel', label: '+ Hotel' },
  { type: 'note', label: '+ Note' },
]

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
        <InputField
          className="mb-0 min-w-0 flex-1"
          dense
          aria-label="Activity title"
          placeholder="Type activity name"
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
      <button
        type="button"
        className="ml-7 mt-1 text-xs text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-100"
        onClick={onAddSub}
      >
        + Add sub activity
      </button>
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

function DayCard({ day, open, onToggle }: { day: Day; open: boolean; onToggle: () => void }) {
  const { updateDay, duplicateDay, removeDay, addActivity, updateActivity, removeActivity, reorderActivities, addSubActivity } =
    useItinerary()
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
      <button type="button" onClick={onToggle} className="flex w-full items-start justify-between px-4 py-3 text-left">
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
            {day.activities.length} activities {day.image ? '• Image added' : ''}
            {travelFilled(day.travel) || mealsFilled(day.meals) || day.hotelName?.trim() || day.tip?.trim() ? ' • Traveller info' : ''}
          </div>
        </div>
        <ChevronDown size={16} className={`mt-1 text-gray-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="border-t border-gray-100 px-4 py-3 dark:border-[#2C2A2A]">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Destination"
              value={day.destination}
              onChange={(e) => updateDay(day.id, { destination: e.target.value })}
            />
            <InputField label="Day title" value={day.title} onChange={(e) => updateDay(day.id, { title: e.target.value })} />
          </div>
          <p className="mb-2 text-xs text-gray-400">{formatLong(day.date)}</p>
          <ImageUploader
            label="Upload destination image"
            value={day.image}
            onChange={(url) => updateDay(day.id, { image: url })}
            onRemove={() => updateDay(day.id, { image: '' })}
          />
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={day.activities.map((a) => a.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
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
          <div className="mt-3 flex flex-wrap gap-2">
            {QUICK.map((q) => (
              <BaseButton key={q.type} size="sm" variant="secondary" onClick={() => addActivity(day.id, q.type)}>
                {q.label}
              </BaseButton>
            ))}
          </div>
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
