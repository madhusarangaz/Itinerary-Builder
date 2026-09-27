import { Plus, Search, Star, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { BaseButton } from '../../../components/ui/BaseButton'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { BaseSelect } from '../../../components/ui/BaseSelect'
import { ImageUploader } from '../../../components/ui/ImageUploader'
import { InputField } from '../../../components/ui/InputField'
import { SearchSelect } from '../../../components/ui/SearchSelect'
import { Modal } from '../../../components/ui/Modal'
import { useToast } from '../../../components/ui/Toast'
import { emptyHotel } from '../../../data/hotel-sample'
import { newRoom } from '../../../lib/hotel'
import { useDestinations } from '../../../state/destination-store'
import { useHotelMaster } from '../../../state/hotel-store'
import { useItinerary } from '../../../state/itinerary-store'
import type { HotelRecord } from '../../../types/hotel'
import type { Accommodation } from '../../../types/itinerary'

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

function StayWorkspace({ stay }: { stay: Accommodation }) {
  const { trip, updateAccommodation, setStayDestination } = useItinerary()
  const { hotels } = useHotelMaster()
  const { destinations } = useDestinations()
  const place = stay.destination.trim() || 'New stay'
  const nights = `${stay.nights} ${stay.nights === 1 ? 'night' : 'nights'}`

  return (
    <div id={`stay-${stay.id}`} className="min-h-0 min-w-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-[720px] px-6 py-4">
        <p className="text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase dark:text-zinc-500">Stay</p>
        <h3 className="mt-1 text-base font-semibold text-gray-900 dark:text-white">{place}</h3>
        <p className="mb-4 text-xs text-gray-400">{stay.hotelName.trim() ? `${stay.hotelName.trim()} · ${nights}` : nights}</p>
        <SearchSelect
          label="Destination"
          placeholder="Where is this night spent?"
          value={
            trip.days.find((day) => stay.dayIds?.includes(day.id) && day.destinationId)?.destinationId ||
            destinations.find((row) => row.name.toLowerCase() === stay.destination.trim().toLowerCase())?.id ||
            stay.destination
          }
          options={destinations.filter((row) => row.status !== 'archived').map((row) => ({ value: row.id, label: row.name }))}
          onChange={(value) => {
            const match = destinations.find((row) => row.id === value)
            setStayDestination(stay.id, match?.name || value, match?.id)
          }}
        />
        <HotelSelector
          value={stay.hotelId}
          destination={stay.destination}
          onPick={(hotel) => {
            const hotelPatch = {
              hotelId: hotel.id,
              hotelName: hotel.name,
              starCategory: hotel.starCategory ?? stay.starCategory,
              image: hotel.images.find((image) => image.isCover)?.url || hotel.images[0]?.url || stay.image,
              roomCategoryId: hotel.rooms[0]?.id,
              roomCategoryName: hotel.rooms[0]?.name,
            }
            if (!stay.destination.trim() && hotel.destinationName) {
              setStayDestination(stay.id, hotel.destinationName, hotel.destinationId, hotelPatch)
              return
            }
            updateAccommodation(stay.id, hotelPatch)
          }}
        />
        {stay.hotelId ? (
          <BaseSelect
            label="Room category"
            value={stay.roomCategoryId ?? ''}
            placeholder="Select a room"
            options={(hotels.find((hotel) => hotel.id === stay.hotelId)?.rooms ?? []).filter((room) => room.name.trim()).map((room) => ({ value: room.id, label: room.name }))}
            onChange={(e) => {
              const room = hotels.find((hotel) => hotel.id === stay.hotelId)?.rooms.find((item) => item.id === e.target.value)
              updateAccommodation(stay.id, { roomCategoryId: room?.id, roomCategoryName: room?.name })
            }}
          />
        ) : null}
        {!stay.hotelId && <p className="mb-2 text-xs text-gray-400">○ Select hotel</p>}
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Number of nights" value={String(stay.nights)} disabled />
          <BaseSelect
            label="Star category"
            value={String(stay.starCategory)}
            onChange={(e) => updateAccommodation(stay.id, { starCategory: Number(e.target.value) })}
            options={[3, 4, 5].map((n) => ({ value: String(n), label: `${n} Star` }))}
          />
        </div>
        <BaseSelect
          label="Meal plan"
          value={stay.mealPlan}
          onChange={(e) => updateAccommodation(stay.id, { mealPlan: e.target.value })}
          options={MEAL}
        />
        <div className="mb-2 flex items-center gap-1 text-amber-500">
          {Array.from({ length: stay.starCategory }).map((_, i) => (
            <Star key={i} size={12} fill="currentColor" />
          ))}
        </div>
        <ImageUploader
          value={stay.image}
          onChange={(url) => updateAccommodation(stay.id, { image: url })}
          aspect="aspect-[3/2]"
        />
      </div>
    </div>
  )
}

export function AccommodationBuilder({ focusStayId }: { focusStayId?: string }) {
  const { trip, addAccommodation, removeAccommodation } = useItinerary()
  const [openId, setOpenId] = useState<string | null>(focusStayId ?? trip.accommodations[0]?.id ?? null)
  const [stayPending, setStayPending] = useState<{ id: string; label: string } | null>(null)
  const stayCount = useRef(trip.accommodations.length)

  useEffect(() => {
    if (focusStayId) setOpenId(focusStayId)
  }, [focusStayId])

  useEffect(() => {
    if (trip.accommodations.length > stayCount.current) {
      setOpenId(trip.accommodations[trip.accommodations.length - 1]?.id ?? null)
    } else if (openId && !trip.accommodations.some((stay) => stay.id === openId)) {
      setOpenId(trip.accommodations[0]?.id ?? null)
    }
    stayCount.current = trip.accommodations.length
  }, [trip.accommodations, openId])

  const selected = trip.accommodations.find((stay) => stay.id === openId) ?? null

  return (
    <div id="form-stay" className="flex h-full min-h-0">
      <div className="flex w-[220px] shrink-0 flex-col border-r border-gray-100 dark:border-[#2C2A2A]">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <p className="text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase dark:text-zinc-500">Stays</p>
          <button
            type="button"
            onClick={addAccommodation}
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-950 dark:text-zinc-200 dark:hover:text-white"
          >
            <Plus size={13} /> Add
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-4">
          {trip.accommodations.length === 0 ? (
            <div className="px-2 py-6 text-center">
              <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">No stays yet</p>
              <p className="mt-1 text-xs text-gray-500">Add a stay, then choose the hotel.</p>
              <BaseButton className="mt-3" size="sm" onClick={addAccommodation}>
                <Plus size={14} /> Add first stay
              </BaseButton>
            </div>
          ) : (
            trip.accommodations.map((stay, index) => {
              const selectedStay = stay.id === openId
              const place = stay.destination.trim() || 'New stay'
              const nights = `${stay.nights} ${stay.nights === 1 ? 'night' : 'nights'}`
              return (
                <div
                  key={stay.id}
                  className={`flex items-start rounded-lg ${selectedStay ? 'bg-gray-900 text-white dark:bg-[#7A3714]' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                >
                  <button type="button" onClick={() => setOpenId(stay.id)} className="min-w-0 flex-1 px-3 py-2.5 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[11px] tracking-wide ${selectedStay ? 'text-white/70' : 'text-gray-400'}`}>
                        STAY {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className={`text-[11px] ${selectedStay ? 'text-white/60' : 'text-gray-400'}`}>{nights}</span>
                    </div>
                    <div className={`mt-0.5 truncate text-sm ${selectedStay ? 'text-white' : 'text-gray-900 dark:text-zinc-100'}`}>{place}</div>
                    <div className={`truncate text-xs ${selectedStay ? 'text-white/70' : 'text-gray-400'}`}>
                      {stay.hotelName.trim() || 'Select a hotel'}
                    </div>
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete stay ${String(index + 1).padStart(2, '0')}`}
                    className={`mt-2 mr-1 rounded p-1 ${selectedStay ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40'}`}
                    onClick={() => setStayPending({ id: stay.id, label: `${place} (${nights})` })}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
      {selected ? (
        <StayWorkspace stay={selected} />
      ) : (
        <div className="flex flex-1 items-center justify-center text-sm text-gray-400">Select a stay to edit it.</div>
      )}
      <ConfirmDialog
        open={stayPending != null}
        title="Remove stay"
        confirmLabel="Remove stay"
        message={`${stayPending?.label ?? 'This stay'} will be removed, and the dates will shorten.`}
        onClose={() => setStayPending(null)}
        onConfirm={() => {
          if (!stayPending) return
          removeAccommodation(stayPending.id)
          if (openId === stayPending.id) setOpenId(null)
          setStayPending(null)
        }}
      />
    </div>
  )
}
