import { Routes } from '@angular/router';

export const CLIENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/client-list-page.component').then((m) => m.ClientListPageComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/client-create-page.component').then((m) => m.ClientCreatePageComponent),
    data: { breadcrumb: 'Novi klijent' },
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/client-edit-page.component').then((m) => m.ClientEditPageComponent),
    data: { breadcrumb: 'Uredi' },
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/client-detail-page.component').then((m) => m.ClientDetailPageComponent),
    data: { breadcrumb: 'Detalji' },
  },
];
