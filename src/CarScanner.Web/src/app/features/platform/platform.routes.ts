import { Routes } from '@angular/router';

export const PLATFORM_ROUTES: Routes = [
  { path: '', redirectTo: 'tenants', pathMatch: 'full' },
  {
    path: 'tenants',
    loadComponent: () =>
      import('./pages/tenants-list-page.component').then((m) => m.TenantsListPageComponent),
    data: { breadcrumb: 'Tenanti' },
  },
  {
    path: 'tenants/:id',
    loadComponent: () =>
      import('./pages/tenant-detail-page.component').then((m) => m.TenantDetailPageComponent),
    data: { breadcrumb: 'Detalji tenanta' },
  },
  {
    path: 'pricing-plans',
    loadComponent: () =>
      import('./pages/pricing-plans-page.component').then((m) => m.PricingPlansPageComponent),
    data: { breadcrumb: 'Pricing planovi' },
  },
  {
    path: 'pricing-plans/:id',
    loadComponent: () =>
      import('./pages/pricing-plan-detail-page.component').then(
        (m) => m.PricingPlanDetailPageComponent,
      ),
    data: { breadcrumb: 'Detalji plana' },
  },
];
