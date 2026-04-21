import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import {
  ChangePasswordRequest,
  UpdateProfileRequest,
  UploadProfileImageResponse,
  UserProfile,
} from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly api = inject(ApiService);

  getProfile(): Observable<UserProfile> {
    return this.api.get<UserProfile>(API_ENDPOINTS.PROFILE.BASE);
  }

  updateProfile(request: UpdateProfileRequest): Observable<void> {
    return this.api.put<void>(API_ENDPOINTS.PROFILE.BASE, request);
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.api.put<void>(API_ENDPOINTS.PROFILE.PASSWORD, request);
  }

  uploadImage(file: File): Observable<UploadProfileImageResponse> {
    const formData = new FormData();
    formData.append('image', file);
    return this.api.upload<UploadProfileImageResponse>(API_ENDPOINTS.PROFILE.IMAGE, formData);
  }

  deleteImage(): Observable<void> {
    return this.api.delete<void>(API_ENDPOINTS.PROFILE.IMAGE);
  }
}
