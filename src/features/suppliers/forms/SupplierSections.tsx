import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { BaseButton } from '../../../components/ui/BaseButton'
import { ChoicePills, MultiChips, RadioCards } from '../../../components/ui/ChoicePills'
import { ImageUploader } from '../../../components/ui/ImageUploader'
import { InputField } from '../../../components/ui/InputField'
import { SearchSelect } from '../../../components/ui/SearchSelect'
import { GUIDE_TYPE_LABEL, SUPPLIER_LANGUAGES } from '../../../data/supplier-catalog'
import { IMAGE_SLOTS } from '../../../data/transport-catalog'
import { imageCount, missingRegistrations, newDriver, newInventory, syncUnits } from '../../../lib/supplier'
import { uid } from '../../../lib/ids'
import { useSuppliers } from '../../../state/supplier-store'
import { useTransport } from '../../../state/transport-store'
import type { GuideType, SupplierSectionId, SupplierVehicleInventory, VehicleOwnership } from '../../../types/supplier'
import type { TransportImageSlot } from '../../../types/transport'
import { SectionHead } from '../../destinations/forms/shared'

function patchGroup(groups: SupplierVehicleInventory[], id: string, patch: Partial<SupplierVehicleInventory>) {
  return groups.map((group) => (group.id === id ? { ...group, ...patch } : group))
}

