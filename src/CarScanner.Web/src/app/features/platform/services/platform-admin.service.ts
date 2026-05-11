import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import {
  AssignPricingPlanRequest,
  CreatePricingPlanRequest,
  CreatePricingPlanResponse,
  PricingPlanDetail,
  PricingPlanSummary,
  ProvisionTenantRequest,
  ProvisionTenantResponse,
  SetLowBalanceThresholdRequest,
  SetMonthlyCapRequest,
  SetPricingPlanModulesRequest,
  SuspendTenantRequest,
  TenantOverview,
  TopUpTenantRequest,
  UpdatePricingPlanRequest,
  UpsertModelPricingRequest,
} from '../models/platform.model';

@Injectable({ providedIn: 'root' })
export class PlatformAdminService {
  private readonly api = inject(ApiService);

  getAllTenants(): Observable<TenantOverview[]> {
    return this.api.get<TenantOverview[]>(API_ENDPOINTS.PLATFORM.TENANTS);
  }

  provisionTenant(request: ProvisionTenantRequest): Observable<ProvisionTenantResponse> {
    return this.api.post<ProvisionTenantResponse>(API_ENDPOINTS.PLATFORM.TENANTS, request);
  }

  topUp(tenantId: string, request: TopUpTenantRequest): Observable<unknown> {
    return this.api.post(API_ENDPOINTS.PLATFORM.TOP_UP(tenantId), request);
  }

  setMonthlyCap(tenantId: string, request: SetMonthlyCapRequest): Observable<void> {
    return this.api.patch<void>(API_ENDPOINTS.PLATFORM.MONTHLY_CAP(tenantId), request);
  }

  setLowBalanceThreshold(
    tenantId: string,
    request: SetLowBalanceThresholdRequest,
  ): Observable<void> {
    return this.api.patch<void>(API_ENDPOINTS.PLATFORM.LOW_BALANCE(tenantId), request);
  }

  assignPricingPlan(tenantId: string, request: AssignPricingPlanRequest): Observable<void> {
    return this.api.patch<void>(API_ENDPOINTS.PLATFORM.ASSIGN_PLAN(tenantId), request);
  }

  suspend(tenantId: string, request: SuspendTenantRequest): Observable<void> {
    return this.api.post<void>(API_ENDPOINTS.PLATFORM.SUSPEND(tenantId), request);
  }

  reactivate(tenantId: string): Observable<void> {
    return this.api.post<void>(API_ENDPOINTS.PLATFORM.REACTIVATE(tenantId));
  }

  deactivate(tenantId: string): Observable<void> {
    return this.api.post<void>(API_ENDPOINTS.PLATFORM.DEACTIVATE(tenantId));
  }

  getAllPricingPlans(): Observable<PricingPlanSummary[]> {
    return this.api.get<PricingPlanSummary[]>(API_ENDPOINTS.PLATFORM.PRICING_PLANS);
  }

  getPricingPlanById(id: string): Observable<PricingPlanDetail> {
    return this.api.get<PricingPlanDetail>(API_ENDPOINTS.PLATFORM.PRICING_PLAN_BY_ID(id));
  }

  createPricingPlan(request: CreatePricingPlanRequest): Observable<CreatePricingPlanResponse> {
    return this.api.post<CreatePricingPlanResponse>(
      API_ENDPOINTS.PLATFORM.PRICING_PLANS,
      request,
    );
  }

  updatePricingPlan(id: string, request: UpdatePricingPlanRequest): Observable<void> {
    return this.api.patch<void>(API_ENDPOINTS.PLATFORM.PRICING_PLAN_BY_ID(id), request);
  }

  deletePricingPlan(id: string): Observable<void> {
    return this.api.delete<void>(API_ENDPOINTS.PLATFORM.PRICING_PLAN_BY_ID(id));
  }

  setDefaultPricingPlan(id: string): Observable<void> {
    return this.api.patch<void>(API_ENDPOINTS.PLATFORM.PRICING_PLAN_SET_DEFAULT(id), {});
  }

  setPricingPlanModules(id: string, request: SetPricingPlanModulesRequest): Observable<void> {
    return this.api.patch<void>(API_ENDPOINTS.PLATFORM.PRICING_PLAN_MODULES(id), request);
  }

  upsertModelPricing(id: string, request: UpsertModelPricingRequest): Observable<void> {
    return this.api.post<void>(API_ENDPOINTS.PLATFORM.PRICING_PLAN_MODEL_PRICINGS(id), request);
  }

  removeModelPricing(id: string, model: string): Observable<void> {
    return this.api.delete<void>(API_ENDPOINTS.PLATFORM.PRICING_PLAN_MODEL_PRICING(id, model));
  }
}
