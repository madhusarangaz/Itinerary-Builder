import { ChoicePills } from '../../../components/ui/ChoicePills'
import { BaseSelect } from '../../../components/ui/BaseSelect'
import { SearchSelect } from '../../../components/ui/SearchSelect'
import { InputField } from '../../../components/ui/InputField'
import { TextAreaField } from '../../../components/ui/TextAreaField'
import { STAR_OPTIONS } from '../../../data/hotel-catalog'
import { useDestinations } from '../../../state/destination-store'
import { useHotelMaster } from '../../../state/hotel-store'
import type { StarCategory } from '../../../types/hotel'
import { SectionHead } from './shared'

export function DetailsForm() {
  const { active: hotel, patchActive } = useHotelMaster()
  const { destinations } = useDestinations()

  return (
    <div className="scroll-mt-3 space-y-1 px-6 py-4">
      <SectionHead title="Hotel Details" helper="Add the hotel's basic information." />
      <InputField label="Hotel Name *" placeholder="e.g. Amari Colombo" value={hotel.name} onChange={(e) => patchActive({ name: e.target.value })} />
      <BaseSelect
        label="Star Category *"
        placeholder="Select stars"
        value={hotel.starCategory ? String(hotel.starCategory) : ''}
        options={STAR_OPTIONS.map((s) => ({ value: String(s.value), label: s.label }))}
        onChange={(e) => patchActive({ starCategory: e.target.value ? (Number(e.target.value) as StarCategory) : undefined })}
      />
      <TextAreaField
        label="Address *"
        rows={4}
        placeholder={'No. XX, Galle Road\nColombo 03\nSri Lanka'}
        value={hotel.address}
        onChange={(e) => patchActive({ address: e.target.value })}
      />
      <SearchSelect
        label="Destination / City"
        optional
        placeholder="Search destinations…"
        value={hotel.destinationId ?? ''}
        options={destinations.map((d) => ({ value: d.id, label: d.name || 'Untitled destination' }))}
        onChange={(destinationId) => {
          const match = destinations.find((d) => d.id === destinationId)
          patchActive({ destinationId, destinationName: match?.name || hotel.destinationName })
        }}
      />
      {hotel.destinationName && !hotel.destinationId ? (
        <p className="-mt-2 mb-3 text-[11px] text-gray-400">Shown as {hotel.destinationName}. Link a destination when it exists in Destinations.</p>
      ) : null}
      <ChoicePills
        label="Status"
        value={hotel.status === 'inactive' ? 'inactive' : 'active'}
        onChange={(status) => patchActive({ status: status === 'inactive' ? 'inactive' : hotel.status === 'inactive' ? 'draft' : hotel.status })}
        options={[
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ]}
      />
    </div>
  )
}
