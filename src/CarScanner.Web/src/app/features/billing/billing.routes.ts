import { Routes } from '@angular/router';

export const BILLING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/billing-dashboard-page.component').then(
        (m) => m.BillingDashboardPageComponent,
      ),
  },
  {
    path: 'usage',
    loadComponent: () =>
      import('./pages/usage-history-page.component').then((m) => m.UsageHistoryPageComponent),
    data: { breadcrumb: 'Historija potrošnje' },
  },
];
