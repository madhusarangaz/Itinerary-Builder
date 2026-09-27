import { SectionMenu } from '../../components/ui/SectionMenu'
import { supplierSectionStatus, supplierSections } from '../../lib/supplier-completeness'
import type { Supplier, SupplierSectionId } from '../../types/supplier'

export function SupplierNav({
  supplier,
  active,
  onChange,
  orientation = 'vertical',
}: {
  supplier: Supplier
  active: SupplierSectionId
  onChange: (id: SupplierSectionId) => void
  orientation?: 'vertical' | 'horizontal'
}) {
  return (
    <SectionMenu
      orientation={orientation}
      active={active}
      onChange={(id) => onChange(id as SupplierSectionId)}
      items={supplierSections(supplier).map((section) => ({
        ...section,
        status: supplierSectionStatus(supplier, section.id),
      }))}
    />
  )
}
