import { DISTRICTS_BY_PROVINCE, EXPERIENCE_TYPES, MONTHS, PROVINCES } from '../../../data/destination-catalog'
import { ChoicePills, MultiChips, RadioCards } from '../../../components/ui/ChoicePills'
import { InputField } from '../../../components/ui/InputField'
import { SearchSelect } from '../../../components/ui/SearchSelect'
import { StepperField } from '../../../components/ui/StepperField'
import { TextAreaField } from '../../../components/ui/TextAreaField'
import { useDestinations } from '../../../state/destination-store'
import type { TypicalPace, VisitType } from '../../../types/destination'
import { SectionHead } from './shared'

export function BasicsForm() {
  const { active: d, patchActive } = useDestinations()
  const districts = DISTRICTS_BY_PROVINCE[d.province] ?? []
  const chars = d.shortDescription.trim().length
  const allYear = d.bestVisitMonths.length === 12

  return (
    <div id="form-basics" className="scroll-mt-3 space-y-1 px-6 py-4">
      <SectionHead
        title="Destination Basics"
        helper="Start with the key information travellers need to understand this destination."
      />

      <InputField
        label="Destination Name *"
        placeholder="e.g. Sigiriya"
        value={d.name}
        onChange={(e) => patchActive({ name: e.target.value })}
      />

      <SearchSelect
        label="Province *"
        placeholder="Search provinces…"
        value={d.province}
        options={PROVINCES.map((p) => ({ value: p, label: p }))}
        onChange={(province) =>
          patchActive({
            province,
            district: (DISTRICTS_BY_PROVINCE[province] ?? []).includes(d.district ?? '') ? d.district : '',
          })
        }
      />

      <SearchSelect
        label="District"
        optional
        placeholder="Optional — skip if you’re not sure"
        value={d.district ?? ''}
        options={districts.map((x) => ({ value: x, label: x }))}
        onChange={(district) => patchActive({ district })}
      />

      <TextAreaField
        label="Short Description *"
        rows={4}
        placeholder="Write a short introduction that can be reused in itineraries."
        value={d.shortDescription}
        onChange={(e) => patchActive({ shortDescription: e.target.value })}
      />
      <p className="mb-3 -mt-2 text-[11px] text-gray-400">
        Recommended 2–4 sentences{chars ? ` · ${chars} characters` : ''}
      </p>

      <MultiChips
        label="Experience Types"
        optional
        allowCustom
        customLabel="+ Add custom tag"
        value={d.experienceTypes}
        onChange={(experienceTypes) => patchActive({ experienceTypes })}
        options={EXPERIENCE_TYPES.map((t) => ({ value: t, label: t }))}
      />

      <div className="mb-3">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-sm font-normal text-gray-800 dark:text-zinc-100">Best time to visit</p>
          <button
            type="button"
            className="text-xs text-gray-500 underline"
            onClick={() => patchActive({ bestVisitMonths: allYear ? [] : MONTHS.map((m) => m.n) })}
          >
            {allYear ? 'Clear months' : 'Select all year'}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {MONTHS.map((m) => {
            const on = d.bestVisitMonths.includes(m.n)
            return (
              <button
                key={m.n}
                type="button"
                onClick={() =>
                  patchActive({
                    bestVisitMonths: on ? d.bestVisitMonths.filter((n) => n !== m.n) : [...d.bestVisitMonths, m.n].sort((a, b) => a - b),
                  })
                }
                className={`rounded-full px-3 py-1.5 text-sm ${
                  on
                    ? 'bg-gray-900 text-white dark:bg-[#7A3714]'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-[#2C2A2A] dark:text-zinc-300'
                }`}
              >
                {m.label}
              </button>
            )
          })}
        </div>
      </div>

      <RadioCards
        label="Recommended visit"
        value={d.visitType}
        onChange={(visitType) => patchActive({ visitType: visitType as VisitType })}
        options={[
          { value: 'day_trip', label: 'Day trip', hint: 'Half day or same-day visit' },
          { value: 'overnight', label: 'Overnight stay', hint: 'Usually 1 night' },
          { value: 'multi_day', label: 'Multi-day stay', hint: 'Two nights or more' },
        ]}
      />

      {d.visitType !== 'day_trip' && (
        <div className="grid grid-cols-2 gap-4">
          <StepperField
            label="Minimum stay"
            value={d.minimumNights ?? 1}
            min={1}
            max={14}
            suffix="nights"
            onChange={(minimumNights) => patchActive({ minimumNights })}
          />
          <StepperField
            label="Ideal stay"
            value={d.idealNights ?? 2}
            min={d.minimumNights ?? 1}
            max={14}
            suffix="nights"
            onChange={(idealNights) => patchActive({ idealNights })}
          />
        </div>
      )}

      <ChoicePills
        label="Typical pace"
        optional
        value={d.typicalPace ?? ''}
        onChange={(typicalPace) => patchActive({ typicalPace: typicalPace as TypicalPace })}
        options={[
          { value: 'relaxed', label: 'Relaxed' },
          { value: 'moderate', label: 'Moderate' },
          { value: 'active', label: 'Active' },
        ]}
      />
      <p className="mb-3 -mt-2 text-[11px] text-gray-400">Typical pace for experiencing this destination.</p>
    </div>
  )
}
