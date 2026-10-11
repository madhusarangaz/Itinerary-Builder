import { Sparkles } from 'lucide-react'
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
  onAskAi,
  orientation = 'vertical',
}: {
  destination: Destination
  active: DestinationSectionId
  onChange: (id: DestinationSectionId) => void
  onAskAi?: () => void
  orientation?: 'vertical' | 'horizontal'
}) {
  const vertical = orientation === 'vertical'
  return (
    <nav
      className={cn(
        vertical
          ? 'flex h-full w-[220px] shrink-0 flex-col border-r border-gray-100 bg-white dark:border-[#2C2A2A] dark:bg-[#0C0C0E]'
          : 'flex gap-1 overflow-x-auto border-b border-gray-100 px-4 py-2 dark:border-[#2C2A2A]',
      )}
    >
      <div className={cn(vertical ? 'flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 py-4' : 'contents')}>
        {vertical ? (
          <p className="px-2 pb-2 text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase dark:text-zinc-500">Sections</p>
        ) : null}
        {DESTINATION_SECTIONS.map((s) => {
          const status = destinationSectionStatus(destination, s.id)
          const on = active === s.id
          return (
            <button
              key={s.id}
              type="button"
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
              <span className={cn('text-[11px]', on ? 'text-[#14357A]/70 dark:text-white/70' : 'text-gray-400')}>{glyph[status]}</span>
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
