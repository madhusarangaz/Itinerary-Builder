import { CheckboxField } from '../../../components/ui/CheckboxField'
import { StepperField } from '../../../components/ui/StepperField'
import { useTransport } from '../../../state/transport-store'
import { SectionHead } from './shared'

export function CapacityForm() {
  const { active: t, patchActive } = useTransport()
  const c = t.capacity
  const minOverMax = c.minAdults != null && c.maxAdults > 0 && c.minAdults > c.maxAdults

  return (
    <div id="form-capacity" className="scroll-mt-3 space-y-1 px-6 py-4">
      <SectionHead title="Passenger Capacity" helper="Use numbers, not phrases like “6–8 adults”." />

      <div className="grid grid-cols-2 gap-3">
        <StepperField
          label="Minimum Adults"
          value={c.minAdults ?? 0}
          min={0}
          max={80}
          onChange={(minAdults) => patchActive({ capacity: { ...c, minAdults } })}
        />
        <StepperField
          label="Maximum Adults *"
          value={c.maxAdults}
          min={0}
          max={80}
          onChange={(maxAdults) => patchActive({ capacity: { ...c, maxAdults } })}
        />
      </div>
      {minOverMax ? (
        <p className="-mt-1 mb-3 text-[11px] text-red-500">Maximum passengers must be greater than or equal to minimum passengers.</p>
      ) : (
        <p className="-mt-2 mb-3 text-[11px] text-gray-400">Shown as a range in itineraries and costing.</p>
      )}

      <CheckboxField
        label="Allow additional young child"
        hint="For example: 2 adults + 1 child below 5 years."
        checked={c.allowAdditionalChild}
        onChange={(allowAdditionalChild) =>
          patchActive({
            capacity: {
              ...c,
              allowAdditionalChild,
              maxAdditionalChildren: allowAdditionalChild ? (c.maxAdditionalChildren ?? 1) : undefined,
              childAgeLimit: allowAdditionalChild ? (c.childAgeLimit ?? 5) : undefined,
            },
          })
        }
      />

      {c.allowAdditionalChild ? (
        <div className="grid grid-cols-2 gap-3">
          <StepperField
            label="Maximum Additional Children"
            value={c.maxAdditionalChildren ?? 1}
            min={1}
            max={4}
            onChange={(maxAdditionalChildren) => patchActive({ capacity: { ...c, maxAdditionalChildren } })}
          />
          <StepperField
            label="Child Age Limit"
            value={c.childAgeLimit ?? 5}
            min={1}
            max={16}
            suffix="yrs"
            onChange={(childAgeLimit) => patchActive({ capacity: { ...c, childAgeLimit } })}
          />
        </div>
      ) : null}

      <p className="mb-1.5 mt-4 text-sm font-normal text-gray-800 dark:text-zinc-100">Luggage capacity</p>
      <p className="mb-3 text-[11px] text-gray-400">Optional. Helps tour coordinators select an appropriate vehicle for the group.</p>
      <div className="grid grid-cols-2 gap-3">
        <StepperField
          label="Large Bags"
          value={c.largeBags ?? 0}
          min={0}
          max={40}
          onChange={(largeBags) => patchActive({ capacity: { ...c, largeBags } })}
        />
        <StepperField
          label="Cabin / Small Bags"
          value={c.cabinBags ?? 0}
          min={0}
          max={40}
          onChange={(cabinBags) => patchActive({ capacity: { ...c, cabinBags } })}
        />
      </div>
    </div>
  )
}
