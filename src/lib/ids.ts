export function uid(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

/** GB/26/145 style reference. Only used when a trip has no tour ID yet. */
export function nextTourId() {
  const year = String(new Date().getFullYear()).slice(-2)
  const seq = String(100 + Math.floor(Math.random() * 900))
  return `GB/${year}/${seq}`
}

/** Itinerary versions are labels like 1.1, 1.2, 1.3. */
export function itineraryVersion(value: string) {
  const version = value.trim()
  return /^\d+\.\d+$/.test(version) ? version : '1.1'
}
