import type { Completeness } from '../types/itinerary'
import type { Supplier, SupplierSectionId } from '../types/supplier'
import { missingRegistrations } from './supplier'

export function supplierSections(supplier: Supplier): { id: SupplierSectionId; n: string; label: string }[] {
  const sections: { id: SupplierSectionId; n: string; label: string }[] = [{ id: 'supplier', n: '01', label: 'Supplier' }]
  if (supplier.guideTypes.length) sections.push({ id: 'guide', n: '02', label: 'Guide Details' })
  if (supplier.type === 'vehicle_fleet') {
    sections.push({ id: 'vehicles', n: '03', label: 'Vehicles' })
    sections.push({ id: 'drivers', n: '04', label: 'Drivers' })
  }
  return sections
}

export function requiredSupplierIssues(supplier: Supplier) {
  const missing: { section: SupplierSectionId; message: string }[] = []
  if (!supplier.type) missing.push({ section: 'supplier', message: 'Select a supplier type.' })
  if (!supplier.name.trim()) missing.push({ section: 'supplier', message: 'Enter the supplier name.' })
  if (supplier.type === 'vehicle_fleet') {
    supplier.vehicleInventory.forEach((group, index) => {
      const label = group.model.trim() || group.transportName.trim() || `Vehicle ${index + 1}`
      if (!group.transportName.trim()) missing.push({ section: 'vehicles', message: `Select a transport type for ${label}.` })
      if (!group.model.trim()) missing.push({ section: 'vehicles', message: `Enter the model for ${label}.` })
      if (!group.manufactureYear || group.manufactureYear < 1950) missing.push({ section: 'vehicles', message: `Enter the manufacture year for ${label}.` })
      if (!group.numberOfUnits || group.numberOfUnits < 1) missing.push({ section: 'vehicles', message: `Enter the number of vehicle units for ${label}.` })
      const gap = missingRegistrations(group)
      if (gap > 0) missing.push({ section: 'vehicles', message: `Add ${gap} more registration ${gap === 1 ? 'number' : 'numbers'} to match the unit count for ${label}.` })
    })
  }
  return missing
}

export function supplierProgress(supplier: Supplier) {
  const checks = [
    !!supplier.type,
    supplier.name.trim(),
    supplier.type !== 'vehicle_fleet' || !!supplier.vehicleOwnership,
    supplier.type !== 'individual' || supplier.guideTypes.length > 0 || supplier.languages.length > 0,
    supplier.type !== 'vehicle_fleet' || supplier.vehicleInventory.length > 0,
    supplier.type !== 'vehicle_fleet' || supplier.drivers.some((driver) => driver.name.trim()),
  ]
  const filled = checks.filter(Boolean).length
  const percent = Math.round((filled / checks.length) * 100)
  const remaining = checks.length - filled
  return { percent, remaining }
}

export function supplierSectionStatus(supplier: Supplier, id: SupplierSectionId): Completeness {
  const issues = requiredSupplierIssues(supplier).filter((issue) => issue.section === id)
  if (id === 'supplier') {
    if (supplier.type && supplier.name.trim()) return 'complete'
    if (supplier.name || supplier.type) return 'progress'
    return 'empty'
  }
  if (id === 'guide') return supplier.guideTypes.length ? 'complete' : 'empty'
  if (id === 'vehicles') {
    if (!supplier.vehicleInventory.length) return 'empty'
    if (issues.length) return 'attention'
    return 'complete'
  }
  if (supplier.drivers.some((driver) => driver.name.trim())) return 'complete'
  if (supplier.drivers.length) return 'progress'
  return 'empty'
}
