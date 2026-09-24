import { Plus, Trash2 } from 'lucide-react'
import { BaseButton } from '../../../components/ui/BaseButton'
import { CheckboxField } from '../../../components/ui/CheckboxField'
import { ChoicePills, MultiChips, RadioCards } from '../../../components/ui/ChoicePills'
import { ImageUploader } from '../../../components/ui/ImageUploader'
import { InputField } from '../../../components/ui/InputField'
import { SearchSelect } from '../../../components/ui/SearchSelect'
import { TextAreaField } from '../../../components/ui/TextAreaField'
import { ACTIVITY_CATEGORIES, ACTIVITY_TIMES, AIRPORT_BIA, PLACEMENT_LABEL } from '../../../data/activity-catalog'
import { MONTHS, SUITABLE_FOR, formatDuration } from '../../../data/destination-catalog'
import { MoreDetails, SectionHead } from '../../destinations/forms/shared'
import { newRoute } from '../../../lib/activity'
import { uid } from '../../../lib/ids'
import { useActivities } from '../../../state/activity-store'
import { useDestinations } from '../../../state/destination-store'
import type { ActivitySectionId } from '../../../types/activity'

function UsdField({ label, hint, value, onChange }: { label: string; hint: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="mb-3">
      <InputField
        label={label}
        type="number"
        min={0}
        step={1}
        value={value}
        startIcon={<span className="text-xs text-gray-400">USD</span>}
        onChange={(e) => {
          const next = e.target.value === '' ? 0 : Number(e.target.value)
          if (Number.isNaN(next) || next < 0) return
          onChange(next)
        }}
      />
      <p className="-mt-2 mb-2 text-[11px] text-gray-400">{hint}</p>
    </div>
  )
}

