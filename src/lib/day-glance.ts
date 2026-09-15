import type { Activity, Day, DayMeals, DayPickup, DayTravel } from '../types/itinerary'

export const emptyTravel = (): DayTravel => ({ from: '', to: '', transport: '', duration: '' })
export const emptyMeals = (): DayMeals => ({ breakfast: false, lunch: false, dinner: false })
export const emptyPickup = (): DayPickup => ({
  meetingPoint: '',
  pickupTime: '',
  contactName: '',
  contactPhone: '',
  ifLost: '',
})

export const TRANSPORT_OPTIONS = [
  { value: 'Private van', label: 'Private van' },
  { value: 'Private car', label: 'Private car' },
  { value: 'Train', label: 'Train' },
  { value: 'Flight', label: 'Flight' },
  { value: 'Boat', label: 'Boat' },
  { value: 'Walking', label: 'Walking' },
  { value: 'Tuk-tuk', label: 'Tuk-tuk' },
]

export const STATUS_OPTIONS = [
  { value: 'included', label: 'Included' },
  { value: 'optional', label: 'Optional' },
  { value: 'extra', label: 'Additional cost' },
]

export type GlanceRow = { label: string; value: string }

function mealsLine(meals?: DayMeals) {
  if (!meals) return ''
  const parts = [
    meals.breakfast ? 'Breakfast' : '',
    meals.lunch ? 'Lunch' : '',
    meals.dinner ? 'Dinner' : '',
  ].filter(Boolean)
  return parts.join(' + ')
}

function pickupFilled(pickup?: DayPickup) {
  if (!pickup) return false
  return Boolean(
    pickup.meetingPoint.trim() ||
      pickup.pickupTime.trim() ||
      pickup.contactName.trim() ||
      pickup.contactPhone.trim() ||
      pickup.ifLost.trim(),
  )
}

export function travelFilled(travel?: DayTravel) {
  if (!travel) return false
  return Boolean(travel.from.trim() || travel.to.trim() || travel.transport.trim() || travel.duration.trim())
}

export function mealsFilled(meals?: DayMeals) {
  return Boolean(meals?.breakfast || meals?.lunch || meals?.dinner)
}

export function activityOpsFilled(activity: Activity) {
  return Boolean(
    activity.time?.trim() ||
      activity.status ||
      activity.notes?.trim() ||
      activity.extraCost?.trim() ||
      activity.bookingRef?.trim() ||
      activity.meetingPoint?.trim(),
  )
}

export function travellerFilled(day: Day) {
  return (
    travelFilled(day.travel) ||
    Boolean(day.hotelName?.trim()) ||
    mealsFilled(day.meals) ||
    Boolean(day.tip?.trim()) ||
    pickupFilled(day.pickup) ||
    day.activities.some(activityOpsFilled)
  )
}

function titled(list: Activity[]) {
  return list.filter((a) => a.title.trim())
}

export function buildDayGlance(day: Day): GlanceRow[] {
  const rows: GlanceRow[] = []
  const travel = day.travel
  if (travelFilled(travel) && travel) {
    const bits: string[] = []
    if (travel.transport.trim()) bits.push(travel.transport.trim())
    if (travel.from.trim() && travel.to.trim()) bits.push(`${travel.from.trim()} → ${travel.to.trim()}`)
    else if (travel.from.trim() || travel.to.trim()) bits.push((travel.from || travel.to).trim())
    if (travel.duration.trim()) {
      const d = travel.duration.trim()
      bits.push(/^approx/i.test(d) ? d : `Approx. ${d}`)
    }
    if (bits.length) rows.push({ label: 'Travel', value: bits.join(' · ') })
  }

  if (day.hotelName?.trim()) rows.push({ label: 'Stay', value: day.hotelName.trim() })

  const meals = mealsLine(day.meals)
  if (meals) rows.push({ label: 'Meals', value: meals })

  const acts = titled(day.activities).filter((a) => a.type === 'activity')
  const included = acts.filter((a) => a.status === 'included')
  const optional = acts.filter((a) => a.status === 'optional')
  const extra = acts.filter((a) => a.status === 'extra')
  if (included.length) {
    rows.push({ label: 'Included', value: included.map((a) => a.title.trim()).join(' · ') })
  }
  if (optional.length) {
    rows.push({ label: 'Optional', value: optional.map((a) => a.title.trim()).join(' · ') })
  }
  if (extra.length) {
    rows.push({
      label: 'Extra cost',
      value: extra
        .map((a) => (a.extraCost?.trim() ? `${a.title.trim()} (${a.extraCost.trim()})` : a.title.trim()))
        .join(' · '),
    })
  }

  if (day.tip?.trim()) rows.push({ label: 'Good to know', value: day.tip.trim() })

  const pickup = day.pickup
  if (pickupFilled(pickup) && pickup) {
    const bits: string[] = []
    if (pickup.pickupTime.trim()) bits.push(pickup.pickupTime.trim())
    if (pickup.meetingPoint.trim()) bits.push(pickup.meetingPoint.trim())
    const who = [pickup.contactName.trim(), pickup.contactPhone.trim()].filter(Boolean).join(' · ')
    if (who) bits.push(who)
    if (bits.length) rows.push({ label: 'Pickup', value: bits.join(' · ') })
    if (pickup.ifLost.trim()) rows.push({ label: 'If missed', value: pickup.ifLost.trim() })
  }

  return rows
}
