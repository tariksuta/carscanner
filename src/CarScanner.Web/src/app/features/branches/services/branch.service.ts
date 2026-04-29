import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import {
  Branch,
  CreateBranchRequest,
  CreateBranchResponse,
  UpdateBranchRequest,
} from '../models/branch.model';

@Injectable({ providedIn: 'root' })
export class BranchService {
  private readonly api = inject(ApiService);

  getAll(activeOnly = false): Observable<Branch[]> {
    return this.api.get<Branch[]>(API_ENDPOINTS.BRANCHES.BASE, { activeOnly });
  }

  getById(id: string): Observable<Branch> {
    return this.api.get<Branch>(API_ENDPOINTS.BRANCHES.BY_ID(id));
  }

  create(request: CreateBranchRequest): Observable<CreateBranchResponse> {
    return this.api.post<CreateBranchResponse>(API_ENDPOINTS.BRANCHES.BASE, request);
  }

  update(id: string, request: UpdateBranchRequest): Observable<void> {
    return this.api.put<void>(API_ENDPOINTS.BRANCHES.BY_ID(id), request);
  }

  activate(id: string): Observable<void> {
    return this.api.post<void>(API_ENDPOINTS.BRANCHES.ACTIVATE(id));
  }

  deactivate(id: string): Observable<void> {
    return this.api.post<void>(API_ENDPOINTS.BRANCHES.DEACTIVATE(id));
  }
}
