export enum TenantStatus {
  Active = 0,
  Suspended = 1,
  Deactivated = 2,
}

export const TENANT_STATUS_LABELS: Record<TenantStatus, string> = {
  [TenantStatus.Active]: 'Aktivan',
  [TenantStatus.Suspended]: 'Suspendovan',
  [TenantStatus.Deactivated]: 'Deaktiviran',
};

export interface TenantOverview {
  tenantId: string;
  name: string;
  contactEmail: string;
  status: TenantStatus;
  provisionedAt: string;
  billingAccountId: string | null;
  currency: string | null;
  balance: number | null;
  monthSpent: number | null;
  monthlyHardCap: number | null;
  lowBalanceThreshold: number | null;
}

export interface ProvisionTenantRequest {
  name: string;
  contactEmail: string;
  initialBalance: number | null;
}

export interface ProvisionTenantResponse {
  tenantId: string;
}

export interface TopUpTenantRequest {
  amount: number;
  reference: string | null;
}

export interface SetMonthlyCapRequest {
  cap: number | null;
}

export interface SetLowBalanceThresholdRequest {
  threshold: number | null;
}

export interface AssignPricingPlanRequest {
  pricingPlanId: string | null;
}

export interface SuspendTenantRequest {
  reason: string | null;
}

export interface PricingPlanSummary {
  id: string;
  name: string;
  isDefault: boolean;
  markupMultiplier: number;
  effectiveFromUtc: string;
  effectiveUntilUtc: string | null;
  enabledModuleCount: number;
  modelPricingCount: number;
}

export interface ModelPricing {
  model: string;
  promptCostPerThousandTokens: number;
  completionCostPerThousandTokens: number;
  fixedSurchargePerCall: number | null;
}

export interface PricingPlanDetail {
  id: string;
  name: string;
  isDefault: boolean;
  markupMultiplier: number;
  effectiveFromUtc: string;
  effectiveUntilUtc: string | null;
  enabledModules: string[];
  modelPricings: ModelPricing[];
}

export interface CreatePricingPlanRequest {
  name: string;
  markupMultiplier: number;
  isDefault: boolean;
}

export interface CreatePricingPlanResponse {
  pricingPlanId: string;
}

export interface UpdatePricingPlanRequest {
  name: string;
  markupMultiplier: number;
}

export interface SetPricingPlanModulesRequest {
  modules: string[];
}

export interface UpsertModelPricingRequest {
  model: string;
  promptCostPerThousandTokens: number;
  completionCostPerThousandTokens: number;
  fixedSurchargePerCall: number | null;
}

export const PRICING_PLAN_MODULES = [
  'Vehicles',
  'Rentals',
  'Inspections',
  'DamageReports',
  'Clients',
  'Employees',
  'Branches',
  'SystemSettings',
  'Billing',
  'ServiceBook',
] as const;
// Note: 'PlatformTenants' is intentionally excluded — platform-only flag, not for regular plans.
// If a Module enum value is added/renamed in CarScanner.SharedKernel.Authorization.Module,
// update this list to match.

export type PricingPlanModule = (typeof PRICING_PLAN_MODULES)[number];
