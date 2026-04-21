import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { PagedResult, PaginationParams } from '../../../core/models/paged-result.model';
import {
  CreateEmployeeRequest,
  CreateEmployeeResponse,
  Employee,
  GrantLoginAccessRequest,
  GrantLoginAccessResponse,
  UpdateEmployeeRequest,
} from '../models/employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly api = inject(ApiService);

  getAll(params?: PaginationParams): Observable<PagedResult<Employee>> {
    const queryParams: Record<string, string | number | boolean> = {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
    };
    if (params?.search) queryParams['search'] = params.search;
    return this.api.get<PagedResult<Employee>>(API_ENDPOINTS.EMPLOYEES.BASE, queryParams);
  }

  getById(id: string): Observable<Employee> {
    return this.api.get<Employee>(API_ENDPOINTS.EMPLOYEES.BY_ID(id));
  }

  create(request: CreateEmployeeRequest): Observable<CreateEmployeeResponse> {
    return this.api.post<CreateEmployeeResponse>(API_ENDPOINTS.EMPLOYEES.BASE, request);
  }

  update(id: string, request: UpdateEmployeeRequest): Observable<void> {
    return this.api.put<void>(API_ENDPOINTS.EMPLOYEES.BY_ID(id), request);
  }

  grantLoginAccess(id: string, request: GrantLoginAccessRequest): Observable<GrantLoginAccessResponse> {
    return this.api.post<GrantLoginAccessResponse>(API_ENDPOINTS.EMPLOYEES.LOGIN_ACCESS(id), request);
  }
}
