import { SectionMenu } from '../../components/ui/SectionMenu'
import { HOTEL_SECTIONS, hotelSectionStatus } from '../../lib/hotel-completeness'
import type { HotelRecord, HotelSectionId } from '../../types/hotel'

export function HotelNav({
  hotel,
  active,
  onChange,
  orientation = 'vertical',
}: {
  hotel: HotelRecord
  active: HotelSectionId
  onChange: (id: HotelSectionId) => void
  orientation?: 'vertical' | 'horizontal'
}) {
  return (
    <SectionMenu
      orientation={orientation}
      active={active}
      onChange={(id) => onChange(id as HotelSectionId)}
      items={HOTEL_SECTIONS.map((section) => ({
        ...section,
        status: hotelSectionStatus(hotel, section.id),
      }))}
    />
  )
}