export function ActivitySections({ section }: { section: ActivitySectionId }) {
  const { active, patchActive } = useActivities()
  const { destinations } = useDestinations()
  const places = destinations.map((d) => ({ value: d.id, label: d.name, hint: d.province }))
  const endpoints = [{ value: AIRPORT_BIA.id, label: AIRPORT_BIA.name, hint: 'Airport' }, ...places]

  function setLocation(value: string) {
    const match = places.find((p) => p.value === value || p.label === value)
    patchActive(match ? { locationId: match.value, locationName: match.label } : { locationId: undefined, locationName: value })
  }

  function setEndpoint(routeId: string, side: 'from' | 'to', value: string) {
    const match = endpoints.find((p) => p.value === value || p.label === value)
    patchActive({
      applicableRoutes: active.applicableRoutes.map((route) => {
        if (route.id !== routeId) return route
        if (side === 'from') {
          return { ...route, fromLocationId: match?.value, fromLocationName: match?.label ?? value }
        }
        return { ...route, toLocationId: match?.value, toLocationName: match?.label ?? value }
      }),
    })
  }

  if (section === 'activity') {
    return (
      <div className="space-y-1 px-6 py-4">
        <SectionHead title="Activity Details" helper="Name the sightseeing place or experience once, then reuse it everywhere." />
        <InputField label="Sightseeing / Activity Name *" placeholder="Sigiriya Rock Fortress" value={active.name} onChange={(e) => patchActive({ name: e.target.value })} />
        <MultiChips
          label="Category"
          optional
          value={active.categories}
          onChange={(categories) => patchActive({ categories })}
          options={ACTIVITY_CATEGORIES.map((c) => ({ value: c, label: c }))}
        />
      </div>
    )
  }

  if (section === 'location') {
    return (
      <div className="space-y-1 px-6 py-4">
        <SectionHead title="Location & Availability" helper="Say where this activity belongs, or which journeys can include it." />
        <SearchSelect
          label="Location / Destination *"
          placeholder="Search destinations…"
          value={active.locationId || active.locationName}
          options={places}
          allowCreate
          onChange={setLocation}
        />
        {!active.locationId && active.locationName ? (
          <p className="-mt-2 mb-3 text-[11px] text-gray-400">Shown as {active.locationName}. Link a destination when it exists in Destinations.</p>
        ) : null}
        <RadioCards
          label="Type *"
          value={active.type}
          onChange={(type) => patchActive({ type: type as ActivityRecordType })}
          options={[
            { value: 'within_destination', label: 'Within Destination', hint: 'Belongs to the selected destination. Example: Sigiriya Rock Fortress in Sigiriya.' },
            { value: 'en_route', label: 'En Route', hint: 'Available while travelling between places. Example: Pinnawala on Airport to Kandy.' },
          ]}
        />
        {active.type === 'en_route' ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-800 dark:text-zinc-100">Applicable routes</p>
            {active.applicableRoutes.map((route) => (
              <div key={route.id} className="rounded-xl border border-gray-100 p-3 dark:border-[#2C2A2A]">
                <div className="grid gap-2 md:grid-cols-2">
                  <SearchSelect label="From" value={route.fromLocationId || route.fromLocationName} options={endpoints} allowCreate onChange={(value) => setEndpoint(route.id, 'from', value)} />
                  <SearchSelect label="To" value={route.toLocationId || route.toLocationName} options={endpoints} allowCreate onChange={(value) => setEndpoint(route.id, 'to', value)} />
                </div>
                <button type="button" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-500" onClick={() => patchActive({ applicableRoutes: active.applicableRoutes.filter((r) => r.id !== route.id) })}>
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            ))}
            <BaseButton variant="secondary" onClick={() => patchActive({ applicableRoutes: [...active.applicableRoutes, newRoute()] })}>
              <Plus size={14} /> Add Route
            </BaseButton>
          </div>
        ) : (
          <p className="text-xs text-gray-400">{PLACEMENT_LABEL.within_destination}. Applicable city ranges stay hidden until you choose En Route.</p>
        )}
      </div>
    )
  }

  if (section === 'fees') {
    return (
      <div className="space-y-1 px-6 py-4">
        <SectionHead title="Entrance Fees" helper="Set the standard entrance rates used when calculating tour costing. Stored in USD. 0 is a valid free rate." />
        <UsdField label="Adult Rate *" hint="Above 6 years. Age 6 itself is not assigned until the business confirms the boundary." value={active.adultRateUsd} onChange={(adultRateUsd) => patchActive({ adultRateUsd })} />
        <UsdField label="Child Rate *" hint="Below 6 years. 0 means children are not charged." value={active.childRateUsd} onChange={(childRateUsd) => patchActive({ childRateUsd })} />
        {active.rateSource === 'demo' ? <p className="text-[11px] text-gray-400">Demo rates are prototype figures for this CRM, not verified live entrance fees.</p> : null}
      </div>
    )
  }

  return (
    <div className="space-y-1 px-6 py-4">
      <SectionHead title="Additional Details" helper="Optional notes the destination profile and itinerary can reuse later." />
      <TextAreaField
        label="Description"
        optional
        rows={4}
        placeholder="Explore the ancient Sigiriya Rock Fortress and its historic gardens, frescoes and panoramic viewpoints."
        value={active.description ?? ''}
        onChange={(e) => patchActive({ description: e.target.value })}
      />
      <MoreDetails label="More details">
        <p className="mb-1.5 text-sm text-gray-800 dark:text-zinc-100">Activity image</p>
        <ImageUploader
          value={active.image?.url ?? ''}
          aspect="aspect-[16/9]"
          onChange={(url) => patchActive({ image: { id: active.image?.id ?? uid('img'), url } })}
          onRemove={() => patchActive({ image: undefined })}
        />
        <InputField
          label="Typical duration (minutes)"
          optional
          type="number"
          min={0}
          value={active.durationMinutes ?? ''}
          onChange={(e) => patchActive({ durationMinutes: e.target.value === '' ? undefined : Math.max(0, Number(e.target.value) || 0) })}
        />
        {active.durationMinutes ? <p className="-mt-2 mb-3 text-[11px] text-gray-400">{formatDuration(active.durationMinutes)}</p> : null}
        <MultiChips label="Recommended time" optional value={active.recommendedTimes} onChange={(recommendedTimes) => patchActive({ recommendedTimes })} options={ACTIVITY_TIMES.map((t) => ({ value: t, label: t }))} />
        <ChoicePills
          label="Difficulty"
          optional
          value={active.difficulty ?? ''}
          onChange={(difficulty) => patchActive({ difficulty: (difficulty || undefined) as 'easy' | 'moderate' | 'challenging' | undefined })}
          options={[
            { value: 'easy', label: 'Easy' },
            { value: 'moderate', label: 'Moderate' },
            { value: 'challenging', label: 'Challenging' },
          ]}
        />
        <p className="mb-1.5 text-sm text-gray-800 dark:text-zinc-100">Suitable for</p>
        <div className="mb-3 grid grid-cols-2 gap-1">
          {SUITABLE_FOR.map((item) => (
            <CheckboxField
              key={item}
              className="mb-1"
              label={item}
              checked={active.suitableFor.includes(item)}
              onChange={(on) => patchActive({ suitableFor: on ? [...active.suitableFor, item] : active.suitableFor.filter((x) => x !== item) })}
            />
          ))}
        </div>
        <TextAreaField label="Dress requirements" optional rows={2} value={active.dressRequirements ?? ''} onChange={(e) => patchActive({ dressRequirements: e.target.value })} />
        <TextAreaField label="Accessibility notes" optional rows={2} value={active.accessibilityNotes ?? ''} onChange={(e) => patchActive({ accessibilityNotes: e.target.value })} />
        <CheckboxField label="Advance booking required" checked={!!active.bookingRequired} onChange={(bookingRequired) => patchActive({ bookingRequired })} />
        <CheckboxField label="Entrance ticket required" checked={!!active.entranceTicketRequired} onChange={(entranceTicketRequired) => patchActive({ entranceTicketRequired })} />
        <CheckboxField label="Seasonal activity" checked={!!active.seasonal} onChange={(seasonal) => patchActive({ seasonal })} />
        {active.seasonal ? (
          <MultiChips
            label="Available months"
            value={(active.availableMonths ?? []).map(String)}
            onChange={(vals) => patchActive({ availableMonths: vals.map(Number).sort((a, b) => a - b) })}
            options={MONTHS.map((m) => ({ value: String(m.n), label: m.label }))}
          />
        ) : null}
        <TextAreaField label="Internal notes" optional rows={2} placeholder="Not shown to travellers." value={active.internalNotes ?? ''} onChange={(e) => patchActive({ internalNotes: e.target.value })} />
      </MoreDetails>
    </div>
  )
}

type ActivityRecordType = 'within_destination' | 'en_route'
