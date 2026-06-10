/**
 * Shared sidebar navigation items used by all page containers.
 * Each item maps to a route in the app router.
 */
export const APP_NAV_ITEMS = [
  { id: 'dashboard',     label: 'Dashboard',     icon: 'dashboard',     href: '/dashboard' },
  { id: 'accounts',      label: 'Accounts',       icon: 'accounts',      href: '/accounts' },
  { id: 'transactions',  label: 'Transactions',   icon: 'transactions',  href: '/transactions' },
  { id: 'recurring',     label: 'Recurring',      icon: 'recurring',     href: '/transactions/recurring' },
  { id: 'budgets',       label: 'Budgets',        icon: 'budgets',       href: '/budgets' },
  { id: 'reports',       label: 'Reports',        icon: 'reports',       href: '/reports' },
  { id: 'notifications', label: 'Notifications',  icon: 'notifications', href: '/notifications' },
  { id: 'settings',      label: 'Settings',       icon: 'settings',      href: '/profile-settings' },
] as const
