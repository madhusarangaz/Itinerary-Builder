import { Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { BaseButton } from '../../../components/ui/BaseButton'
import { InputField } from '../../../components/ui/InputField'
import { StepperField } from '../../../components/ui/StepperField'
import { TextAreaField } from '../../../components/ui/TextAreaField'
import { formatUsd } from '../../../data/activity-catalog'
import { uid } from '../../../lib/ids'
import { calculateActivityCost, calculateSightseeingTotal, formatMoney } from '../../../lib/costing-calc'
import { useActivities } from '../../../state/activity-store'
import { useCosting } from '../../../state/costing-store'
import type { ActivityRecord } from '../../../types/activity'

export function ActivityCostBuilder() {
  const { active: c, patchActive } = useCosting()
  const { activities: master } = useActivities()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState(false)
  const selectedIds = new Set(c.activities.map((a) => a.activityId).filter(Boolean))
  const list = useMemo(() => {
    const term = q.toLowerCase()
    return master.filter(
      (a) => a.status !== 'inactive' && !selectedIds.has(a.id) && `${a.name} ${a.locationName}`.toLowerCase().includes(term),
    )
  }, [q, selectedIds, master])

  const destinations = [...new Set(c.accommodation.map((r) => r.destinationName).filter(Boolean))]
  const suggested = master.filter(
    (a) => a.status === 'active' && !selectedIds.has(a.id) && destinations.some((name) => a.locationName.toLowerCase() === name.toLowerCase() || a.applicableRoutes.some((r) => r.toLocationName.toLowerCase() === name.toLowerCase() || r.fromLocationName.toLowerCase() === name.toLowerCase())),
  )

  function add(item: ActivityRecord) {
    patchActive({
      activities: [
        ...c.activities,
        {
          id: uid('ac'),
          activityId: item.id,
          name: item.name,
          destinationName: item.locationName,
          costPerPerson: item.adultRateUsd,
          quantity: c.numberOfPeople || 1,
          adultQty: c.numberOfPeople || 1,
          childQty: 0,
          masterAdultRate: item.adultRateUsd,
          masterChildRate: item.childRateUsd,
        },
      ],
    })
    setQ('')
    setOpen(false)
  }

  const total = calculateSightseeingTotal(c.activities, c.numberOfPeople)

  return (
    <div id="cost-activities" className="scroll-mt-3 space-y-3 px-6 py-4">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">Activities</h3>
      <div className="relative">
        <InputField
          label="Search activities"
          placeholder="Search activities..."
          startIcon={<Search size={16} />}
          value={q}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
        />
        {open && (
          <div className="absolute z-30 mb-3 max-h-56 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            {list.slice(0, 12).map((a) => (
              <button
                key={a.id}
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-zinc-700"
                onClick={() => add(a)}
              >
                <span className="text-gray-900 dark:text-zinc-100">{a.name}</span>
                <span className="text-xs text-gray-400">{formatUsd(a.adultRateUsd)}</span>
              </button>
            ))}
            {list.length === 0 && <p className="px-3 py-2 text-sm text-gray-400">No matching activities</p>}
          </div>
        )}
      </div>
      {suggested.length > 0 && c.activities.length === 0 && (
        <div>
          <p className="mb-2 text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase">Suggested for this tour</p>
          <div className="flex flex-wrap gap-2">
            {suggested.slice(0, 8).map((a) => (
              <button
                key={a.id}
                type="button"
                className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50 dark:border-[#2C2A2A] dark:text-zinc-200"
                onClick={() => add(a)}
              >
                {a.name}
              </button>
            ))}
          </div>
        </div>
      )}
      {c.activities.length === 0 && (
        <p className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-[#2C2A2A]">
          No activities added yet. Search the activity library or add a custom activity.
        </p>
      )}
      {c.activities.map((a) => (
        <div key={a.id} className="rounded-xl border border-gray-100 p-3 dark:border-[#2C2A2A]">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{a.name}</p>
              {a.destinationName ? <p className="text-xs text-gray-400">{a.destinationName}</p> : null}
            </div>
            <button
              type="button"
              className="text-gray-400 hover:text-red-500"
              onClick={() => patchActive({ activities: c.activities.filter((x) => x.id !== a.id) })}
            >
              <Trash2 size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InputField
              className="mb-2"
              label="Adult rate (USD)"
              type="number"
              min={0}
              value={a.overrideAdultRate ?? a.masterAdultRate ?? a.costPerPerson}
              onChange={(e) => {
                const next = Number(e.target.value)
                const masterRate = a.masterAdultRate ?? a.costPerPerson
                patchActive({
                  activities: c.activities.map((x) =>
                    x.id === a.id
                      ? { ...x, overrideAdultRate: next === masterRate ? undefined : next, costPerPerson: Number.isNaN(next) ? 0 : next }
                      : x,
                  ),
                })
              }}
            />
            <StepperField
              className="mb-2"
              label="Adults"
              min={0}
              max={40}
              value={a.adultQty ?? a.quantity}
              onChange={(adultQty) =>
                patchActive({
                  activities: c.activities.map((x) => (x.id === a.id ? { ...x, adultQty, quantity: adultQty } : x)),
                })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InputField
              className="mb-2"
              label="Child rate (USD)"
              type="number"
              min={0}
              value={a.overrideChildRate ?? a.masterChildRate ?? 0}
              onChange={(e) => {
                const next = Number(e.target.value)
                const masterRate = a.masterChildRate ?? 0
                patchActive({
                  activities: c.activities.map((x) => (x.id === a.id ? { ...x, overrideChildRate: next === masterRate ? undefined : next, childQty: x.childQty ?? 0 } : x)),
                })
              }}
            />
            <StepperField
              className="mb-2"
              label="Children"
              min={0}
              max={40}
              value={a.childQty ?? 0}
              onChange={(childQty) =>
                patchActive({
                  activities: c.activities.map((x) => (x.id === a.id ? { ...x, childQty } : x)),
                })
              }
            />
          </div>
          {a.masterAdultRate != null && a.overrideAdultRate != null && a.overrideAdultRate !== a.masterAdultRate ? (
            <p className="mb-1 text-[11px] text-gray-400">Master rate {formatUsd(a.masterAdultRate)} · Trip rate {formatUsd(a.overrideAdultRate)}</p>
          ) : null}
          <p className="text-right text-sm font-medium text-gray-900 dark:text-zinc-100">
            {formatMoney(calculateActivityCost(a, c.numberOfPeople), c.currency)}
          </p>
        </div>
      ))}
      {custom ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-3 dark:border-[#2C2A2A]">
          <CustomActivity onDone={() => setCustom(false)} />
        </div>
      ) : (
        <BaseButton variant="secondary" onClick={() => setCustom(true)}>
          + Add custom activity
        </BaseButton>
      )}
      <div className="flex justify-between rounded-xl border border-gray-100 px-4 py-3 text-sm font-semibold text-gray-900 dark:border-[#2C2A2A] dark:text-zinc-100">
        <span>Sightseeing total</span>
        <span>{formatMoney(total, c.currency)}</span>
      </div>
    </div>
  )
}

function CustomActivity({ onDone }: { onDone: () => void }) {
  const { active: c, patchActive } = useCosting()
  const [name, setName] = useState('')
  const [destination, setDestination] = useState('')
  const [cost, setCost] = useState(0)
  const [qty, setQty] = useState(1)
  const [notes, setNotes] = useState('')
  return (
    <>
      <InputField label="Activity name" value={name} onChange={(e) => setName(e.target.value)} />
      <InputField label="Destination" optional value={destination} onChange={(e) => setDestination(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <InputField label="Cost per person" type="number" min={0} value={cost} onChange={(e) => setCost(Number(e.target.value) || 0)} />
        <InputField label="Quantity" type="number" min={0} value={qty} onChange={(e) => setQty(Number(e.target.value) || 0)} />
      </div>
      <TextAreaField label="Notes" optional rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      <div className="flex gap-2">
        <BaseButton variant="secondary" onClick={onDone}>
          Cancel
        </BaseButton>
        <BaseButton
          onClick={() => {
            if (!name.trim()) return
            patchActive({
              activities: [
                ...c.activities,
                {
                  id: uid('ac'),
                  name: name.trim(),
                  destinationName: destination,
                  costPerPerson: cost,
                  quantity: qty,
                  notes,
                },
              ],
            })
            onDone()
          }}
        >
          Add activity
        </BaseButton>
      </div>
    </>
  )
}
