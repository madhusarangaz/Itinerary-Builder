let loading: Promise<void> | null = null

export function googleMapsKey() {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  return typeof key === 'string' && key.trim() ? key.trim() : ''
}

export function loadGoogleMaps(key: string) {
  if (window.google?.maps?.Map) return Promise.resolve()
  if (loading) return loading

  loading = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-google-maps]')
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Google Maps failed to load')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.dataset.googleMaps = 'true'
    script.async = true
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly`
    script.onload = () => resolve()
    script.onerror = () => {
      loading = null
      reject(new Error('Google Maps failed to load'))
    }
    document.head.appendChild(script)
  })

  return loading
}
