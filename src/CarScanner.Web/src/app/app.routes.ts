import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { noAuthGuard } from './core/auth/guards/no-auth.guard';
import { platformAdminGuard } from './core/auth/guards/platform-admin.guard';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login-page.component').then((m) => m.LoginPageComponent),
    canActivate: [noAuthGuard],
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
        data: { breadcrumb: 'Dashboard' },
      },
      {
        path: 'vehicles',
        loadChildren: () =>
          import('./features/vehicles/vehicles.routes').then((m) => m.VEHICLE_ROUTES),
        data: { breadcrumb: 'Vehicles' },
      },
      {
        path: 'clients',
        loadChildren: () =>
          import('./features/clients/clients.routes').then((m) => m.CLIENT_ROUTES),
        data: { breadcrumb: 'Clients' },
      },
      {
        path: 'employees',
        loadChildren: () =>
          import('./features/employees/employees.routes').then((m) => m.EMPLOYEE_ROUTES),
        data: { breadcrumb: 'Employees' },
      },
      {
        path: 'branches',
        loadChildren: () =>
          import('./features/branches/branches.routes').then((m) => m.BRANCH_ROUTES),
        data: { breadcrumb: 'Poslovnice' },
      },
      {
        path: 'rentals',
        loadChildren: () =>
          import('./features/rentals/rentals.routes').then((m) => m.RENTAL_ROUTES),
        data: { breadcrumb: 'Rentals' },
      },
      {
        path: 'inspections',
        loadChildren: () =>
          import('./features/inspections/inspections.routes').then((m) => m.INSPECTION_ROUTES),
        data: { breadcrumb: 'Inspections' },
      },
      {
        path: 'damage-reports',
        loadChildren: () =>
          import('./features/damage-reports/damage-reports.routes').then(
            (m) => m.DAMAGE_REPORT_ROUTES,
          ),
        data: { breadcrumb: 'Damage Reports' },
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./features/profile/profile.routes').then((m) => m.PROFILE_ROUTES),
        data: { breadcrumb: 'Profile Settings' },
      },
      {
        path: 'billing',
        loadChildren: () =>
          import('./features/billing/billing.routes').then((m) => m.BILLING_ROUTES),
        data: { breadcrumb: 'Naplata' },
      },
      {
        path: 'service-book',
        loadChildren: () =>
          import('./features/service-book/service-book.routes').then(
            (m) => m.SERVICE_BOOK_ROUTES,
          ),
        data: { breadcrumb: 'Servisna knjiga' },
      },
      {
        path: 'platform',
        loadChildren: () =>
          import('./features/platform/platform.routes').then((m) => m.PLATFORM_ROUTES),
        canActivate: [platformAdminGuard],
        data: { breadcrumb: 'Platform' },
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
