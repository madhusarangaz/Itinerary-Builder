import { Plus, Search, Star } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { BaseButton } from '../../../components/ui/BaseButton'
import { BaseSelect } from '../../../components/ui/BaseSelect'
import { ImageSelect, type ImageChoice } from '../../../components/ui/ImageSelect'
import { InputField } from '../../../components/ui/InputField'
import { Modal } from '../../../components/ui/Modal'
import { useToast } from '../../../components/ui/Toast'
import { emptyHotel } from '../../../data/hotel-sample'
import { photos } from '../../../data/images'
import { formatShort } from '../../../lib/dates'
import { newRoom } from '../../../lib/hotel'
import { uid } from '../../../lib/ids'
import { alignedNightCount, assignStayDays } from '../../../lib/journey'
import { useDestinations } from '../../../state/destination-store'
import { useHotelMaster } from '../../../state/hotel-store'
import { useItinerary } from '../../../state/itinerary-store'
import { revealFirstMissing } from '../missing-attention'
import type { HotelRecord } from '../../../types/hotel'
import { primaryStayOption, type Accommodation, type StayChoice } from '../../../types/itinerary'

function HotelSelector({
  value,
  destination,
  onPick,
  attention = false,
}: {
  value: string
  destination: string
  onPick: (hotel: HotelRecord) => void
  attention?: boolean
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
        attention={attention}
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

function boardMeals(mealPlan: string) {
  if (mealPlan === 'FB') return { breakfast: true, lunch: true, dinner: true }
  if (mealPlan === 'HB') return { breakfast: true, lunch: false, dinner: true }
  return { breakfast: true, lunch: false, dinner: false }
}

function StarMark({ value, onChange }: { value: number; onChange: (stars: number) => void }) {
  const count = value >= 1 && value <= 5 ? Math.round(value) : 0
  return (
    <div className="w-full space-y-1">
      <p className="mb-1.5 text-sm font-normal text-gray-800 dark:text-zinc-100">Star category</p>
      <div role="radiogroup" aria-label="Star category" className="flex h-10 items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const on = star <= count
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={star === count}
              aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`}
              onClick={() => onChange(star)}
              className="rounded p-0.5"
            >
              <Star
                size={22}
                strokeWidth={1.75}
                className={on ? 'fill-[#c4a574] text-[#c4a574]' : 'fill-transparent text-gray-300 dark:text-zinc-600'}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

function optionIds(saved?: string[]) {
  const ids = (saved ?? []).filter(Boolean)
  if (!ids.length) return [primaryStayOption]
  if (ids[0] !== primaryStayOption) return [primaryStayOption, ...ids.filter((id) => id !== primaryStayOption)]
  return ids
}

function choiceFor(stay: Accommodation, optionId: string, dayId: string, nightMeal = ''): StayChoice {
  const mealPlan = nightMeal || stay.mealPlan || 'BB'
  if (optionId === primaryStayOption) {
    return {
      optionId,
      dayId,
      hotelId: stay.hotelId,
      hotelName: stay.hotelName,
      roomCategoryId: stay.roomCategoryId,
      roomCategoryName: stay.roomCategoryName,
      starCategory: stay.starCategory,
      mealPlan,
      image: stay.image,
      images: photoList(stay.images, stay.image),
    }
  }
  return (
    stay.choices?.find((choice) => choice.optionId === optionId && choice.dayId === dayId) ?? {
      optionId,
      dayId,
      hotelId: '',
      hotelName: '',
      starCategory: stay.starCategory || 5,
      mealPlan,
      image: '',
      images: [],
    }
  )
}

function photoList(images: string[] | undefined, image: string) {
  const list = (images ?? []).filter(Boolean)
  if (list.length) return list
  return image ? [image] : []
}

function nightOptionIds(stay: Accommodation, dayId: string) {
  return optionIds(stay.nightOptions?.find((row) => row.dayId === dayId)?.optionIds)
}

const HOTEL_IMAGE_FALLBACK = [photos.hotelColombo, photos.hotelSigiriya, photos.hotelKandy, photos.hotelNuwara, photos.hotelMirissa, photos.pool]

function hotelImageChoices(hotel: HotelRecord | undefined, destination: string, hotels: HotelRecord[]): ImageChoice[] {
  const picked: ImageChoice[] = []
  const seen = new Set<string>()
  function push(src?: string, alt?: string) {
    if (!src || seen.has(src) || picked.length >= 6) return
    seen.add(src)
    picked.push({ src, alt })
  }
  const own = [...(hotel?.images ?? [])].sort((a, b) => Number(b.isCover) - Number(a.isCover) || a.sortOrder - b.sortOrder)
  for (const image of own) push(image.url, hotel?.name)
  const place = destination.trim().toLowerCase()
  for (const other of hotels) {
    if (hotel && other.id === hotel.id) continue
    if (place && (other.destinationName ?? '').toLowerCase() !== place) continue
    for (const image of other.images) push(image.url, other.name)
  }
  for (const src of HOTEL_IMAGE_FALLBACK) push(src, 'Hotel')
  return picked
}

function HotelOptionSkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-hidden="true">
      <div>
        <div className="mb-1.5 h-4 w-14 rounded bg-gray-200 dark:bg-zinc-700" />
        <div className="h-10 rounded-lg bg-gray-200 dark:bg-zinc-700" />
      </div>
      <div className="h-16 rounded-lg bg-gray-200 dark:bg-zinc-700" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-16 rounded-lg bg-gray-200 dark:bg-zinc-700" />
        <div className="h-16 rounded-lg bg-gray-200 dark:bg-zinc-700" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="aspect-[4/3] rounded-lg bg-gray-200 dark:bg-zinc-700" />
        ))}
      </div>
    </div>
  )
}

function StayWorkspace({
  stay,
  dayId,
  nightLabel,
  nightDate,
  nightMeal,
  markMissing,
}: {
  stay: Accommodation
  dayId: string
  nightLabel: string
  nightDate: string
  nightMeal: string
  markMissing: boolean
}) {
  const { updateAccommodation, updateDay } = useItinerary()
  const { hotels } = useHotelMaster()
  const options = nightOptionIds(stay, dayId)
  const [optionId, setOptionId] = useState(primaryStayOption)
  const [loading, setLoading] = useState(false)
  const loadTimer = useRef<number | null>(null)
  const activeOption = options.includes(optionId) ? optionId : primaryStayOption
  const choice = choiceFor(stay, activeOption, dayId, nightMeal)
  const mealValue = activeOption === primaryStayOption ? nightMeal || choice.mealPlan : choice.mealPlan
  const place = stay.destination.trim() || 'Add destination'
  const selectedHotel =
    hotels.find((hotel) => hotel.id === choice.hotelId) ??
    hotels.find((hotel) => choice.hotelName.trim() && hotel.name.trim().toLowerCase() === choice.hotelName.trim().toLowerCase())

  useEffect(() => {
    return () => {
      if (loadTimer.current) window.clearTimeout(loadTimer.current)
    }
  }, [])

  function showOption(id: string) {
    if (id === activeOption && !loading) return
    setOptionId(id)
    setLoading(true)
    if (loadTimer.current) window.clearTimeout(loadTimer.current)
    loadTimer.current = window.setTimeout(() => setLoading(false), 420)
  }

  function writeChoice(patch: Partial<StayChoice>) {
    const next = { ...choice, ...patch, optionId: activeOption, dayId }
    if (activeOption === primaryStayOption) {
      updateAccommodation(stay.id, {
        hotelId: next.hotelId,
        hotelName: next.hotelName,
        roomCategoryId: next.roomCategoryId,
        roomCategoryName: next.roomCategoryName,
        starCategory: next.starCategory,
        ...(patch.mealPlan !== undefined ? { mealPlan: next.mealPlan } : {}),
        image: next.image,
        images: next.images,
      })
      if (patch.mealPlan !== undefined) updateDay(dayId, { mealPlan: next.mealPlan, meals: boardMeals(next.mealPlan) })
      return
    }
    updateAccommodation(stay.id, {
      choices: [...(stay.choices ?? []).filter((row) => !(row.optionId === activeOption && row.dayId === dayId)), next],
    })
  }

  function addOption() {
    const next = uid('opt')
    const others = (stay.nightOptions ?? []).filter((row) => row.dayId !== dayId)
    updateAccommodation(stay.id, {
      nightOptions: [...others, { dayId, optionIds: [...options, next] }],
    })
    showOption(next)
  }

  return (
    <div id={`stay-${stay.id}`} className="min-h-0 min-w-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-[720px] px-6 py-4">
        <p className="text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase dark:text-zinc-500">{nightLabel}</p>
        <h3 className="mt-1 text-base font-semibold text-gray-900 dark:text-white">{place}</h3>
        <p className="mb-4 text-xs text-gray-400">{formatShort(nightDate)}</p>
        <div role="tablist" aria-label="Hotel options" className="mb-5 flex h-12 items-end gap-6 overflow-x-auto overflow-y-hidden border-b border-gray-200 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden dark:border-zinc-700">
          {options.map((id, index) => {
            const on = id === activeOption
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => showOption(id)}
                className={`shrink-0 border-b-2 px-0.5 pt-2 pb-3 text-sm ${
                  on
                    ? 'border-gray-900 font-medium text-gray-900 dark:border-white dark:text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                Option {index + 1}
              </button>
            )
          })}
          <button
            type="button"
            onClick={addOption}
            className="inline-flex shrink-0 items-center gap-1 border-b-2 border-transparent px-0.5 pt-2 pb-3 text-sm text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <Plus size={14} /> Add option
          </button>
        </div>
        <div aria-busy={loading}>
          {loading ? (
            <HotelOptionSkeleton />
          ) : (
            <>
              <HotelSelector
                value={choice.hotelId}
                attention={markMissing && activeOption === primaryStayOption && !choice.hotelId}
                destination={stay.destination}
                onPick={(hotel) => {
                  writeChoice({
                    hotelId: hotel.id,
                    hotelName: hotel.name,
                    starCategory: hotel.starCategory ?? choice.starCategory,
                    image: hotel.images.find((image) => image.isCover)?.url || hotel.images[0]?.url || choice.image,
                    images: hotel.images.map((image) => image.url).filter(Boolean),
                    roomCategoryId: hotel.rooms[0]?.id,
                    roomCategoryName: hotel.rooms[0]?.name,
                  })
                }}
              />
              <div className="mb-3">
                <p className="mb-1.5 text-sm font-normal text-gray-800 dark:text-zinc-100">Room category</p>
                <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 dark:border-transparent dark:bg-zinc-800 dark:shadow-[0px_0px_1px_1px_#404040]">
                  {selectedHotel && selectedHotel.rooms.some((room) => room.name.trim()) ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedHotel.rooms
                        .filter((room) => room.name.trim())
                        .map((room) => {
                          const on = choice.roomCategoryId === room.id
                          return (
                            <button
                              key={room.id}
                              type="button"
                              aria-pressed={on}
                              onClick={() => writeChoice({ roomCategoryId: room.id, roomCategoryName: room.name })}
                              className={`rounded-full px-3 py-1.5 text-sm ${
                                on
                                  ? 'bg-[#E7EFFF] font-medium text-[#14357A] dark:bg-[#5b93ff]/25 dark:text-[#c5d9ff]'
                                  : 'border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-700'
                              }`}
                            >
                              {room.name}
                            </button>
                          )
                        })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-zinc-500">
                      {selectedHotel ? 'This hotel has no room types yet.' : 'Select a hotel to choose a room type.'}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <StarMark value={choice.starCategory} onChange={(starCategory) => writeChoice({ starCategory })} />
                <BaseSelect
                  className="mb-0"
                  label="Meal plan"
                  value={mealValue}
                  onChange={(e) => writeChoice({ mealPlan: e.target.value })}
                  options={MEAL}
                />
              </div>
              <p className="mt-1 mb-3 text-[11px] text-gray-400 dark:text-zinc-500">
                Meal plan starts from this night in Trip Details. Change it if this hotel is different.
              </p>
              <div className="mt-1">
                <p className="mb-1.5 text-sm font-normal text-gray-800 dark:text-zinc-100">Hotel images</p>
                <ImageSelect
                  multiple
                  columns={3}
                  value={choice.image}
                  values={photoList(choice.images, choice.image)}
                  options={hotelImageChoices(selectedHotel, stay.destination, hotels)}
                  onChange={(image) => writeChoice({ image, images: image ? [image] : [] })}
                  onSelectMany={(images) => writeChoice({ images, image: images[0] ?? '' })}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export function AccommodationBuilder({
  focusStayId,
  attentionToken = 0,
  onAttentionHandled,
}: {
  focusStayId?: string
  attentionToken?: number
  onAttentionHandled?: () => void
}) {
  const { trip } = useItinerary()
  const nightCount = alignedNightCount(trip.days.length, trip.startDate, trip.endDate)
  const nightDays = trip.days.slice(0, nightCount)
  const stays = assignStayDays(nightDays, trip.accommodations)
  const [openId, setOpenId] = useState<string | null>(focusStayId ? null : (nightDays[0]?.id ?? null))
  const [markMissing, setMarkMissing] = useState(false)

  function stayFor(dayId: string) {
    return stays.find((stay) => stay.dayIds?.includes(dayId))
  }

  function hotelLabel(dayId: string) {
    const stay = stayFor(dayId)
    if (!stay) return 'Select a hotel'
    return choiceFor(stay, primaryStayOption, dayId).hotelName.trim() || 'Select a hotel'
  }

  useEffect(() => {
    if (!attentionToken) return
    const first = trip.accommodations.find((stay) => !stay.hotelId)
    if (trip.accommodations.length && !first) {
      onAttentionHandled?.()
      return
    }
    if (first) {
      const night = nightDays.find((day) => stayFor(day.id)?.id === first.id)
      if (night) setOpenId(night.id)
    }
    setMarkMissing(true)
    const handle = window.setTimeout(() => {
      revealFirstMissing(document.getElementById('form-stay'))
      onAttentionHandled?.()
    }, 80)
    return () => window.clearTimeout(handle)
  }, [attentionToken, onAttentionHandled, trip.accommodations])

  useEffect(() => {
    if (!focusStayId) return
    const night = nightDays.find((day) => stayFor(day.id)?.id === focusStayId)
    if (night) setOpenId(night.id)
  }, [focusStayId])

  useEffect(() => {
    if (openId && nightDays.some((day) => day.id === openId)) return
    setOpenId(nightDays[0]?.id ?? null)
  }, [nightDays, openId])

  const selectedDay = nightDays.find((day) => day.id === openId) ?? null
  const selectedStay = selectedDay ? stayFor(selectedDay.id) : undefined

  return (
    <div id="form-stay" className="flex h-full min-h-0">
        <div className="flex w-[220px] shrink-0 flex-col border-r border-gray-100 dark:border-[#2C2A2A]">
          <div className="px-4 pt-4 pb-2">
            <p className="text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase dark:text-zinc-500">Nights</p>
          </div>
          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-4">
            {nightDays.length === 0 ? (
              <div className="px-2 py-6 text-center">
                <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">No nights yet</p>
                <p className="mt-1 text-xs text-gray-500">Set the dates in Trip Details. Those nights show up here.</p>
              </div>
            ) : (
              nightDays.map((day, index) => {
                const selectedNight = day.id === openId
                const nightLabel = `Night ${String(index + 1).padStart(2, '0')}`
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => setOpenId(day.id)}
                    className={`block w-full rounded-lg px-3 py-2.5 text-left ${selectedNight ? 'bg-[#E7EFFF] text-[#14357A] dark:bg-white/10 dark:text-white' : 'hover:bg-[#F3F7FF] dark:hover:bg-white/5'}`}
                  >
                    <span className={`text-[11px] tracking-wide ${selectedNight ? 'text-[#14357A]/70 dark:text-white/70' : 'text-gray-400'}`}>
                      {nightLabel.toUpperCase()}
                    </span>
                    <div className={`mt-0.5 truncate text-sm ${selectedNight ? 'text-[#14357A] dark:text-white' : 'text-gray-900 dark:text-zinc-100'}`}>
                      {day.destination || 'Add destination'}
                    </div>
                    <div className={`text-[11px] ${selectedNight ? 'text-[#14357A]/60 dark:text-white/60' : 'text-gray-400'}`}>{formatShort(day.date)}</div>
                    <div className={`truncate text-xs ${selectedNight ? 'text-[#14357A]/70 dark:text-white/70' : 'text-gray-400'}`}>
                      {hotelLabel(day.id)}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
        {selectedDay && selectedStay ? (
          <StayWorkspace
            key={selectedDay.id}
            stay={selectedStay}
            dayId={selectedDay.id}
            nightLabel={`Night ${String(nightDays.findIndex((day) => day.id === selectedDay.id) + 1).padStart(2, '0')}`}
            nightDate={selectedDay.date}
            nightMeal={selectedDay.mealPlan || selectedStay.mealPlan || 'BB'}
            markMissing={markMissing}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-gray-400">
            {nightDays.length ? 'Select a night to choose its hotel.' : 'Nights from Trip Details will show here.'}
          </div>
        )}
    </div>
  )
}
