export interface BillingAccount {
  accountId: string;
  tenantId: string;
  currency: string;
  balance: number;
  lifetimeToppedUp: number;
  lifetimeSpent: number;
  monthlyHardCap?: number | null;
  monthSpent: number;
  monthAnchorUtc: string;
  lowBalanceThreshold?: number | null;
  planName?: string | null;
  markupMultiplier: number;
}

export enum AiUsageStatus {
  Reserved = 0,
  Committed = 1,
  Refunded = 2,
  EstimatedFallback = 3,
}

export interface AiUsageRecord {
  id: string;
  damageReportId?: string | null;
  feature: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  rawCostUsd: number;
  chargedAmount: number;
  status: AiUsageStatus;
  errorContext?: string | null;
  originalUsageRecordId?: string | null;
  createdAtUtc: string;
}

export interface PagedUsageResult {
  items: AiUsageRecord[];
  page: number;
  pageSize: number;
  totalCount: number;
}
