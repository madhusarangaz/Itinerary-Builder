import { Calendar, ChevronDown, Search, Trash2 } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { mockCustomers } from '../../../data/sample-trip'
import { calendarDays, formatLong, formatShort, nightsBetween } from '../../../lib/dates'
import { addedNightDates, applyJourneyDays, journeyDelta, nightsToRemove, redateDays, syncStays } from '../../../lib/journey'
import { uid } from '../../../lib/ids'
import { useItinerary } from '../../../state/itinerary-store'
import { SearchSelect } from '../../../components/ui/SearchSelect'
import { useDestinations } from '../../../state/destination-store'
import { useSuppliers } from '../../../state/supplier-store'
import { useTransport } from '../../../state/transport-store'
import { BaseButton } from '../../../components/ui/BaseButton'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { ImageUploader } from '../../../components/ui/ImageUploader'
import { InputField } from '../../../components/ui/InputField'
import { Modal } from '../../../components/ui/Modal'
import { TextAreaField } from '../../../components/ui/TextAreaField'

const PRESET = ['Wi-Fi', 'Pool Access', '24/7 Concierge', 'VIP Excursions', 'Gourmet Dining', 'Spa', 'Private Driver']

function highlightNumbers(highlights: { number?: number }[]) {
  let legacy = 0
  return highlights.map((highlight) => {
    if (typeof highlight.number === 'number') return highlight.number
    legacy += 1
    return legacy
  })
}

