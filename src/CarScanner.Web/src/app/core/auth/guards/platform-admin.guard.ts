import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../store/auth.store';

/**
 * Allows route activation only when the current user has the PlatformAdmin role.
 * Non-PlatformAdmin users get redirected to /dashboard (graceful — they won't see
 * a 403; they just don't have access to this section).
 */
export const platformAdminGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isPlatformAdmin()) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
