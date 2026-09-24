import { Bus } from 'lucide-react'
import { formatCapacity, formatLkr, VEHICLE_GROUP_LABELS } from '../../data/transport-catalog'
import { transportProgress } from '../../lib/transport-completeness'
import { useTransport } from '../../state/transport-store'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 py-1 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-900 dark:text-zinc-100">{value}</span>
    </div>
  )
}

export function TransportSummary() {
  const { active: t } = useTransport()
  const progress = transportProgress(t)
  const cover = t.images.front?.url || t.images.side?.url || t.images.interior?.url
  const title = t.displayName || t.vehicleCategory || 'Untitled transport'
  const models = t.models.map((m) => m.name).filter(Boolean).join(', ') || 'No models yet'
  const child =
    t.capacity.allowAdditionalChild && t.capacity.maxAdditionalChildren
      ? ` + ${t.capacity.maxAdditionalChildren} child${t.capacity.childAgeLimit ? ` under ${t.capacity.childAgeLimit}` : ''}`
      : ''

  return (
    <div className="h-full overflow-auto bg-[#f2f2f2] p-4 dark:bg-[#1F1F20]">
      <div className="rounded-xl border border-gray-100 bg-white p-4 dark:border-[#2C2A2A] dark:bg-[#1E1E20]">
        <div className="mb-4 overflow-hidden rounded-lg bg-gray-100 dark:bg-zinc-800">
          {cover ? (
            <img src={cover} alt="" className="aspect-[16/9] w-full object-cover" />
          ) : (
            <div className="flex aspect-[16/9] items-center justify-center text-gray-300 dark:text-zinc-600">
              <Bus size={28} />
            </div>
          )}
        </div>
        <p className="text-[10px] font-medium tracking-[0.22em] text-gray-400 uppercase">{VEHICLE_GROUP_LABELS[t.vehicleGroup]}</p>
        <h2 className="mt-1 text-lg font-medium text-gray-900 dark:text-zinc-100">{title}</h2>
        <p className="text-sm text-gray-500">{models}</p>
        <p className="mt-2 text-sm text-gray-700 dark:text-zinc-300">
          {formatCapacity(t.capacity.minAdults, t.capacity.maxAdults)}
          {child}
        </p>

        <div className="mt-4 border-t border-gray-100 pt-3 dark:border-[#2C2A2A]">
          <p className="mb-1 text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase">Costing</p>
          <Row label="Per Day" value={t.costing.perDayEnabled ? formatLkr(t.costing.perDayRate) : 'Off'} />
          <Row label="Per KM" value={t.costing.perKmEnabled ? formatLkr(t.costing.perKmRate) : 'Off'} />
          <Row label="Driver Bata" value={t.costing.driverBata != null ? `${formatLkr(t.costing.driverBata)} / day` : '—'} />
        </div>

        <div className="mt-3 border-t border-gray-100 pt-3 dark:border-[#2C2A2A]">
          <p className="mb-1 text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase">Crew</p>
          <Row label="Helper" value={t.costing.helperApplicable ? formatLkr(t.costing.helperRate) : 'Not applicable'} />
          <Row label="Guide" value={t.costing.guideApplicable ? formatLkr(t.costing.guideRate) : 'Not applicable'} />
        </div>

        <div className="mt-3 border-t border-gray-100 pt-3 dark:border-[#2C2A2A]">
          <p className="mb-1 text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase">Mileage</p>
          <Row
            label="Arrival / Departure"
            value={
              t.mileageRules.arrivalDepartureEnabled
                ? `${t.mileageRules.arrivalDepartureOneWayKm ?? 80} km one way`
                : 'Off'
            }
          />
          <Row
            label="Leisure Day"
            value={t.mileageRules.leisureDayEnabled ? `${t.mileageRules.leisureDayKm ?? 80} km` : 'Off'}
          />
        </div>

        <div className="mt-3 border-t border-gray-100 pt-3 dark:border-[#2C2A2A]">
          <p className="text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase">Profile</p>
          <p className="mt-1 text-sm text-gray-700 dark:text-zinc-300">{progress.percent}% complete</p>
          {progress.remaining > 0 ? (
            <p className="text-xs text-gray-400">
              {progress.remaining === 1 ? '1 recommended detail remaining' : `${progress.remaining} recommended details remaining`}
            </p>
          ) : (
            <p className="text-xs text-gray-400">Ready to reuse in itineraries and costing.</p>
          )}
        </div>
      </div>
    </div>
  )
}
