import { SectionMenu } from '../../components/ui/SectionMenu'
import { COSTING_SECTIONS, costingSectionStatus } from '../../lib/costing-completeness'
import type { Costing, CostingSectionId } from '../../types/costing'

export function CostingNav({
  costing,
  active,
  onChange,
  orientation = 'vertical',
}: {
  costing: Costing
  active: CostingSectionId
  onChange: (id: CostingSectionId) => void
  orientation?: 'vertical' | 'horizontal'
}) {
  return (
    <SectionMenu
      orientation={orientation}
      active={active}
      onChange={(id) => onChange(id as CostingSectionId)}
      items={COSTING_SECTIONS.map((section) => ({
        ...section,
        status: costingSectionStatus(costing, section.id),
      }))}
    />
  )
}
