import { GUIDE_TYPE_LABEL, SUPPLIER_TYPE_LABEL, activeDriverCount, vehicleCount } from '../../data/supplier-catalog'
import { supplierProgress } from '../../lib/supplier-completeness'
import { useSuppliers } from '../../state/supplier-store'

export function SupplierSummary() {
  const { active } = useSuppliers()
  const progress = supplierProgress(active)
  const fleet = active.type === 'vehicle_fleet'
  const groups = active.vehicleInventory.reduce<Record<string, number>>((acc, group) => {
    const key = group.transportName || 'Unassigned'
    acc[key] = (acc[key] ?? 0) + group.numberOfUnits
    return acc
  }, {})

  return (
    <aside className="h-full overflow-y-auto bg-gray-50 p-5 dark:bg-[#18181A]">
      <div className="sticky top-0 space-y-4">
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-zinc-100">{active.name || 'Untitled supplier'}</h2>
          <p className="text-sm text-gray-500">{active.type ? `${SUPPLIER_TYPE_LABEL[active.type]} Supplier` : 'Supplier type not set'}</p>
          <p className="mt-1 text-[11px] tracking-wide text-gray-400 uppercase">{active.status}</p>
        </div>
        {active.guideTypes.length ? (
          <div>
            <p className="text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase">Guide</p>
            <p className="mt-2 text-sm">{active.guideTypes.map((type) => GUIDE_TYPE_LABEL[type]).join(' · ')}</p>
            {active.languages.length ? <p className="mt-2 text-sm text-gray-600 dark:text-zinc-300">{active.languages.join(', ')}</p> : null}
            {active.sltdaRegistrationNo ? <p className="mt-2 text-xs text-gray-400">SLTDA {active.sltdaRegistrationNo}</p> : null}
          </div>
        ) : fleet ? (
          <div>
            <p className="text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase">Guide</p>
            <p className="mt-2 text-sm text-gray-400">Not applicable</p>
          </div>
        ) : null}
        {fleet ? (
          <>
            <div>
              <p className="text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase">Fleet</p>
              <p className="mt-2 text-sm">{vehicleCount(active)} vehicles · {Object.keys(groups).length} vehicle {Object.keys(groups).length === 1 ? 'type' : 'types'}</p>
              <ul className="mt-2 space-y-1 text-sm">
                {Object.entries(groups).map(([name, count]) => (
                  <li key={name} className="flex justify-between"><span className="text-gray-500">{name}</span><span>{count}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase">Drivers</p>
              <p className="mt-2 text-sm">{activeDriverCount(active)} active drivers</p>
            </div>
          </>
        ) : (
          <div>
            <p className="text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase">Vehicles</p>
            <p className="mt-2 text-sm text-gray-400">None</p>
          </div>
        )}
        <div>
          <p className="text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase">Profile</p>
          <p className="mt-2 text-sm">{progress.percent}% complete</p>
          {progress.remaining > 0 ? <p className="text-[11px] text-gray-400">{progress.remaining === 1 ? '1 recommended detail remaining' : `${progress.remaining} recommended details remaining`}</p> : null}
          <p className="mt-2 text-[11px] text-gray-400">Demo suppliers are prototype records, not verified businesses.</p>
        </div>
      </div>
    </aside>
  )
}
