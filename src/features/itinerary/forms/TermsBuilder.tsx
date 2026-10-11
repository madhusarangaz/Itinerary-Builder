import { DndContext, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { GripVertical, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { FieldAttention } from '../../../components/ui/FieldAttention'
import { InputField } from '../../../components/ui/InputField'
import { TextAreaField } from '../../../components/ui/TextAreaField'
import { uid } from '../../../lib/ids'
import { useItinerary } from '../../../state/itinerary-store'
import { useMissingAttention } from '../missing-attention'

type TermKind = 'inclusion' | 'exclusion'

type TermCard = {
  id: string
  text: string
  kind: TermKind
}

const LIBRARY_INCLUSIONS: TermCard[] = [
  { id: 'proto-in-meet', text: 'Meet & greet at Colombo Airport', kind: 'inclusion' },
  { id: 'proto-in-meals', text: 'Meals according to selected meal plans', kind: 'inclusion' },
  { id: 'proto-in-stay', text: 'Accommodation as mentioned above or similar', kind: 'inclusion' },
  { id: 'proto-in-transfer', text: 'All transfers in an air-conditioned private vehicle', kind: 'inclusion' },
  { id: 'proto-in-guide', text: 'English-speaking chauffeur guide', kind: 'inclusion' },
  { id: 'proto-in-water', text: '2 x 500ml water bottles per person per day', kind: 'inclusion' },
  { id: 'proto-in-tax', text: 'Applicable local taxes', kind: 'inclusion' },
]

const LIBRARY_EXCLUSIONS: TermCard[] = [
  { id: 'proto-ex-air', text: 'Airfare', kind: 'exclusion' },
  { id: 'proto-ex-visa', text: 'Visa', kind: 'exclusion' },
  { id: 'proto-ex-tickets', text: 'Entrance tickets', kind: 'exclusion' },
  { id: 'proto-ex-activity', text: 'Activity charges', kind: 'exclusion' },
  { id: 'proto-ex-train', text: 'Train tickets', kind: 'exclusion' },
  { id: 'proto-ex-lunch', text: 'Lunches', kind: 'exclusion' },
  { id: 'proto-ex-personal', text: 'Personal expenses', kind: 'exclusion' },
  { id: 'proto-ex-laundry', text: 'Laundry / Bar', kind: 'exclusion' },
  { id: 'proto-ex-tips', text: 'Tips and gratuities', kind: 'exclusion' },
  { id: 'proto-ex-extra-stay', text: 'Pre/Post tour accommodation', kind: 'exclusion' },
]

function keyOf(text: string) {
  return text.trim().toLowerCase()
}

function TermChip({ item, taken }: { item: TermCard; taken: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `lib:${item.id}`,
    data: { term: item },
    disabled: taken,
  })
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex min-w-0 items-center gap-2 rounded-xl border px-2.5 py-2.5 text-sm ${
        taken
          ? 'cursor-default border-gray-100 bg-gray-50 text-gray-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500'
          : 'cursor-grab border-gray-200 bg-white text-gray-800 active:cursor-grabbing dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100'
      } ${isDragging ? 'opacity-40' : ''}`}
    >
      <GripVertical size={14} className="shrink-0 text-gray-400" />
      <span className="min-w-0">{item.text}</span>
    </div>
  )
}

function LibraryBlock({ label, items, taken }: { label: string; items: TermCard[]; taken: Set<string> }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase dark:text-zinc-500">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <TermChip key={item.id} item={item} taken={taken.has(keyOf(item.text))} />
        ))}
      </div>
    </div>
  )
}

function DroppedTerm({ text, onRemove }: { text: string; onRemove: () => void }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-gray-200 bg-white px-2.5 py-2.5 text-sm text-gray-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
      <span className="min-w-0 flex-1">{text}</span>
      <button type="button" className="shrink-0 text-gray-400 hover:text-red-500" aria-label={`Remove ${text}`} onClick={onRemove}>
        <Trash2 size={14} />
      </button>
    </div>
  )
}

function TermDrop({
  id,
  title,
  empty,
  more,
  items,
  attention,
  onRemove,
}: {
  id: string
  title: string
  empty: string
  more: string
  items: { id: string; text: string }[]
  attention: boolean
  onRemove: (id: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <section id={id === 'drop-inclusions' ? 'form-inclusions' : 'form-exclusions'} className="scroll-mt-3">
      <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-zinc-100">{title}</h3>
      <FieldAttention on={attention}>
        <div
          ref={setNodeRef}
          className={`space-y-2 rounded-xl ${isOver ? 'bg-[#F9FBFF] ring-2 ring-[#E7EFFF] dark:bg-[#5b93ff]/10 dark:ring-[#5b93ff]/30' : ''}`}
        >
          {items.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-400 dark:border-[#2C2A2A]">{empty}</p>
          ) : (
            items.map((row) => <DroppedTerm key={row.id} text={row.text} onRemove={() => onRemove(row.id)} />)
          )}
          {items.length > 0 ? (
            <p className="rounded-lg border border-dashed border-gray-200 px-3 py-2 text-center text-xs text-gray-400 dark:border-[#2C2A2A]">{more}</p>
          ) : null}
        </div>
      </FieldAttention>
    </section>
  )
}

export function TermsBuilder({
  attentionToken = 0,
  onAttentionHandled,
}: {
  attentionToken?: number
  onAttentionHandled?: () => void
}) {
  const { trip, patch } = useItinerary()
  const markMissing = useMissingAttention(attentionToken, onAttentionHandled)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const [dragging, setDragging] = useState<TermCard | null>(null)
  const inclusionsOpen = !trip.inclusions.some((row) => row.text.trim())
  const exclusionsOpen = !trip.exclusions.some((row) => row.text.trim())
  const taken = new Set(
    [...trip.inclusions, ...trip.exclusions].map((row) => keyOf(row.text)).filter(Boolean),
  )

  function onDragStart(event: DragStartEvent) {
    const term = event.active.data.current?.term as TermCard | undefined
    setDragging(term ?? null)
  }

  function onDragEnd(event: DragEndEvent) {
    setDragging(null)
    const term = event.active.data.current?.term as TermCard | undefined
    if (!term || !event.over) return
    const overId = String(event.over.id)
    const onBoard = overId === 'drop-inclusions' || overId === 'drop-exclusions'
    if (!onBoard || taken.has(keyOf(term.text))) return
    if (term.kind === 'inclusion') {
      patch({ inclusions: [...trip.inclusions, { id: uid('in'), text: term.text }] })
      return
    }
    patch({ exclusions: [...trip.exclusions, { id: uid('ex'), text: term.text }] })
  }

  return (
    <div id="form-terms" className="h-full min-h-0 overflow-y-auto">
      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="flex min-h-full flex-col lg:flex-row">
          <div className="flex-1 space-y-6 border-gray-100 px-6 py-4 lg:w-1/2 lg:border-r dark:border-[#2C2A2A]">
            <TermDrop
              id="drop-inclusions"
              title="Inclusions"
              empty="Drop an inclusion here."
              more="Drag another inclusion here."
              items={trip.inclusions}
              attention={markMissing && inclusionsOpen}
              onRemove={(id) => patch({ inclusions: trip.inclusions.filter((row) => row.id !== id) })}
            />
            <TermDrop
              id="drop-exclusions"
              title="Exclusions"
              empty="Drop an exclusion here."
              more="Drag another exclusion here."
              items={trip.exclusions}
              attention={markMissing && exclusionsOpen}
              onRemove={(id) => patch({ exclusions: trip.exclusions.filter((row) => row.id !== id) })}
            />
          </div>
          <div className="flex-1 space-y-5 px-6 py-4 lg:w-1/2">
            <LibraryBlock label="Inclusions" items={LIBRARY_INCLUSIONS} taken={taken} />
            <LibraryBlock label="Exclusions" items={LIBRARY_EXCLUSIONS} taken={taken} />
          </div>
        </div>
        <DragOverlay>
          {dragging ? (
            <div className="flex w-56 items-center gap-2 rounded-xl border border-gray-200 bg-white px-2.5 py-2 text-sm text-gray-800 shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
              <GripVertical size={14} className="shrink-0 text-gray-400" />
              <span className="truncate">{dragging.text}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      <div className="mx-auto w-full max-w-[720px] space-y-6 px-6 py-8">
        <section id="form-cancel" className="scroll-mt-3">
          <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-zinc-100">Cancellation policy</h3>
          {trip.cancellationPolicies.map((row) => (
            <div key={row.id} className="mb-2 grid grid-cols-5 gap-2">
              <InputField
                className="col-span-2 mb-0"
                value={row.window}
                onChange={(e) =>
                  patch({
                    cancellationPolicies: trip.cancellationPolicies.map((item) =>
                      item.id === row.id ? { ...item, window: e.target.value } : item,
                    ),
                  })
                }
              />
              <InputField
                className="col-span-3 mb-0"
                value={row.detail}
                onChange={(e) =>
                  patch({
                    cancellationPolicies: trip.cancellationPolicies.map((item) =>
                      item.id === row.id ? { ...item, detail: e.target.value } : item,
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
    </div>
  )
}
