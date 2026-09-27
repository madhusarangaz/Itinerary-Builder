import { SectionMenu } from '../../components/ui/SectionMenu'
import { ACTIVITY_SECTIONS, activitySectionStatus } from '../../lib/activity-completeness'
import type { ActivityRecord, ActivitySectionId } from '../../types/activity'

export function ActivityNav({
  activity,
  active,
  onChange,
  orientation = 'vertical',
}: {
  activity: ActivityRecord
  active: ActivitySectionId
  onChange: (id: ActivitySectionId) => void
  orientation?: 'vertical' | 'horizontal'
}) {
  return (
    <SectionMenu
      orientation={orientation}
      active={active}
      onChange={(id) => onChange(id as ActivitySectionId)}
      items={ACTIVITY_SECTIONS.map((section) => ({
        ...section,
        status: activitySectionStatus(activity, section.id),
      }))}
    />
  )
}
