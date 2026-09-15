import { DESTINATION_SECTIONS, destinationSectionStatus } from '../../lib/destination-completeness'
import { cn } from '../../lib/cn'
import type { Destination, DestinationSectionId } from '../../types/destination'

const glyph: Record<string, string> = {
  complete: '✓',
  progress: '•',
  empty: '○',
  attention: '!',
}

export function DestinationNav({
  destination,
  active,
  onChange,
}: {
  destination: Destination
  active: DestinationSectionId
  onChange: (id: DestinationSectionId) => void
}) {
  return (
    <nav className="flex gap-1 overflow-x-auto px-6 pb-2">
      {DESTINATION_SECTIONS.map((s) => {
        const status = destinationSectionStatus(destination, s.id)
        const on = active === s.id
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onChange(s.id)}
            className={cn(
              'shrink-0 rounded-full px-2.5 py-1 text-[11px] tracking-wide',
              on ? 'bg-gray-900 text-white dark:bg-[#7A3714]' : 'text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-white/5',
            )}
          >
            <span className="opacity-60">{glyph[status]}</span> {s.n} {s.label}
          </button>
        )
      })}
    </nav>
  )
}
