import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TenantContextService } from '../../services/tenant-context.service';

/**
 * Sets X-Tenant-Id header from TenantContextService when a tenant is selected.
 * Used by PlatformAdmin to impersonate a tenant context. Regular (non-PlatformAdmin)
 * users have their tenant cemented by the JWT 'tenant_id' claim — backend
 * JwtClaimTenantProvider ignores this header for them.
 */
export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const tenantContext = inject(TenantContextService);
  const tenantId = tenantContext.currentTenantId();

  if (tenantId) {
    const cloned = req.clone({
      setHeaders: {
        'X-Tenant-Id': tenantId,
      },
    });
    return next(cloned);
  }

  return next(req);
};
