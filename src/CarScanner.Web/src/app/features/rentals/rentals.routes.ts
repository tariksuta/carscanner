import { Routes } from '@angular/router';

export const RENTAL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/rental-list-page.component').then((m) => m.RentalListPageComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/rental-create-page.component').then((m) => m.RentalCreatePageComponent),
    data: { breadcrumb: 'New Rental' },
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/rental-detail-page.component').then((m) => m.RentalDetailPageComponent),
    data: { breadcrumb: 'Details' },
  },
];
