import { cn } from '../../lib/cn'

const glyph: Record<string, string> = {
  complete: '✓',
  progress: '•',
  empty: '○',
  attention: '!',
}

export function SectionMenu({
  items,
  active,
  onChange,
  orientation = 'vertical',
}: {
  items: { id: string; n: string; label: string; status: string }[]
  active: string
  onChange: (id: string) => void
  orientation?: 'vertical' | 'horizontal'
}) {
  const vertical = orientation === 'vertical'
  return (
    <nav
      className={cn(
        vertical
          ? 'flex h-full w-[220px] shrink-0 flex-col border-r border-gray-100 bg-white dark:border-[#2C2A2A] dark:bg-[#1E1E20]'
          : 'flex gap-1 overflow-x-auto border-b border-gray-100 px-4 py-2 dark:border-[#2C2A2A]',
      )}
    >
      <div className={cn(vertical ? 'flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 py-4' : 'contents')}>
        {vertical ? (
          <p className="px-2 pb-2 text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase dark:text-zinc-500">Sections</p>
        ) : null}
        {items.map((item) => {
          const on = active === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                'flex items-center gap-2 rounded-lg text-left text-sm',
                vertical ? 'px-2.5 py-2' : 'shrink-0 px-2.5 py-1.5 text-[11px]',
                on
                  ? 'bg-gray-900 text-white dark:bg-[#7A3714]'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-zinc-300 dark:hover:bg-white/5',
              )}
            >
              <span className={cn('w-5 shrink-0 text-[11px] tabular-nums', on ? 'text-white/70' : 'text-gray-400')}>{item.n}</span>
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              <span className={cn('text-[11px]', on ? 'text-white/70' : 'text-gray-400')}>{glyph[item.status] ?? '○'}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
