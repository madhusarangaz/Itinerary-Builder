import { useParams } from 'react-router-dom'
import { readStoredTrip, useOptionalItinerary } from '../../state/itinerary-store'
import { ItineraryChat } from './ItineraryChat'
import { ItineraryTemplate } from './ItineraryTemplate'

export function ShareItineraryPage() {
  const { shareId } = useParams()
  const ctx = useOptionalItinerary()
  const stored = ctx?.trip ?? readStoredTrip()
  const trip = shareId ? { ...stored, shareId: stored.shareId || shareId } : stored

  return (
    <div className="relative min-h-screen bg-[#f2f2f2]">
      <ItineraryTemplate trip={trip} animate />
      <ItineraryChat trip={trip} placement="fixed" />
    </div>
  )
}
