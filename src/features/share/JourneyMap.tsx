import L from 'leaflet'
import { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import { buildJourneyStops, type JourneyStop } from '../../lib/journey-stops'
import { googleMapsKey, loadGoogleMaps } from '../../lib/load-google-maps'
import type { Trip } from '../../types/itinerary'

type ResolvedStop = JourneyStop & { lat: number; lng: number }

type Provider = 'google' | 'osm'

const ISLAND = { lat: 7.7, lng: 80.7 }
const GOLD = '#c4a574'
const NAVY = '#1c2a3a'

const GOOGLE_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { elementType: 'geometry', stylers: [{ saturation: -32 }, { lightness: 10 }] },
  { featureType: 'water', stylers: [{ color: '#c9d6de' }] },
  { featureType: 'landscape', stylers: [{ color: '#efe6d8' }] },
  { featureType: 'road.highway', stylers: [{ color: '#d9cbb8' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#5c564c' }] },
]

function pinHtml(n: number) {
  return `<span class="journey-pin">${n}</span>`
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (ch) => {
    if (ch === '&') return '&amp;'
    if (ch === '<') return '&lt;'
    if (ch === '>') return '&gt;'
    if (ch === '"') return '&quot;'
    return '&#39;'
  })
}

function popupHtml(stop: ResolvedStop, n: number, total: number) {
  let kicker = 'City'
  if (stop.kind === 'airport') {
    kicker = n === 1 ? 'Arrival' : n === total ? 'Return' : 'Airport'
  }
  return `<div class="journey-popup">
    <p class="journey-popup-kicker">${String(n).padStart(2, '0')} · ${kicker}</p>
    <p class="journey-popup-name">${escapeHtml(stop.label)}</p>
  </div>`
}

type PinStop = ResolvedStop & { pinLat: number; pinLng: number }

function groupByLocation(points: ResolvedStop[]) {
  const groups = new Map<string, number[]>()
  points.forEach((p, i) => {
    const key = `${p.lat.toFixed(3)}|${p.lng.toFixed(3)}`
    const list = groups.get(key) ?? []
    list.push(i)
    groups.set(key, list)
  })
  return groups
}

/** Nudge stacked pins (arrival + return airport) so both numbers stay visible. */
function spreadLeafletPins(map: L.Map, points: ResolvedStop[]): PinStop[] {
  const groups = groupByLocation(points)
  return points.map((p, i) => {
    const group = groups.get(`${p.lat.toFixed(3)}|${p.lng.toFixed(3)}`) ?? [i]
    const j = group.indexOf(i)
    if (group.length < 2 || j === 0) return { ...p, pinLat: p.lat, pinLng: p.lng }
    const pt = map.latLngToLayerPoint(L.latLng(p.lat, p.lng))
    const ll = map.layerPointToLatLng(L.point(pt.x + 28 * j, pt.y - 10 * j))
    return { ...p, pinLat: ll.lat, pinLng: ll.lng }
  })
}

function spreadByKilometers(points: ResolvedStop[], km: number): PinStop[] {
  const groups = groupByLocation(points)
  return points.map((p, i) => {
    const group = groups.get(`${p.lat.toFixed(3)}|${p.lng.toFixed(3)}`) ?? [i]
    const j = group.indexOf(i)
    if (group.length < 2 || j === 0) return { ...p, pinLat: p.lat, pinLng: p.lng }
    const dLng = (km * j) / (111.32 * Math.cos((p.lat * Math.PI) / 180))
    return { ...p, pinLat: p.lat + 0.03 * j, pinLng: p.lng + dLng }
  })
}

async function geocodeStop(stop: JourneyStop, region: string): Promise<ResolvedStop | null> {
  if (stop.known) return { ...stop, lat: stop.known.lat, lng: stop.known.lng }
  const geocoder = new google.maps.Geocoder()
  try {
    const res = await geocoder.geocode({
      address: `${stop.query}, ${region}`,
      region: 'lk',
    })
    const loc = res.results[0]?.geometry.location
    if (!loc) return null
    return { ...stop, lat: loc.lat(), lng: loc.lng() }
  } catch {
    return null
  }
}

async function resolveStops(stops: JourneyStop[], region: string, canGeocode: boolean) {
  const out: ResolvedStop[] = []
  for (const stop of stops) {
    if (stop.known) {
      out.push({ ...stop, lat: stop.known.lat, lng: stop.known.lng })
      continue
    }
    if (!canGeocode) continue
    const found = await geocodeStop(stop, region)
    if (found) out.push(found)
  }
  return out
}

function googleSymbol() {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 12,
    fillColor: NAVY,
    fillOpacity: 1,
    strokeColor: GOLD,
    strokeWeight: 2,
  }
}

export function JourneyMap({ trip }: { trip: Trip }) {
  const mapEl = useRef<HTMLDivElement>(null)
  const destKey = `${trip.country}|${trip.days.map((d) => d.destination).join('|')}`
  const [stableKey, setStableKey] = useState(destKey)
  const [provider, setProvider] = useState<Provider>(googleMapsKey() ? 'google' : 'osm')
  const tripRef = useRef(trip)
  tripRef.current = trip
  const plan = buildJourneyStops(trip)

  useEffect(() => {
    const t = window.setTimeout(() => setStableKey(destKey), 450)
    return () => window.clearTimeout(t)
  }, [destKey])

  useEffect(() => {
    const el = mapEl.current
    if (!el) return
    const liveTrip = tripRef.current
    const mapped = buildJourneyStops(liveTrip)

    let cancelled = false
    let leaflet: L.Map | null = null
    let googleMap: google.maps.Map | null = null
    let directions: google.maps.DirectionsRenderer | null = null
    let infoWindow: google.maps.InfoWindow | null = null
    const googleMarkers: google.maps.Marker[] = []
    let resize: ResizeObserver | null = null

    const key = googleMapsKey()
    const region = liveTrip.country.trim() || 'Sri Lanka'

    function attachResize(refresh: () => void) {
      if (!el) return
      resize?.disconnect()
      resize = new ResizeObserver(refresh)
      resize.observe(el)
      window.setTimeout(refresh, 120)
    }

    function paintLeaflet(points: ResolvedStop[]) {
      if (cancelled || !el) return
      leaflet?.remove()
      leaflet = null
      el.replaceChildren()
      leaflet = L.map(el, {
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: true,
      })
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 18,
      }).addTo(leaflet)

      if (points.length === 0) {
        leaflet.setView([ISLAND.lat, ISLAND.lng], 7)
      } else {
        const latlngs = points.map((p) => [p.lat, p.lng] as L.LatLngExpression)
        const line = L.polyline(latlngs, { color: GOLD, weight: 4, opacity: 0.95 })
        line.addTo(leaflet)
        leaflet.invalidateSize()
        leaflet.fitBounds(line.getBounds(), { padding: [36, 36], maxZoom: 9 })
        const pins = spreadLeafletPins(leaflet, points)
        pins.forEach((p, i) => {
          L.marker([p.pinLat, p.pinLng], {
            icon: L.divIcon({
              className: 'journey-marker',
              html: pinHtml(i + 1),
              iconSize: [28, 28],
              iconAnchor: [14, 14],
              popupAnchor: [0, -16],
            }),
            title: p.label,
            riseOnHover: true,
            zIndexOffset: 800 - i,
          })
            .bindPopup(popupHtml(p, i + 1, pins.length), {
              className: 'journey-popup-wrap',
              closeButton: true,
              autoPan: true,
              maxWidth: 220,
            })
            .addTo(leaflet!)
        })
      }

      attachResize(() => leaflet?.invalidateSize())
      if (!cancelled) setProvider('osm')
    }

    async function paintGoogle(points: ResolvedStop[]) {
      if (cancelled || !el) return
      el.replaceChildren()
      googleMap = new google.maps.Map(el, {
        center: ISLAND,
        zoom: 7,
        mapTypeId: 'roadmap',
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'cooperative',
        styles: GOOGLE_STYLES,
        backgroundColor: '#efe6d8',
      })

      const bounds = new google.maps.LatLngBounds()
      infoWindow = new google.maps.InfoWindow()
      const pins = spreadByKilometers(points, 16)
      pins.forEach((p, i) => {
        const marker = new google.maps.Marker({
          map: googleMap!,
          position: { lat: p.pinLat, lng: p.pinLng },
          label: { text: String(i + 1), color: '#f4eee4', fontSize: '11px', fontWeight: '600' },
          icon: googleSymbol(),
          title: p.label,
          zIndex: 800 - i,
        })
        marker.addListener('click', () => {
          infoWindow?.setContent(popupHtml(p, i + 1, pins.length))
          infoWindow?.open({ map: googleMap!, anchor: marker })
        })
        googleMarkers.push(marker)
        bounds.extend(marker.getPosition()!)
      })

      if (points.length >= 2) {
        const renderer = new google.maps.DirectionsRenderer({
          map: googleMap,
          suppressMarkers: true,
          preserveViewport: true,
          polylineOptions: { strokeColor: GOLD, strokeWeight: 5, strokeOpacity: 0.95 },
        })
        directions = renderer
        const svc = new google.maps.DirectionsService()
        try {
          const result = await svc.route({
            origin: { lat: points[0].lat, lng: points[0].lng },
            destination: { lat: points[points.length - 1].lat, lng: points[points.length - 1].lng },
            waypoints: points.slice(1, -1).map((p) => ({
              location: { lat: p.lat, lng: p.lng },
              stopover: true,
            })),
            travelMode: google.maps.TravelMode.DRIVING,
          })
          if (!cancelled) renderer.setDirections(result)
        } catch {
          new google.maps.Polyline({
            map: googleMap,
            path: points.map((p) => ({ lat: p.lat, lng: p.lng })),
            strokeColor: GOLD,
            strokeWeight: 4,
          })
        }
      } else if (points.length === 1) {
        googleMap.setCenter({ lat: points[0].lat, lng: points[0].lng })
        googleMap.setZoom(9)
      }

      if (points.length >= 2 && !bounds.isEmpty()) {
        googleMap.fitBounds(bounds, 48)
      }

      attachResize(() => {
        if (!googleMap) return
        google.maps.event.trigger(googleMap, 'resize')
      })
      if (!cancelled) setProvider('google')
    }

    async function start() {
      const wantGoogle = Boolean(key)
      if (wantGoogle) {
        window.gm_authFailure = () => {
          if (cancelled) return
          void resolveStops(mapped, region, false).then((pts) => {
            if (!cancelled) paintLeaflet(pts)
          })
        }
        try {
          await loadGoogleMaps(key)
          if (cancelled) return
          const points = await resolveStops(mapped, region, true)
          if (cancelled) return
          await paintGoogle(points)
          return
        } catch {
          // fall through to OSM
        }
      }
      const points = await resolveStops(mapped, region, false)
      if (!cancelled) paintLeaflet(points)
    }

    void start()

    return () => {
      cancelled = true
      resize?.disconnect()
      leaflet?.remove()
      infoWindow?.close()
      directions?.setMap(null)
      googleMarkers.forEach((m) => m.setMap(null))
      googleMap = null
      if (window.gm_authFailure) window.gm_authFailure = undefined
    }
  }, [stableKey])

  const missing = plan.filter((s) => !s.known).map((s) => s.label)
  const caption =
    provider === 'google' ? 'Google road map · driving route through your destinations' : 'Road map of your journey'

  return (
    <div className="journey-map overflow-hidden border border-[#1c2a3a]/10 bg-[#efe6d8] shadow-[0_18px_50px_rgb(28_42_58_/_0.12)]">
      <div className="itinerary-map-frame">
        <div ref={mapEl} className="h-full w-full" />
      </div>
      <p className="border-t border-[#1c2a3a]/8 px-4 py-2.5 font-[family-name:var(--font-satoshi)] text-[11px] tracking-wide text-[#5c564c]">
        {caption}
        {missing.length > 0 && provider === 'osm' ? ` · Couldn’t place ${missing.join(', ')}` : ''}
      </p>
    </div>
  )
}
