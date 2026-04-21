import { BaseEntity } from '../../../core/models/base.model';

export enum VehicleStatus {
  Available = 0,
  Rented = 1,
  InMaintenance = 2,
  OutOfService = 3,
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
}

export interface UpdateVehicleRequest {
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  currentMileage: number;
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
