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
  city?: string;
  birthDate?: string;
  jmbg?: string;
  isVip: boolean;
  marketingConsent: boolean;
  internalNote?: string;
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
  city?: string;
  birthDate?: string;
  jmbg?: string;
  isVip: boolean;
  marketingConsent: boolean;
  internalNote?: string;
}

export interface UpdateClientRequest {
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
  driverLicenseNumber: string;
  driverLicenseExpiry: string;
  driverLicenseCountry: string;
  city?: string;
  birthDate?: string;
  jmbg?: string;
  isVip: boolean;
  marketingConsent: boolean;
  internalNote?: string;
}

export interface CreateClientResponse {
  clientId: string;
}

export enum ClientActivityType {
  RentalCreated = 0,
  RentalStarted = 1,
  RentalCompleted = 2,
  DamageDetected = 3,
}

export interface ClientStats {
  totalRentals: number;
  averageDurationDays: number;
  damageCount: number;
  totalSpent: number;
  lastRentalDate: string | null;
}

export interface ClientRentalRow {
  id: string;
  vehicleLabel: string;
  licensePlate: string;
  pickupDate: string | null;
  actualReturnDate: string | null;
  expectedReturnDate: string;
  status: number;
  price: number;
  hasDamage: boolean;
}

export interface ClientActivityItem {
  timestamp: string;
  type: ClientActivityType;
  title: string;
  subtitle: string;
  relatedRentalId: string | null;
}

export interface ClientDetails {
  client: Client;
  stats: ClientStats;
  recentRentals: ClientRentalRow[];
  activity: ClientActivityItem[];
}
