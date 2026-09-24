import { ChoicePills, MultiChips } from '../../../components/ui/ChoicePills'
import { InputField } from '../../../components/ui/InputField'
import { SearchSelect } from '../../../components/ui/SearchSelect'
import { TextAreaField } from '../../../components/ui/TextAreaField'
import { defaultLeisureKm, inferVehicleGroup, VEHICLE_CATEGORIES, VEHICLE_GROUP_LABELS } from '../../../data/transport-catalog'
import { newModel } from '../../../lib/transport'
import { useTransport } from '../../../state/transport-store'
import type { VehicleGroup } from '../../../types/transport'
import { SectionHead } from './shared'

export function VehicleForm() {
  const { active: t, transports, patchActive } = useTransport()
  const extras = transports.map((row) => row.vehicleCategory).filter(Boolean)
  const categories = Array.from(new Set([...VEHICLE_CATEGORIES, ...extras, t.vehicleCategory].filter(Boolean)))

  function setCategory(vehicleCategory: string) {
    const vehicleGroup = inferVehicleGroup(vehicleCategory)
    const rename = !t.displayName.trim() || t.displayName === t.vehicleCategory
    patchActive({
      vehicleCategory,
      vehicleGroup,
      displayName: rename ? vehicleCategory : t.displayName,
      mileageRules: {
        ...t.mileageRules,
        leisureDayKm: defaultLeisureKm(vehicleGroup),
      },
    })
  }

  return (
    <div id="form-vehicle" className="scroll-mt-3 space-y-1 px-6 py-4">
      <SectionHead
        title="Vehicle Details"
        helper="Define the reusable vehicle category and models available under this transport type."
      />

      <SearchSelect
        label="Vehicle Category *"
        placeholder="Search categories…"
        allowCreate
        value={t.vehicleCategory}
        options={categories.map((c) => ({ value: c, label: c }))}
        onChange={setCategory}
      />

      <InputField
        label="Display Name"
        placeholder="Usually matches the category"
        value={t.displayName}
        onChange={(e) => patchActive({ displayName: e.target.value })}
      />

      <MultiChips
        label="Available Models *"
        allowCustom
        customLabel="+ Add model"
        value={t.models.map((m) => m.name)}
        onChange={(names) =>
          patchActive({
            models: names.filter(Boolean).map((name) => t.models.find((m) => m.name === name) ?? newModel(name)),
          })
        }
        options={t.models.map((m) => ({ value: m.name, label: m.name }))}
      />
      <p className="-mt-2 mb-3 text-[11px] text-gray-400">Add every model guests might travel in under this category.</p>

      <TextAreaField
        label="Description"
        optional
        rows={3}
        placeholder="Short note for coordinators or itinerary copy."
        value={t.description ?? ''}
        onChange={(e) => patchActive({ description: e.target.value })}
      />

      <ChoicePills
        label="Vehicle Group"
        value={t.vehicleGroup}
        onChange={(vehicleGroup) =>
          patchActive({
            vehicleGroup: vehicleGroup as VehicleGroup,
            mileageRules: { ...t.mileageRules, leisureDayKm: defaultLeisureKm(vehicleGroup as VehicleGroup) },
          })
        }
        options={(Object.keys(VEHICLE_GROUP_LABELS) as VehicleGroup[]).map((g) => ({
          value: g,
          label: VEHICLE_GROUP_LABELS[g],
        }))}
      />
      <p className="-mt-2 mb-3 text-[11px] text-gray-400">Used for mileage defaults. Cars and vans use 80 km leisure days; coaches use 100 km.</p>

      <ChoicePills
        label="Status"
        value={t.status === 'inactive' ? 'inactive' : 'active'}
        onChange={(status) => {
          if (status === 'inactive') patchActive({ status: 'inactive' })
          else patchActive({ status: t.status === 'inactive' ? 'draft' : t.status })
        }}
        options={[
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ]}
      />
    </div>
  )
}
