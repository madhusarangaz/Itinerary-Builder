import { NavLink } from 'react-router-dom'
import { Bus, Calculator, CalendarRange, Hotel, MapPin, Sparkles, Ticket, Truck, Users } from 'lucide-react'
import darkLogo from '../../assets/dark logo.png'
import lightLogo from '../../assets/Light logo.png'
import { cn } from '../../lib/cn'
import { ThemeToggle } from '../ui/ThemeToggle'

export type SidebarAskAi = { open: boolean; onToggle: () => void }

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

export function Sidebar({ askAi }: { askAi?: SidebarAskAi }) {
  return (
    <aside className="flex h-full w-64 flex-col rounded-3xl bg-white py-8 shadow-[0_1px_1px_rgb(0_0_0/_0.03),0_16px_40px_rgb(0_0_0/_0.06)] dark:bg-[#101012] dark:shadow-[0_16px_40px_rgb(0_0_0/_0.35)]">
      <div className="px-6 pb-8">
        <img src={darkLogo} alt="O'Viana Holidays CRM" className="h-12 w-auto dark:hidden" />
        <img src={lightLogo} alt="" aria-hidden="true" className="hidden h-12 w-auto dark:block" />
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                isActive
                  ? 'active bg-[#EFEFF1] text-[#1c2a3a] dark:bg-white/10 dark:text-zinc-100'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5'
              }`
            }
          >
            <l.icon size={16} className="text-gray-400 group-hover:text-[var(--accent)] group-[.active]:text-[var(--accent)] dark:text-zinc-500 dark:group-hover:text-[var(--accent)] dark:group-[.active]:text-[var(--accent)]" />
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 pt-4">
        {askAi ? (
          <button
            type="button"
            onClick={askAi.onToggle}
            aria-pressed={askAi.open}
            className={cn(
              'mb-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm',
              askAi.open
                ? 'bg-[var(--accent)] font-medium text-white'
                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5',
            )}
          >
            <Sparkles size={16} className={askAi.open ? 'text-white' : 'text-[var(--accent)]'} />
            Ask AI
          </button>
        ) : null}
        <ThemeToggle />
        <button
          type="button"
          className="mt-3 px-1 text-[11px] text-gray-400 underline"
          onClick={() => {
            if (!window.confirm('Reset prototype data? This clears records created in this browser and restores the demo set.')) return
            ;['travelbuilding.destinations.v1', 'travelbuilding.hotel-master.v1', 'travelbuilding.hotels.v3', 'travelbuilding.activities.v1', 'travelbuilding.transport.v1', 'travelbuilding.suppliers.v1', 'travelbuilding.trip.v3', 'travelbuilding.trips.v1', 'travelbuilding.costing.v2'].forEach((key) => localStorage.removeItem(key))
            window.location.reload()
          }}
        >
          Reset demo data
        </button>
      </div>
    </aside>
  )
}
