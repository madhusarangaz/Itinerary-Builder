import { HOTEL_SECTIONS, hotelSectionStatus } from '../../lib/hotel-completeness'
import { cn } from '../../lib/cn'
import type { HotelRecord, HotelSectionId } from '../../types/hotel'

const glyph: Record<string, string> = { complete: '✓', progress: '•', empty: '○', attention: '!' }

export function HotelNav({ hotel, active, onChange }: { hotel: HotelRecord; active: HotelSectionId; onChange: (id: HotelSectionId) => void }) {
  return (
    <nav className="flex gap-1 overflow-x-auto px-6 pb-2">
      {HOTEL_SECTIONS.map((s) => {
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
            <span className="opacity-60">{glyph[hotelSectionStatus(hotel, s.id)]}</span> {s.n} {s.label}
          </button>
        )
      })}
    </nav>
  )
}
