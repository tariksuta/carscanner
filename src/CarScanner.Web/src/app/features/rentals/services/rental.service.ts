import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { PagedResult, PaginationParams } from '../../../core/models/paged-result.model';
import { CreateRentalRequest, CreateRentalResponse, Rental, RentalStatus } from '../models/rental.model';

@Injectable({ providedIn: 'root' })
export class RentalService {
  private readonly api = inject(ApiService);

  getAll(params?: PaginationParams): Observable<PagedResult<Rental>> {
    const queryParams: Record<string, string | number | boolean> = {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
    };
    return this.api.get<PagedResult<Rental>>(API_ENDPOINTS.RENTALS.BASE, queryParams);
  }

  getById(id: string): Observable<Rental> {
    return this.api.get<Rental>(API_ENDPOINTS.RENTALS.BY_ID(id));
  }

  create(request: CreateRentalRequest): Observable<CreateRentalResponse> {
    return this.api.post<CreateRentalResponse>(API_ENDPOINTS.RENTALS.BASE, request);
  }

  changeStatus(id: string, status: RentalStatus, employeeId?: string): Observable<void> {
    return this.api.patch<void>(API_ENDPOINTS.RENTALS.CHANGE_STATUS(id), { status, employeeId });
  }
}
