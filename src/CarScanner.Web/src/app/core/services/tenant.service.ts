import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { APP_CONSTANTS } from '../constants/app.constants';

@Injectable({ providedIn: 'root' })
export class TenantService {
  getTenantId(): string | null {
    return (
      localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.TENANT_ID) ?? environment.tenantId ?? null
    );
  }

  setTenantId(tenantId: string): void {
    localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.TENANT_ID, tenantId);
  }
}
