import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { PagedResult } from '../../../core/models/paged-result.model';
import {
  CreateReminderRequest,
  CreateReminderResponse,
  CreateServiceRecordRequest,
  CreateServiceRecordResponse,
  Reminder,
  ServiceRecordDetail,
  ServiceRecordSummary,
  UpdateReminderRequest,
  UpdateServiceRecordRequest,
} from '../models/service-book.model';

@Injectable({ providedIn: 'root' })
export class ServiceBookService {
  private readonly api = inject(ApiService);

  // Service records
  getRecords(
    vehicleId: string | null,
    page = 1,
    pageSize = 20,
  ): Observable<PagedResult<ServiceRecordSummary>> {
    const params: Record<string, string | number | boolean> = { page, pageSize };
    if (vehicleId) params['vehicleId'] = vehicleId;
    return this.api.get<PagedResult<ServiceRecordSummary>>(API_ENDPOINTS.SERVICE_BOOK.RECORDS, params);
  }

  getRecordById(id: string): Observable<ServiceRecordDetail> {
    return this.api.get<ServiceRecordDetail>(API_ENDPOINTS.SERVICE_BOOK.RECORD_BY_ID(id));
  }

  createRecord(request: CreateServiceRecordRequest): Observable<CreateServiceRecordResponse> {
    return this.api.post<CreateServiceRecordResponse>(API_ENDPOINTS.SERVICE_BOOK.RECORDS, request);
  }

  updateRecord(id: string, request: UpdateServiceRecordRequest): Observable<void> {
    return this.api.put<void>(API_ENDPOINTS.SERVICE_BOOK.RECORD_BY_ID(id), request);
  }

  deleteRecord(id: string): Observable<void> {
    return this.api.delete<void>(API_ENDPOINTS.SERVICE_BOOK.RECORD_BY_ID(id));
  }

  // Reminders
  getRemindersForVehicle(vehicleId: string, includeInactive = false): Observable<Reminder[]> {
    return this.api.get<Reminder[]>(
      API_ENDPOINTS.SERVICE_BOOK.REMINDERS_BY_VEHICLE(vehicleId),
      { includeInactive },
    );
  }

  getUpcomingReminders(days = 30): Observable<Reminder[]> {
    return this.api.get<Reminder[]>(API_ENDPOINTS.SERVICE_BOOK.REMINDERS_UPCOMING, { days });
  }

  createReminder(request: CreateReminderRequest): Observable<CreateReminderResponse> {
    return this.api.post<CreateReminderResponse>(API_ENDPOINTS.SERVICE_BOOK.REMINDERS, request);
  }

  updateReminder(id: string, request: UpdateReminderRequest): Observable<void> {
    return this.api.put<void>(API_ENDPOINTS.SERVICE_BOOK.REMINDER_BY_ID(id), request);
  }

  dismissReminder(id: string): Observable<void> {
    return this.api.post<void>(API_ENDPOINTS.SERVICE_BOOK.REMINDER_DISMISS(id));
  }
}
