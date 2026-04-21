import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { PagedResult, PaginationParams } from '../../../core/models/paged-result.model';
import { CompleteInspectionRequest, CompleteInspectionResponse, CreateInspectionRequest, CreateInspectionResponse, PhotoPosition, UploadPhotoResponse, VehicleInspection } from '../models/inspection.model';

@Injectable({ providedIn: 'root' })
export class InspectionService {
  private readonly api = inject(ApiService);

  getAll(params?: PaginationParams): Observable<PagedResult<VehicleInspection>> {
    const queryParams: Record<string, string | number | boolean> = {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
    };
    return this.api.get<PagedResult<VehicleInspection>>(API_ENDPOINTS.INSPECTIONS.BASE, queryParams);
  }

  getById(id: string): Observable<VehicleInspection> {
    return this.api.get<VehicleInspection>(API_ENDPOINTS.INSPECTIONS.BY_ID(id));
  }

  create(req: CreateInspectionRequest): Observable<CreateInspectionResponse> {
    return this.api.post<CreateInspectionResponse>(API_ENDPOINTS.INSPECTIONS.BASE, req);
  }

  uploadPhoto(inspectionId: string, position: PhotoPosition, file: File): Observable<UploadPhotoResponse> {
    const fd = new FormData();
    fd.append('photo', file);
    fd.append('position', String(position));
    return this.api.upload<UploadPhotoResponse>(API_ENDPOINTS.INSPECTIONS.PHOTOS(inspectionId), fd);
  }

  complete(inspectionId: string, req: CompleteInspectionRequest): Observable<CompleteInspectionResponse> {
    return this.api.post<CompleteInspectionResponse>(API_ENDPOINTS.INSPECTIONS.COMPLETE(inspectionId), req);
  }
}
