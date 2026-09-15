import { ChevronDown, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { BaseButton } from '../../../components/ui/BaseButton'
import { BaseSelect } from '../../../components/ui/BaseSelect'
import { CheckboxField } from '../../../components/ui/CheckboxField'
import { ChoicePills } from '../../../components/ui/ChoicePills'
import { InputField } from '../../../components/ui/InputField'
import { Modal } from '../../../components/ui/Modal'
import { StepperField } from '../../../components/ui/StepperField'
import { DESTINATION_LABELS } from '../../../data/destinations'
import { formatShort } from '../../../lib/dates'
import { uid } from '../../../lib/ids'
import {
  calculateAccommodationDayTotal,
  calculateAccommodationTotal,
  calculateGuideAccommodationTotal,
  calculateRouteKm,
  formatMoney,
} from '../../../lib/costing-calc'
import { useCosting } from '../../../state/costing-store'
import { useItinerary } from '../../../state/itinerary-store'
import type { AccommodationCostRow, RoomType } from '../../../types/costing'
import type { Hotel } from '../../../types/itinerary'

const MEALS = ['RO', 'BB', 'HB', 'FB', 'AI', 'Custom']
const STARS = ['3 Star', '4 Star', '5 Star', 'Boutique', 'Luxury']
const ROOM_LABEL: Record<RoomType, string> = {
  SGL: 'Single',
  DBL: 'Double',
  TRPL: 'Triple',
  TWIN: 'Twin',
  FAMILY: 'Family',
  SUITE: 'Suite',
  VILLA: 'Villa',
  CUSTOM: 'Custom',
}

function HotelPicker({
  value,
  destination,
  onPick,
}: {
  value: string
  destination: string
  onPick: (hotel: Hotel | { name: string }) => void
}) {
  const { hotels, addHotel } = useItinerary()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [modal, setModal] = useState(false)
  const list = useMemo(() => {
    const term = q.toLowerCase()
    return hotels.filter(
      (h) =>
        h.name.toLowerCase().includes(term) ||
        h.destination.toLowerCase().includes(term) ||
        (destination && h.destination.toLowerCase().includes(destination.toLowerCase())),
    )
  }, [hotels, q, destination])

  return (
    <div className="relative mb-3">
      <InputField
        label="Hotel"
        placeholder="Search hotels..."
        startIcon={<Search size={16} />}
        value={open ? q : value}
        onFocus={() => {
          setOpen(true)
          setQ('')
        }}
        onChange={(e) => {
          setQ(e.target.value)
          setOpen(true)
        }}
      />
      {open && (
        <div className="absolute z-30 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          {list.map((h) => (
            <button
              key={h.id}
              type="button"
              className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-zinc-700"
              onClick={() => {
                onPick(h)
                setOpen(false)
                setQ('')
              }}
            >
              <div className="font-medium text-gray-900 dark:text-zinc-100">{h.name}</div>
              <div className="text-xs text-gray-500">{h.destination}</div>
            </button>
          ))}
          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-sm text-blue-600"
            onClick={() => setModal(true)}
          >
            + Add new hotel
          </button>
        </div>
      )}
      <Modal
        open={modal}
        title="Add hotel"
        onClose={() => setModal(false)}
        footer={
          <>
            <BaseButton variant="secondary" onClick={() => setModal(false)}>
              Cancel
            </BaseButton>
            <BaseButton
              onClick={() => {
                const hotel = addHotel({
                  name: q || 'New hotel',
                  destination,
                  starRating: 5,
                  mealPlans: ['HB'],
                  image: '',
                  notes: '',
                })
                onPick(hotel)
                setModal(false)
                setOpen(false)
              }}
            >
              Save hotel
            </BaseButton>
          </>
        }
      >
        <InputField label="Hotel name" value={q} onChange={(e) => setQ(e.target.value)} />
      </Modal>
    </div>
  )
}

