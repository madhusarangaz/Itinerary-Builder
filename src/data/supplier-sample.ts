import { emptySupplier, newDriver, newInventory, newUnit } from '../lib/supplier'
import type { Supplier } from '../types/supplier'

const now = '2026-09-14T10:00:00.000Z'

export const sampleSuppliers: Supplier[] = [
  emptySupplier({
    id: 'sup-abc',
    type: 'vehicle_fleet',
    name: 'ABC Transport Services',
    vehicleOwnership: 'multiple',
    phone: '+94 77 000 0100',
    status: 'active',
    createdAt: now,
    updatedAt: now,
    vehicleInventory: [
      newInventory({
        id: 'fleet-abc-kdh',
        transportName: 'High Roof Van',
        model: 'Toyota KDH',
        manufactureYear: 2022,
        numberOfUnits: 3,
        vehicles: [
          newUnit({ id: 'unit-abc-1', registrationNumber: 'CAB-1234' }),
          newUnit({ id: 'unit-abc-2', registrationNumber: 'CAB-5678' }),
          newUnit({ id: 'unit-abc-3', registrationNumber: 'NC-9012' }),
        ],
      }),
    ],
    drivers: [
      newDriver({ id: 'drv-kamal', name: 'Kamal Silva', contactNumber: '+94 77 000 0101', status: 'active' }),
      newDriver({ id: 'drv-nimal', name: 'Nimal Perera', contactNumber: '+94 77 000 0102', status: 'active' }),
    ],
  }),
  emptySupplier({
    id: 'sup-guide-demo',
    type: 'individual',
    name: 'Demo National Guide',
    sltdaRegistrationNo: 'DEMO-SLTDA-001',
    guideTypes: ['national_guide'],
    languages: ['English', 'German', 'Sinhala'],
    phone: '+94 77 000 0200',
    status: 'active',
    createdAt: now,
    updatedAt: now,
  }),
]

export { emptySupplier }
