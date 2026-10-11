import dayjs from 'dayjs'
import { ChevronDown, CornerDownLeft, Search, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { mockCustomers } from '../../../data/sample-trip'
import { headerImages } from '../../../data/images'
import { DEFAULT_START_POINT, journeyPointOptions } from '../../../data/destinations'
import { calendarDays, formatLong, formatShort, nightsBetween } from '../../../lib/dates'
import { addedNightDates, applyJourneyDays, assignStayDays, journeyDelta, nightsToRemove, redateDays, syncStays } from '../../../lib/journey'
import { itineraryVersion, nextTourId, uid } from '../../../lib/ids'
import { useItinerary } from '../../../state/itinerary-store'
import { SearchSelect } from '../../../components/ui/SearchSelect'
import { liveDestinations, useDestinations } from '../../../state/destination-store'
import { useSuppliers } from '../../../state/supplier-store'
import { useTransport } from '../../../state/transport-store'
import { BaseButton } from '../../../components/ui/BaseButton'
import { FieldAttention } from '../../../components/ui/FieldAttention'
import { ImageSelect } from '../../../components/ui/ImageSelect'
import { DateRangeField } from '../../../components/ui/DateRangeField'
import { InputField } from '../../../components/ui/InputField'
import { QuantityField } from '../../../components/ui/QuantityField'
import { Modal } from '../../../components/ui/Modal'

const PRESET = ['Wi-Fi', 'Pool Access', '24/7 Concierge', 'VIP Excursions', 'Gourmet Dining', 'Spa', 'Private Driver']
const INTERESTS = ['Beach', 'Wildlife', 'Photography', 'Food', 'Village']
const NIGHT_MEALS = [
  { value: 'BB', label: 'BB', title: 'Bed & Breakfast' },
  { value: 'HB', label: 'HB', title: 'Half Board' },
  { value: 'FB', label: 'FB', title: 'Full Board' },
] as const
const POINT_OPTIONS = journeyPointOptions()

function suggestTourName(trip: { nights: number; days: { destination: string }[]; interests?: string[] }) {
  const nights = trip.nights > 0 ? trip.nights : 1
  const places = [...new Set(trip.days.map((day) => day.destination.trim()).filter((name) => name && name.toLowerCase() !== 'departure'))]
  const shown = places.slice(0, 3)
  if (shown.length === 1) return `${nights} Nights in ${shown[0]}`
  if (shown.length === 2) return `${nights} Nights in ${shown[0]} & ${shown[1]}`
  if (shown.length > 2) return `${nights} Nights through ${shown[0]}, ${shown[1]} & ${shown[2]}`
  const interests = (trip.interests ?? []).slice(0, 2)
  if (interests.length) return `${nights} Nights of ${interests.join(' & ')}`
  return `${nights} Nights in Sri Lanka`
}

function EnterHint() {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium leading-none text-gray-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
      <CornerDownLeft size={11} />
      Enter
    </span>
  )
}

