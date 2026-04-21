import { inject, Injectable } from '@angular/core';
import { concat, Observable, of, switchMap } from 'rxjs';
import { last } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { PagedResult, PaginationParams } from '../../../core/models/paged-result.model';
import {
  CreateVehicleRequest,
  CreateVehicleResponse,
  UpdateVehicleRequest,
  UploadVehicleImageResponse,
  Vehicle,
  VehicleDetail,
} from '../models/vehicle.model';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private readonly api = inject(ApiService);

  getAll(params?: PaginationParams & { onlyAvailable?: boolean }): Observable<PagedResult<Vehicle>> {
    const queryParams: Record<string, string | number | boolean> = {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
    };
    if (params?.search) queryParams['search'] = params.search;
    if (params?.onlyAvailable) queryParams['onlyAvailable'] = true;
    return this.api.get<PagedResult<Vehicle>>(API_ENDPOINTS.VEHICLES.BASE, queryParams);
  }

  getById(id: string): Observable<Vehicle> {
    return this.api.get<Vehicle>(API_ENDPOINTS.VEHICLES.BY_ID(id));
  }

  getDetail(id: string): Observable<VehicleDetail> {
    return this.api.get<VehicleDetail>(API_ENDPOINTS.VEHICLES.BY_ID(id));
  }

  create(request: CreateVehicleRequest): Observable<CreateVehicleResponse> {
    return this.api.post<CreateVehicleResponse>(API_ENDPOINTS.VEHICLES.BASE, request);
  }

  update(id: string, request: UpdateVehicleRequest): Observable<void> {
    return this.api.put<void>(API_ENDPOINTS.VEHICLES.BY_ID(id), request);
  }

  uploadImage(vehicleId: string, file: File, isPrimary: boolean): Observable<UploadVehicleImageResponse> {
    const formData = new FormData();
    formData.append('image', file);
    return this.api.upload<UploadVehicleImageResponse>(
      `${API_ENDPOINTS.VEHICLES.IMAGES(vehicleId)}?isPrimary=${isPrimary}`,
      formData,
    );
  }

  deleteImage(vehicleId: string, imageId: string): Observable<void> {
    return this.api.delete<void>(API_ENDPOINTS.VEHICLES.IMAGE(vehicleId, imageId));
  }

  setPrimaryImage(vehicleId: string, imageId: string): Observable<void> {
    return this.api.put<void>(API_ENDPOINTS.VEHICLES.SET_PRIMARY(vehicleId, imageId), {});
  }

  createWithImages(
    request: CreateVehicleRequest,
    images: { file: File; isPrimary: boolean }[],
  ): Observable<CreateVehicleResponse> {
    return this.create(request).pipe(
      switchMap((response) => {
        if (images.length === 0) return of(response);
        const uploads = images.map((img) => this.uploadImage(response.vehicleId, img.file, img.isPrimary));
        return concat(...uploads).pipe(
          last(),
          switchMap(() => of(response)),
        );
      }),
    );
  }
}
