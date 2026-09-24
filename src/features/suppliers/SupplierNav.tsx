import { supplierSectionStatus, supplierSections } from '../../lib/supplier-completeness'
import { cn } from '../../lib/cn'
import type { Supplier, SupplierSectionId } from '../../types/supplier'

const glyph: Record<string, string> = { complete: '✓', progress: '•', empty: '○', attention: '!' }

export function SupplierNav({ supplier, active, onChange }: { supplier: Supplier; active: SupplierSectionId; onChange: (id: SupplierSectionId) => void }) {
  return (
    <nav className="flex gap-1 overflow-x-auto px-6 pb-2">
      {supplierSections(supplier).map((section) => {
        const on = active === section.id
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onChange(section.id)}
            className={cn('shrink-0 rounded-full px-2.5 py-1 text-[11px] tracking-wide', on ? 'bg-gray-900 text-white dark:bg-[#7A3714]' : 'text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-white/5')}
          >
            <span className="opacity-60">{glyph[supplierSectionStatus(supplier, section.id)]}</span> {section.n} {section.label}
          </button>
        )
      })}
    </nav>
  )
}
