import { useSelector } from 'react-redux'
import { selectLanguage } from '../../store'
import {
  AlertTriangle,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCheck,
  ChevronRight,
  Clock3,
  Info,
  LogIn,
  type LucideIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export type NotificationsLanguage = 'en' | 'ar'

export interface NotificationsNavItem {
  id: string
  label: string
  href?: string
  isActive?: boolean
}

export interface NotificationsFilterTab {
  id: string
  label: string
  isActive?: boolean
  onSelect?: () => void
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  timeLabel: string
  icon: NotificationIconName
  tone: NotificationTone
  isUnread?: boolean
  onOpen?: () => void
}

export interface NotificationsFooterLink {
  id: string
  label: string
  href?: string
}

export interface NotificationsPageData {
  navItems: NotificationsNavItem[]
  tabs: NotificationsFilterTab[]
  notifications: NotificationItem[]
  footerLinks: NotificationsFooterLink[]
  archiveMessage?: string
  copyrightLabel?: string
}

export interface NotificationsPageProps {
  data?: NotificationsPageData
  language?: NotificationsLanguage
  languageToggleLabel?: string
  onLanguageToggle?: () => void
  onLogin?: () => void
  onMarkAllAsRead?: () => void
}

type NotificationIconName =
  | 'alert'
  | 'budget'
  | 'calendar'
  | 'info'
  | 'notifications'
  | 'summary'

type NotificationTone = 'primary' | 'secondary' | 'error' | 'neutral'

const EN_TEXT = {
  brand: 'PFT',
  pageTitle: 'Notifications',
  pageSubtitle: 'Stay updated on your financial activities.',
  login: 'Login',
  markAllAsRead: 'Mark All as Read',
  emptyTitle: 'No notifications yet',
  emptyDescription: 'Important account and budget updates will appear here.',
  archiveFallback: 'Notifications older than 90 days are archived.',
  openNotificationAriaLabel: 'Open notification',
}

const AR_TEXT = {
  brand: 'PFT',
  pageTitle: 'الإشعارات',
  pageSubtitle: 'ابق على اطلاع دائم بأنشطتك المالية.',
  login: 'تسجيل الدخول',
  markAllAsRead: 'تحديد الكل كمقروء',
  emptyTitle: 'لا توجد إشعارات بعد',
  emptyDescription: 'ستظهر التحديثات الهامة للحساب والميزانية هنا.',
  archiveFallback: 'يتم أرشفة الإشعارات التي يزيد عمرها عن 90 يومًا.',
  openNotificationAriaLabel: 'فتح الإشعار',
};

export function useNotificationsPageText() {
  const language = useSelector(selectLanguage);
  return language === 'ar' ? AR_TEXT : EN_TEXT;
}


const ICONS: Record<NotificationIconName, LucideIcon> = {
  alert: AlertTriangle,
  budget: Bell,
  calendar: CalendarDays,
  info: Info,
  notifications: Bell,
  summary: BarChart3,
}

const DEFAULT_DATA: NotificationsPageData = {
  navItems: [],
  tabs: [],
  notifications: [],
  footerLinks: [],
}

export function useNotificationsPageData(): NotificationsPageData {
  return DEFAULT_DATA
}

export function NotificationsPage({
  data,
  language: _language = 'en',
  languageToggleLabel: _languageToggleLabel,
  onLanguageToggle: _onLanguageToggle,
  onLogin: _onLogin,
  onMarkAllAsRead,
}: NotificationsPageProps) {
  const fallbackData = useNotificationsPageData()
  const pageData = data ?? fallbackData

  return (
    <>
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader onMarkAllAsRead={onMarkAllAsRead} />
        <FilterTabs tabs={pageData.tabs} />

        {pageData.notifications.length > 0 ? (
          <div className="flex flex-col gap-3">
            {pageData.notifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function TopNav({
  navItems,
  languageToggleLabel,
  onLanguageToggle,
  onLogin,
}: {
  navItems: NotificationsNavItem[]
  languageToggleLabel?: string
  onLanguageToggle?: () => void
  onLogin?: () => void
}) {
    const TEXT_VAR = useNotificationsPageText();
  return (
    <header className="sticky top-0 z-50 bg-[#f8f9ff] shadow-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="text-2xl font-bold text-[#005c55]">{TEXT_VAR.brand}</div>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href ?? '#'}
              className={`text-lg font-semibold transition ${
                item.isActive ? 'text-[#005c55]' : 'text-[#3e4947] hover:text-[#005c55]'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {languageToggleLabel ? (
            <button
              type="button"
              onClick={onLanguageToggle}
              className="text-sm text-[#0b1c30] transition hover:text-[#005c55]"
            >
              {languageToggleLabel}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onLogin}
            className="inline-flex items-center gap-2 rounded bg-[#005c55] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#0f766e]"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            {TEXT_VAR.login}
          </button>
        </div>
      </div>
    </header>
  )
}

function PageHeader({ onMarkAllAsRead }: { onMarkAllAsRead?: () => void }) {
  const TEXT_VAR = useNotificationsPageText();

  return (
    <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 className="mb-2 text-3xl font-semibold text-[#0b1c30]">{TEXT_VAR.pageTitle}</h1>
        <p className="text-sm text-[#3e4947]">{TEXT_VAR.pageSubtitle}</p>
      </div>
      <button
        type="button"
        onClick={onMarkAllAsRead}
        className="flex items-center gap-2 rounded border border-[#005c55] bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#005c55] transition hover:bg-[#eff4ff]"
      >
        <CheckCheck className="h-4 w-4" aria-hidden="true" />
        {TEXT_VAR.markAllAsRead}
      </button>
    </div>
  )
}

function FilterTabs({ tabs }: { tabs: NotificationsFilterTab[] }) {
  if (tabs.length === 0) {
    return null
  }

  return (
    <div className="mb-6 flex gap-4 overflow-x-auto border-b border-[#bdc9c6] pb-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={tab.onSelect}
          className={`whitespace-nowrap px-4 py-2 text-lg font-semibold transition ${
            tab.isActive
              ? 'border-b-2 border-[#005c55] text-[#005c55]'
              : 'text-[#3e4947] hover:text-[#005c55]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

function NotificationCard({ notification }: { notification: NotificationItem }) {
  const TEXT_VAR = useNotificationsPageText();

  const Icon = ICONS[notification.icon]
  const tone = toneClasses(notification.tone)

  return (
    <button
      type="button"
      onClick={notification.onOpen}
      className={`group relative flex w-full items-start gap-4 rounded-lg border p-4 text-left transition hover:shadow-sm ${
        notification.isUnread
          ? 'border-[#80d5cb] bg-[#eff4ff]'
          : 'border-[#bdc9c6] bg-white'
      }`}
    >
      {notification.isUnread ? (
        <span className="absolute end-4 top-4 h-2 w-2 rounded-full bg-[#005c55]" />
      ) : null}

      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone.icon}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-col justify-between gap-1 sm:flex-row sm:items-start">
          <h2 className="text-xl font-semibold text-[#0b1c30]">{notification.title}</h2>
          <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-[#3e4947]">
            {notification.timeLabel}
          </span>
        </div>
        <p className="text-sm leading-6 text-[#3e4947]">{notification.message}</p>
      </div>

      <ChevronRight
        className="mt-1 h-5 w-5 shrink-0 text-[#6e7977] transition group-hover:text-[#005c55] rtl:rotate-180"
        aria-label={TEXT_VAR.openNotificationAriaLabel}
      />
    </button>
  )
}

function EmptyState() {
  const TEXT_VAR = useNotificationsPageText();

  return (
    <section className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-[#bdc9c6] bg-white p-8 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#e5eeff] text-[#005c55]">
        <Bell className="h-7 w-7" aria-hidden="true" />
      </div>
      <h2 className="mb-2 text-2xl font-semibold text-[#0b1c30]">{TEXT_VAR.emptyTitle}</h2>
      <p className="max-w-md text-sm text-[#3e4947]">{TEXT_VAR.emptyDescription}</p>
    </section>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ArchiveBanner({ message }: { message: string }) {
  return (
    <div className="mt-6 flex items-center gap-2 rounded-lg bg-[#e5eeff] p-4 text-[#3e4947]">
      <Clock3 className="h-5 w-5 text-[#005c55]" aria-hidden="true" />
      <p className="text-sm">{message}</p>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Footer({
  links,
  copyrightLabel,
}: {
  links: NotificationsFooterLink[]
  copyrightLabel?: string
}) {
    const TEXT_VAR = useNotificationsPageText();
  return (
    <footer className="mt-auto border-t border-[#bdc9c6] bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:px-6 md:flex-row lg:px-8">
        <div className="text-xl font-bold text-[#005c55]">{TEXT_VAR.brand}</div>
        {links.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-4">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.href ?? '#'}
                className="text-sm text-[#3e4947] transition hover:text-[#855300]"
              >
                {link.label}
              </a>
            ))}
          </div>
        ) : null}
        {copyrightLabel ? (
          <div className="text-center text-sm text-[#3e4947] md:text-right">{copyrightLabel}</div>
        ) : null}
      </div>
    </footer>
  )
}

function toneClasses(tone: NotificationTone) {
  if (tone === 'secondary') {
    return {
      icon: 'bg-[#ffddb8] text-[#855300]',
    }
  }

  if (tone === 'error') {
    return {
      icon: 'bg-[#ffdad6] text-[#ba1a1a]',
    }
  }

  if (tone === 'neutral') {
    return {
      icon: 'bg-[#d3e4fe] text-[#3e4947]',
    }
  }

  return {
    icon: 'bg-[#dce9ff] text-[#005c55]',
  }
}

function NotificationsPageContainer() {
  const language = useSelector(selectLanguage)
  const navigate = useNavigate()
  const fallbackData = useNotificationsPageData()

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { id: 'accounts', label: 'Accounts', href: '/accounts' },
    { id: 'transactions', label: 'Transactions', href: '/transactions' },
    { id: 'budgets', label: 'Budgets', href: '/budgets' },
    { id: 'reports', label: 'Reports', href: '/reports' },
  ]

  return (
    <NotificationsPage
      language={language}
      data={{ ...fallbackData, navItems }}
      onLogin={() => navigate('/login')}
      onMarkAllAsRead={() => alert('Mark All as Read – backend not connected yet')}
    />
  )
}

export default NotificationsPageContainer
