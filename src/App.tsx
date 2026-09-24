import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { CostingsPage } from './features/costing/CostingsPage'
import { DestinationsPage } from './features/destinations/DestinationsPage'
import { ShareItineraryPage } from './features/share/ShareItineraryPage'
import { ActivitiesPage } from './features/activities/ActivitiesPage'
import { HotelsPage } from './features/hotels/HotelsPage'
import { SuppliersPage } from './features/suppliers/SuppliersPage'
import { TransportPage } from './features/transport/TransportPage'
import { TripsPage } from './features/trips/TripsPage'
import { useItinerary } from './state/itinerary-store'

function Placeholder({ title }: { title: string }) {
  const { hotels } = useItinerary()
  return (
    <AppShell>
      <div className="p-8">
        <h1 className="text-xl font-medium text-gray-900 dark:text-zinc-100">{title}</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">Coming next in the CRM. {hotels.length} hotels already live in the library.</p>
      </div>
    </AppShell>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TripsPage />} />
      <Route path="/destinations" element={<DestinationsPage />} />
      <Route path="/transport" element={<TransportPage />} />
      <Route path="/suppliers" element={<SuppliersPage />} />
      <Route path="/costing" element={<CostingsPage />} />
      <Route path="/customers" element={<Placeholder title="Customers" />} />
      <Route path="/hotels" element={<HotelsPage />} />
      <Route path="/activities" element={<ActivitiesPage />} />
      <Route path="/i/:shareId" element={<ShareItineraryPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
