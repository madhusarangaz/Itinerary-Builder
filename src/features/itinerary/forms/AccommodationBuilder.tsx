import { Search, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { BaseButton } from '../../../components/ui/BaseButton'
import { BaseSelect } from '../../../components/ui/BaseSelect'
import { ImageUploader } from '../../../components/ui/ImageUploader'
import { InputField } from '../../../components/ui/InputField'
import { Modal } from '../../../components/ui/Modal'
import { useToast } from '../../../components/ui/Toast'
import { emptyHotel } from '../../../data/hotel-sample'
import { newRoom } from '../../../lib/hotel'
import { useDestinations } from '../../../state/destination-store'
import { useHotelMaster } from '../../../state/hotel-store'
import { useItinerary } from '../../../state/itinerary-store'
import type { HotelRecord } from '../../../types/hotel'

function HotelSelector({
  value,
  destination,
  onPick,
}: {
  value: string
  destination: string
  onPick: (hotel: HotelRecord) => void
}) {
  const { hotels, addHotel } = useHotelMaster()
  const { destinations } = useDestinations()
  const { notify } = useToast()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [modal, setModal] = useState(false)
  const [draft, setDraft] = useState({ name: '', starCategory: 4, address: '', roomName: 'Deluxe' })
  const place = destinations.find((row) => row.name.toLowerCase() === destination.trim().toLowerCase())

  const list = useMemo(() => {
    const term = q.toLowerCase()
    return hotels
      .filter((hotel) => hotel.status !== 'inactive')
      .filter((hotel) => {
        if (!destination.trim()) return true
        return hotel.destinationId === place?.id || (hotel.destinationName ?? '').toLowerCase() === destination.trim().toLowerCase()
      })
      .filter((hotel) => !term || hotel.name.toLowerCase().includes(term))
  }, [hotels, q, destination, place?.id])

  const selected = hotels.find((hotel) => hotel.id === value)

  return (
    <div className="relative mb-3">
      <InputField
        label="Hotel"
        placeholder={destination ? `Search ${destination} hotels...` : 'Search hotel...'}
        startIcon={<Search size={16} />}
        value={open ? q : selected?.name ?? ''}
        onFocus={() => { setOpen(true); setQ('') }}
        onChange={(e) => { setQ(e.target.value); setOpen(true) }}
      />
      {open && (
        <div className="absolute z-30 max-h-56 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          {list.map((hotel) => (
            <button key={hotel.id} type="button" className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-zinc-700" onClick={() => { onPick(hotel); setOpen(false); setQ('') }}>
              <div className="font-medium text-gray-900 dark:text-zinc-100">{hotel.name}</div>
              <div className="text-xs text-gray-500">{hotel.destinationName || 'No destination'} · {hotel.starCategory ? `${hotel.starCategory} Star` : 'Stars not set'}</div>
            </button>
          ))}
          {list.length === 0 ? <p className="px-3 py-2 text-sm text-gray-400">No hotels for this destination yet.</p> : null}
          <button type="button" className="block w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-zinc-200" onClick={() => { setDraft((d) => ({ ...d, name: q })); setModal(true) }}>
            + Add new hotel
          </button>
        </div>
      )}
      <Modal
        open={modal}
        title="Add hotel"
        subtitle="Saved to Hotel Master and selected on this stay."
        onClose={() => setModal(false)}
        footer={
          <>
            <BaseButton variant="secondary" onClick={() => setModal(false)}>Cancel</BaseButton>
            <BaseButton
              disabled={!draft.name.trim()}
              onClick={() => {
                const created = addHotel({
                  ...emptyHotel(),
                  name: draft.name.trim(),
                  destinationId: place?.id,
                  destinationName: destination || place?.name || '',
                  starCategory: draft.starCategory as 1 | 2 | 3 | 4 | 5,
                  address: draft.address || destination,
                  rooms: [newRoom({ name: draft.roomName || 'Deluxe', numberOfRooms: 1 })],
                  status: 'active',
                })
                onPick(created)
                notify('Hotel added successfully.')
                setModal(false)
                setOpen(false)
              }}
            >
              Save & select
            </BaseButton>
          </>
        }
      >
        <InputField label="Hotel name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        <InputField label="Destination" value={destination} onChange={() => undefined} />
        <BaseSelect label="Star category" value={String(draft.starCategory)} onChange={(e) => setDraft({ ...draft, starCategory: Number(e.target.value) })} options={[3, 4, 5].map((n) => ({ value: String(n), label: `${n} Star` }))} />
        <InputField label="Address" value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} />
        <InputField label="Room category" value={draft.roomName} onChange={(e) => setDraft({ ...draft, roomName: e.target.value })} />
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
  const { hotels } = useHotelMaster()

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
                destination: acc.destination || hotel.destinationName,
                starCategory: hotel.starCategory ?? acc.starCategory,
                image: hotel.images.find((image) => image.isCover)?.url || hotel.images[0]?.url || acc.image,
                roomCategoryId: hotel.rooms[0]?.id,
                roomCategoryName: hotel.rooms[0]?.name,
              })
            }
          />
          {acc.hotelId ? (
            <BaseSelect
              label="Room category"
              value={acc.roomCategoryId ?? ''}
              placeholder="Select a room"
              options={(hotels.find((hotel) => hotel.id === acc.hotelId)?.rooms ?? []).filter((room) => room.name.trim()).map((room) => ({ value: room.id, label: room.name }))}
              onChange={(e) => {
                const room = hotels.find((hotel) => hotel.id === acc.hotelId)?.rooms.find((item) => item.id === e.target.value)
                updateAccommodation(acc.id, { roomCategoryId: room?.id, roomCategoryName: room?.name })
              }}
            />
          ) : null}
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
