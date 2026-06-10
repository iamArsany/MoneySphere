import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AppSidebar, HamburgerButton } from './AppSidebar'
import { Bell, Globe2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { selectLanguage, setLanguage } from '../../store'

const EN_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/accounts': 'Accounts',
  '/transactions': 'Transactions',
  '/transactions/recurring': 'Recurring',
  '/budgets': 'Budgets',
  '/reports': 'Reports',
  '/reports/preview': 'Report Preview',
  '/notifications': 'Notifications',
  '/profile-settings': 'Settings',
  '/admin': 'Admin Dashboard',
  '/admin/users': 'Users',
}

const AR_TITLES: Record<string, string> = {
  '/dashboard': 'لوحة القيادة',
  '/accounts': 'الحسابات',
  '/transactions': 'المعاملات',
  '/transactions/recurring': 'متكررة',
  '/budgets': 'الميزانيات',
  '/reports': 'التقارير',
  '/reports/preview': 'معاينة التقرير',
  '/notifications': 'الإشعارات',
  '/profile-settings': 'الإعدادات',
  '/admin': 'لوحة تحكم المسؤول',
  '/admin/users': 'المستخدمين',
}

function getPageTitle(pathname: string, language: 'en' | 'ar'): string {
  const titles = language === 'ar' ? AR_TITLES : EN_TITLES
  // exact match first
  if (titles[pathname]) return titles[pathname]
  // prefix match (e.g. /accounts/123)
  const match = Object.keys(titles).find((k) => pathname.startsWith(k + '/'))
  return match ? titles[match] : 'PFT'
}

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const dispatch = useDispatch()
  const language = useSelector(selectLanguage)
  const pageTitle = getPageTitle(location.pathname, language)

  return (
    <div className="min-h-screen bg-[#f8f9ff] font-sans text-[#0b1c30]">
      {/* Global sidebar */}
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area — pushed right on desktop */}
      <div className="flex min-h-screen flex-col md:ms-60">
        {/* ─── Top header ─── */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#bdc9c6]/50 bg-white px-4 shadow-sm sm:px-6">
          <div className="flex items-center gap-3">
            {/* Hamburger (mobile only) */}
            <HamburgerButton onClick={() => setSidebarOpen(true)} />
            {/* App name on mobile, page title on desktop */}
            <span className="text-xl font-black text-[#005c55] md:hidden">PFT</span>
            <h1 className="hidden text-xl font-semibold text-[#0b1c30] md:block">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => dispatch(setLanguage(language === 'en' ? 'ar' : 'en'))}
              aria-label="Change language"
              className="rounded-full p-2 text-[#3e4947] transition hover:bg-[#eff4ff] hover:text-[#005c55]"
            >
              <Globe2 className="h-5 w-5" aria-hidden="true" />
            </button>
            <Link
              to="/notifications"
              aria-label="Notifications"
              className="relative rounded-full p-2 text-[#3e4947] transition hover:bg-[#eff4ff] hover:text-[#005c55]"
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex flex-1 flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
