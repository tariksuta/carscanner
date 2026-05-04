import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { BillingAccount, PagedUsageResult } from '../models/billing.model';

export interface UsageQueryParams {
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class BillingService {
  private readonly api = inject(ApiService);

  getAccount(): Observable<BillingAccount> {
    return this.api.get<BillingAccount>(API_ENDPOINTS.BILLING.ACCOUNT);
  }

  getUsage(params: UsageQueryParams = {}): Observable<PagedUsageResult> {
    const query: Record<string, string | number> = {};
    if (params.from) query['from'] = params.from;
    if (params.to) query['to'] = params.to;
    if (params.page) query['page'] = params.page;
    if (params.pageSize) query['pageSize'] = params.pageSize;
    return this.api.get<PagedUsageResult>(API_ENDPOINTS.BILLING.USAGE, query);
  }
}
