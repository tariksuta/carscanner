import { Routes } from '@angular/router';

export const SERVICE_BOOK_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/service-book-overview-page.component').then(
        (m) => m.ServiceBookOverviewPageComponent,
      ),
  },
  {
    path: 'records',
    loadComponent: () =>
      import('./pages/service-records-list-page.component').then(
        (m) => m.ServiceRecordsListPageComponent,
      ),
    data: { breadcrumb: 'Servisni zapisi' },
  },
  {
    path: 'records/new',
    loadComponent: () =>
      import('./pages/service-record-create-page.component').then(
        (m) => m.ServiceRecordCreatePageComponent,
      ),
    data: { breadcrumb: 'Novi servis' },
  },
  {
    path: 'records/:id/edit',
    loadComponent: () =>
      import('./pages/service-record-edit-page.component').then(
        (m) => m.ServiceRecordEditPageComponent,
      ),
    data: { breadcrumb: 'Uredi' },
  },
  {
    path: 'reminders',
    loadComponent: () =>
      import('./pages/reminders-list-page.component').then((m) => m.RemindersListPageComponent),
    data: { breadcrumb: 'Podsjetnici' },
  },
];
