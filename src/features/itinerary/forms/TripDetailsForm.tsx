import { Calendar, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { mockCustomers } from '../../../data/sample-trip'
import { addDays, formatLong } from '../../../lib/dates'
import { uid } from '../../../lib/ids'
import { useItinerary } from '../../../state/itinerary-store'
import { SearchSelect } from '../../../components/ui/SearchSelect'
import { useSuppliers } from '../../../state/supplier-store'
import { useTransport } from '../../../state/transport-store'
import { BaseButton } from '../../../components/ui/BaseButton'
import { ImageUploader } from '../../../components/ui/ImageUploader'
import { InputField } from '../../../components/ui/InputField'
import { TextAreaField } from '../../../components/ui/TextAreaField'

const PRESET = ['Wi-Fi', 'Pool Access', '24/7 Concierge', 'VIP Excursions', 'Gourmet Dining', 'Spa', 'Private Driver']

export function TripDetailsForm() {
  const { trip, patch } = useItinerary()
  const { transports } = useTransport()
  const { suppliers } = useSuppliers()
  const [query, setQuery] = useState(trip.customer)
  const [open, setOpen] = useState(false)
  const [customFacility, setCustomFacility] = useState('')

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

  return (
    <div className="space-y-6 px-6 py-4">
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
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Start Date"
            type="date"
            startIcon={<Calendar size={16} />}
            value={trip.startDate}
            onChange={(e) => {
              const startDate = e.target.value
              patch({
                startDate,
                days: trip.days.map((d, i) => ({
                  ...d,
                  date: addDays(startDate, i),
                })),
              })
            }}
          />
          <InputField
            label="End Date"
            type="date"
            startIcon={<Calendar size={16} />}
            value={trip.endDate}
            onChange={(e) => patch({ endDate: e.target.value })}
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

      <section id="form-highlights" className="scroll-mt-3">
        <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">Tour highlights</h3>
        <div className="space-y-3">
          {trip.highlights.map((h) => (
            <div key={h.id} className="rounded-xl border border-gray-100 p-3 dark:border-[#2C2A2A]">
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
                onClick={() => patch({ highlights: trip.highlights.filter((x) => x.id !== h.id) })}
              >
                Remove
              </BaseButton>
            </div>
          ))}
        </div>
        <BaseButton
          variant="secondary"
          className="mt-2"
          onClick={() =>
            patch({
              highlights: [...trip.highlights, { id: uid('hl'), name: 'New highlight', description: '', image: '' }],
            })
          }
        >
          + Add Highlight
        </BaseButton>
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
  )
}
