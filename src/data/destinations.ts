export type GeoPoint = {
  lat: number
  lng: number
}

export type KnownPlace = {
  label: string
  lat: number
  lng: number
  aliases: string[]
}

/** Bandaranaike International (CMB) — typical Sri Lanka arrival. */
export const AIRPORT: KnownPlace = {
  label: 'Colombo Airport',
  lat: 7.1808,
  lng: 79.8841,
  aliases: ['airport', 'cmb', 'bandaranaike', 'katunayake', 'departure', 'depart', 'arrival'],
}

export const DESTINATION_LABELS = [
  'Colombo Airport',
  'Colombo',
  'Negombo',
  'Sigiriya',
  'Dambulla',
  'Kandy',
  'Nuwara Eliya',
  'Ella',
  'Mirissa',
  'Galle',
  'Yala',
  'Udawalawe',
  'Departure',
]

const PLACES: KnownPlace[] = [
  AIRPORT,
  { label: 'Colombo', lat: 6.9271, lng: 79.8612, aliases: ['colombo', 'colpetty', 'kolpity', 'fort'] },
  { label: 'Negombo', lat: 7.2083, lng: 79.8358, aliases: ['negombo'] },
  { label: 'Sigiriya', lat: 7.957, lng: 80.7603, aliases: ['sigiriya', 'sygiria'] },
  { label: 'Dambulla', lat: 7.8742, lng: 80.6511, aliases: ['dambulla'] },
  { label: 'Habarana', lat: 8.036, lng: 80.754, aliases: ['habarana'] },
  { label: 'Polonnaruwa', lat: 7.9403, lng: 81.0188, aliases: ['polonnaruwa'] },
  { label: 'Anuradhapura', lat: 8.3114, lng: 80.4037, aliases: ['anuradhapura'] },
  { label: 'Minneriya', lat: 8.035, lng: 80.888, aliases: ['minneriya'] },
  { label: 'Kandy', lat: 7.2906, lng: 80.6337, aliases: ['kandy'] },
  { label: 'Peradeniya', lat: 7.271, lng: 80.595, aliases: ['peradeniya'] },
  { label: 'Pinnawala', lat: 7.3, lng: 80.388, aliases: ['pinnawala', 'pinnawela'] },
  { label: 'Nuwara Eliya', lat: 6.9497, lng: 80.7891, aliases: ['nuwara eliya', 'nuwara'] },
  { label: 'Horton Plains', lat: 6.8094, lng: 80.8022, aliases: ['horton plains', 'horton', 'worlds end'] },
  { label: 'Hatton', lat: 6.8916, lng: 80.5956, aliases: ['hatton'] },
  { label: 'Adam’s Peak', lat: 6.8096, lng: 80.4994, aliases: ['adams peak', 'sri pada'] },
  { label: 'Ella', lat: 6.8667, lng: 81.0466, aliases: ['ella'] },
  { label: 'Haputale', lat: 6.7686, lng: 80.9516, aliases: ['haputale'] },
  { label: 'Bandarawela', lat: 6.8331, lng: 80.9956, aliases: ['bandarawela'] },
  { label: 'Badulla', lat: 6.9934, lng: 81.055, aliases: ['badulla'] },
  { label: 'Kitulgala', lat: 6.989, lng: 80.411, aliases: ['kitulgala'] },
  { label: 'Bentota', lat: 6.425, lng: 80.0, aliases: ['bentota'] },
  { label: 'Hikkaduwa', lat: 6.1395, lng: 80.102, aliases: ['hikkaduwa'] },
  { label: 'Galle', lat: 6.0535, lng: 80.221, aliases: ['galle'] },
  { label: 'Unawatuna', lat: 6.0097, lng: 80.2484, aliases: ['unawatuna'] },
  { label: 'Mirissa', lat: 5.9483, lng: 80.4589, aliases: ['mirissa'] },
  { label: 'Weligama', lat: 5.9731, lng: 80.4297, aliases: ['weligama'] },
  { label: 'Matara', lat: 5.9549, lng: 80.555, aliases: ['matara'] },
  { label: 'Tangalle', lat: 6.024, lng: 80.797, aliases: ['tangalle', 'tangalla'] },
  { label: 'Hiriketiya', lat: 5.96, lng: 80.729, aliases: ['hiriketiya'] },
  { label: 'Yala', lat: 6.3728, lng: 81.5185, aliases: ['yala', 'tissamaharama', 'tissa'] },
  { label: 'Udawalawe', lat: 6.438, lng: 80.8888, aliases: ['udawalawe', 'udawalawa'] },
  { label: 'Hambantota', lat: 6.1241, lng: 81.1185, aliases: ['hambantota'] },
  { label: 'Arugam Bay', lat: 6.8404, lng: 81.8363, aliases: ['arugam bay', 'arugam'] },
  { label: 'Pasikudah', lat: 7.9294, lng: 81.5611, aliases: ['pasikudah', 'pasikuda'] },
  { label: 'Batticaloa', lat: 7.7102, lng: 81.6924, aliases: ['batticaloa'] },
  { label: 'Trincomalee', lat: 8.5874, lng: 81.2152, aliases: ['trincomalee', 'trinco', 'nilaveli'] },
  { label: 'Jaffna', lat: 9.6615, lng: 80.0255, aliases: ['jaffna'] },
  { label: 'Kalpitiya', lat: 8.2295, lng: 79.7396, aliases: ['kalpitiya'] },
  { label: 'Wilpattu', lat: 8.395, lng: 80.05, aliases: ['wilpattu'] },
]

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

const ALIAS_INDEX = PLACES.flatMap((place) =>
  place.aliases.map((alias) => ({ alias: normalize(alias), place })),
).sort((a, b) => b.alias.length - a.alias.length)

export function isTerminalDestination(name: string) {
  const n = normalize(name)
  return n.length === 0 || AIRPORT.aliases.some((a) => n === a || n.startsWith(`${a} `))
}

export function resolveKnownPlace(name: string): KnownPlace | null {
  const n = normalize(name)
  if (!n) return null
  const exact = ALIAS_INDEX.find((row) => row.alias === n)
  if (exact) return exact.place
  const contained = ALIAS_INDEX.find((row) => row.alias.length >= 4 && (n.includes(row.alias) || row.alias.includes(n)))
  return contained?.place ?? null
}
