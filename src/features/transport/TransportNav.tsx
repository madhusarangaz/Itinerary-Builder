import { SectionMenu } from '../../components/ui/SectionMenu'
import { TRANSPORT_SECTIONS, transportSectionStatus } from '../../lib/transport-completeness'
import type { Transport, TransportSectionId } from '../../types/transport'

export function TransportNav({
  transport,
  active,
  onChange,
  orientation = 'vertical',
}: {
  transport: Transport
  active: TransportSectionId
  onChange: (id: TransportSectionId) => void
  orientation?: 'vertical' | 'horizontal'
}) {
  return (
    <SectionMenu
      orientation={orientation}
      active={active}
      onChange={(id) => onChange(id as TransportSectionId)}
      items={TRANSPORT_SECTIONS.map((section) => ({
        ...section,
        status: transportSectionStatus(transport, section.id),
      }))}
    />
  )
}
