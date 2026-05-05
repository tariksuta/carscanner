export interface NavItem {
  label: string;
  icon: string;
  route: string;
}

export interface NavGroup {
  label: string | null;
  items: NavItem[];
}

const PLATFORM_GROUP: NavGroup = {
  label: 'Platform',
  items: [
    { label: 'Tenanti', icon: 'building', route: '/platform/tenants' },
    { label: 'Pricing planovi', icon: 'tag', route: '/platform/pricing-plans' },
  ],
};

const TENANT_GROUPS: NavGroup[] = [
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
    label: 'Održavanje',
    items: [
      { label: 'Servisna knjiga', icon: 'wrench', route: '/service-book' },
      { label: 'Podsjetnici', icon: 'bell-ring', route: '/service-book/reminders' },
    ],
  },
  {
    label: 'Postavke',
    items: [
      { label: 'Poslovnice', icon: 'building-2', route: '/branches' },
      { label: 'Naplata', icon: 'wallet', route: '/billing' },
      { label: 'Profil', icon: 'user', route: '/profile' },
    ],
  },
];

export function getNavGroups(role: string | null | undefined): NavGroup[] {
  if (role === 'PlatformAdmin') {
    return [PLATFORM_GROUP, ...TENANT_GROUPS];
  }
  return TENANT_GROUPS;
}

/** @deprecated use getNavGroups(role). Zadržano za back-compat. */
export const NAV_GROUPS: NavGroup[] = TENANT_GROUPS;
