import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { ThemeProvider } from './components/ThemeProvider.tsx'
import { ToastProvider } from './components/ui/Toast.tsx'
import { CostingProvider } from './state/costing-store.tsx'
import { DestinationProvider } from './state/destination-store.tsx'
import { ActivityProvider } from './state/activity-store.tsx'
import { HotelMasterProvider } from './state/hotel-store.tsx'
import { ItineraryProvider } from './state/itinerary-store.tsx'
import { SupplierProvider } from './state/supplier-store.tsx'
import { TransportProvider } from './state/transport-store.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
      <BrowserRouter>
        <ItineraryProvider>
          <CostingProvider>
            <DestinationProvider>
              <ActivityProvider>
              <TransportProvider>
                <SupplierProvider>
                <HotelMasterProvider>
                  <App />
                </HotelMasterProvider>
                </SupplierProvider>
              </TransportProvider>
              </ActivityProvider>
            </DestinationProvider>
          </CostingProvider>
        </ItineraryProvider>
      </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
)
