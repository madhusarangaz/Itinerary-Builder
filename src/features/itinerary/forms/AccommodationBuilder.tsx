import { Search, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { BaseButton } from '../../../components/ui/BaseButton'
import { BaseSelect } from '../../../components/ui/BaseSelect'
import { ImageUploader } from '../../../components/ui/ImageUploader'
import { InputField } from '../../../components/ui/InputField'
import { Modal } from '../../../components/ui/Modal'
import { TextAreaField } from '../../../components/ui/TextAreaField'
import { useItinerary } from '../../../state/itinerary-store'
import type { Hotel } from '../../../types/itinerary'

function HotelSelector({
  value,
  destination,
  onPick,
}: {
  value: string
  destination: string
  onPick: (hotel: Hotel) => void
}) {
  const { hotels, addHotel } = useItinerary()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [modal, setModal] = useState(false)
  const [draft, setDraft] = useState({
    name: '',
    destination,
    starRating: 5,
    mealPlans: 'BB, HB',
    image: '',
    notes: '',
  })

  const list = useMemo(() => {
    const term = q.toLowerCase()
    return hotels.filter(
      (h) =>
        h.name.toLowerCase().includes(term) ||
        h.destination.toLowerCase().includes(term) ||
        (destination && h.destination.toLowerCase().includes(destination.toLowerCase())),
    )
  }, [hotels, q, destination])

  const selected = hotels.find((h) => h.id === value)

  return (
    <div className="relative mb-3">
      <InputField
        label="Hotel"
        placeholder="Search hotel..."
        startIcon={<Search size={16} />}
        value={open ? q : selected?.name ?? q}
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
        <div className="absolute z-30 max-h-56 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          {list.map((h) => (
            <button
              key={h.id}
              type="button"
              className="block w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 dark:text-zinc-100 dark:hover:bg-zinc-700"
              onClick={() => {
                onPick(h)
                setOpen(false)
                setQ('')
              }}
            >
              <div className="font-medium">{h.name}</div>
              <div className="text-xs text-gray-500 dark:text-zinc-400">
                {h.destination} • {h.starRating} Star
              </div>
            </button>
          ))}
          {q && (
            <button
              type="button"
              className="block w-full px-3 py-2 text-left text-sm text-blue-600 dark:text-blue-400"
              onClick={() => {
                setDraft((d) => ({ ...d, name: q, destination }))
                setModal(true)
              }}
            >
              + Add “{q}” as new hotel
            </button>
          )}
        </div>
      )}
      <Modal
        open={modal}
        title="Add hotel"
        subtitle="Saved to your hotel library"
        onClose={() => setModal(false)}
        footer={
          <>
            <BaseButton variant="secondary" onClick={() => setModal(false)}>
              Cancel
            </BaseButton>
            <BaseButton
              onClick={() => {
                const hotel = addHotel({
                  name: draft.name,
                  destination: draft.destination,
                  starRating: draft.starRating,
                  mealPlans: draft.mealPlans.split(',').map((s) => s.trim()).filter(Boolean),
                  image: draft.image,
                  notes: draft.notes,
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
        <InputField label="Hotel name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        <InputField
          label="Destination"
          value={draft.destination}
          onChange={(e) => setDraft({ ...draft, destination: e.target.value })}
        />
        <BaseSelect
          label="Star rating"
          value={String(draft.starRating)}
          onChange={(e) => setDraft({ ...draft, starRating: Number(e.target.value) })}
          options={[3, 4, 5].map((n) => ({ value: String(n), label: `${n} Star` }))}
        />
        <InputField
          label="Meal plans"
          value={draft.mealPlans}
          onChange={(e) => setDraft({ ...draft, mealPlans: e.target.value })}
        />
        <ImageUploader value={draft.image} onChange={(url) => setDraft({ ...draft, image: url })} />
        <TextAreaField
          label="Internal notes"
          optional
          value={draft.notes}
          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
        />
      </Modal>
    </div>
  )
}

const MEAL = [
  { value: 'BB', label: 'Bed & Breakfast (BB)' },
  { value: 'HB', label: 'Half Board (HB)' },
  { value: 'FB', label: 'Full Board (FB)' },
]

export function AccommodationBuilder() {
  const { trip, updateAccommodation, addAccommodation, removeAccommodation } = useItinerary()

  return (
    <div id="form-stay" className="scroll-mt-3 space-y-3 px-6 py-4">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">Accommodation</h3>
      {trip.accommodations.length === 0 && (
        <div className="rounded-xl border border-dashed p-6 text-center text-sm text-gray-500">
          No hotel selected. Search your hotel library or add a new hotel.
        </div>
      )}
      {trip.accommodations.map((acc) => (
        <div key={acc.id} className="rounded-xl border border-gray-100 p-3 dark:border-[#2C2A2A]">
          <InputField
            label="Destination"
            value={acc.destination}
            onChange={(e) => updateAccommodation(acc.id, { destination: e.target.value })}
          />
          <HotelSelector
            value={acc.hotelId}
            destination={acc.destination}
            onPick={(hotel) =>
              updateAccommodation(acc.id, {
                hotelId: hotel.id,
                hotelName: hotel.name,
                destination: acc.destination || hotel.destination,
                starCategory: hotel.starRating,
                image: hotel.image,
                mealPlan: hotel.mealPlans[0] ?? acc.mealPlan,
              })
            }
          />
          {!acc.hotelId && <p className="mb-2 text-xs text-gray-400">○ Select hotel</p>}
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Number of nights"
              type="number"
              min={1}
              value={acc.nights}
              onChange={(e) => updateAccommodation(acc.id, { nights: Number(e.target.value) })}
            />
            <BaseSelect
              label="Star category"
              value={String(acc.starCategory)}
              onChange={(e) => updateAccommodation(acc.id, { starCategory: Number(e.target.value) })}
              options={[3, 4, 5].map((n) => ({ value: String(n), label: `${n} Star` }))}
            />
          </div>
          <BaseSelect
            label="Meal plan"
            value={acc.mealPlan}
            onChange={(e) => updateAccommodation(acc.id, { mealPlan: e.target.value })}
            options={MEAL}
          />
          <div className="mb-2 flex items-center gap-1 text-amber-500">
            {Array.from({ length: acc.starCategory }).map((_, i) => (
              <Star key={i} size={12} fill="currentColor" />
            ))}
          </div>
          <ImageUploader
            value={acc.image}
            onChange={(url) => updateAccommodation(acc.id, { image: url })}
            aspect="aspect-[3/2]"
          />
          <BaseButton variant="ghost" size="sm" onClick={() => removeAccommodation(acc.id)}>
            Remove stay
          </BaseButton>
        </div>
      ))}
      <BaseButton variant="secondary" onClick={addAccommodation}>
        + Add stay
      </BaseButton>
    </div>
  )
}
