import { useState } from 'react'
import { BaseButton } from '../../../components/ui/BaseButton'
import { CheckboxField } from '../../../components/ui/CheckboxField'
import { ChoicePills } from '../../../components/ui/ChoicePills'
import { Drawer } from '../../../components/ui/Drawer'
import { InputField } from '../../../components/ui/InputField'
import { RadioCards } from '../../../components/ui/ChoicePills'
import { StepperField } from '../../../components/ui/StepperField'
import {
  calculateRouteKm,
  calculateTotalMileage,
  calculateTransportationCost,
  calculateTransportationLKR,
  formatLkr,
  formatMoney,
} from '../../../lib/costing-calc'
import { formatShort } from '../../../lib/dates'
import { SearchSelect } from '../../../components/ui/SearchSelect'
import { useCosting } from '../../../state/costing-store'
import { useSuppliers } from '../../../state/supplier-store'

const RATE_PRESETS = [
  { value: '80', label: 'LKR 80', hint: '/ km' },
  { value: '100', label: 'LKR 100', hint: '/ km' },
  { value: '120', label: 'LKR 120', hint: '/ km' },
  { value: '150', label: 'LKR 150', hint: '/ km' },
  { value: 'custom', label: 'Custom', hint: 'Enter rate' },
]
const EXTRA_CHIPS = [0, 40, 80, 100, 150]

