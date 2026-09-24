export type SupplierType = 'individual' | 'vehicle_fleet'

export type SupplierStatus = 'draft' | 'active' | 'inactive'

export type GuideType = 'national_guide' | 'chauffeur_guide'

export type VehicleOwnership = 'single' | 'multiple'

export type SupplierSectionId = 'supplier' | 'guide' | 'vehicles' | 'drivers'

export type SupplierVehicleImage = {
  id: string
  url: string
  fileName?: string
}

export type SupplierVehicleImages = {
  front?: SupplierVehicleImage
  interior?: SupplierVehicleImage
  side?: SupplierVehicleImage
  luggage?: SupplierVehicleImage
}

export type SupplierVehicleUnit = {
  id: string
  registrationNumber: string
  status?: 'active' | 'inactive'
}

export type SupplierVehicleInventory = {
  id: string
  transportId?: string
  transportName: string
  model: string
  manufactureYear?: number
  numberOfUnits: number
  vehicles: SupplierVehicleUnit[]
  images: SupplierVehicleImages
}

export type SupplierDriver = {
  id: string
  name: string
  contactNumber?: string
  status: 'active' | 'inactive'
}

export type Supplier = {
  id: string
  type?: SupplierType
  name: string
  sltdaRegistrationNo?: string
  guideTypes: GuideType[]
  languages: string[]
  vehicleOwnership?: VehicleOwnership
  email?: string
  phone?: string
  vehicleInventory: SupplierVehicleInventory[]
  drivers: SupplierDriver[]
  status: SupplierStatus
  createdAt: string
  updatedAt: string
}
