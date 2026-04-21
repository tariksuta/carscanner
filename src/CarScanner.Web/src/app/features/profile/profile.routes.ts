import { Routes } from '@angular/router';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./profile-settings-page.component').then((m) => m.ProfileSettingsPageComponent),
  },
];
