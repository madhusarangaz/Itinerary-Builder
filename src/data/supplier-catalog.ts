import type { GuideType, Supplier, SupplierStatus, SupplierType, VehicleOwnership } from '../types/supplier'

export const SUPPLIER_TYPE_LABEL: Record<SupplierType, string> = {
  individual: 'Individual',
  vehicle_fleet: 'Vehicle Fleet',
}

export const GUIDE_TYPE_LABEL: Record<GuideType, string> = {
  national_guide: 'National Guide',
  chauffeur_guide: 'Chauffeur Guide',
}

export const OWNERSHIP_LABEL: Record<VehicleOwnership, string> = {
  single: 'Single Vehicle',
  multiple: 'Multiple Vehicles',
}

export const SUPPLIER_STATUS_LABELS: Record<SupplierStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  inactive: 'Inactive',
}

export const SUPPLIER_LANGUAGES = ['English', 'German', 'French', 'Italian', 'Spanish', 'Russian', 'Chinese', 'Japanese', 'Tamil', 'Sinhala']

export function formatUpdated(iso: string) {
  const then = new Date(iso).getTime()
  if (!then) return ''
  const mins = Math.round((Date.now() - then) / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

export function vehicleCount(supplier: Supplier) {
  return supplier.vehicleInventory.reduce((sum, group) => sum + group.vehicles.filter((unit) => unit.registrationNumber.trim()).length, 0)
}

export function activeDriverCount(supplier: Supplier) {
  return supplier.drivers.filter((driver) => driver.status === 'active' && driver.name.trim()).length
}

export function serviceLabel(supplier: Supplier) {
  if (supplier.guideTypes.length) return supplier.guideTypes.map((type) => GUIDE_TYPE_LABEL[type]).join(', ')
  if (supplier.type === 'vehicle_fleet') return 'Transport'
  return '—'
}
