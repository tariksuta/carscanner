import { BaseEntity } from '../../../core/models/base.model';

export interface Employee extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  applicationUserId?: string;
  hasLoginAccess: boolean;
  role?: string;
  lastSignInOnUtc?: string;
  branchId?: string;
  branchName?: string;
  branchCity?: string;
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  branchId?: string;
}

export interface UpdateEmployeeRequest {
  firstName: string;
  lastName: string;
  phone?: string;
  branchId?: string;
}

export interface CreateEmployeeResponse {
  employeeId: string;
}

export const EMPLOYEE_ROLES = ['Admin', 'Manager', 'Inspektor', 'Recepcija'] as const;
export type EmployeeRole = (typeof EMPLOYEE_ROLES)[number];

export interface GrantLoginAccessRequest {
  role: EmployeeRole;
}

export interface GrantLoginAccessResponse {
  applicationUserId: string;
}

export type EmployeePermissionModule =
  | 'Vehicles'
  | 'Rentals'
  | 'Inspections'
  | 'DamageReports'
  | 'Clients'
  | 'Employees'
  | 'Branches'
  | 'SystemSettings';

export interface EmployeePermission {
  module: EmployeePermissionModule;
  view: boolean;
  edit: boolean;
  delete: boolean;
}

export const EMPLOYEE_MODULE_LABELS: Record<EmployeePermissionModule, string> = {
  Vehicles: 'Vozila',
  Rentals: 'Rentali',
  Inspections: 'Inspekcije',
  DamageReports: 'Izvještaji šteta',
  Clients: 'Klijenti',
  Employees: 'Zaposlenici',
  Branches: 'Poslovnice',
  SystemSettings: 'Postavke sistema',
};

export interface EmployeeStats {
  totalInspections: number;
  inspectionsThisMonth: number;
  inspectionsLastMonth: number;
  monthOverMonthChangePercent: number | null;
  averageDurationSeconds: number | null;
  teamAverageDurationSeconds: number | null;
  completedInspections: number;
  completedRatePercent: number | null;
  returnInspectionsCompleted: number;
  damageDetectionsCount: number;
  damageDetectionRatePercent: number | null;
}

export type EmployeeInspectionTypeKey = 'Pickup' | 'Return';
export type EmployeeInspectionStatusKey =
  | 'Pending'
  | 'InProgress'
  | 'PhotosUploaded'
  | 'Completed';

export interface EmployeeRecentInspection {
  id: string;
  inspectionType: EmployeeInspectionTypeKey;
  status: EmployeeInspectionStatusKey;
  vehicleBrand: string;
  vehicleModel: string;
  createdOnUtc: string;
  completedAt: string | null;
  durationSeconds: number | null;
  hasDamage: boolean;
}

export const INSPECTION_TYPE_LABELS: Record<EmployeeInspectionTypeKey, string> = {
  Pickup: 'Preuzimanje',
  Return: 'Povrat',
};
