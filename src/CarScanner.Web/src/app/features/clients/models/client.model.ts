import { BaseEntity } from '../../../core/models/base.model';

export interface Client extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  driverLicenseNumber: string;
  driverLicenseExpiry: string;
  driverLicenseCountry: string;
  address?: string;
}

export interface CreateClientRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  driverLicenseNumber: string;
  driverLicenseExpiry: string;
  driverLicenseCountry: string;
  address?: string;
}

export interface UpdateClientRequest {
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
  driverLicenseNumber: string;
  driverLicenseExpiry: string;
  driverLicenseCountry: string;
}

export interface CreateClientResponse {
  clientId: string;
}
