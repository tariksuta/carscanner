import { BaseEntity } from '../../../core/models/base.model';

export enum DamageReportStatus {
  Pending = 0,
  Analyzing = 1,
  Completed = 2,
  NoDamageFound = 3,
  DamageDetected = 4,
  Failed = 5,
}

export enum DamageSeverity {
  Minor = 0,
  Moderate = 1,
  Severe = 2,
}

export const DAMAGE_REPORT_STATUS_LABELS: Record<DamageReportStatus, string> = {
  [DamageReportStatus.Pending]: 'Pending',
  [DamageReportStatus.Analyzing]: 'Analyzing',
  [DamageReportStatus.Completed]: 'Completed',
  [DamageReportStatus.NoDamageFound]: 'No Damage Found',
  [DamageReportStatus.DamageDetected]: 'Damage Detected',
  [DamageReportStatus.Failed]: 'Failed',
};

export const DAMAGE_SEVERITY_LABELS: Record<DamageSeverity, string> = {
  [DamageSeverity.Minor]: 'Minor',
  [DamageSeverity.Moderate]: 'Moderate',
  [DamageSeverity.Severe]: 'Severe',
};

export interface DamageItem {
  id: string;
  damageReportId: string;
  position: number;
  description: string;
  severity: DamageSeverity;
  estimatedCost?: number;
  pickupPhotoUrl?: string;
  returnPhotoUrl?: string;
}

export interface DamageReport extends BaseEntity {
  rentalId: string;
  clientId: string;
  pickupInspectionId: string;
  returnInspectionId: string;
  status: DamageReportStatus;
  requestedAt: string;
  completedAt?: string;
  aiRawResponse?: string;
  errorMessage?: string;
  damageItems: DamageItem[];
  totalEstimatedCost?: number;
}
