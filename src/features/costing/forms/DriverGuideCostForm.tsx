import { CheckboxField } from '../../../components/ui/CheckboxField'
import { ChoicePills } from '../../../components/ui/ChoicePills'
import { InputField } from '../../../components/ui/InputField'
import { StepperField } from '../../../components/ui/StepperField'
import { calculateDriverGuideCost, calculateDriverGuideLKR, calculateDriverLKR, calculateGuideLKR, formatLkr, formatMoney } from '../../../lib/costing-calc'
import { useCosting } from '../../../state/costing-store'
import type { CalcMode } from '../../../types/costing'

const BATA_CHIPS = [2000, 2500, 3000, 3500]
const GUIDE_CHIPS = [0, 3000, 4000, 5000, 7500]

function ModeToggle({
  value,
  onChange,
}: {
  value: CalcMode
  onChange: (v: CalcMode) => void
}) {
  return (
    <div className="mb-3 flex rounded-lg border border-gray-200 bg-white p-0.5 text-sm dark:border-[#2C2A2A] dark:bg-zinc-800">
      {(['daily', 'manual'] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`flex-1 rounded-md px-3 py-1.5 ${value === m ? 'bg-gray-900 text-white dark:bg-[#7A3714]' : 'text-gray-500'}`}
        >
          {m === 'daily' ? 'Daily calculation' : 'Manual total'}
        </button>
      ))}
    </div>
  )
}

export function DriverGuideCostForm() {
  const { active: c, patchActive } = useCosting()
  const d = c.driverGuide
  const usd = calculateDriverGuideCost(d, c.exchangeRate)
  const includeGuide = d.guideCalculationMode === 'manual' ? (d.guideManualTotalLKR ?? 0) > 0 : d.guideFeePerDayLKR > 0

  function patch(p: Partial<typeof d>) {
    patchActive({ driverGuide: { ...d, ...p } })
  }

  return (
    <div id="cost-crew" className="scroll-mt-3 space-y-4 px-6 py-4">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">Driver & guide</h3>
      <p className="-mt-3 text-xs text-gray-400">Paid in LKR, converted with the tour exchange rate.</p>

      <div className="rounded-xl border border-gray-100 p-4 dark:border-[#2C2A2A]">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Driver</h4>
          {d.driverCalculationMode === 'manual' && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium tracking-wide text-gray-600 uppercase dark:bg-white/10 dark:text-zinc-300">
              Manual override
            </span>
          )}
        </div>
        <ModeToggle value={d.driverCalculationMode} onChange={(driverCalculationMode) => patch({ driverCalculationMode })} />
        {d.driverCalculationMode === 'daily' ? (
          <>
            <ChoicePills
              label="Driver bata / day (LKR)"
              value={String(d.driverBataPerDayLKR)}
              onChange={(v) => patch({ driverBataPerDayLKR: Number(v) })}
              options={BATA_CHIPS.map((n) => ({ value: String(n), label: n.toLocaleString() }))}
            />
            <InputField
              label="Exact bata (LKR)"
              type="number"
              min={0}
              value={d.driverBataPerDayLKR}
              onChange={(e) => patch({ driverBataPerDayLKR: Number(e.target.value) || 0 })}
            />
            <StepperField
              label="Chargeable days"
              min={0}
              max={30}
              value={d.driverDays}
              onChange={(driverDays) => patch({ driverDays })}
            />
          </>
        ) : (
          <InputField
            label="Driver total (LKR)"
            type="number"
            min={0}
            value={d.driverManualTotalLKR ?? 0}
            onChange={(e) => patch({ driverManualTotalLKR: Number(e.target.value) || 0 })}
          />
        )}
        <p className="text-sm text-gray-500">
          Driver total <span className="font-medium text-gray-900 dark:text-zinc-100">{formatLkr(calculateDriverLKR(d))}</span>
        </p>
      </div>

      <div className="rounded-xl border border-gray-100 p-4 dark:border-[#2C2A2A]">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Guide</h4>
          {d.guideCalculationMode === 'manual' && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium tracking-wide text-gray-600 uppercase dark:bg-white/10 dark:text-zinc-300">
              Manual override
            </span>
          )}
        </div>
        <CheckboxField
          label="Include a guide on this tour"
          hint="Guide hotel rooms stay under Accommodation."
          checked={includeGuide}
          onChange={(on) => {
            if (!on) patch({ guideFeePerDayLKR: 0, guideManualTotalLKR: 0 })
            else if (!d.guideFeePerDayLKR) patch({ guideFeePerDayLKR: 4000 })
          }}
        />
        {includeGuide && (
          <>
            <ModeToggle value={d.guideCalculationMode} onChange={(guideCalculationMode) => patch({ guideCalculationMode })} />
            {d.guideCalculationMode === 'daily' ? (
              <>
                <ChoicePills
                  label="Guide fee / day (LKR)"
                  value={String(d.guideFeePerDayLKR)}
                  onChange={(v) => patch({ guideFeePerDayLKR: Number(v) })}
                  options={GUIDE_CHIPS.filter((n) => n > 0).map((n) => ({ value: String(n), label: n.toLocaleString() }))}
                />
                <InputField
                  label="Exact fee (LKR)"
                  type="number"
                  min={0}
                  value={d.guideFeePerDayLKR}
                  onChange={(e) => patch({ guideFeePerDayLKR: Number(e.target.value) || 0 })}
                />
                <StepperField
                  label="Chargeable days"
                  min={0}
                  max={30}
                  value={d.guideDays}
                  onChange={(guideDays) => patch({ guideDays })}
                />
              </>
            ) : (
              <InputField
                label="Guide total (LKR)"
                type="number"
                min={0}
                value={d.guideManualTotalLKR ?? 0}
                onChange={(e) => patch({ guideManualTotalLKR: Number(e.target.value) || 0 })}
              />
            )}
          </>
        )}
        <p className="text-sm text-gray-500">
          Guide total <span className="font-medium text-gray-900 dark:text-zinc-100">{formatLkr(calculateGuideLKR(d))}</span>
        </p>
      </div>

      <div className="rounded-xl border border-gray-100 px-4 py-3 dark:border-[#2C2A2A]">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Combined LKR</span>
          <span>{formatLkr(calculateDriverGuideLKR(d))}</span>
        </div>
        <div className="mt-1 flex justify-between text-base font-semibold text-gray-900 dark:text-zinc-100">
          <span>Driver & guide</span>
          <span>{formatMoney(usd, c.currency)}</span>
        </div>
      </div>
    </div>
  )
}
