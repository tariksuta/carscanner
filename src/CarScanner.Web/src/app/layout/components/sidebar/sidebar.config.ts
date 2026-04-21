export interface NavItem {
  label: string;
  icon: string;
  route: string;
}

export interface NavGroup {
  label: string | null;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [{ label: 'Dashboard', icon: 'layout-dashboard', route: '/dashboard' }],
  },
  {
    label: 'Flota',
    items: [
      { label: 'Vozila', icon: 'car', route: '/vehicles' },
      { label: 'Klijenti', icon: 'users', route: '/clients' },
      { label: 'Zaposlenici', icon: 'user-cog', route: '/employees' },
    ],
  },
  {
    label: 'Operacije',
    items: [
      { label: 'Rentali', icon: 'key', route: '/rentals' },
      { label: 'Inspekcije', icon: 'clipboard-check', route: '/inspections' },
      { label: 'Izvještaji šteta', icon: 'shield-alert', route: '/damage-reports' },
    ],
  },
  {
    label: 'Postavke',
    items: [{ label: 'Profil', icon: 'user', route: '/profile' }],
  },
];
