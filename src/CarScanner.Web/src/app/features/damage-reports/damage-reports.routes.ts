import { Routes } from '@angular/router';

export const DAMAGE_REPORT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/damage-report-list-page.component').then(
        (m) => m.DamageReportListPageComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/damage-report-detail-page.component').then(
        (m) => m.DamageReportDetailPageComponent,
      ),
    data: { breadcrumb: 'Details' },
  },
];
