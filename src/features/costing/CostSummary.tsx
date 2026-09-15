import { ChevronDown } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import {
  calculateAccommodationDayTotal,
  calculateActivityCost,
  calculateDriverLKR,
  calculateGuideLKR,
  calculatePricing,
  formatLkr,
  formatMoney,
} from '../../lib/costing-calc'
import { cn } from '../../lib/cn'
import { useCosting } from '../../state/costing-store'

function Accordion({
  id,
  open,
  onToggle,
  label,
  amount,
  currency,
  children,
  defaultHint,
}: {
  id: string
  open: boolean
  onToggle: (id: string) => void
  label: string
  amount: number
  currency: string
  children: ReactNode
  defaultHint?: string
}) {
  return (
    <>
      <tr className="border-t border-gray-100 dark:border-[#2C2A2A]">
        <td colSpan={2} className="p-0">
          <button type="button" className="flex w-full items-center gap-2 px-0 py-2.5 text-left" onClick={() => onToggle(id)}>
            <ChevronDown size={14} className={cn('shrink-0 text-gray-400 transition', open && 'rotate-180')} />
            <span className="flex-1 text-sm text-gray-700 dark:text-zinc-200">{label}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-zinc-100">{formatMoney(amount, currency)}</span>
          </button>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={2} className="pb-2 pl-6">
            {children}
            {defaultHint && !children ? <p className="text-xs text-gray-400">{defaultHint}</p> : null}
          </td>
        </tr>
      )}
    </>
  )
}

function Detail({ left, right }: { left: string; right: string }) {
  return (
    <div className="flex justify-between gap-3 py-0.5 text-xs text-gray-500">
      <span className="min-w-0 truncate">{left}</span>
      <span className="shrink-0 tabular-nums">{right}</span>
    </div>
  )
}

