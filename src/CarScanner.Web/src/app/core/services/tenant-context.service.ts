import { Injectable, signal } from '@angular/core';

const STORAGE_KEY_ID = 'cs_tenant_id';
const STORAGE_KEY_NAME = 'cs_tenant_name';

/**
 * Holds the PlatformAdmin's currently impersonated tenant context.
 * Persists in localStorage so a hard reload preserves the selection.
 * Regular users (with tenant_id JWT claim) ignore this entirely — their
 * tenant is cemented by the backend JwtClaimTenantProvider.
 */
@Injectable({ providedIn: 'root' })
export class TenantContextService {
  private readonly _tenantId = signal<string | null>(this.readFromStorage(STORAGE_KEY_ID));
  private readonly _tenantName = signal<string | null>(this.readFromStorage(STORAGE_KEY_NAME));

  readonly currentTenantId = this._tenantId.asReadonly();
  readonly currentTenantName = this._tenantName.asReadonly();

  setTenant(tenantId: string, tenantName: string | null = null): void {
    this._tenantId.set(tenantId);
    this._tenantName.set(tenantName);
    localStorage.setItem(STORAGE_KEY_ID, tenantId);
    if (tenantName) {
      localStorage.setItem(STORAGE_KEY_NAME, tenantName);
    } else {
      localStorage.removeItem(STORAGE_KEY_NAME);
    }
  }

  clearTenant(): void {
    this._tenantId.set(null);
    this._tenantName.set(null);
    localStorage.removeItem(STORAGE_KEY_ID);
    localStorage.removeItem(STORAGE_KEY_NAME);
  }

  private readFromStorage(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
}
