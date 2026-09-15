import { COSTING_SECTIONS, costingSectionStatus } from '../../lib/costing-completeness'
import { cn } from '../../lib/cn'
import type { Costing, CostingSectionId } from '../../types/costing'

const glyph: Record<string, string> = {
  complete: '✓',
  progress: '•',
  empty: '○',
  attention: '!',
}

export function CostingNav({
  costing,
  active,
  onChange,
}: {
  costing: Costing
  active: CostingSectionId
  onChange: (id: CostingSectionId) => void
}) {
  return (
    <nav className="flex flex-wrap gap-1 px-6 pb-2">
      {COSTING_SECTIONS.map((s) => {
        const status = costingSectionStatus(costing, s.id)
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
