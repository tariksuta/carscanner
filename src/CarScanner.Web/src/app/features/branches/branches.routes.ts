import { Routes } from '@angular/router';

export const BRANCH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/branch-list-page.component').then((m) => m.BranchListPageComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/branch-create-page.component').then((m) => m.BranchCreatePageComponent),
    data: { breadcrumb: 'Nova poslovnica' },
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/branch-edit-page.component').then((m) => m.BranchEditPageComponent),
    data: { breadcrumb: 'Uredi' },
  },
];