function StayCard({
  row,
  currency,
  onChange,
  onRemove,
}: {
  row: AccommodationCostRow
  currency: string
  onChange: (p: Partial<AccommodationCostRow>) => void
  onRemove: () => void
}) {
  const [open, setOpen] = useState(false)
  const [more, setMore] = useState(row.guideRoomRate > 0)
  const total = calculateAccommodationDayTotal(row)
  const departure = /depart/i.test(row.destinationName) && row.nights === 0

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-[#2C2A2A]">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-start justify-between px-4 py-3 text-left">
        <div>
          <div className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
            DAY {String(row.dayNumber).padStart(2, '0')}
            <span className="ml-2 text-xs font-normal text-gray-400">{formatShort(row.date)}</span>
          </div>
          <div className="mt-0.5 text-sm uppercase tracking-wide text-gray-900 dark:text-zinc-100">
            {row.destinationName || 'Add destination'}
          </div>
          <div className="text-xs text-gray-400">
            {departure ? 'No stay' : `${row.hotelName || 'Hotel to confirm'} · ${row.mealPlan || 'Meal'} · ${row.nights} night`}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-zinc-100">{formatMoney(total, currency)}</span>
          <ChevronDown size={16} className={`text-gray-400 transition ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {open && (
        <div className="border-t border-gray-100 px-4 py-3 dark:border-[#2C2A2A]">
          <div className="grid grid-cols-2 gap-4">
            <BaseSelect
              label="Destination"
              value={DESTINATION_LABELS.includes(row.destinationName) ? row.destinationName : row.destinationName}
              onChange={(e) => onChange({ destinationName: e.target.value })}
              options={[
                ...(!row.destinationName || DESTINATION_LABELS.includes(row.destinationName)
                  ? []
                  : [{ value: row.destinationName, label: row.destinationName }]),
                ...DESTINATION_LABELS.map((s) => ({ value: s, label: s })),
              ]}
              placeholder="Select"
            />
            <InputField label="Date" type="date" value={row.date} onChange={(e) => onChange({ date: e.target.value })} />
          </div>
          <HotelPicker
            value={row.hotelName ?? ''}
            destination={row.destinationName}
            onPick={(h) =>
              onChange({
                hotelName: 'id' in h ? h.name : h.name,
                hotelId: 'id' in h ? h.id : undefined,
                starClass: 'starRating' in h ? `${h.starRating} Star` : row.starClass,
              })
            }
          />
          <ChoicePills
            label="Star"
            value={row.starClass ?? ''}
            onChange={(starClass) => onChange({ starClass })}
            options={STARS.map((s) => ({ value: s, label: s }))}
          />
          <ChoicePills
            label="Meal plan"
            value={row.mealPlan ?? ''}
            onChange={(mealPlan) => onChange({ mealPlan })}
            options={MEALS.map((s) => ({ value: s, label: s }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <StepperField label="Nights" min={0} max={14} value={row.nights} onChange={(nights) => onChange({ nights })} />
            <StepperField label="Route KM" min={0} step={10} value={row.routeKm} suffix="km" onChange={(routeKm) => onChange({ routeKm })} />
          </div>
          <p className="mb-2 text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase">Room configuration</p>
          <div className="space-y-2">
            {row.rooms.map((room) => (
              <div key={room.id} className="grid grid-cols-[1fr_1fr_auto_auto] items-end gap-2">
                <InputField className="mb-0" label={ROOM_LABEL[room.type] ?? room.type} value={ROOM_LABEL[room.type] ?? room.label ?? room.type} disabled />
                <InputField
                  className="mb-0"
                  label="Rate"
                  type="number"
                  min={0}
                  value={room.rate}
                  onChange={(e) => {
                    const rate = Number(e.target.value) || 0
                    onChange({ rooms: row.rooms.map((r) => (r.id === room.id ? { ...r, rate } : r)) })
                  }}
                />
                <StepperField
                  className="mb-0"
                  label="Rooms"
                  min={0}
                  max={12}
                  value={room.quantity}
                  onChange={(quantity) => onChange({ rooms: row.rooms.map((r) => (r.id === room.id ? { ...r, quantity } : r)) })}
                />
                <button
                  type="button"
                  className="mb-2 text-gray-400 hover:text-red-500"
                  onClick={() => onChange({ rooms: row.rooms.filter((r) => r.id !== room.id) })}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-2 text-xs text-gray-500 hover:text-gray-800 dark:text-zinc-400"
            onClick={() => {
              const extras: RoomType[] = ['TWIN', 'FAMILY', 'SUITE', 'VILLA', 'CUSTOM']
              const next = extras.find((t) => !row.rooms.some((r) => r.type === t)) ?? 'CUSTOM'
              onChange({ rooms: [...row.rooms, { id: uid('rm'), type: next, rate: 0, quantity: 0 }] })
            }}
          >
            + Add room type
          </button>
          <CheckboxField
            className="mt-3"
            label="Include a guide room this night"
            checked={more || row.guideRoomRate > 0}
            onChange={(on) => {
              setMore(on)
              if (!on) onChange({ guideRoomRate: 0 })
            }}
          />
          {(more || row.guideRoomRate > 0) && (
            <InputField
              label="Guide room rate"
              optional
              type="number"
              min={0}
              value={row.guideRoomRate}
              onChange={(e) => onChange({ guideRoomRate: Number(e.target.value) || 0 })}
            />
          )}
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Day total <span className="font-medium text-gray-900 dark:text-zinc-100">{formatMoney(total, currency)}</span>
            </p>
            <BaseButton size="sm" variant="danger" onClick={onRemove}>
              <Trash2 size={14} /> Remove
            </BaseButton>
          </div>
        </div>
      )}
    </div>
  )
}

export function AccommodationCostBuilder() {
  const { active: c, patchActive } = useCosting()
  const currency = c.currency
  const acc = calculateAccommodationTotal(c.accommodation)
  const guide = calculateGuideAccommodationTotal(c.accommodation)
  const km = calculateRouteKm(c.accommodation)

  function updateRow(id: string, p: Partial<AccommodationCostRow>) {
    patchActive({ accommodation: c.accommodation.map((r) => (r.id === id ? { ...r, ...p } : r)) })
  }

  return (
    <div id="cost-stay" className="scroll-mt-3 space-y-3 px-6 py-4">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">Accommodation</h3>
      {c.accommodation.length === 0 && (
        <p className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-[#2C2A2A]">
          No accommodation added yet.
        </p>
      )}
      {c.accommodation.map((row) => (
        <StayCard
          key={row.id}
          row={row}
          currency={currency}
          onChange={(p) => updateRow(row.id, p)}
          onRemove={() => patchActive({ accommodation: c.accommodation.filter((r) => r.id !== row.id) })}
        />
      ))}
      <BaseButton
        variant="secondary"
        onClick={() => {
          const last = c.accommodation[c.accommodation.length - 1]
          const n = c.accommodation.length + 1
          patchActive({
            accommodation: [
              ...c.accommodation,
              {
                id: uid('cst'),
                date: last?.date ?? c.arrivalDate,
                dayNumber: n,
                destinationName: '',
                hotelName: '',
                starClass: c.starCategory,
                mealPlan: 'HB',
                nights: 1,
                routeKm: 40,
                rooms: [
                  { id: uid('rm'), type: 'SGL', rate: 0, quantity: 0 },
                  { id: uid('rm'), type: 'DBL', rate: 0, quantity: 1 },
                  { id: uid('rm'), type: 'TRPL', rate: 0, quantity: 0 },
                ],
                guideRoomRate: 0,
              },
            ],
          })
        }}
      >
        <Plus size={14} /> Add stay
      </BaseButton>
      <div className="rounded-xl border border-gray-100 px-4 py-3 text-sm dark:border-[#2C2A2A]">
        <div className="flex justify-between text-gray-500">
          <span>Total days</span>
          <span>{c.tripDays}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Total nights</span>
          <span>{c.nights}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Route KM</span>
          <span>{km} km</span>
        </div>
        <div className="mt-2 flex justify-between font-medium text-gray-900 dark:text-zinc-100">
          <span>Accommodation</span>
          <span>{formatMoney(acc, currency)}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Guide accommodation</span>
          <span>{formatMoney(guide, currency)}</span>
        </div>
      </div>
    </div>
  )
}
