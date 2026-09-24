import { NavLink } from 'react-router-dom'
import { Bus, Calculator, CalendarRange, Hotel, MapPin, Ticket, Truck, Users } from 'lucide-react'
import { ThemeToggle } from '../ui/ThemeToggle'

const links = [
  { to: '/', label: 'Itinerary', icon: CalendarRange },
  { to: '/destinations', label: 'Destinations', icon: MapPin },
  { to: '/hotels', label: 'Hotels', icon: Hotel },
  { to: '/activities', label: 'Activities & Entrance Fees', icon: Ticket },
  { to: '/transport', label: 'Transport', icon: Bus },
  { to: '/suppliers', label: 'Suppliers', icon: Truck },
  { to: '/costing', label: 'Costing', icon: Calculator },
  { to: '/customers', label: 'Customers', icon: Users },
]

export function Sidebar() {
  return (
    <aside className="flex h-full w-64 flex-col rounded-3xl bg-white py-8 dark:bg-[#242528]">
      <div className="px-6 pb-8">
        <p className="text-lg font-semibold tracking-tight text-gray-900 dark:text-zinc-100">Travel Building</p>
        <p className="text-xs text-gray-400 dark:text-zinc-500">Itinerary CRM</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
                isActive
                  ? 'bg-gray-100 font-medium text-gray-900 dark:bg-white/10 dark:text-zinc-100'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5'
              }`
            }
          >
            <l.icon size={16} />
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 pt-4">
        <ThemeToggle />
        <button
          type="button"
          className="mt-3 px-1 text-[11px] text-gray-400 underline"
          onClick={() => {
            if (!window.confirm('Reset prototype data? This clears records created in this browser and restores the demo set.')) return
            ;['travelbuilding.destinations.v1', 'travelbuilding.hotel-master.v1', 'travelbuilding.hotels.v3', 'travelbuilding.activities.v1', 'travelbuilding.transport.v1', 'travelbuilding.suppliers.v1', 'travelbuilding.trip.v3', 'travelbuilding.costing.v2'].forEach((key) => localStorage.removeItem(key))
            window.location.reload()
          }}
        >
          Reset demo data
        </button>
      </div>
    </aside>
  )
}
