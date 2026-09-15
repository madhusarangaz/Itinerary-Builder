import { Trash2 } from 'lucide-react'
import { BaseButton } from '../../../components/ui/BaseButton'
import { ChoicePills } from '../../../components/ui/ChoicePills'
import { InputField } from '../../../components/ui/InputField'
import { TextAreaField } from '../../../components/ui/TextAreaField'
import { uid } from '../../../lib/ids'
import { calculateAdditionalCostsTotal, formatMoney } from '../../../lib/costing-calc'
import { useCosting } from '../../../state/costing-store'

const QUICK_COSTS = ['Water', 'Garlands', 'Parking', 'Tolls', 'Welcome', 'Porter', 'Permit', 'Special meal']

export function AdditionalCostBuilder() {
  const { active: c, patchActive } = useCosting()
  const total = calculateAdditionalCostsTotal(c.additionalCosts)
  const used = new Set(c.additionalCosts.map((r) => r.name.toLowerCase()))

  function addNamed(name: string) {
    if (used.has(name.toLowerCase())) return
    patchActive({
      additionalCosts: [...c.additionalCosts, { id: uid('add'), name, cost: name === 'Water' || name === 'Garlands' ? 6 : 0, notes: '' }],
    })
  }

  return (
    <div id="cost-extras" className="scroll-mt-3 space-y-3 px-6 py-4">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">Additional costs</h3>
      <p className="-mt-2 text-xs text-gray-400">Tick common extras, or add a custom line.</p>
      {QUICK_COSTS.some((n) => !used.has(n.toLowerCase())) && (
        <ChoicePills
          label="Quick add"
          value=""
          onChange={addNamed}
          options={QUICK_COSTS.filter((n) => !used.has(n.toLowerCase())).map((n) => ({ value: n, label: n }))}
        />
      )}
      {c.additionalCosts.length === 0 && (
        <p className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-[#2C2A2A]">
          No additional costs.
        </p>
      )}
      {c.additionalCosts.map((row) => (
        <div key={row.id} className="rounded-xl border border-gray-100 p-3 dark:border-[#2C2A2A]">
          <div className="flex items-start gap-2">
            <InputField
              className="mb-2"
              label="Cost name"
              value={row.name}
              onChange={(e) =>
                patchActive({ additionalCosts: c.additionalCosts.map((x) => (x.id === row.id ? { ...x, name: e.target.value } : x)) })
              }
            />
            <button
              type="button"
              className="mt-8 text-gray-400 hover:text-red-500"
              onClick={() => patchActive({ additionalCosts: c.additionalCosts.filter((x) => x.id !== row.id) })}
            >
              <Trash2 size={14} />
            </button>
          </div>
          <InputField
            className="mb-2"
            label="Cost"
            type="number"
            min={0}
            value={row.cost}
            onChange={(e) =>
              patchActive({
                additionalCosts: c.additionalCosts.map((x) => (x.id === row.id ? { ...x, cost: Number(e.target.value) || 0 } : x)),
              })
            }
          />
          <TextAreaField
            className="mb-0"
            label="Notes"
            optional
            rows={2}
            value={row.notes ?? ''}
            onChange={(e) =>
              patchActive({ additionalCosts: c.additionalCosts.map((x) => (x.id === row.id ? { ...x, notes: e.target.value } : x)) })
            }
          />
        </div>
      ))}
      <BaseButton
        variant="secondary"
        onClick={() =>
          patchActive({
            additionalCosts: [...c.additionalCosts, { id: uid('add'), name: '', cost: 0, notes: '' }],
          })
        }
      >
        + Add custom cost
      </BaseButton>
      <div className="flex justify-between rounded-xl border border-gray-100 px-4 py-3 text-sm font-semibold text-gray-900 dark:border-[#2C2A2A] dark:text-zinc-100">
        <span>Additional costs total</span>
        <span>{formatMoney(total, c.currency)}</span>
      </div>
    </div>
  )
}
