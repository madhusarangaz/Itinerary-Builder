import { uid } from './ids'
import type { Supplier, SupplierDriver, SupplierVehicleInventory, SupplierVehicleUnit } from '../types/supplier'

export function newUnit(partial?: Partial<SupplierVehicleUnit>): SupplierVehicleUnit {
  return { id: uid('unit'), registrationNumber: '', status: 'active', ...partial }
}

export function syncUnits(group: SupplierVehicleInventory, count: number): SupplierVehicleInventory {
  const numberOfUnits = Math.max(1, Math.floor(count) || 1)
  const vehicles = [...group.vehicles]
  while (vehicles.length < numberOfUnits) vehicles.push(newUnit())
  return { ...group, numberOfUnits, vehicles: vehicles.slice(0, numberOfUnits) }
}

export function newInventory(partial?: Partial<SupplierVehicleInventory>): SupplierVehicleInventory {
  return syncUnits(
    {
      id: uid('fleet'),
      transportName: '',
      model: '',
      numberOfUnits: 1,
      vehicles: [],
      images: {},
      ...partial,
    },
    partial?.numberOfUnits ?? 1,
  )
}

export function newDriver(partial?: Partial<SupplierDriver>): SupplierDriver {
  return { id: uid('drv'), name: '', status: 'active', ...partial }
}

export function emptySupplier(partial?: Partial<Supplier>): Supplier {
  const now = new Date().toISOString()
  return {
    id: uid('sup'),
    name: '',
    guideTypes: [],
    languages: [],
    vehicleInventory: [],
    drivers: [],
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    ...partial,
  }
}

export function missingRegistrations(group: SupplierVehicleInventory) {
  const filled = group.vehicles.filter((unit) => unit.registrationNumber.trim()).length
  return Math.max(0, group.numberOfUnits - filled)
}

export function imageCount(group: SupplierVehicleInventory) {
  return [group.images.front, group.images.interior, group.images.side, group.images.luggage].filter((image) => image?.url).length
}
