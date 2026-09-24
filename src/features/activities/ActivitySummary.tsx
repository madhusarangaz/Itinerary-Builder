import { formatDuration } from '../../data/destination-catalog'
import { PLACEMENT_LABEL, formatUsd, routeLabel } from '../../data/activity-catalog'
import { activityProgress } from '../../lib/activity-completeness'
import { useActivities } from '../../state/activity-store'
import { useDestinations } from '../../state/destination-store'

export function ActivitySummary() {
  const { active } = useActivities()
  const { destinations } = useDestinations()
  const progress = activityProgress(active)
  const linked = destinations.filter((d) => d.activityIds.includes(active.id))
  const place = active.type === 'en_route' ? 'En route' : active.locationName

  return (
    <aside className="h-full overflow-y-auto bg-gray-50 p-5 dark:bg-[#18181A]">
      <div className="sticky top-0 space-y-4">
        <div className="overflow-hidden rounded-xl bg-gray-200 dark:bg-zinc-800">
          {active.image?.url ? <img src={active.image.url} alt="" className="h-36 w-full object-cover" /> : <div className="flex h-28 items-center justify-center text-xs text-gray-400">No image</div>}
        </div>
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-zinc-100">{active.name || 'Untitled activity'}</h2>
          {active.categories.length ? <p className="text-xs text-gray-500">{active.categories.join(' · ')}</p> : null}
          <p className="mt-1 text-sm text-gray-600 dark:text-zinc-300">{place || 'Location not set'}</p>
          <p className="mt-1 text-[11px] tracking-wide text-gray-400 uppercase">{PLACEMENT_LABEL[active.type]}</p>
        </div>
        {active.type === 'en_route' ? (
          <div>
            <p className="text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase">Applicable routes</p>
            <ul className="mt-2 space-y-1 text-sm text-gray-800 dark:text-zinc-200">
              {active.applicableRoutes.filter((r) => r.fromLocationName || r.toLocationName).map((route) => (
                <li key={route.id}>{routeLabel(route.fromLocationName, route.toLocationName)}</li>
              ))}
              {active.applicableRoutes.length === 0 ? <li className="text-gray-400">No routes yet</li> : null}
            </ul>
          </div>
        ) : null}
        <div>
          <p className="text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase">Entrance fees</p>
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Adult</span><span>{formatUsd(active.adultRateUsd)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Child</span><span>{formatUsd(active.childRateUsd)}</span></div>
          </div>
          <p className="mt-1 text-[11px] text-gray-400">Adult above 6 years · Child below 6 years</p>
        </div>
        <div>
          <p className="text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase">Details</p>
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Duration</span><span>{formatDuration(active.durationMinutes) || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Difficulty</span><span className="capitalize">{active.difficulty || '—'}</span></div>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase">Used in</p>
          <p className="mt-2 text-sm text-gray-700 dark:text-zinc-200">{linked.length ? linked.map((d) => d.name).join(', ') : 'Not linked to a destination yet'}</p>
        </div>
        <div>
          <p className="text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase">Profile</p>
          <p className="mt-2 text-sm">{progress.percent}% complete</p>
          {progress.remaining > 0 ? <p className="text-[11px] text-gray-400">{progress.remaining === 1 ? '1 recommended detail remaining' : `${progress.remaining} recommended details remaining`}</p> : null}
          {active.rateSource === 'demo' ? <p className="mt-2 text-[11px] text-gray-400">Fees shown here are demo values until a verified rate is entered.</p> : null}
        </div>
      </div>
    </aside>
  )
}
