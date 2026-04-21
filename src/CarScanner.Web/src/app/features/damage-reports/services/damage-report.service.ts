import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { PagedResult, PaginationParams } from '../../../core/models/paged-result.model';
import { DamageReport } from '../models/damage-report.model';

@Injectable({ providedIn: 'root' })
export class DamageReportService {
  private readonly api = inject(ApiService);

  getAll(params?: PaginationParams): Observable<PagedResult<DamageReport>> {
    const queryParams: Record<string, string | number | boolean> = {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
    };
    return this.api.get<PagedResult<DamageReport>>(API_ENDPOINTS.DAMAGE_REPORTS.BASE, queryParams);
  }

  getById(id: string): Observable<DamageReport> {
    return this.api.get<DamageReport>(API_ENDPOINTS.DAMAGE_REPORTS.BY_ID(id));
  }

  requestAnalysis(reportId: string): Observable<{ message: string }> {
    return this.api.post<{ message: string }>(API_ENDPOINTS.DAMAGE_REPORTS.ANALYZE(reportId));
  }
}
