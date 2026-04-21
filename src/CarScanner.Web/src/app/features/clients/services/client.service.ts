import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { PagedResult, PaginationParams } from '../../../core/models/paged-result.model';
import { Client, CreateClientRequest, CreateClientResponse, UpdateClientRequest } from '../models/client.model';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly api = inject(ApiService);

  getAll(params?: PaginationParams): Observable<PagedResult<Client>> {
    const queryParams: Record<string, string | number | boolean> = {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
    };
    if (params?.search) queryParams['search'] = params.search;
    return this.api.get<PagedResult<Client>>(API_ENDPOINTS.CLIENTS.BASE, queryParams);
  }

  getById(id: string): Observable<Client> {
    return this.api.get<Client>(API_ENDPOINTS.CLIENTS.BY_ID(id));
  }

  create(request: CreateClientRequest): Observable<CreateClientResponse> {
    return this.api.post<CreateClientResponse>(API_ENDPOINTS.CLIENTS.BASE, request);
  }

  update(id: string, request: UpdateClientRequest): Observable<void> {
    return this.api.put<void>(API_ENDPOINTS.CLIENTS.BY_ID(id), request);
  }
}
