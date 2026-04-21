import { Routes } from '@angular/router';

export const VEHICLE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/vehicle-list-page.component').then((m) => m.VehicleListPageComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/vehicle-create-page.component').then((m) => m.VehicleCreatePageComponent),
    data: { breadcrumb: 'Novo vozilo' },
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/vehicle-edit-page.component').then((m) => m.VehicleEditPageComponent),
    data: { breadcrumb: 'Uredi' },
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/vehicle-detail-page.component').then((m) => m.VehicleDetailPageComponent),
    data: { breadcrumb: 'Detalji' },
  },
];
