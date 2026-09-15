import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { ThemeProvider } from './components/ThemeProvider.tsx'
import { CostingProvider } from './state/costing-store.tsx'
import { DestinationProvider } from './state/destination-store.tsx'
import { ItineraryProvider } from './state/itinerary-store.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <ItineraryProvider>
          <CostingProvider>
            <DestinationProvider>
              <App />
            </DestinationProvider>
          </CostingProvider>
        </ItineraryProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
