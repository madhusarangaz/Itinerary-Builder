import { Calendar } from 'lucide-react'
import { BaseSelect } from '../../../components/ui/BaseSelect'
import { CheckboxField } from '../../../components/ui/CheckboxField'
import { ChoicePills } from '../../../components/ui/ChoicePills'
import { InputField } from '../../../components/ui/InputField'
import { StepperField } from '../../../components/ui/StepperField'
import { TOUR_EXECUTIVES } from '../../../data/costing-sample'
import { COSTING_STATUS_LABELS } from '../../../lib/costing-completeness'
import { formatLong } from '../../../lib/dates'
import { useCosting } from '../../../state/costing-store'
import type { CostingCurrency, CostingStatus } from '../../../types/costing'

const STARS = ['3 Star', '4 Star', '5 Star', 'Boutique', 'Luxury', 'Custom']
const CURRENCIES: CostingCurrency[] = ['USD', 'EUR', 'GBP', 'AUD', 'LKR']
const NATIONALITIES = [
  'Pakistan',
  'India',
  'United Kingdom',
  'Germany',
  'France',
  'Australia',
  'China',
  'United States',
  'United Arab Emirates',
  'Maldives',
  'Japan',
  'Russia',
  'Netherlands',
  'Switzerland',
  'Canada',
  'Other',
]
const PAX_CHIPS = [2, 4, 5, 6, 8, 10]
const RATE_CHIPS = [300, 320, 330, 350]

export function TourDetailsForm() {
  const { active: c, patchActive } = useCosting()
  const matchNights = c.chargeableDriverDays === c.nights
  const nationalityOptions = NATIONALITIES.includes(c.nationality) || !c.nationality
    ? NATIONALITIES
    : [c.nationality, ...NATIONALITIES]

  return (
    <div id="cost-tour" className="scroll-mt-3 space-y-1 px-6 py-4">
      <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-white">Tour details</h3>
      <p className="mb-4 text-xs text-gray-400">Who is travelling, when, and in which currency we cost.</p>
      {!c.referenceNo && !c.clientName ? (
        <p className="mb-3 text-sm text-gray-400">Start by adding your tour details.</p>
      ) : null}

      <ChoicePills
        label="Status"
        value={c.status}
        onChange={(status) => patchActive({ status: status as CostingStatus })}
        options={(Object.keys(COSTING_STATUS_LABELS) as CostingStatus[]).map((s) => ({
          value: s,
          label: COSTING_STATUS_LABELS[s],
        }))}
      />

      <InputField
        label="Tour reference no"
        placeholder="INQ-GB-26-102"
        value={c.referenceNo}
        onChange={(e) => patchActive({ referenceNo: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Agent name" placeholder="Shehara" value={c.agentName} onChange={(e) => patchActive({ agentName: e.target.value })} />
        <InputField label="Client name" placeholder="Idrees" value={c.clientName} onChange={(e) => patchActive({ clientName: e.target.value })} />
      </div>

      <BaseSelect
        label="Nationality"
        value={nationalityOptions.includes(c.nationality) ? c.nationality : 'Other'}
        onChange={(e) => {
          const v = e.target.value
          patchActive({ nationality: v === 'Other' ? '' : v })
        }}
        options={nationalityOptions.map((s) => ({ value: s, label: s }))}
      />
      {c.nationality === '' || !NATIONALITIES.includes(c.nationality) ? (
        <InputField
          label="Nationality (custom)"
          placeholder="Type nationality"
          value={c.nationality}
          onChange={(e) => patchActive({ nationality: e.target.value })}
        />
      ) : null}

      <p className="mb-1.5 text-sm text-gray-800 dark:text-zinc-100">Number of people / pax</p>
      <ChoicePills
        className="mb-2"
        value={String(c.numberOfPeople)}
        onChange={(v) => patchActive({ numberOfPeople: Number(v) })}
        options={PAX_CHIPS.map((n) => ({ value: String(n), label: String(n) }))}
      />
      <StepperField label="Exact pax" min={1} max={40} value={c.numberOfPeople} onChange={(numberOfPeople) => patchActive({ numberOfPeople })} />

      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="Arrival date"
          type="date"
          startIcon={<Calendar size={16} />}
          value={c.arrivalDate}
          onChange={(e) => patchActive({ arrivalDate: e.target.value })}
        />
        <InputField
          label="Departure date"
          type="date"
          startIcon={<Calendar size={16} />}
          value={c.departureDate}
          onChange={(e) => patchActive({ departureDate: e.target.value })}
        />
      </div>
      {c.arrivalDate && c.departureDate ? (
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-white/10 dark:text-zinc-200">{c.tripDays} days</span>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-white/10 dark:text-zinc-200">{c.nights} nights</span>
          <span className="text-xs text-gray-400">
            {formatLong(c.arrivalDate)} → {formatLong(c.departureDate)}
          </span>
        </div>
      ) : null}

      <CheckboxField
        label="Chargeable driver / guide days match nights"
        hint="Uncheck to set a different number of paid crew days."
        checked={matchNights}
        onChange={(on) => {
          const n = on ? c.nights : c.chargeableDriverDays
          patchActive({ chargeableDriverDays: n, chargeableGuideDays: n })
        }}
      />
      {!matchNights && (
        <StepperField
          label="Chargeable driver / guide days"
          min={0}
          max={30}
          value={c.chargeableDriverDays}
          onChange={(n) => patchActive({ chargeableDriverDays: n, chargeableGuideDays: n })}
        />
      )}

      <ChoicePills
        label="Star category"
        value={c.starCategory}
        onChange={(starCategory) => patchActive({ starCategory })}
        options={STARS.map((s) => ({ value: s, label: s }))}
      />
      <BaseSelect
        label="Tour executive"
        value={c.tourExecutive}
        onChange={(e) => patchActive({ tourExecutive: e.target.value })}
        options={TOUR_EXECUTIVES.map((s) => ({ value: s, label: s }))}
      />
      <ChoicePills
        label="Currency"
        value={c.currency}
        onChange={(currency) => patchActive({ currency: currency as CostingCurrency })}
        options={CURRENCIES.map((s) => ({ value: s, label: s }))}
      />
      <p className="mb-1.5 text-sm text-gray-800 dark:text-zinc-100">Exchange rate · 1 {c.currency} = LKR</p>
      <ChoicePills
        className="mb-2"
        value={String(c.exchangeRate)}
        onChange={(v) => patchActive({ exchangeRate: Number(v) })}
        options={RATE_CHIPS.map((n) => ({ value: String(n), label: String(n) }))}
      />
      <InputField
        label="Exact rate"
        type="number"
        min={0}
        step="0.01"
        value={c.exchangeRate}
        onChange={(e) => patchActive({ exchangeRate: Number(e.target.value) || 0 })}
      />
    </div>
  )
}
