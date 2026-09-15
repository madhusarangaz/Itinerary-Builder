import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { BaseButton } from '../../../components/ui/BaseButton'
import { BaseSelect } from '../../../components/ui/BaseSelect'
import { CheckboxField } from '../../../components/ui/CheckboxField'
import { ChoicePills } from '../../../components/ui/ChoicePills'
import { Drawer } from '../../../components/ui/Drawer'
import { InputField } from '../../../components/ui/InputField'
import { TextAreaField } from '../../../components/ui/TextAreaField'
import { uid } from '../../../lib/ids'
import { useDestinations } from '../../../state/destination-store'
import type { TipCategory, TipImportance, TravellerTip } from '../../../types/destination'
import { SectionHead } from './shared'

const CATEGORIES: { value: TipCategory; label: string }[] = [
  { value: 'weather', label: 'Weather' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'culture', label: 'Culture' },
  { value: 'safety', label: 'Safety' },
  { value: 'walking', label: 'Walking' },
  { value: 'accessibility', label: 'Accessibility' },
  { value: 'photography', label: 'Photography' },
  { value: 'wildlife', label: 'Wildlife' },
  { value: 'health', label: 'Health' },
  { value: 'food', label: 'Food' },
  { value: 'money', label: 'Money' },
  { value: 'transport', label: 'Transport' },
  { value: 'packing', label: 'Packing' },
  { value: 'family', label: 'Family' },
  { value: 'other', label: 'Other' },
]

function emptyTip(): TravellerTip {
  return {
    id: uid('tip'),
    category: 'culture',
    title: '',
    information: '',
    importance: 'recommended',
    showInItinerary: true,
    internalOnly: false,
  }
}

export function TravellerInfoForm() {
  const { active: d, patchActive } = useDestinations()
  const [draft, setDraft] = useState<TravellerTip | null>(null)

  function save() {
    if (!draft?.title.trim() || !draft.information.trim()) return
    const exists = d.travellerTips.some((t) => t.id === draft.id)
    patchActive({
      travellerTips: exists ? d.travellerTips.map((t) => (t.id === draft.id ? draft : t)) : [...d.travellerTips, draft],
    })
    setDraft(null)
  }

  return (
    <div id="form-tips" className="scroll-mt-3 space-y-1 px-6 py-4">
      <SectionHead
        title="Traveller Information"
        helper="Add destination-specific information travellers should know before visiting."
      />

      <div className="space-y-2">
        {d.travellerTips.map((tip) => (
          <div key={tip.id} className="rounded-xl border border-gray-100 px-4 py-3 dark:border-[#2C2A2A]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] tracking-[0.16em] text-gray-400 uppercase">
                  {CATEGORIES.find((c) => c.value === tip.category)?.label} · {tip.importance}
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-zinc-100">{tip.title}</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-zinc-300">{tip.information}</p>
                <p className="mt-2 text-[11px] text-gray-400">
                  {tip.internalOnly ? 'Internal only' : tip.showInItinerary ? 'Show in itinerary ✓' : 'Hidden from itinerary'}
                </p>
              </div>
              <div className="flex gap-1">
                <button type="button" className="rounded-lg p-2 text-gray-400 hover:bg-gray-50" onClick={() => setDraft({ ...tip })}>
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  onClick={() => patchActive({ travellerTips: d.travellerTips.filter((t) => t.id !== tip.id) })}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BaseButton variant="secondary" className="mt-3" onClick={() => setDraft(emptyTip())}>
        <Plus size={14} /> Add traveller tip
      </BaseButton>

      <Drawer
        open={!!draft}
        title={draft && d.travellerTips.some((t) => t.id === draft.id) ? 'Edit tip' : 'Add traveller tip'}
        onClose={() => setDraft(null)}
        footer={
          <div className="flex justify-end gap-2">
            <BaseButton variant="secondary" onClick={() => setDraft(null)}>
              Cancel
            </BaseButton>
            <BaseButton disabled={!draft?.title.trim() || !draft.information.trim()} onClick={save}>
              Save tip
            </BaseButton>
          </div>
        }
      >
        {draft ? (
          <>
            <BaseSelect
              label="Tip category"
              value={draft.category}
              options={CATEGORIES}
              onChange={(e) => setDraft({ ...draft, category: e.target.value as TipCategory })}
            />
            <InputField
              label="Title"
              placeholder="Temple Dress Code"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
            <TextAreaField
              label="Information"
              rows={4}
              placeholder="Shoulders and knees should be covered when visiting temples."
              value={draft.information}
              onChange={(e) => setDraft({ ...draft, information: e.target.value })}
            />
            <ChoicePills
              label="Importance"
              value={draft.importance}
              onChange={(importance) => setDraft({ ...draft, importance: importance as TipImportance })}
              options={[
                { value: 'useful', label: 'Useful' },
                { value: 'recommended', label: 'Recommended' },
                { value: 'important', label: 'Important' },
              ]}
            />
            <CheckboxField
              label="Show in customer itinerary"
              checked={draft.showInItinerary && !draft.internalOnly}
              onChange={(showInItinerary) => setDraft({ ...draft, showInItinerary, internalOnly: showInItinerary ? false : draft.internalOnly })}
            />
            <CheckboxField
              label="Internal only"
              hint="Hides this tip from customer-facing itineraries."
              checked={draft.internalOnly}
              onChange={(internalOnly) =>
                setDraft({
                  ...draft,
                  internalOnly,
                  showInItinerary: internalOnly ? false : draft.showInItinerary,
                })
              }
            />
          </>
        ) : null}
      </Drawer>
    </div>
  )
}