export function TripDetailsForm({
  attentionToken = 0,
  onAttentionHandled,
}: {
  attentionToken?: number
  onAttentionHandled?: () => void
}) {
  const { trip, patch, updateDay, updateAccommodation } = useItinerary()
  const { transports } = useTransport()
  const { suppliers } = useSuppliers()
  const { destinations } = useDestinations()
  const [query, setQuery] = useState(trip.customer)
  const [open, setOpen] = useState(false)
  const [customFacility, setCustomFacility] = useState('')
  const [customInterest, setCustomInterest] = useState('')
  const [naming, setNaming] = useState(false)
  const [nightsOpen, setNightsOpen] = useState(true)
  const [markMissing, setMarkMissing] = useState(false)
  const [datePrompt, setDatePrompt] = useState<number | null>(null)
  const [reviseNights, setReviseNights] = useState(false)
  const [journeyDates, setJourneyDates] = useState<string[]>([])
  const priorStay = useRef({ nights: 0, end: '' })
  const tripRef = useRef(trip)
  tripRef.current = trip
  const ignoreDateChange = useRef(false)
  const version = itineraryVersion(trip.option)

  useEffect(() => {
    if (!attentionToken) return
    const current = tripRef.current
    const titleEmpty = !current.title.trim()
    const customerEmpty = !current.customer.trim()
    const datesEmpty = !current.startDate || !current.endDate
    const coverEmpty = !current.coverImage
    if (!titleEmpty && !customerEmpty && !datesEmpty && !coverEmpty) {
      onAttentionHandled?.()
      return
    }
    setMarkMissing(true)
    const handle = window.setTimeout(() => {
      const focusEl = titleEmpty
        ? document.getElementById('trip-title')
        : customerEmpty
          ? document.getElementById('trip-customer')
          : datesEmpty
            ? document.querySelector<HTMLButtonElement>('#form-dates button')
            : null
      const scrollEl = focusEl ?? document.getElementById('form-cover')
      scrollEl?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      if (focusEl instanceof HTMLElement) focusEl.focus()
      onAttentionHandled?.()
    }, 60)
    return () => window.clearTimeout(handle)
  }, [attentionToken, onAttentionHandled])

  useEffect(() => {
    const next: { tourId?: string; option?: string; startPoint?: string } = {}
    if (!trip.tourId.trim()) next.tourId = nextTourId()
    if (trip.option.trim() !== version) next.option = version
    if (trip.startPoint == null || trip.startPoint === '') next.startPoint = DEFAULT_START_POINT
    if (next.tourId || next.option || next.startPoint) patch(next)
  }, [patch, trip.option, trip.startPoint, trip.tourId, version])

  const destinationOptions = liveDestinations(destinations).map((row) => ({ value: row.id, label: row.name }))
  const expectedDays = calendarDays(trip.startDate, trip.endDate)
  const dateMismatch = expectedDays > 0 && trip.days.length !== expectedDays
  const nightCount = dateMismatch ? Math.max(trip.days.length - 1, 0) : trip.nights
  const nightDays = trip.days.slice(0, nightCount)
  const departure = trip.days.length > nightCount ? trip.days[nightCount] : undefined

  function closeDatePrompt() {
    setDatePrompt(null)
    setReviseNights(false)
    setJourneyDates([])
  }

  function proposeDates(startDate: string, endDate: string) {
    if (ignoreDateChange.current) return
    if (startDate === trip.startDate && endDate === trip.endDate) return
    const nightsAlreadySet = Boolean(trip.startDate && trip.endDate && trip.days.length > 0)
    priorStay.current = { nights: Math.max(trip.days.length - 1, 0), end: trip.endDate }
    const delta = journeyDelta(trip.days.length, startDate, endDate)
    if (nightsAlreadySet && delta !== 0) {
      const nights = nightsBetween(startDate, endDate)
      const shifted = startDate ? redateDays(trip.days, startDate) : trip.days
      const highlighted =
        delta > 0
          ? addedNightDates(startDate, shifted, nights)
          : nightsToRemove(shifted, nights).map((day) => day.date)
      const days = applyJourneyDays(trip.days, startDate, nights)
      patch({
        startDate,
        endDate,
        days,
        accommodations: syncStays(days, trip.accommodations, nights),
      })
      setJourneyDates(highlighted)
      setReviseNights(true)
      setDatePrompt(delta)
      return
    }
    const days = startDate ? redateDays(trip.days, startDate) : trip.days
    patch({ startDate, endDate, days })
    setJourneyDates([])
    setReviseNights(false)
    setDatePrompt(delta === 0 ? null : delta)
  }

  function applyJourney() {
    ignoreDateChange.current = true
    closeDatePrompt()
    const nights = nightsBetween(trip.startDate, trip.endDate)
    if (nights <= 0) {
      ignoreDateChange.current = false
      return
    }
    const days = applyJourneyDays(trip.days, trip.startDate, nights)
    patch({ days, accommodations: syncStays(days, trip.accommodations, nights) })
    window.setTimeout(() => {
      ignoreDateChange.current = false
    }, 0)
  }

  const matches = useMemo(
    () => mockCustomers.filter((c) => c.toLowerCase().includes(query.toLowerCase())),
    [query],
  )

  function toggleInterest(label: string) {
    const current = trip.interests ?? []
    patch({
      interests: current.includes(label) ? current.filter((item) => item !== label) : [...current, label],
    })
  }

  function toggleFacility(label: string) {
    const exists = trip.facilities.find((f) => f.label === label)
    patch({
      facilities: exists
        ? trip.facilities.filter((f) => f.label !== label)
        : [...trip.facilities, { id: uid('fc'), label }],
    })
  }

  const stayForNight = assignStayDays(nightDays, trip.accommodations)

  function mealForNight(dayId: string, own?: string) {
    if (own) return own
    return stayForNight.find((stay) => stay.dayIds?.includes(dayId))?.mealPlan || ''
  }

  function chooseMeal(dayId: string, mealPlan: string) {
    const meals =
      mealPlan === 'FB'
        ? { breakfast: true, lunch: true, dinner: true }
        : mealPlan === 'HB'
          ? { breakfast: true, lunch: false, dinner: true }
          : { breakfast: true, lunch: false, dinner: false }
    updateDay(dayId, { mealPlan, meals })
    const stay = stayForNight.find((row) => row.dayIds?.includes(dayId))
    if (stay) updateAccommodation(stay.id, { mealPlan })
  }

  return (
    <div className="h-full min-h-0 overflow-y-auto">
    <div className="mx-auto w-full max-w-[640px] space-y-6 px-6 py-8">
      <section id="form-header" className="scroll-mt-3">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Trip details</h3>
          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-white/10 dark:text-zinc-400">
              Tour ID <span className="font-medium text-gray-800 dark:text-zinc-100">{trip.tourId}</span>
            </span>
            <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-white/10 dark:text-zinc-400">
              Version <span className="font-medium text-gray-800 dark:text-zinc-100">{version}</span>
            </span>
          </div>
        </div>
        <div className="mb-4 rounded-xl border border-[#D6E4FF] bg-[#F9FBFF] px-3 pt-3 dark:border-[#5b93ff]/30 dark:bg-[#5b93ff]/5">
          <DateRangeField
            start={trip.startDate}
            end={trip.endDate}
            attention={markMissing && (!trip.startDate || !trip.endDate)}
            onChange={proposeDates}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <SearchSelect
            label="Starting point"
            placeholder="Search a place"
            value={trip.startPoint || DEFAULT_START_POINT}
            options={POINT_OPTIONS}
            allowCreate
            onChange={(startPoint) => patch({ startPoint })}
          />
          <SearchSelect
            label="End point"
            placeholder="Select an end point"
            value={trip.endPoint || ''}
            options={POINT_OPTIONS}
            allowCreate
            onChange={(endPoint) => patch({ endPoint })}
          />
        </div>
        <div className="mb-3">
          <p className="mb-1.5 text-sm font-normal text-gray-800 dark:text-zinc-100">Interests</p>
          <div className="flex flex-wrap gap-2">
            {[...INTERESTS, ...(trip.interests ?? []).filter((label) => !INTERESTS.includes(label))].map((label) => {
              const on = (trip.interests ?? []).includes(label)
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleInterest(label)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    on
                      ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-200'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
          <InputField
            placeholder="Add an interest"
            value={customInterest}
            endAdornment={customInterest ? <EnterHint /> : undefined}
            onChange={(e) => setCustomInterest(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return
              e.preventDefault()
              const label = customInterest.trim()
              if (!label) return
              if (!(trip.interests ?? []).includes(label)) toggleInterest(label)
              setCustomInterest('')
            }}
            className="mt-3 mb-0"
          />
        </div>
        <div className="relative mb-3">
          <InputField
            id="trip-customer"
            label="Traveller / Customer"
            placeholder="Search customer or add new"
            startIcon={<Search size={16} />}
            attention={markMissing && !trip.customer.trim()}
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value)
              patch({ customer: e.target.value })
              setOpen(true)
            }}
          />
          {open && (query || matches.length) ? (
            <div className="absolute z-20 mt-[-8px] w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
              {matches.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 dark:text-zinc-100 dark:hover:bg-zinc-700"
                  onClick={() => {
                    setQuery(c)
                    patch({ customer: c })
                    setOpen(false)
                  }}
                >
                  {c}
                </button>
              ))}
              {query && !matches.includes(query) && (
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm text-blue-600 dark:text-blue-400"
                  onClick={() => {
                    patch({ customer: query })
                    setOpen(false)
                  }}
                >
                  + Add “{query}” as new traveller
                </button>
              )}
            </div>
          ) : null}
        </div>
        <div className="mb-3 grid grid-cols-2 gap-4">
          <div>
            <SearchSelect
              className="mb-0"
              label="Transport"
              optional
              placeholder="Search transport types…"
              value={trip.transportId || trip.transportName || ''}
              options={transports.filter((row) => row.status === 'active').map((row) => ({ value: row.id, label: row.displayName || row.vehicleCategory, hint: `${row.capacity.minAdults ?? 1}–${row.capacity.maxAdults} pax` }))}
              onChange={(value) => {
                const match = transports.find((row) => row.id === value)
                const party = trip.adults
                const fits = match ? party <= match.capacity.maxAdults && party >= (match.capacity.minAdults ?? 1) : true
                patch({
                  transportId: match?.id,
                  transportName: match?.displayName || match?.vehicleCategory,
                  supplierId: undefined,
                  supplierName: undefined,
                  vehicleRegistration: undefined,
                  driverName: undefined,
                })
                if (match && !fits) {
                  /* suggestion only — coordinator can still keep this vehicle */
                }
              }}
            />
            {trip.transportId ? (
              <p className="mt-1 text-[11px] text-gray-400">Suggested for {trip.adults} adults</p>
            ) : null}
          </div>
          <SearchSelect
            className="mb-0"
            label="Supplier"
            optional
            placeholder={trip.transportName ? 'Optional — not required to quote' : 'Select transport first'}
            value={trip.supplierId || ''}
            options={
              trip.transportName
                ? suppliers
                    .filter((supplier) => supplier.status === 'active' && supplier.type === 'vehicle_fleet')
                    .filter((supplier) => supplier.vehicleInventory.some((group) => group.transportId === trip.transportId || group.transportName === trip.transportName))
                    .map((supplier) => ({ value: supplier.id, label: supplier.name }))
                : []
            }
            onChange={(value) => {
              const match = suppliers.find((supplier) => supplier.id === value)
              patch({ supplierId: match?.id, supplierName: match?.name, vehicleRegistration: undefined, driverName: undefined })
            }}
          />
        </div>
        {trip.supplierId ? (
          <div className="grid grid-cols-2 gap-4">
            <SearchSelect
              label="Vehicle"
              optional
              value={trip.vehicleRegistration || ''}
              options={(suppliers.find((supplier) => supplier.id === trip.supplierId)?.vehicleInventory ?? [])
                .filter((group) => group.transportId === trip.transportId || group.transportName === trip.transportName)
                .flatMap((group) => group.vehicles.filter((unit) => unit.registrationNumber.trim()).map((unit) => ({ value: unit.registrationNumber, label: unit.registrationNumber, hint: `${group.model} · ${group.manufactureYear ?? ''}` })))}
              onChange={(vehicleRegistration) => patch({ vehicleRegistration })}
            />
            <SearchSelect
              label="Driver"
              optional
              value={trip.driverName || ''}
              options={(suppliers.find((supplier) => supplier.id === trip.supplierId)?.drivers ?? []).filter((driver) => driver.status === 'active' && driver.name.trim()).map((driver) => ({ value: driver.name, label: driver.name }))}
              onChange={(driverName) => patch({ driverName })}
            />
          </div>
        ) : null}
        <div className="grid grid-cols-3 gap-4">
          <QuantityField
            label="Adults"
            min={1}
            value={trip.adults}
            onChange={(adults) => patch({ adults, pricing: { ...trip.pricing, travellerCount: adults } })}
          />
          <QuantityField
            label="Children"
            note="4 to 12"
            min={0}
            value={trip.children}
            onChange={(children) => patch({ children })}
          />
          <QuantityField
            label="Infant"
            note="below 4"
            min={0}
            value={trip.infants ?? 0}
            onChange={(infants) => patch({ infants })}
          />
        </div>
      </section>

      <section id="form-nights" className="scroll-mt-3">
        <div className="rounded-xl border border-[#F6D7C3] bg-[#FFF8F3] dark:border-[#f0a05a]/30 dark:bg-[#f0a05a]/8">
          <button
            type="button"
            aria-expanded={nightsOpen}
            onClick={() => setNightsOpen((open) => !open)}
            className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left"
          >
            <span>
              <span className="block text-base font-semibold text-gray-900 dark:text-white">Where each night is spent</span>
              <span className="mt-0.5 block text-xs text-gray-400">
                {trip.nights} {trip.nights === 1 ? 'night' : 'nights'}
                {trip.endDate ? ` · departure ${formatShort(trip.endDate)}` : ''}
              </span>
            </span>
            <ChevronDown size={16} className={`shrink-0 text-gray-400 transition ${nightsOpen ? 'rotate-180' : ''}`} />
          </button>
          {nightsOpen ? (
            <div className="px-3 pb-3">
              {dateMismatch && datePrompt == null ? (
                <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-[#2C2A2A] dark:bg-transparent">
                  <p className="text-xs text-gray-500 dark:text-zinc-400">
                    These dates cover {trip.nights} {trip.nights === 1 ? 'night' : 'nights'} ({expectedDays} days). The itinerary has {trip.days.length} {trip.days.length === 1 ? 'day' : 'days'}.
                  </p>
                  <BaseButton variant="secondary" size="sm" onClick={() => { setReviseNights(false); setDatePrompt(expectedDays - trip.days.length) }}>
                    {expectedDays > trip.days.length ? 'Add the days' : 'Remove the days'}
                  </BaseButton>
                </div>
              ) : null}
              {nightDays.length === 0 ? (
                <p className="text-sm text-gray-500">Set the travel dates to lay the nights out.</p>
              ) : (
                nightDays.map((day, index) => (
                  <div key={day.id} id={`night-${day.id}`} className="flex scroll-mt-3 items-start gap-3">
                    <div className="w-[92px] shrink-0 pt-2">
                      <p className="text-[11px] tabular-nums text-gray-400">Night {String(index + 1).padStart(2, '0')}</p>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">{formatShort(day.date)}</p>
                    </div>
                    <SearchSelect
                      className="mb-2 min-w-0 flex-1"
                      placeholder="Where is this night spent?"
                      value={day.destinationId || day.destination}
                      options={destinationOptions}
                      onChange={(value) => {
                        const match = destinations.find((row) => row.id === value)
                        updateDay(day.id, { destinationId: match?.id, destination: match?.name || value })
                      }}
                    />
                    <div className="mb-2 flex h-10 shrink-0 items-center rounded-lg border border-gray-200 bg-white p-0.5 dark:border-transparent dark:bg-zinc-800 dark:shadow-[0px_0px_1px_1px_#404040]">
                      {NIGHT_MEALS.map((meal) => {
                        const selected = mealForNight(day.id, day.mealPlan) === meal.value
                        return (
                          <button
                            key={meal.value}
                            type="button"
                            title={meal.title}
                            aria-label={meal.title}
                            aria-pressed={selected}
                            onClick={() => chooseMeal(day.id, meal.value)}
                            className={`h-full rounded-md px-2 text-xs font-medium ${
                              selected
                                ? 'bg-[#E7EFFF] text-[#14357A] dark:bg-[#5b93ff]/25 dark:text-[#c5d9ff]'
                                : 'text-gray-600 hover:bg-gray-50 dark:text-zinc-300 dark:hover:bg-white/5'
                            }`}
                          >
                            {meal.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
              {departure ? (
                <div className="flex items-center gap-3 py-1">
                  <div className="w-[92px] shrink-0">
                    <p className="text-[11px] tabular-nums text-gray-400">Departure</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">{formatShort(departure.date)}</p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-zinc-400">No overnight stay</p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <section id="form-cover" className="scroll-mt-3">
        <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">Header</h3>
        <div className="rounded-xl border border-gray-200 bg-white px-3 pt-3 dark:border-zinc-700 dark:bg-zinc-900/40">
          <InputField
            id="trip-title"
            label="Tour name"
            placeholder="e.g. 6 Nights in Paradise"
            value={trip.title}
            attention={markMissing && !trip.title.trim()}
            onChange={(e) => patch({ title: e.target.value })}
            labelAction={
              <button
                type="button"
                disabled={naming}
                onClick={() => {
                  if (naming) return
                  setNaming(true)
                  window.setTimeout(() => {
                    patch({ title: suggestTourName(trip) })
                    setNaming(false)
                    document.getElementById('trip-title')?.focus()
                  }, 350)
                }}
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-pink-400 to-blue-500 px-2 py-[3px] text-[11px] font-medium leading-none text-white hover:opacity-90 disabled:opacity-60"
              >
                <Sparkles size={11} />
                Generate
              </button>
            }
          />
          <p className="mb-2 text-sm text-gray-800 dark:text-zinc-100">Cover image</p>
          <FieldAttention on={markMissing && !trip.coverImage}>
            <ImageSelect
              value={trip.coverImage}
              options={headerImages}
              onChange={(coverImage) => patch({ coverImage })}
            />
          </FieldAttention>
          <InputField
            label="YouTube URL"
            optional
            placeholder="https://www.youtube.com/watch?v=…"
            value={trip.heroVideoUrl ?? ''}
            onChange={(e) => patch({ heroVideoUrl: e.target.value })}
            className="mt-4"
          />
          <p className="-mt-1 mb-3 text-xs text-gray-400">
            Plays muted on a loop behind the itinerary title. Cover image is the poster until the film starts.
          </p>
        </div>
      </section>

      <section id="form-facilities" className="scroll-mt-3">
        <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">General facilities</h3>
        <div className="flex flex-wrap gap-2">
          {[...PRESET, ...trip.facilities.map((item) => item.label).filter((label) => !PRESET.includes(label))].map((label) => {
            const on = trip.facilities.some((f) => f.label === label)
            return (
              <button
                key={label}
                type="button"
                onClick={() => toggleFacility(label)}
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  on
                    ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-200'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
        <InputField
          placeholder="Add a facility"
          value={customFacility}
          endAdornment={customFacility ? <EnterHint /> : undefined}
          onChange={(e) => setCustomFacility(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return
            e.preventDefault()
            const label = customFacility.trim()
            if (!label) return
            if (!trip.facilities.some((item) => item.label === label)) toggleFacility(label)
            setCustomFacility('')
          }}
          className="mt-3 mb-0"
        />
      </section>
    </div>
    <Modal
      open={datePrompt != null}
      title={
        reviseNights
          ? 'Nights and days updated'
          : trip.days.length === 0
            ? 'Lay out this trip'
            : (datePrompt ?? 0) > 0
              ? 'Add to the journey'
              : 'Shorten the journey'
      }
      onClose={closeDatePrompt}
      footer={
        reviseNights ? (
          <BaseButton onClick={closeDatePrompt}>Done</BaseButton>
        ) : (
          <>
            <BaseButton variant="secondary" onClick={closeDatePrompt}>
              Not now
            </BaseButton>
            <BaseButton variant={(datePrompt ?? 0) < 0 ? 'danger' : 'primary'} onClick={applyJourney}>
              {trip.days.length === 0
                ? `Lay out ${expectedDays} days`
                : (datePrompt ?? 0) > 0
                  ? `Add ${datePrompt} ${datePrompt === 1 ? 'day' : 'days'}`
                  : `Remove ${Math.abs(datePrompt ?? 0)} ${Math.abs(datePrompt ?? 0) === 1 ? 'day' : 'days'}`}
            </BaseButton>
          </>
        )
      }
    >
      {reviseNights ? (
        <p className="mb-4 text-sm text-gray-600 dark:text-zinc-300">
          These nights were already on the trip — {priorStay.current.nights} {priorStay.current.nights === 1 ? 'night' : 'nights'}, departure {formatLong(priorStay.current.end)}. The new dates {(datePrompt ?? 0) > 0 ? 'add' : 'remove'} {Math.abs(datePrompt ?? 0)} {Math.abs(datePrompt ?? 0) === 1 ? 'night' : 'nights'}. The nights and the day-by-day dates have been updated.
        </p>
      ) : null}
      <JourneyDateCopy delta={datePrompt ?? 0} dates={reviseNights ? journeyDates : undefined} />
    </Modal>
    </div>
  )
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

function weekRows(dates: string[]) {
  const sorted = [...dates].filter(Boolean).sort()
  if (!sorted.length) return []
  const selected = new Set(sorted)
  const first = dayjs(sorted[0])
  const last = dayjs(sorted[sorted.length - 1])
  let cursor = first.subtract((first.day() + 6) % 7, 'day')
  const rows: { iso: string; label: number; on: boolean }[][] = []
  while (!cursor.isAfter(last, 'day')) {
    const row: { iso: string; label: number; on: boolean }[] = []
    for (let index = 0; index < 7; index += 1) {
      const iso = cursor.format('YYYY-MM-DD')
      row.push({ iso, label: cursor.date(), on: selected.has(iso) })
      cursor = cursor.add(1, 'day')
    }
    rows.push(row)
  }
  return rows
}

function JourneyDates({ dates }: { dates: string[] }) {
  const rows = weekRows(dates)
  if (!rows.length) return null
  const months = [...new Set(dates.filter(Boolean).map((date) => dayjs(date).format('MMMM')))]
  return (
    <div>
      <p className="mb-3 text-center text-sm font-medium text-gray-800 dark:text-zinc-100">{months.join(' – ')}</p>
      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((day) => (
          <div key={day} className="pb-1 text-center text-[11px] text-gray-400">
            {day}
          </div>
        ))}
        {rows.flat().map((cell) => (
          <div
            key={cell.iso}
            className={
              cell.on
                ? 'flex h-9 items-center justify-center rounded-lg bg-[#E7EFFF] text-sm font-medium text-[#14357A] dark:bg-[#5b93ff]/25 dark:text-[#c5d9ff]'
                : 'h-9'
            }
          >
            {cell.on ? cell.label : ''}
          </div>
        ))}
      </div>
    </div>
  )
}

function datesFromRange(start: string, end: string) {
  if (!start || !end) return []
  const dates: string[] = []
  let cursor = dayjs(start)
  const last = dayjs(end)
  while (!cursor.isAfter(last, 'day')) {
    dates.push(cursor.format('YYYY-MM-DD'))
    cursor = cursor.add(1, 'day')
  }
  return dates
}

function JourneyDateCopy({ delta, dates }: { delta: number; dates?: string[] }) {
  const { trip } = useItinerary()
  const nextNights = nightsBetween(trip.startDate, trip.endDate)
  if (dates) return <JourneyDates dates={dates} />
  if (trip.days.length === 0) return <JourneyDates dates={datesFromRange(trip.startDate, trip.endDate)} />
  if (delta > 0) {
    return <JourneyDates dates={addedNightDates(trip.startDate, trip.days, nextNights)} />
  }
  return <JourneyDates dates={nightsToRemove(trip.days, nextNights).map((day) => day.date)} />
}
