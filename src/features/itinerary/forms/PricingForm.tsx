import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BaseButton } from '../../../components/ui/BaseButton'
import { BaseSelect } from '../../../components/ui/BaseSelect'
import { InputField } from '../../../components/ui/InputField'
import { TextAreaField } from '../../../components/ui/TextAreaField'
import { calculatePricing, formatMoney, sellingFigures } from '../../../lib/costing-calc'
import { COSTING_STATUS_LABELS } from '../../../lib/costing-completeness'
import { useCosting } from '../../../state/costing-store'
import { useItinerary } from '../../../state/itinerary-store'

export function PricingForm() {
  const { trip, patch } = useItinerary()
  const { costings, setActiveId, createFromTrip } = useCosting()
  const navigate = useNavigate()
  const p = trip.pricing
  const [searchOpen, setSearchOpen] = useState(false)
  const [q, setQ] = useState('')
  const linked = costings.find((c) => c.id === trip.costingId)
  const linkedTotals = linked ? calculatePricing(linked) : null
  const matches = useMemo(() => {
    const term = q.toLowerCase()
    return costings.filter(
      (c) =>
        c.referenceNo.toLowerCase().includes(term) ||
        c.clientName.toLowerCase().includes(term) ||
        c.agentName.toLowerCase().includes(term),
    )
  }, [costings, q])

  function applyLink(id: string) {
    const costing = costings.find((c) => c.id === id)
    if (!costing) return
    const sell = sellingFigures(costing)
    setActiveId(id)
    patch({
      costingId: id,
      pricing: {
        ...p,
        currency: sell.currency,
        travellerCount: sell.travellerCount,
        total: sell.total,
      },
    })
    setSearchOpen(false)
    setQ('')
  }

  function createNew() {
    const created = createFromTrip(trip)
    const sell = sellingFigures(created)
    patch({
      costingId: created.id,
      pricing: {
        ...p,
        currency: sell.currency,
        travellerCount: sell.travellerCount,
      },
    })
    navigate(`/costing?open=${created.id}&from=itinerary`)
  }

  return (
    <div id="form-pricing" className="scroll-mt-3 space-y-3 px-6 py-4">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">Investment</h3>
      {p.total <= 0 && <p className="text-xs text-gray-400">○ Pricing not completed</p>}

      <div className="rounded-xl border border-gray-100 p-4 dark:border-[#2C2A2A]">
        <p className="text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase">Linked costing</p>
        {linked && linkedTotals ? (
          <div className="mt-3 space-y-2">
            <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">
              {linked.referenceNo || 'Untitled'} — {linked.clientName || 'Client'}
            </p>
            <p className="text-xs text-gray-500">
              {linked.status === 'completed' || linked.status === 'approved' ? '✓' : '○'} {COSTING_STATUS_LABELS[linked.status]}
            </p>
            <div className="text-sm text-gray-600 dark:text-zinc-300">
              <div className="flex justify-between py-0.5">
                <span>Internal base cost</span>
                <span>{formatMoney(linkedTotals.baseCost, linked.currency)}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>Selling price</span>
                <span>{formatMoney(linkedTotals.finalPackageCost, linked.currency)}</span>
              </div>
              <div className="flex justify-between py-0.5 font-medium text-gray-900 dark:text-zinc-100">
                <span>Price per person</span>
                <span>{formatMoney(linkedTotals.pricePerPerson, linked.currency)}</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-400">Internal costs stay in costing. This itinerary only shows selling figures.</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <BaseButton
                size="sm"
                onClick={() => {
                  setActiveId(linked.id)
                  navigate(`/costing?open=${linked.id}&from=itinerary`)
                }}
              >
                Open costing
              </BaseButton>
              <BaseButton
                size="sm"
                variant="secondary"
                onClick={() => {
                  patch({ costingId: undefined })
                }}
              >
                Unlink
              </BaseButton>
            </div>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-gray-500">No costing linked yet.</p>
            <div className="relative">
              <InputField
                className="mb-0"
                label="Select costing"
                placeholder="Search costing..."
                value={q}
                onFocus={() => setSearchOpen(true)}
                onChange={(e) => {
                  setQ(e.target.value)
                  setSearchOpen(true)
                }}
              />
              {searchOpen && (
                <div className="absolute z-30 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                  {matches.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-zinc-700"
                      onClick={() => applyLink(c.id)}
                    >
                      <div className="font-medium text-gray-900 dark:text-zinc-100">
                        {c.referenceNo || 'Untitled'} — {c.clientName || 'Client'}
                      </div>
                      <div className="text-xs text-gray-400">{COSTING_STATUS_LABELS[c.status]}</div>
                    </button>
                  ))}
                  {matches.length === 0 && <p className="px-3 py-2 text-sm text-gray-400">No matching costings</p>}
                </div>
              )}
            </div>
            <BaseButton variant="secondary" onClick={createNew}>
              + Create new costing
            </BaseButton>
          </div>
        )}
      </div>

      <InputField
        label="Number of travellers"
        type="number"
        min={1}
        value={p.travellerCount}
        onChange={(e) => patch({ pricing: { ...p, travellerCount: Number(e.target.value) } })}
      />
      <BaseSelect
        label="Currency"
        value={p.currency}
        onChange={(e) =>
          patch({ pricing: { ...p, currency: e.target.value as typeof p.currency } })
        }
        options={['USD', 'EUR', 'GBP', 'AUD', 'LKR'].map((c) => ({ value: c, label: c }))}
      />
      <InputField
        label="Total tour cost"
        type="number"
        min={0}
        value={p.total}
        onChange={(e) => patch({ pricing: { ...p, total: Number(e.target.value) } })}
      />
      <p className="text-xs text-gray-400">Shown to travellers. Do not enter buy rates here.</p>
      <TextAreaField
        label="Occupancy / pricing note"
        value={p.occupancyNote}
        onChange={(e) => patch({ pricing: { ...p, occupancyNote: e.target.value } })}
      />
    </div>
  )
}