export function CostSummary() {
  const { active: c } = useCosting()
  const t = calculatePricing(c)
  const [open, setOpen] = useState<Record<string, boolean>>({
    acc: true,
    tr: true,
    crew: true,
    extras: true,
  })
  const cur = c.currency

  function toggle(id: string) {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="h-full overflow-auto bg-[#f2f2f2] p-4 dark:bg-[#1F1F20]">
      <div className="rounded-xl border border-gray-100 bg-white p-4 dark:border-[#2C2A2A] dark:bg-[#1E1E20]">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-medium tracking-[0.22em] text-gray-400 uppercase">Cost summary</p>
            <p className="mt-1 text-xs text-gray-400">
              {c.referenceNo || 'Untitled'} · {c.numberOfPeople} pax · {cur}
            </p>
          </div>
          <button
            type="button"
            className="text-[11px] text-gray-400 underline"
            onClick={() =>
              setOpen({
                acc: true,
                tr: true,
                crew: true,
                act: true,
                extras: true,
              })
            }
          >
            Expand all
          </button>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="text-[10px] tracking-[0.16em] text-gray-400 uppercase">
              <th className="pb-2 text-left font-medium">Item</th>
              <th className="pb-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            <Accordion
              id="acc"
              open={!!open.acc}
              onToggle={toggle}
              label="Accommodation"
              amount={t.accommodationTotal}
              currency={cur}
            >
              {c.accommodation.filter((r) => r.nights > 0).length === 0 && (
                <p className="text-xs text-gray-400">No stay costs yet</p>
              )}
              {c.accommodation
                .filter((r) => r.nights > 0)
                .map((r) => (
                  <Detail
                    key={r.id}
                    left={`Day ${r.dayNumber} · ${r.destinationName} — ${r.hotelName || 'Hotel'}`}
                    right={formatMoney(calculateAccommodationDayTotal(r), cur)}
                  />
                ))}
              <Detail left="Guide rooms" right={formatMoney(t.guideAccommodationTotal, cur)} />
            </Accordion>

            <Accordion
              id="tr"
              open={!!open.tr}
              onToggle={toggle}
              label="Transportation"
              amount={t.transportationTotal}
              currency={cur}
            >
              <Detail left="Route KM" right={`${t.routeKm.toLocaleString()} km`} />
              <Detail left="Gross mileage" right={`${c.transportation.grossMileage.toLocaleString()} km`} />
              <Detail left="Extra mileage" right={`${c.transportation.extraMileage.toLocaleString()} km`} />
              <Detail left="Total mileage" right={`${t.totalMileage.toLocaleString()} km`} />
              <Detail left="KM charge" right={`LKR ${c.transportation.ratePerKmLKR}/km`} />
              <Detail left="Cost in LKR" right={formatLkr(t.transportationLKR)} />
            </Accordion>

            <Accordion id="crew" open={!!open.crew} onToggle={toggle} label="Driver & guide" amount={t.driverGuideTotal} currency={cur}>
              <Detail left={`Driver (${c.driverGuide.driverCalculationMode})`} right={formatLkr(calculateDriverLKR(c.driverGuide))} />
              <Detail left={`Guide (${c.driverGuide.guideCalculationMode})`} right={formatLkr(calculateGuideLKR(c.driverGuide))} />
              <Detail left="Combined LKR" right={formatLkr(t.driverGuideLKR)} />
            </Accordion>

            <Accordion id="act" open={!!open.act} onToggle={toggle} label="Activities" amount={t.activityTotal} currency={cur}>
              {c.activities.length === 0 && <p className="text-xs text-gray-400">None selected</p>}
              {c.activities.map((a) => (
                <Detail
                  key={a.id}
                  left={`${a.name} × ${a.quantity} × ${c.numberOfPeople}`}
                  right={formatMoney(calculateActivityCost(a, c.numberOfPeople), cur)}
                />
              ))}
            </Accordion>

            <Accordion id="extras" open={!!open.extras} onToggle={toggle} label="Additional costs" amount={t.additionalCostTotal} currency={cur}>
              {c.additionalCosts.length === 0 && <p className="text-xs text-gray-400">None</p>}
              {c.additionalCosts.map((a) => (
                <Detail key={a.id} left={a.name || 'Cost'} right={formatMoney(a.cost, cur)} />
              ))}
            </Accordion>

            <tr className="border-t border-gray-200 dark:border-[#3a3838]">
              <td className="py-3 text-sm font-semibold text-gray-900 dark:text-zinc-100">Base tour cost</td>
              <td className="py-3 text-right text-sm font-semibold text-gray-900 dark:text-zinc-100">
                {formatMoney(t.baseCost, cur)}
              </td>
            </tr>
            <tr>
              <td className="py-1 text-sm text-gray-600 dark:text-zinc-300">
                Company profit
                <span className="ml-1 text-xs text-gray-400">{c.pricing.companyProfitPercent}%</span>
              </td>
              <td className="py-1 text-right text-sm text-gray-900 dark:text-zinc-100">
                {formatMoney(t.companyProfitAmount, cur)}
              </td>
            </tr>
            <tr>
              <td className="py-1 text-sm text-gray-600 dark:text-zinc-300">
                Agent profit
                <span className="ml-1 text-xs text-gray-400">{c.pricing.agentProfitPercent}%</span>
              </td>
              <td className="py-1 text-right text-sm text-gray-900 dark:text-zinc-100">{formatMoney(t.agentProfitAmount, cur)}</td>
            </tr>
            <tr>
              <td className="py-1 text-sm text-gray-600 dark:text-zinc-300">
                Salesperson profit
                <span className="ml-1 text-xs text-gray-400">{c.pricing.salesPersonProfitPercent}%</span>
              </td>
              <td className="py-1 text-right text-sm text-gray-900 dark:text-zinc-100">
                {formatMoney(t.salesPersonProfitAmount, cur)}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="mt-4 rounded-xl bg-gray-900 px-4 py-4 text-white dark:bg-[#7A3714]">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-white/70">Final package</p>
              <p className="mt-1 text-3xl font-semibold">{formatMoney(t.finalPackageCost, cur)}</p>
              <p className="mt-1 text-xs text-white/60">{c.numberOfPeople} travellers</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] tracking-[0.2em] uppercase text-white/70">Price / person</p>
              <p className="mt-1 text-2xl">{formatMoney(t.pricePerPerson, cur)}</p>
            </div>
          </div>
        </div>
        {Math.abs(t.quotedPricePerPerson - t.pricePerPerson) >= 0.5 && (
          <p className="mt-3 text-xs text-gray-500">
            Quoted {formatMoney(t.quotedPricePerPerson, cur)}/person · {formatMoney(t.quotedPackageTotal, cur)} total
          </p>
        )}
      </div>
    </div>
  )
}
