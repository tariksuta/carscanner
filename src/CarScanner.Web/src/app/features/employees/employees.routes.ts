import { Routes } from '@angular/router';

export const EMPLOYEE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/employee-list-page.component').then((m) => m.EmployeeListPageComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/employee-create-page.component').then((m) => m.EmployeeCreatePageComponent),
    data: { breadcrumb: 'Novi zaposlenik' },
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/employee-edit-page.component').then((m) => m.EmployeeEditPageComponent),
    data: { breadcrumb: 'Uredi' },
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/employee-detail-page.component').then((m) => m.EmployeeDetailPageComponent),
    data: { breadcrumb: 'Detalji' },
  },
];