export function TransportationCostForm() {
  const { active: c, patchActive } = useCosting()
  const { suppliers } = useSuppliers()
  const [kmOpen, setKmOpen] = useState(false)
  const [maps, setMaps] = useState(!!c.transportation.googleMapsLink)
  const [customRate, setCustomRate] = useState(
    () => !['80', '100', '120', '150'].includes(String(c.transportation.ratePerKmLKR)),
  )
  const routeKm = calculateRouteKm(c.accommodation)
  const t = c.transportation
  const totalMileage = calculateTotalMileage(t, routeKm)
  const lkr = calculateTransportationLKR(t, routeKm)
  const usd = calculateTransportationCost(t, routeKm, c.exchangeRate)
  const rateKey = customRate ? 'custom' : String(t.ratePerKmLKR)

  function patch(p: Partial<typeof t>) {
    patchActive({ transportation: { ...t, ...p } })
  }

  return (
    <div id="cost-transport" className="scroll-mt-3 space-y-1 px-6 py-4">
      <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-white">Transportation</h3>
      <p className="mb-4 text-xs text-gray-400">Mileage is built from the daily route, then Google base KM and extras. Supplier is optional until the quote is confirmed.</p>
      <SearchSelect
        label="Supplier"
        optional
        placeholder="Select a fleet supplier later"
        value={t.supplierId || t.supplierName || ''}
        options={suppliers.filter((supplier) => supplier.type === 'vehicle_fleet' && supplier.status === 'active').map((supplier) => ({ value: supplier.id, label: supplier.name, hint: `${supplier.vehicleInventory.length} vehicle groups` }))}
        onChange={(value) => {
          const match = suppliers.find((supplier) => supplier.id === value)
          patch({ supplierId: match?.id, supplierName: match?.name })
        }}
      />

      <div className="mb-4 rounded-xl border border-gray-100 px-4 py-3 dark:border-[#2C2A2A]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase">Route KM</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-zinc-100">{routeKm} km</p>
            <p className="text-xs text-gray-400">Sum of each day’s destination KM</p>
          </div>
          <BaseButton variant="secondary" size="sm" onClick={() => setKmOpen(true)}>
            Edit daily KM
          </BaseButton>
        </div>
      </div>

      <InputField
        label="Gross mileage / base mileage"
        type="number"
        min={0}
        value={t.grossMileage}
        onChange={(e) => patch({ grossMileage: Number(e.target.value) || 0 })}
      />
      <p className="mb-3 -mt-2 text-xs text-gray-400">Google / route base mileage for the whole tour</p>
      {t.masterRatePerKmLKR != null ? <p className="mb-3 text-[11px] text-gray-400">Transport master rate captured for this costing: LKR {t.masterRatePerKmLKR}/km. Changing the trip rate does not change Transport Master.</p> : null}

      <ChoicePills
        label="Extra mileage"
        value={EXTRA_CHIPS.includes(t.extraMileage) ? String(t.extraMileage) : 'custom'}
        onChange={(v) => patch({ extraMileage: v === 'custom' ? t.extraMileage : Number(v) })}
        options={[...EXTRA_CHIPS.map((n) => ({ value: String(n), label: n === 0 ? 'None' : `${n} km` })), { value: 'custom', label: 'Custom' }]}
      />
      <StepperField label="Extra KM" min={0} step={10} value={t.extraMileage} onChange={(extraMileage) => patch({ extraMileage })} suffix="km" />

      <RadioCards
        label="KM charge"
        value={rateKey}
        onChange={(v) => {
          if (v === 'custom') {
            setCustomRate(true)
            return
          }
          setCustomRate(false)
          patch({ ratePerKmLKR: Number(v) })
        }}
        options={RATE_PRESETS}
      />
      {customRate ? (
        <InputField
          label="Custom KM charge (LKR)"
          type="number"
          min={0}
          value={t.ratePerKmLKR}
          onChange={(e) => patch({ ratePerKmLKR: Number(e.target.value) || 0 })}
        />
      ) : null}

      <p className="mb-3 text-xs text-gray-400">Exchange rate from Tour details: 1 {c.currency} = LKR {c.exchangeRate}</p>

      <CheckboxField
        label="Add a Google Maps link"
        checked={maps}
        onChange={(on) => {
          setMaps(on)
          if (!on) patch({ googleMapsLink: '' })
        }}
      />
      {maps && (
        <InputField
          label="Google Maps link"
          optional
          placeholder="https://maps.google.com/…"
          value={t.googleMapsLink ?? ''}
          onChange={(e) => patch({ googleMapsLink: e.target.value })}
        />
      )}

      <div className="mt-4 rounded-xl border border-gray-100 px-4 py-3 text-sm dark:border-[#2C2A2A]">
        <div className="flex justify-between text-gray-500">
          <span>Total mileage</span>
          <span>{totalMileage.toLocaleString()} km</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Cost in LKR</span>
          <span>{formatLkr(lkr)}</span>
        </div>
        <div className="mt-2 flex justify-between text-base font-semibold text-gray-900 dark:text-zinc-100">
          <span>Transportation cost</span>
          <span>{formatMoney(usd, c.currency)}</span>
        </div>
      </div>

      <Drawer
        open={kmOpen}
        title="Daily route kilometres"
        subtitle="These add up to Route KM. Override any day."
        onClose={() => setKmOpen(false)}
        footer={
          <BaseButton className="w-full" onClick={() => setKmOpen(false)}>
            Done
          </BaseButton>
        }
      >
        <div className="space-y-3">
          {c.accommodation.map((row) => (
            <div key={row.id} className="rounded-xl border border-gray-100 px-3 py-2 dark:border-[#2C2A2A]">
              <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">
                Day {row.dayNumber} · {row.destinationName || 'Stop'}
              </p>
              <p className="text-xs text-gray-400">{formatShort(row.date)}</p>
              <StepperField
                className="mb-0 mt-2"
                min={0}
                step={10}
                value={row.routeKm}
                suffix="km"
                onChange={(routeKm) =>
                  patchActive({
                    accommodation: c.accommodation.map((r) => (r.id === row.id ? { ...r, routeKm } : r)),
                  })
                }
              />
            </div>
          ))}
          {c.accommodation.length === 0 && <p className="text-sm text-gray-400">Add accommodation days first.</p>}
        </div>
      </Drawer>
    </div>
  )
}
