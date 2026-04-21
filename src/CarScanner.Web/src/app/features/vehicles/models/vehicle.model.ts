import { BaseEntity } from '../../../core/models/base.model';

export enum VehicleStatus {
  Available = 0,
  Rented = 1,
  InMaintenance = 2,
  OutOfService = 3,
}

export enum FuelType {
  Petrol = 0,
  Diesel = 1,
  Hybrid = 2,
  Electric = 3,
}

export enum GearType {
  Manual = 0,
  Automatic = 1,
  Dsg = 2,
}

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  [VehicleStatus.Available]: 'Available',
  [VehicleStatus.Rented]: 'Rented',
  [VehicleStatus.InMaintenance]: 'In Maintenance',
  [VehicleStatus.OutOfService]: 'Out of Service',
};

export interface VehicleImage {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface Vehicle extends BaseEntity {
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  color: string;
  currentMileage: number;
  status: VehicleStatus;
  primaryImageUrl: string | null;
}

export interface VehicleDetail extends BaseEntity {
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  color: string;
  currentMileage: number;
  status: VehicleStatus;
  fuel: FuelType;
  gear: GearType;
  powerKw: number | null;
  seats: number;
  registrationExpiry: string | null;
  insuranceExpiry: string | null;
  images: VehicleImage[];
}

export interface CreateVehicleRequest {
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  color: string;
  currentMileage: number;
  fuel: FuelType;
  gear: GearType;
  powerKw: number | null;
  seats: number;
  registrationExpiry: string | null;
  insuranceExpiry: string | null;
}

export interface UpdateVehicleRequest {
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  currentMileage: number;
  fuel: FuelType;
  gear: GearType;
  powerKw: number | null;
  seats: number;
  registrationExpiry: string | null;
  insuranceExpiry: string | null;
  status: VehicleStatus;
}

export interface CreateVehicleResponse {
  vehicleId: string;
}

export interface UploadVehicleImageResponse {
  imageId: string;
  imageUrl: string;
}

export interface GetVehiclesResponse {
  vehicles: Vehicle[];
}
