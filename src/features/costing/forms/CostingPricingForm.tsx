import { CheckboxField } from '../../../components/ui/CheckboxField'
import { ChoicePills } from '../../../components/ui/ChoicePills'
import { InputField } from '../../../components/ui/InputField'
import { calculatePricing, formatMoney } from '../../../lib/costing-calc'
import { useCosting } from '../../../state/costing-store'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1 text-sm text-gray-600 dark:text-zinc-300">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}

const PROFIT_CHIPS = [20, 25, 28.3, 30, 35]

export function CostingPricingForm() {
  const { active: c, patchActive } = useCosting()
  const t = calculatePricing(c)
  const quotedDiff = t.quotedPricePerPerson - t.pricePerPerson
  const p = c.pricing
  const rounded = Math.round(t.pricePerPerson / 5) * 5
  const isRounded = Math.abs((p.quotedPricePerPerson ?? t.pricePerPerson) - rounded) < 0.5 && Math.abs(quotedDiff) >= 0.5

  return (
    <div id="cost-pricing" className="scroll-mt-3 space-y-3 px-6 py-4">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">Pricing</h3>
      <p className="-mt-2 text-xs text-gray-400">Margins are internal. Only the selling price can flow to the itinerary.</p>
      <div className="rounded-xl border border-gray-100 px-4 py-3 dark:border-[#2C2A2A]">
        <Row label="Accommodation" value={formatMoney(t.accommodationTotal, c.currency)} />
        <Row label="Guide accommodation" value={formatMoney(t.guideAccommodationTotal, c.currency)} />
        <Row label="Transportation" value={formatMoney(t.transportationTotal, c.currency)} />
        <Row label="Driver & guide" value={formatMoney(t.driverGuideTotal, c.currency)} />
        <Row label="Activities" value={formatMoney(t.activityTotal, c.currency)} />
        <Row label="Additional costs" value={formatMoney(t.additionalCostTotal, c.currency)} />
        <div className="mt-2 flex justify-between border-t border-gray-100 pt-2 text-sm font-semibold text-gray-900 dark:border-[#2C2A2A] dark:text-zinc-100">
          <span>Base tour cost</span>
          <span>{formatMoney(t.baseCost, c.currency)}</span>
        </div>
      </div>

      <ChoicePills
        label="Company profit %"
        value={String(p.companyProfitPercent)}
        onChange={(v) => patchActive({ pricing: { ...p, companyProfitPercent: Number(v) } })}
        options={PROFIT_CHIPS.map((n) => ({ value: String(n), label: `${n}%` }))}
      />
      <label className="mb-3 block">
        <span className="mb-1.5 block text-sm text-gray-800 dark:text-zinc-100">Fine-tune company profit</span>
        <input
          type="range"
          min={0}
          max={50}
          step={0.1}
          value={p.companyProfitPercent}
          onChange={(e) => patchActive({ pricing: { ...p, companyProfitPercent: Number(e.target.value) } })}
          className="w-full accent-gray-900 dark:accent-[#7A3714]"
        />
        <p className="mt-1 text-xs text-gray-400">
          {p.companyProfitPercent}% = {formatMoney(t.companyProfitAmount, c.currency)}
        </p>
      </label>

      <InputField
        label="Agent profit %"
        type="number"
        min={0}
        step="0.1"
        value={p.agentProfitPercent}
        onChange={(e) => patchActive({ pricing: { ...p, agentProfitPercent: Number(e.target.value) || 0 } })}
      />
      <InputField
        label="Salesperson profit %"
        type="number"
        min={0}
        step="0.1"
        value={p.salesPersonProfitPercent}
        onChange={(e) => patchActive({ pricing: { ...p, salesPersonProfitPercent: Number(e.target.value) || 0 } })}
      />

      <div className="rounded-xl bg-gray-900 px-4 py-5 text-white dark:bg-[#7A3714]">
        <p className="text-[10px] tracking-[0.2em] uppercase text-white/70">Final package price</p>
        <p className="mt-1 text-3xl font-semibold">{formatMoney(t.finalPackageCost, c.currency)}</p>
        <p className="mt-3 text-[10px] tracking-[0.2em] uppercase text-white/70">Price per person</p>
        <p className="text-2xl">{formatMoney(t.pricePerPerson, c.currency)}</p>
        <p className="mt-1 text-xs text-white/60">{c.numberOfPeople} travellers</p>
      </div>

      <CheckboxField
        label={`Round quoted price to ${formatMoney(rounded, c.currency)} / person`}
        hint="Operators often round before sending a quote."
        checked={isRounded}
        onChange={(on) =>
          patchActive({
            pricing: { ...p, quotedPricePerPerson: on ? rounded : t.pricePerPerson },
          })
        }
      />
      <InputField
        label="Quoted price per person"
        type="number"
        min={0}
        step="1"
        value={Math.round(t.quotedPricePerPerson)}
        onChange={(e) => {
          const n = Number(e.target.value)
          patchActive({ pricing: { ...p, quotedPricePerPerson: Number.isFinite(n) ? n : t.pricePerPerson } })
        }}
      />
      {Math.abs(quotedDiff) >= 0.5 && (
        <p className="text-xs text-gray-500">
          Calculated {formatMoney(t.pricePerPerson, c.currency)} · Quoted {formatMoney(t.quotedPricePerPerson, c.currency)} ·{' '}
          {quotedDiff > 0 ? '+' : ''}
          {formatMoney(quotedDiff, c.currency)}/person
        </p>
      )}
      <p className="text-sm text-gray-500">
        Final quote total <span className="font-medium text-gray-900 dark:text-zinc-100">{formatMoney(t.quotedPackageTotal, c.currency)}</span>
      </p>
    </div>
  )
}
