import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  ReceiptText,
  WalletCards,
  BarChart3,
  Settings,
  Bell,
  Repeat,
  LogOut,
  X,
  Menu,
} from 'lucide-react'

import { useSelector } from 'react-redux'
import { selectLanguage } from '../../store'

const EN_TEXT = {
  appName: 'PFT',
  appSubtitle: 'Personal Finance Tracker',
  dashboard: 'Dashboard',
  accounts: 'Accounts',
  transactions: 'Transactions',
  recurring: 'Recurring',
  budgets: 'Budgets',
  reports: 'Reports',
  notifications: 'Notifications',
  settings: 'Settings',
  logout: 'Logout',
}

const AR_TEXT = {
  appName: 'PFT',
  appSubtitle: 'متتبع الشؤون المالية الشخصية',
  dashboard: 'لوحة القيادة',
  accounts: 'الحسابات',
  transactions: 'المعاملات',
  recurring: 'متكررة',
  budgets: 'الميزانيات',
  reports: 'التقارير',
  notifications: 'الإشعارات',
  settings: 'الإعدادات',
  logout: 'تسجيل خروج',
}

interface AppSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const language = useSelector(selectLanguage)
  const text = language === 'ar' ? AR_TEXT : EN_TEXT

  const NAV_ITEMS = [
    { id: 'dashboard',    label: text.dashboard,     icon: LayoutDashboard, href: '/dashboard' },
    { id: 'accounts',     label: text.accounts,      icon: Building2,       href: '/accounts' },
    { id: 'transactions', label: text.transactions,  icon: ReceiptText,     href: '/transactions' },
    { id: 'recurring',    label: text.recurring,     icon: Repeat,          href: '/transactions/recurring' },
    { id: 'budgets',      label: text.budgets,       icon: WalletCards,     href: '/budgets' },
    { id: 'reports',      label: text.reports,       icon: BarChart3,       href: '/reports' },
    { id: 'notifications',label: text.notifications, icon: Bell,            href: '/notifications' },
    { id: 'settings',     label: text.settings,      icon: Settings,        href: '/profile-settings' },
  ]

  // Close on route change (mobile)
  useEffect(() => {
    onClose()
  }, [location.pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleLogout() {
    onClose()
    navigate('/login')
  }

  function isActive(href: string) {
    if (href === '/transactions') {
      // exact match only so /transactions/recurring doesn't also highlight Transactions
      return location.pathname === '/transactions'
    }
    return location.pathname.startsWith(href)
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-[#bdc9c6]/30 px-4 py-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#005c55] text-white shadow">
          <WalletCards className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-lg font-black leading-none text-[#005c55]">{text.appName}</p>
          <p className="text-[11px] font-semibold text-[#3e4947]">{text.appSubtitle}</p>
        </div>
        {/* Close button — mobile only */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="ms-auto rounded-full p-1.5 text-[#3e4947] transition hover:bg-[#f0f4ff] md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.id}
              to={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-150 active:scale-[.98] ${
                active
                  ? 'bg-[#0f766e] font-semibold text-[#a3faef] shadow-sm'
                  : 'text-[#3e4947] hover:bg-[#dce9ff] hover:text-[#0b1c30]'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
              {active && <span className="ms-auto h-1.5 w-1.5 rounded-full bg-[#a3faef]" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-[#bdc9c6]/30 px-3 pb-4 pt-2">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#ba1a1a] transition hover:bg-[#ffdad6]/60 active:scale-[.98]"
        >
          <LogOut className="h-5 w-5 shrink-0 rtl:rotate-180" aria-hidden="true" />
          <span>{text.logout}</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* ─── Desktop sidebar ─── */}
      <aside className="fixed inset-y-0 start-0 z-40 hidden w-60 flex-col border-e border-[#bdc9c6]/50 bg-white shadow-sm md:flex">
        {sidebarContent}
      </aside>

      {/* ─── Mobile overlay ─── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#0b1c30]/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Drawer */}
          <aside className="absolute inset-y-0 start-0 w-72 animate-slide-in bg-white shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}

/* ─── Hamburger toggle button (used in mobile header) ─── */
interface HamburgerProps {
  onClick: () => void
}

export function HamburgerButton({ onClick }: HamburgerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open navigation menu"
      className="rounded-full p-2 text-[#005c55] transition hover:bg-[#eff4ff] md:hidden"
    >
      <Menu className="h-6 w-6" aria-hidden="true" />
    </button>
  )
}
