import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { PagedResult } from '../../../core/models/paged-result.model';
import { NotificationItem, UnreadCountResponse } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly api = inject(ApiService);

  getList(unreadOnly = false, page = 1, pageSize = 20): Observable<PagedResult<NotificationItem>> {
    return this.api.get<PagedResult<NotificationItem>>(API_ENDPOINTS.NOTIFICATIONS.BASE, {
      unreadOnly,
      page,
      pageSize,
    });
  }

  getUnreadCount(): Observable<UnreadCountResponse> {
    return this.api.get<UnreadCountResponse>(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
  }

  markAsRead(id: string): Observable<void> {
    return this.api.post<void>(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
  }

  markAllAsRead(): Observable<void> {
    return this.api.post<void>(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  }
}