export function TripDetailsForm() {
  const { trip, patch, updateDay } = useItinerary()
  const { transports } = useTransport()
  const { suppliers } = useSuppliers()
  const { destinations } = useDestinations()
  const [query, setQuery] = useState(trip.customer)
  const [open, setOpen] = useState(false)
  const [customFacility, setCustomFacility] = useState('')
  const [openHighlight, setOpenHighlight] = useState<string | null>(trip.highlights[0]?.id ?? null)
  const [datePrompt, setDatePrompt] = useState<number | null>(null)
  const [highlightPending, setHighlightPending] = useState<{ id: string; name: string } | null>(null)
  const ignoreDateChange = useRef(false)

  const destinationOptions = destinations
    .filter((row) => row.status !== 'archived')
    .map((row) => ({ value: row.id, label: row.name }))
  const expectedDays = calendarDays(trip.startDate, trip.endDate)
  const dateMismatch = expectedDays > 0 && trip.days.length !== expectedDays
  const nightCount = dateMismatch ? Math.max(trip.days.length - 1, 0) : trip.nights
  const nightDays = trip.days.slice(0, nightCount)
  const departure = trip.days.length > nightCount ? trip.days[nightCount] : undefined

  function proposeDates(startDate: string, endDate: string) {
    if (ignoreDateChange.current) return
    if (startDate === trip.startDate && endDate === trip.endDate) return
    const days = startDate ? redateDays(trip.days, startDate) : trip.days
    patch({ startDate, endDate, days })
    const delta = journeyDelta(days.length, startDate, endDate)
    setDatePrompt(delta === 0 ? null : delta)
  }

  function applyJourney() {
    ignoreDateChange.current = true
    setDatePrompt(null)
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

  function toggleFacility(label: string) {
    const exists = trip.facilities.find((f) => f.label === label)
    patch({
      facilities: exists
        ? trip.facilities.filter((f) => f.label !== label)
        : [...trip.facilities, { id: uid('fc'), label }],
    })
  }

  function addHighlight() {
    const id = uid('hl')
    const next = Math.max(0, ...highlightNumbers(trip.highlights)) + 1
    patch({
      highlights: [{ id, name: '', description: '', image: '', number: next }, ...trip.highlights],
    })
    setOpenHighlight(id)
  }

  return (
    <div className="flex h-full min-h-0 flex-col xl:flex-row">
    <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-4 xl:max-w-[640px]">
      <section id="form-header" className="scroll-mt-3">
        <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">Header</h3>
        <InputField
          label="Trip / Tour Name"
          placeholder="e.g. 6 Nights in Paradise"
          value={trip.title}
          onChange={(e) => patch({ title: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Tour ID" value={trip.tourId} onChange={(e) => patch({ tourId: e.target.value })} />
          <InputField label="Option" value={trip.option} onChange={(e) => patch({ option: e.target.value })} />
        </div>
        <div className="relative mb-3">
          <InputField
            label="Traveller / Customer"
            placeholder="Search customer or add new"
            startIcon={<Search size={16} />}
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
        <SearchSelect
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
          <p className="mb-3 -mt-2 text-[11px] text-gray-400">
            Suggested for {trip.adults} adults:{' '}
            {transports
              .filter((row) => row.status === 'active' && trip.adults <= row.capacity.maxAdults && trip.adults >= (row.capacity.minAdults ?? 1))
              .slice(0, 3)
              .map((row) => row.displayName || row.vehicleCategory)
              .join(', ') || 'none of the active types match this party size'}
          </p>
        ) : null}
        {trip.transportName ? (
          <>
            <SearchSelect
              label="Supplier"
              optional
              placeholder="Optional — not required to quote"
              value={trip.supplierId || ''}
              options={suppliers
                .filter((supplier) => supplier.status === 'active' && supplier.type === 'vehicle_fleet')
                .filter((supplier) => supplier.vehicleInventory.some((group) => group.transportId === trip.transportId || group.transportName === trip.transportName))
                .map((supplier) => ({ value: supplier.id, label: supplier.name }))}
              onChange={(value) => {
                const match = suppliers.find((supplier) => supplier.id === value)
                patch({ supplierId: match?.id, supplierName: match?.name, vehicleRegistration: undefined, driverName: undefined })
              }}
            />
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
          </>
        ) : null}
        <div id="form-dates" className="grid scroll-mt-3 grid-cols-2 gap-4">
          <InputField
            label="Start Date"
            type="date"
            startIcon={<Calendar size={16} />}
            value={trip.startDate}
            onChange={(e) => proposeDates(e.target.value, trip.endDate)}
          />
          <InputField
            label="End Date"
            type="date"
            startIcon={<Calendar size={16} />}
            value={trip.endDate}
            onChange={(e) => proposeDates(trip.startDate, e.target.value)}
          />
        </div>
        <p className="mb-3 text-xs text-gray-400">{formatLong(trip.startDate)} → {formatLong(trip.endDate)}</p>
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Adults"
            type="number"
            min={1}
            value={trip.adults}
            onChange={(e) => patch({ adults: Number(e.target.value), pricing: { ...trip.pricing, travellerCount: Number(e.target.value) } })}
          />
          <InputField
            label="Children"
            optional
            type="number"
            min={0}
            value={trip.children}
            onChange={(e) => patch({ children: Number(e.target.value) })}
          />
        </div>
        <InputField label="Number of Nights" value={String(trip.nights)} disabled />
      </section>

      <section id="form-nights" className="scroll-mt-3">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Where each night is spent</h3>
        <p className="mt-1 mb-3 text-xs text-gray-400">
          {trip.nights} {trip.nights === 1 ? 'night' : 'nights'}
          {trip.endDate ? ` · departure ${formatShort(trip.endDate)}` : ''}
        </p>
        {dateMismatch && datePrompt == null ? (
          <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2 dark:border-[#2C2A2A]">
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              These dates cover {trip.nights} {trip.nights === 1 ? 'night' : 'nights'} ({expectedDays} days). The itinerary has {trip.days.length} {trip.days.length === 1 ? 'day' : 'days'}.
            </p>
            <BaseButton variant="secondary" size="sm" onClick={() => setDatePrompt(expectedDays - trip.days.length)}>
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
      </section>

      <section id="form-cover" className="scroll-mt-3">
        <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">Cover image</h3>
        <ImageUploader
          label="Upload Cover Image"
          value={trip.coverImage}
          onChange={(url) => patch({ coverImage: url })}
          onRemove={() => patch({ coverImage: '' })}
          onReposition={() =>
            patch({ coverPosition: trip.coverPosition >= 70 ? 30 : trip.coverPosition + 20 })
          }
        />
      </section>

      <section>
        <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">Header film</h3>
        <InputField
          label="YouTube URL"
          optional
          placeholder="https://www.youtube.com/watch?v=…"
          value={trip.heroVideoUrl ?? ''}
          onChange={(e) => patch({ heroVideoUrl: e.target.value })}
        />
        <p className="mb-3 text-xs text-gray-400">
          Plays muted on a loop behind the itinerary title. Cover image is the poster until the film starts.
        </p>
      </section>

      <section id="form-facilities" className="scroll-mt-3">
        <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">General facilities</h3>
        <div className="flex flex-wrap gap-2">
          {PRESET.map((label) => {
            const on = trip.facilities.some((f) => f.label === label)
            return (
              <button
                key={label}
                type="button"
                onClick={() => toggleFacility(label)}
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  on
                    ? 'border-gray-900 bg-gray-900 text-white dark:border-orange-700 dark:bg-orange-800'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-200'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
        <div className="mt-3 flex gap-2">
          <InputField
            placeholder="Custom facility"
            value={customFacility}
            onChange={(e) => setCustomFacility(e.target.value)}
            className="mb-0"
          />
          <BaseButton
            variant="secondary"
            onClick={() => {
              if (!customFacility.trim()) return
              toggleFacility(customFacility.trim())
              setCustomFacility('')
            }}
          >
            + Add
          </BaseButton>
        </div>
      </section>
    </div>
    <aside id="form-highlights" className="flex max-h-[480px] min-h-0 w-full shrink-0 flex-col border-t border-gray-100 xl:max-h-none xl:w-auto xl:min-w-[520px] xl:flex-1 xl:border-t-0 xl:border-l dark:border-[#2C2A2A]">
      <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Tour highlights</h3>
          <p className="text-xs text-gray-400">{trip.highlights.length} {trip.highlights.length === 1 ? 'highlight' : 'highlights'}</p>
        </div>
        <BaseButton variant="secondary" size="sm" onClick={addHighlight}>
          + Add
        </BaseButton>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        {trip.highlights.length === 0 ? (
          <p className="px-2 py-8 text-center text-sm text-gray-400">No highlights yet.</p>
        ) : (
          <div className="space-y-1">
            {trip.highlights.map((h, index) => {
              const expanded = openHighlight === h.id
              const label = highlightNumbers(trip.highlights)[index] ?? index + 1
              return (
                <div key={h.id} className="overflow-hidden rounded-lg border border-gray-100 dark:border-[#2C2A2A]">
                  <div className="flex items-center">
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-left"
                      aria-expanded={expanded}
                      onClick={() => setOpenHighlight(expanded ? null : h.id)}
                    >
                      <span className="w-5 shrink-0 text-[11px] tabular-nums text-gray-400">{String(label).padStart(2, '0')}</span>
                      <span className="min-w-0 flex-1 truncate text-sm text-gray-900 dark:text-zinc-100">{h.name.trim() || 'Untitled highlight'}</span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete highlight ${String(label).padStart(2, '0')}`}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                      onClick={() => setHighlightPending({ id: h.id, name: h.name.trim() || 'This highlight' })}
                    >
                      <Trash2 size={13} />
                    </button>
                    <button
                      type="button"
                      aria-label={expanded ? 'Collapse highlight' : 'Expand highlight'}
                      className="px-2.5 py-2.5 text-gray-400"
                      onClick={() => setOpenHighlight(expanded ? null : h.id)}
                    >
                      <ChevronDown size={16} className={`transition ${expanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                  {expanded ? (
                    <div className="border-t border-gray-100 px-3 pt-3 dark:border-[#2C2A2A]">
                      <InputField
                        label="Highlight name"
                        value={h.name}
                        onChange={(e) =>
                          patch({ highlights: trip.highlights.map((x) => (x.id === h.id ? { ...x, name: e.target.value } : x)) })
                        }
                      />
                      <TextAreaField
                        label="Short description"
                        optional
                        rows={2}
                        value={h.description}
                        onChange={(e) =>
                          patch({
                            highlights: trip.highlights.map((x) => (x.id === h.id ? { ...x, description: e.target.value } : x)),
                          })
                        }
                      />
                      <ImageUploader
                        value={h.image}
                        onChange={(url) =>
                          patch({ highlights: trip.highlights.map((x) => (x.id === h.id ? { ...x, image: url } : x)) })
                        }
                        onRemove={() =>
                          patch({ highlights: trip.highlights.map((x) => (x.id === h.id ? { ...x, image: '' } : x)) })
                        }
                        aspect="aspect-[3/2]"
                      />
                      <BaseButton
                        variant="ghost"
                        size="sm"
                        className="mb-2"
                        onClick={() => setHighlightPending({ id: h.id, name: h.name.trim() || 'This highlight' })}
                      >
                        Remove
                      </BaseButton>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </aside>
    <Modal
      open={datePrompt != null}
      title={trip.days.length === 0 ? 'Lay out this trip' : (datePrompt ?? 0) > 0 ? 'Add to the journey' : 'Shorten the journey'}
      onClose={() => setDatePrompt(null)}
      footer={
        <>
          <BaseButton variant="secondary" onClick={() => setDatePrompt(null)}>
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
      }
    >
      <JourneyDateCopy delta={datePrompt ?? 0} />
    </Modal>
    <ConfirmDialog
      open={highlightPending != null}
      title="Delete highlight"
      message={`${highlightPending?.name ?? 'This highlight'} will be removed from this trip.`}
      onClose={() => setHighlightPending(null)}
      onConfirm={() => {
        if (!highlightPending) return
        patch({ highlights: trip.highlights.filter((item) => item.id !== highlightPending.id) })
        if (openHighlight === highlightPending.id) setOpenHighlight(null)
        setHighlightPending(null)
      }}
    />
    </div>
  )
}

function JourneyDateCopy({ delta }: { delta: number }) {
  const { trip } = useItinerary()
  const nextNights = nightsBetween(trip.startDate, trip.endDate)
  if (trip.days.length === 0) {
    return (
      <p className="text-sm text-gray-600 dark:text-zinc-300">
        {formatLong(trip.startDate)} – {formatLong(trip.endDate)} is {nextNights} {nextNights === 1 ? 'night' : 'nights'}. Lay out the days, then choose where each night is spent.
      </p>
    )
  }
  if (delta > 0) {
    const dates = addedNightDates(trip.startDate, trip.days, nextNights)
    return (
      <p className="text-sm text-gray-600 dark:text-zinc-300">
        These dates are {nextNights} {nextNights === 1 ? 'night' : 'nights'}. Add {dates.length === 1 ? 'a night' : `${dates.length} nights`} before the departure day
        {dates.length ? ` (${dates.map((date) => formatLong(date)).join(', ')})` : ''}.
      </p>
    )
  }
  const removing = nightsToRemove(trip.days, nextNights)
  return (
    <div className="space-y-2 text-sm text-gray-600 dark:text-zinc-300">
      <p>These dates are {nextNights} {nextNights === 1 ? 'night' : 'nights'}. Remove {removing.length === 1 ? 'this night' : 'these nights'}?</p>
      <ul className="space-y-1">
        {removing.map((day) => (
          <li key={day.id}>
            Day {String(day.dayNumber).padStart(2, '0')} · {day.destination.trim() || 'No destination'} · {formatLong(day.date)}
          </li>
        ))}
      </ul>
    </div>
  )
}
