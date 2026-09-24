import { CheckboxField } from '../../../components/ui/CheckboxField'
import { MultiChips } from '../../../components/ui/ChoicePills'
import { StepperField } from '../../../components/ui/StepperField'
import { TextAreaField } from '../../../components/ui/TextAreaField'
import { ARRIVAL_LOCATIONS, defaultLeisureKm } from '../../../data/transport-catalog'
import { useTransport } from '../../../state/transport-store'
import { MoreDetails, SectionHead } from './shared'

export function MileageForm() {
  const { active: t, patchActive } = useTransport()
  const m = t.mileageRules
  const leisureDefault = defaultLeisureKm(t.vehicleGroup)

  function patchRules(partial: Partial<typeof m>) {
    patchActive({ mileageRules: { ...m, ...partial } })
  }

  return (
    <div id="form-mileage" className="scroll-mt-3 space-y-1 px-6 py-4">
      <SectionHead
        title="Mileage Rules"
        helper="These rules are automatically applied when this vehicle is costed using the Per KM method."
      />

      {!t.costing.perKmEnabled ? (
        <p className="mb-4 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500 dark:bg-white/5 dark:text-zinc-400">
          Mileage rules are only used when Per KM costing is enabled. Saved values are kept.
        </p>
      ) : null}

      <CheckboxField
        label="Apply arrival/departure mileage"
        hint="Mandatory one-way kilometres from Colombo or Negombo."
        checked={m.arrivalDepartureEnabled}
        onChange={(arrivalDepartureEnabled) => patchRules({ arrivalDepartureEnabled })}
      />
      {m.arrivalDepartureEnabled ? (
        <>
          <MultiChips
            label="Applicable Locations"
            value={m.applicableLocations}
            onChange={(applicableLocations) => patchRules({ applicableLocations })}
            options={ARRIVAL_LOCATIONS.map((l) => ({ value: l, label: l }))}
          />
          <StepperField
            label="Mandatory One-Way Mileage"
            value={m.arrivalDepartureOneWayKm ?? 80}
            min={0}
            max={400}
            step={5}
            suffix="km"
            onChange={(arrivalDepartureOneWayKm) => patchRules({ arrivalDepartureOneWayKm })}
          />
          <p className="-mt-2 mb-3 text-[11px] text-gray-400">Applied for arrival or departure from Colombo or Negombo.</p>
        </>
      ) : null}

      <CheckboxField
        label="Apply leisure-day mileage"
        hint={`Prefills ${leisureDefault} km for this vehicle group.`}
        checked={m.leisureDayEnabled}
        onChange={(leisureDayEnabled) =>
          patchRules({
            leisureDayEnabled,
            leisureDayKm: leisureDayEnabled ? (m.leisureDayKm ?? leisureDefault) : m.leisureDayKm,
          })
        }
      />
      {m.leisureDayEnabled ? (
        <StepperField
          label="Mileage Per Leisure Day"
          value={m.leisureDayKm ?? leisureDefault}
          min={0}
          max={400}
          step={5}
          suffix="km"
          onChange={(leisureDayKm) => patchRules({ leisureDayKm })}
        />
      ) : null}

      <div className="mb-4 rounded-lg bg-gray-50 px-3 py-2.5 text-[11px] leading-relaxed text-gray-500 dark:bg-white/5 dark:text-zinc-400">
        <p className="font-medium text-gray-600 dark:text-zinc-300">Example · 2 nights in Kandy</p>
        <p className="mt-1">Sightseeing mileage: 40 km</p>
        <p>Leisure-day allowance: {m.leisureDayKm ?? leisureDefault} km</p>
        <p>Applicable mileage: {40 + (m.leisureDayKm ?? leisureDefault)} km</p>
      </div>

      <MoreDetails>
        <TextAreaField
          label="Internal Rule Notes"
          optional
          rows={3}
          placeholder="Only for the team — not shown to guests."
          value={m.internalNotes ?? ''}
          onChange={(e) => patchRules({ internalNotes: e.target.value })}
        />
      </MoreDetails>
    </div>
  )
}
