import { BaseButton } from '../../../components/ui/BaseButton'
import { InputField } from '../../../components/ui/InputField'
import { TextAreaField } from '../../../components/ui/TextAreaField'
import { uid } from '../../../lib/ids'
import { useItinerary } from '../../../state/itinerary-store'

export function TermsBuilder() {
  const { trip, patch } = useItinerary()

  return (
    <div id="form-terms" className="scroll-mt-3 space-y-6 px-6 py-4">
      <section id="form-inclusions" className="scroll-mt-3">
        <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-zinc-100">Inclusions</h3>
        {trip.inclusions.map((row) => (
          <div key={row.id} className="mb-2 flex gap-2">
            <InputField
              className="mb-0"
              value={row.text}
              onChange={(e) =>
                patch({
                  inclusions: trip.inclusions.map((r) => (r.id === row.id ? { ...r, text: e.target.value } : r)),
                })
              }
            />
            <BaseButton
              variant="ghost"
              onClick={() => patch({ inclusions: trip.inclusions.filter((r) => r.id !== row.id) })}
            >
              ✕
            </BaseButton>
          </div>
        ))}
        <BaseButton
          variant="secondary"
          size="sm"
          onClick={() => patch({ inclusions: [...trip.inclusions, { id: uid('in'), text: 'New inclusion' }] })}
        >
          + Add inclusion
        </BaseButton>
      </section>
      <section id="form-exclusions" className="scroll-mt-3">
        <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-zinc-100">Exclusions</h3>
        {trip.exclusions.map((row) => (
          <div key={row.id} className="mb-2 flex gap-2">
            <InputField
              className="mb-0"
              value={row.text}
              onChange={(e) =>
                patch({
                  exclusions: trip.exclusions.map((r) => (r.id === row.id ? { ...r, text: e.target.value } : r)),
                })
              }
            />
            <BaseButton
              variant="ghost"
              onClick={() => patch({ exclusions: trip.exclusions.filter((r) => r.id !== row.id) })}
            >
              ✕
            </BaseButton>
          </div>
        ))}
        <BaseButton
          variant="secondary"
          size="sm"
          onClick={() => patch({ exclusions: [...trip.exclusions, { id: uid('ex'), text: 'New exclusion' }] })}
        >
          + Add exclusion
        </BaseButton>
      </section>
      <section id="form-cancel" className="scroll-mt-3">
        <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-zinc-100">Cancellation policy</h3>
        {trip.cancellationPolicies.map((row) => (
          <div key={row.id} className="mb-2 grid grid-cols-5 gap-2">
            <InputField
              className="col-span-2 mb-0"
              value={row.window}
              onChange={(e) =>
                patch({
                  cancellationPolicies: trip.cancellationPolicies.map((r) =>
                    r.id === row.id ? { ...r, window: e.target.value } : r,
                  ),
                })
              }
            />
            <InputField
              className="col-span-3 mb-0"
              value={row.detail}
              onChange={(e) =>
                patch({
                  cancellationPolicies: trip.cancellationPolicies.map((r) =>
                    r.id === row.id ? { ...r, detail: e.target.value } : r,
                  ),
                })
              }
            />
          </div>
        ))}
        <TextAreaField
          label="Additional note"
          value={trip.cancellationNote}
          onChange={(e) => patch({ cancellationNote: e.target.value })}
        />
      </section>
      <section>
        <TextAreaField
          label="Accommodation note"
          value={trip.accommodationNote}
          onChange={(e) => patch({ accommodationNote: e.target.value })}
        />
      </section>
    </div>
  )
}
