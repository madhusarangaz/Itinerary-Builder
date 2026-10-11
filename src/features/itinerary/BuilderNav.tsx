import { Lock, Sparkles } from 'lucide-react'
import { SECTION_META, sectionStatus, sectionUnlocked } from '../../lib/completeness'
import { cn } from '../../lib/cn'
import type { SectionId, Trip } from '../../types/itinerary'

const glyph: Record<string, string> = {
  complete: '✓',
  progress: '•',
  empty: '○',
  attention: '!',
}

export function BuilderNav({
  trip,
  active,
  onChange,
  onAskAi,
  orientation = 'vertical',
  reviewDetails = false,
}: {
  trip: Trip
  active: SectionId
  onChange: (id: SectionId) => void
  onAskAi?: () => void
  orientation?: 'vertical' | 'horizontal'
  /** A night was just added. Trip Details still needs a look. */
  reviewDetails?: boolean
}) {
  const vertical = orientation === 'vertical'
  return (
    <nav
      className={cn(
        vertical
          ? 'flex h-full w-[220px] shrink-0 flex-col border-r border-gray-100 bg-white dark:border-[#2C2A2A] dark:bg-transparent'
          : 'flex gap-1 overflow-x-auto border-b border-gray-100 px-4 py-2 dark:border-[#2C2A2A]',
      )}
    >
      <div className={cn(vertical ? 'flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 py-4' : 'contents')}>
      {vertical ? (
        <p className="px-2 pb-2 text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase dark:text-zinc-500">Sections</p>
      ) : null}
      {SECTION_META.map((s, index) => {
        const status = sectionStatus(trip, s.id)
        const on = active === s.id
        const locked = !sectionUnlocked(trip, s.id)
        const blocker = SECTION_META.slice(0, index).find((item) => sectionStatus(trip, item.id) !== 'complete')
        return (
          <button
            key={s.id}
            type="button"
            aria-current={on ? 'page' : undefined}
            title={locked && blocker ? `Please fill the missing data in ${blocker.label}, then come back here.` : undefined}
            onClick={() => onChange(s.id)}
            className={cn(
              'flex items-center gap-2 rounded-lg text-left text-sm',
              vertical ? 'px-2.5 py-2' : 'shrink-0 px-2.5 py-1.5 text-[11px]',
              on
                ? 'bg-[#E7EFFF] text-[#14357A] dark:bg-white/10 dark:text-white'
                : 'text-gray-600 hover:bg-[#F3F7FF] dark:text-zinc-300 dark:hover:bg-white/5',
            )}
          >
            <span className={cn('w-5 shrink-0 text-[11px] tabular-nums', on ? 'text-[#14357A]/70 dark:text-white/70' : 'text-gray-400')}>{s.n}</span>
            <span className="min-w-0 flex-1 truncate">{s.label}</span>
            {s.id === 'details' && reviewDetails ? (
              <span className="nav-review-dot" title="A new night was added. Check it in Trip Details." aria-label="Review the new night" />
            ) : null}
            {locked ? (
              <Lock size={12} className="shrink-0 text-gray-400 dark:text-zinc-500" aria-hidden />
            ) : (
              <span className={cn('text-[11px]', on ? 'text-[#14357A]/70 dark:text-white/70' : 'text-gray-400')}>{glyph[status]}</span>
            )}
          </button>
        )
      })}
      </div>
      {onAskAi ? (
        <div className={cn(vertical ? 'shrink-0 border-t border-gray-100 px-3 pt-6 pb-10 dark:border-gray-800' : 'contents')}>
          <button
            type="button"
            onClick={onAskAi}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-[7px] text-sm font-medium text-[var(--accent-text)] shadow-sm hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-white/5',
              vertical ? 'w-full' : 'shrink-0',
            )}
          >
            <Sparkles size={14} />
            Ask AI
          </button>
        </div>
      ) : null}
    </nav>
  )
}
