import { BaseEntity } from '../../../core/models/base.model';

export enum ServiceRecordType {
  RegularService = 0,
  OilChange = 1,
  TireChange = 2,
  BrakeService = 3,
  BatteryReplacement = 4,
  Repair = 5,
  TechnicalInspection = 6,
  Other = 7,
}

export const SERVICE_RECORD_TYPE_LABELS: Record<ServiceRecordType, string> = {
  [ServiceRecordType.RegularService]: 'Redovan servis',
  [ServiceRecordType.OilChange]: 'Zamjena ulja',
  [ServiceRecordType.TireChange]: 'Zamjena guma',
  [ServiceRecordType.BrakeService]: 'Servis kočnica',
  [ServiceRecordType.BatteryReplacement]: 'Zamjena akumulatora',
  [ServiceRecordType.Repair]: 'Popravka',
  [ServiceRecordType.TechnicalInspection]: 'Tehnički pregled',
  [ServiceRecordType.Other]: 'Ostalo',
};

export enum ReminderType {
  RegistrationExpiry = 0,
  InsuranceExpiry = 1,
  TechnicalInspection = 2,
  NextService = 3,
  Custom = 4,
}

export const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  [ReminderType.RegistrationExpiry]: 'Registracija',
  [ReminderType.InsuranceExpiry]: 'Osiguranje',
  [ReminderType.TechnicalInspection]: 'Tehnički pregled',
  [ReminderType.NextService]: 'Sljedeći servis',
  [ReminderType.Custom]: 'Ostalo',
};

export enum ReminderNotificationStage {
  None = 0,
  T30Days = 1,
  T14Days = 2,
  T7Days = 3,
  T1Day = 4,
  Overdue = 5,
}

export interface ServiceRecordSummary {
  id: string;
  vehicleId: string;
  vehicleDisplayName: string;
  serviceDate: string;
  mileageAtService: number;
  type: ServiceRecordType;
  cost: number;
  currency: string;
  workshopName?: string;
}

export interface ServiceRecordDetail extends BaseEntity {
  vehicleId: string;
  vehicleDisplayName: string;
  serviceDate: string;
  mileageAtService: number;
  type: ServiceRecordType;
  cost: number;
  currency: string;
  description: string;
  workshopName?: string;
  workshopContact?: string;
  createdByEmployeeId?: string;
  createdOnUtc: string;
  documents: ServiceDocument[];
}

export interface ServiceDocument {
  url: string;
  fileName: string;
  contentType: string;
  uploadedAtUtc: string;
}

export interface CreateServiceRecordRequest {
  vehicleId: string;
  serviceDate: string;
  mileageAtService: number;
  type: ServiceRecordType;
  cost: number;
  currency?: string;
  description?: string;
  workshopName?: string;
  workshopContact?: string;
}

export interface UpdateServiceRecordRequest {
  serviceDate: string;
  mileageAtService: number;
  type: ServiceRecordType;
  cost: number;
  currency?: string;
  description?: string;
  workshopName?: string;
  workshopContact?: string;
}

export interface CreateServiceRecordResponse {
  serviceRecordId: string;
}

export interface Reminder {
  id: string;
  vehicleId: string;
  vehicleDisplayName: string;
  type: ReminderType;
  dueDate: string | null;
  dueMileage: number | null;
  description: string;
  isActive: boolean;
  notificationStage: ReminderNotificationStage;
  lastNotificationSentAtUtc: string | null;
  daysUntilDue: number | null;
}

export interface CreateReminderRequest {
  vehicleId: string;
  type: ReminderType;
  dueDate: string | null;
  dueMileage: number | null;
  description: string;
}

export interface UpdateReminderRequest {
  dueDate: string | null;
  dueMileage: number | null;
  description: string;
}

export interface CreateReminderResponse {
  reminderId: string;
}