export function SupplierSections({ section }: { section: SupplierSectionId }) {
  const { active, patchActive } = useSuppliers()
  const { transports } = useTransport()
  const [openFleet, setOpenFleet] = useState<string | null>(active.vehicleInventory[0]?.id ?? null)
  const [driverQuery, setDriverQuery] = useState('')
  const [editingDriver, setEditingDriver] = useState<string | null>(null)
  const transportOptions = transports
    .filter((row) => row.status !== 'inactive')
    .map((row) => ({ value: row.id, label: row.displayName || row.vehicleCategory, hint: row.vehicleCategory }))

  if (section === 'supplier') {
    return (
      <div className="space-y-1 px-6 py-4">
        <SectionHead title="Supplier Details" helper="Add the supplier's main information and service type." />
        <RadioCards
          label="Supplier Type *"
          value={active.type ?? ''}
          onChange={(type) => patchActive({ type: type as 'individual' | 'vehicle_fleet', vehicleOwnership: type === 'individual' ? undefined : active.vehicleOwnership })}
          options={[
            { value: 'individual', label: 'Individual Supplier', hint: 'A person such as a national guide or chauffeur guide.' },
            { value: 'vehicle_fleet', label: 'Vehicle Fleet Supplier', hint: 'A business with one or more vehicles and drivers.' },
          ]}
        />
        <InputField
          label="Supplier Name *"
          placeholder={active.type === 'vehicle_fleet' ? 'ABC Transport Services' : 'Nimal Perera'}
          value={active.name}
          onChange={(e) => patchActive({ name: e.target.value })}
        />
        <InputField
          label="SLTDA Registration No."
          optional
          placeholder="Enter the registration number"
          value={active.sltdaRegistrationNo ?? ''}
          onChange={(e) => patchActive({ sltdaRegistrationNo: e.target.value })}
        />
        <MultiChips
          label="Guide Type"
          optional
          value={active.guideTypes}
          onChange={(guideTypes) => patchActive({ guideTypes: guideTypes as GuideType[] })}
          options={(Object.keys(GUIDE_TYPE_LABEL) as GuideType[]).map((id) => ({ value: id, label: GUIDE_TYPE_LABEL[id] }))}
        />
        <MultiChips
          label="Languages"
          optional
          allowCustom
          customLabel="+ Add language"
          value={active.languages}
          onChange={(languages) => patchActive({ languages })}
          options={SUPPLIER_LANGUAGES.map((language) => ({ value: language, label: language }))}
        />
        {active.type === 'vehicle_fleet' ? (
          <RadioCards
            label="Vehicle Ownership"
            value={active.vehicleOwnership ?? ''}
            onChange={(vehicleOwnership) => patchActive({ vehicleOwnership: vehicleOwnership as VehicleOwnership })}
            options={[
              { value: 'single', label: 'Single Vehicle', hint: 'One vehicle provided by this supplier.' },
              { value: 'multiple', label: 'Multiple Vehicles', hint: 'A fleet of more than one vehicle.' },
            ]}
          />
        ) : null}
        <p className="mb-2 text-[11px] text-gray-400">Phone and email are optional contact details for coordinators. They are not part of the director’s required supplier record.</p>
        <div className="grid gap-3 md:grid-cols-2">
          <InputField label="Phone Number" optional value={active.phone ?? ''} onChange={(e) => patchActive({ phone: e.target.value })} />
          <InputField label="Email Address" optional type="email" value={active.email ?? ''} onChange={(e) => patchActive({ email: e.target.value })} />
        </div>
        <ChoicePills
          label="Status"
          value={active.status === 'inactive' ? 'inactive' : 'active'}
          onChange={(status) => patchActive({ status: status === 'inactive' ? 'inactive' : active.status === 'draft' ? 'draft' : 'active' })}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />
      </div>
    )
  }

  if (section === 'guide') {
    return (
      <div className="space-y-3 px-6 py-4">
        <SectionHead title="Guide Details" helper="These values are edited in Supplier Details so there is only one record of each." />
        <div className="rounded-xl border border-gray-100 p-4 dark:border-[#2C2A2A]">
          <p className="text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase">Guide profile</p>
          <p className="mt-2 text-sm font-medium text-gray-900 dark:text-zinc-100">{active.guideTypes.map((type) => GUIDE_TYPE_LABEL[type]).join(' · ') || 'No guide type'}</p>
          <p className="mt-3 text-xs text-gray-400">Languages</p>
          <p className="text-sm">{active.languages.length ? active.languages.join(', ') : 'None added'}</p>
          <p className="mt-3 text-xs text-gray-400">SLTDA registration</p>
          <p className="text-sm">{active.sltdaRegistrationNo || 'Not added'}</p>
        </div>
      </div>
    )
  }

  if (section === 'vehicles') {
    return (
      <div className="space-y-3 px-6 py-4">
        <SectionHead title="Vehicle Inventory" helper="Actual vehicles this supplier can provide. Rates and capacity stay on Transport Master." />
        {active.vehicleInventory.map((group) => {
          const open = openFleet === group.id
          const gap = missingRegistrations(group)
          const linked = transports.find((row) => row.id === group.transportId) ?? transports.find((row) => row.vehicleCategory === group.transportName || row.displayName === group.transportName)
          const modelOptions = (linked?.models ?? []).map((model) => ({ value: model.name, label: model.name }))
          return (
            <div key={group.id} className="rounded-xl border border-gray-100 dark:border-[#2C2A2A]">
              <button type="button" className="flex w-full items-start justify-between px-4 py-3 text-left" onClick={() => setOpenFleet(open ? null : group.id)}>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{group.model || group.transportName || 'New vehicle'}</p>
                  <p className="text-xs text-gray-400">{group.transportName || 'Transport type not set'} · {group.numberOfUnits} units{group.manufactureYear ? ` · ${group.manufactureYear}` : ''} · {group.vehicles.filter((unit) => unit.registrationNumber.trim()).length} registrations · {imageCount(group)} images</p>
                </div>
                <span className="text-xs text-gray-400">{open ? 'Close' : 'Edit'}</span>
              </button>
              {open ? (
                <div className="space-y-2 border-t border-gray-100 px-4 py-3 dark:border-[#2C2A2A]">
                  <SearchSelect
                    label="Transport Type *"
                    placeholder="Search transport…"
                    value={linked?.id || group.transportName}
                    options={transportOptions}
                    onChange={(value) => {
                      const match = transports.find((row) => row.id === value)
                      patchActive({ vehicleInventory: patchGroup(active.vehicleInventory, group.id, { transportId: match?.id, transportName: match?.displayName || match?.vehicleCategory || value }) })
                    }}
                  />
                  <SearchSelect
                    label="Vehicle Model *"
                    allowCreate
                    placeholder="Toyota KDH"
                    value={group.model}
                    options={modelOptions}
                    onChange={(model) => patchActive({ vehicleInventory: patchGroup(active.vehicleInventory, group.id, { model }) })}
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <InputField
                      label="Manufacture Year *"
                      type="number"
                      min={1950}
                      max={new Date().getFullYear() + 1}
                      value={group.manufactureYear ?? ''}
                      onChange={(e) => {
                        const year = e.target.value === '' ? undefined : Number(e.target.value)
                        if (year != null && year < 0) return
                        patchActive({ vehicleInventory: patchGroup(active.vehicleInventory, group.id, { manufactureYear: year }) })
                      }}
                    />
                    <InputField
                      label="Number of Units *"
                      type="number"
                      min={1}
                      value={group.numberOfUnits}
                      onChange={(e) => {
                        const count = Math.max(1, Math.floor(Number(e.target.value) || 1))
                        patchActive({ vehicleInventory: patchGroup(active.vehicleInventory, group.id, syncUnits(group, count)) })
                      }}
                    />
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-zinc-100">Vehicle numbers</p>
                  {group.vehicles.map((unit, index) => (
                    <InputField
                      key={unit.id}
                      label={`Vehicle ${String(index + 1).padStart(2, '0')} registration`}
                      placeholder="CAB-1234"
                      value={unit.registrationNumber}
                      onChange={(e) =>
                        patchActive({
                          vehicleInventory: patchGroup(active.vehicleInventory, group.id, {
                            vehicles: group.vehicles.map((row) => (row.id === unit.id ? { ...row, registrationNumber: e.target.value } : row)),
                          }),
                        })
                      }
                    />
                  ))}
                  {gap > 0 ? <p className="text-xs text-amber-600 dark:text-amber-400">Add {gap} more vehicle registration{gap === 1 ? '' : 's'} to match the number of units.</p> : null}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {IMAGE_SLOTS.map((slot) => (
                      <ImageUploader
                        key={slot.id}
                        className="mb-0"
                        aspect="aspect-[4/3]"
                        label={slot.label}
                        value={group.images[slot.id as TransportImageSlot]?.url ?? ''}
                        onChange={(url) =>
                          patchActive({
                            vehicleInventory: patchGroup(active.vehicleInventory, group.id, {
                              images: { ...group.images, [slot.id]: url ? { id: group.images[slot.id as TransportImageSlot]?.id ?? uid('img'), url } : undefined },
                            }),
                          })
                        }
                        onRemove={() =>
                          patchActive({
                            vehicleInventory: patchGroup(active.vehicleInventory, group.id, {
                              images: { ...group.images, [slot.id]: undefined },
                            }),
                          })
                        }
                      />
                    ))}
                  </div>
                  <button type="button" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-500" onClick={() => patchActive({ vehicleInventory: active.vehicleInventory.filter((row) => row.id !== group.id) })}>
                    <Trash2 size={12} /> Remove this inventory
                  </button>
                </div>
              ) : null}
            </div>
          )
        })}
        <BaseButton variant="secondary" onClick={() => { const created = newInventory(); patchActive({ vehicleInventory: [...active.vehicleInventory, created] }); setOpenFleet(created.id) }}>
          <Plus size={14} /> Add Vehicle
        </BaseButton>
      </div>
    )
  }

  const drivers = active.drivers.filter((driver) => `${driver.name} ${driver.contactNumber ?? ''}`.toLowerCase().includes(driverQuery.toLowerCase().trim()))
  return (
    <div className="space-y-3 px-6 py-4">
      <SectionHead title="Drivers" helper="Drivers belong to this supplier and can be added without assigning a vehicle." />
      <InputField label="Search drivers" placeholder="Search drivers..." value={driverQuery} onChange={(e) => setDriverQuery(e.target.value)} />
      {drivers.map((driver) => (
        <div key={driver.id} className="rounded-xl border border-gray-100 p-3 dark:border-[#2C2A2A]">
          {editingDriver === driver.id || !driver.name.trim() ? (
            <>
              <InputField label="Driver Name" value={driver.name} onChange={(e) => patchActive({ drivers: active.drivers.map((row) => (row.id === driver.id ? { ...row, name: e.target.value } : row)) })} />
              <InputField label="Contact Number" optional value={driver.contactNumber ?? ''} onChange={(e) => patchActive({ drivers: active.drivers.map((row) => (row.id === driver.id ? { ...row, contactNumber: e.target.value } : row)) })} />
              <BaseButton size="sm" variant="secondary" onClick={() => setEditingDriver(null)}>Done</BaseButton>
            </>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{driver.name}</p>
                <p className="text-xs text-gray-400">{driver.contactNumber || 'No contact number'} · {driver.status === 'active' ? 'Active' : 'Inactive'}</p>
              </div>
              <div className="flex gap-2 text-xs text-gray-500">
                <button type="button" onClick={() => setEditingDriver(driver.id)}>Edit</button>
                <button type="button" onClick={() => patchActive({ drivers: active.drivers.map((row) => (row.id === driver.id ? { ...row, status: row.status === 'active' ? 'inactive' : 'active' } : row)) })}>
                  {driver.status === 'active' ? 'Deactivate' : 'Restore'}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
      <BaseButton variant="secondary" onClick={() => { const created = newDriver(); patchActive({ drivers: [...active.drivers, created] }); setEditingDriver(created.id) }}>
        <Plus size={14} /> Add Driver
      </BaseButton>
    </div>
  )
}
