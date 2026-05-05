import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import {
  AssignPricingPlanRequest,
  ProvisionTenantRequest,
  ProvisionTenantResponse,
  SetLowBalanceThresholdRequest,
  SetMonthlyCapRequest,
  SuspendTenantRequest,
  TenantOverview,
  TopUpTenantRequest,
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
}
