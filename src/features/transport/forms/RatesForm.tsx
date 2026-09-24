import { ChoicePills } from '../../../components/ui/ChoicePills'
import { cn } from '../../../lib/cn'
import { useTransport } from '../../../state/transport-store'
import { MoneyField, SectionHead } from './shared'

export function RatesForm() {
  const { active: t, patchActive } = useTransport()
  const c = t.costing

  function patchCosting(partial: Partial<typeof c>) {
    patchActive({ costing: { ...c, ...partial } })
  }

  return (
    <div id="form-rates" className="scroll-mt-3 space-y-1 px-6 py-4">
      <SectionHead
        title="Rates & Costing"
        helper="Configure how this vehicle can be costed when preparing a tour. Enable one method or both."
      />

      <p className="mb-1.5 text-sm font-normal text-gray-800 dark:text-zinc-100">Costing methods *</p>
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => patchCosting({ perDayEnabled: !c.perDayEnabled })}
          className={cn(
            'rounded-xl border px-3 py-3 text-left transition',
            c.perDayEnabled
              ? 'border-gray-900 bg-gray-900 text-white dark:border-[#7A3714] dark:bg-[#7A3714]'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-[#2C2A2A] dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-white/5',
          )}
        >
          <span className="block text-sm font-medium">Per Day</span>
          <span className={cn('mt-0.5 block text-[11px]', c.perDayEnabled ? 'text-white/70' : 'text-gray-400')}>
            Fixed daily rate
          </span>
        </button>
        <button
          type="button"
          onClick={() => patchCosting({ perKmEnabled: !c.perKmEnabled })}
          className={cn(
            'rounded-xl border px-3 py-3 text-left transition',
            c.perKmEnabled
              ? 'border-gray-900 bg-gray-900 text-white dark:border-[#7A3714] dark:bg-[#7A3714]'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-[#2C2A2A] dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-white/5',
          )}
        >
          <span className="block text-sm font-medium">Per KM</span>
          <span className={cn('mt-0.5 block text-[11px]', c.perKmEnabled ? 'text-white/70' : 'text-gray-400')}>
            Rate based on calculated tour mileage
          </span>
        </button>
      </div>
      {!c.perDayEnabled && !c.perKmEnabled ? (
        <p className="-mt-2 mb-3 text-[11px] text-red-500">Enable at least one costing method before activating.</p>
      ) : null}

      {c.perDayEnabled ? (
        <div className="mb-4 rounded-xl border border-gray-100 p-3 dark:border-[#2C2A2A]">
          <MoneyField
            label="Per Day Rate *"
            value={c.perDayRate}
            onChange={(perDayRate) => patchCosting({ perDayRate })}
            hint={c.perDayEnabled && (c.perDayRate == null || c.perDayRate <= 0) ? 'Enter a Per Day rate because Per Day costing is enabled.' : undefined}
          />
          <p className="mb-2 text-xs font-medium text-gray-700 dark:text-zinc-200">Included in daily rate</p>
          <div className="grid grid-cols-2 gap-x-3">
            {(
              [
                ['driverBata', 'Driver Bata'],
                ['parking', 'Parking'],
                ['highwayCharges', 'Highway Charges'],
                ['meals', 'Meals'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="mb-1.5 flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-zinc-200">
                <input
                  type="checkbox"
                  checked={c.dailyRateInclusions[key]}
                  onChange={(e) =>
                    patchCosting({
                      dailyRateInclusions: { ...c.dailyRateInclusions, [key]: e.target.checked },
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-gray-900 dark:border-zinc-600"
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {c.perKmEnabled ? (
        <div className="mb-4 rounded-xl border border-gray-100 p-3 dark:border-[#2C2A2A]">
          <MoneyField
            label="Per KM Rate *"
            value={c.perKmRate}
            onChange={(perKmRate) => patchCosting({ perKmRate })}
            hint="Applied later in Costing against costable mileage."
          />
        </div>
      ) : null}

      <MoneyField label="Driver Bata / Day" optional value={c.driverBata} onChange={(driverBata) => patchCosting({ driverBata })} />

      <ChoicePills
        label="Helper applicable"
        value={c.helperApplicable ? 'yes' : 'no'}
        onChange={(v) => patchCosting({ helperApplicable: v === 'yes', helperRate: v === 'yes' ? c.helperRate : undefined })}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ]}
      />
      {c.helperApplicable ? (
        <MoneyField label="Helper / Day" value={c.helperRate} onChange={(helperRate) => patchCosting({ helperRate })} />
      ) : null}

      <ChoicePills
        label="Guide cost applicable"
        value={c.guideApplicable ? 'yes' : 'no'}
        onChange={(v) => patchCosting({ guideApplicable: v === 'yes', guideRate: v === 'yes' ? c.guideRate : undefined })}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ]}
      />
      {c.guideApplicable ? (
        <MoneyField label="Guide / Day" value={c.guideRate} onChange={(guideRate) => patchCosting({ guideRate })} />
      ) : null}
    </div>
  )
}
