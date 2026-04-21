import { Routes } from '@angular/router';

export const INSPECTION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/inspection-list-page.component').then((m) => m.InspectionListPageComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/inspection-detail-page.component').then(
        (m) => m.InspectionDetailPageComponent,
      ),
    data: { breadcrumb: 'Details' },
  },
];
