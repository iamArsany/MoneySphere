import { useSelector } from 'react-redux'
import { selectLanguage } from '../../store'
import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import {
  Archive,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Bell,
  Building2,
  CreditCard,
  Globe2,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreVertical,
  Plus,
  ReceiptText,
  Repeat,
  Settings,
  TrendingUp,
  User,
  Wallet,
  WalletCards,
  type LucideIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export type AccountsLanguage = 'en' | 'ar'
export type AccountCardTone = 'primary' | 'secondary' | 'tertiary' | 'neutral'
export type AccountMetricTone = 'income' | 'expense' | 'secondary' | 'neutral'
export type AccountsIconName =
  | 'accounts'
  | 'budgets'
  | 'creditCard'
  | 'dashboard'
  | 'notifications'
  | 'recurring'
  | 'reports'
  | 'settings'
  | 'transactions'
  | 'wallet'

export interface AccountsUser {
  name: string
  avatarUrl?: string
  initials?: string
}

export interface AccountsNavItem {
  id: string
  label: string
  icon: AccountsIconName
  href?: string
  isActive?: boolean
}

export interface AccountsSummary {
  label: string
  balanceLabel: string
  currencyLabel: string
  trendLabel?: string
}

export interface AccountMetric {
  id: string
  label: string
  valueLabel: string
  tone?: AccountMetricTone
  icon?: 'in' | 'out' | 'percent'
}

export interface AccountListItem {
  id: string
  name: string
  typeLabel: string
  currencyLabel: string
  balanceLabel: string
  icon: AccountsIconName
  tone?: AccountCardTone
  metrics?: AccountMetric[]
  limitLabel?: string
  utilizationPercent?: number
  isArchived?: boolean
  archivedLabel?: string
}

export interface AccountsPageData {
  user?: AccountsUser
  navItems: AccountsNavItem[]
  summary?: AccountsSummary
  accounts: AccountListItem[]
}

export interface AccountsPageProps {
  data?: AccountsPageData
  language?: AccountsLanguage
  hasUnreadNotifications?: boolean
  onLanguageToggle?: () => void
  onMenuClick?: () => void
  onAddAccount?: () => void
  onAccountMenu?: (accountId: string) => void
  onArchiveAccount?: (accountId: string) => void
  onLogout?: () => void
}

interface SidebarProps {
  navItems: AccountsNavItem[]
}

interface TopHeaderProps {
  user?: AccountsUser
  hasUnreadNotifications: boolean
  onLanguageToggle?: () => void
  onMenuClick?: () => void
}

interface PageHeaderProps {
  onAddAccount?: () => void
}

interface SummaryHeroProps {
  summary?: AccountsSummary
}

interface AccountsGridProps {
  accounts: AccountListItem[]
  onAccountMenu?: (accountId: string) => void
  onArchiveAccount?: (accountId: string) => void
}

interface AccountCardProps {
  account: AccountListItem
  onAccountMenu?: (accountId: string) => void
  onArchiveAccount?: (accountId: string) => void
}

interface UserAvatarProps {
  user?: AccountsUser
}

const EN_TEXT = {
  appName: 'PFT',
  appSubtitle: 'Personal Finance Tracker',
  desktopTitle: 'My Accounts',
  mobileTitle: 'Accounts',
  addAccount: 'Add Account',
  logout: 'Logout',
  archived: 'Archived',
  archiveAccount: 'Archive Account',
  languageAriaLabel: 'Change language',
  notificationsAriaLabel: 'Notifications',
  menuAriaLabel: 'Open navigation',
  accountMenuAriaLabel: 'Open account actions',
  emptyNav: 'No navigation items available.',
  emptySummary: 'No account summary available.',
  emptyAccounts: 'No accounts available.',
}

const AR_TEXT = {
  appName: 'PFT',
  appSubtitle: 'متتبع الشؤون المالية الشخصية',
  desktopTitle: 'حساباتي',
  mobileTitle: 'الحسابات',
  addAccount: 'إضافة حساب',
  logout: 'تسجيل خروج',
  archived: 'مؤرشف',
  archiveAccount: 'أرشفة الحساب',
  languageAriaLabel: 'تغيير اللغة',
  notificationsAriaLabel: 'الإشعارات',
  menuAriaLabel: 'فتح القائمة',
  accountMenuAriaLabel: 'فتح إجراءات الحساب',
  emptyNav: 'لا تتوفر عناصر تنقل.',
  emptySummary: 'لا يتوفر ملخص للحساب.',
  emptyAccounts: 'لا تتوفر حسابات.',
};

export function useAccountsPageText() {
  const language = useSelector(selectLanguage);
  return language === 'ar' ? AR_TEXT : EN_TEXT;
}


const DEFAULT_DATA: AccountsPageData = {
  navItems: [],
  accounts: [],
}

const ICONS: Record<AccountsIconName, LucideIcon> = {
  accounts: Building2,
  budgets: WalletCards,
  creditCard: CreditCard,
  dashboard: LayoutDashboard,
  notifications: Bell,
  recurring: Repeat,
  reports: BarChart3,
  settings: Settings,
  transactions: ReceiptText,
  wallet: Wallet,
}

export function useAccountsPageData(): AccountsPageData {
  return DEFAULT_DATA
}

export function AccountsPage({
  data,
  language = 'en',
  hasUnreadNotifications = false,
  onLanguageToggle,
  onMenuClick,
  onAddAccount,
  onAccountMenu,
  onArchiveAccount,
  onLogout,
}: AccountsPageProps) {
  const fallbackData = useAccountsPageData()
  const pageData = data ?? fallbackData
  const isRtl = language === 'ar'

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader onAddAccount={onAddAccount} />
        <SummaryHero summary={pageData.summary} />
        <AccountsGrid
          accounts={pageData.accounts}
          onAccountMenu={onAccountMenu}
          onArchiveAccount={onArchiveAccount}
        />
      </div>
    </>
  )
}

function Sidebar({ navItems }: SidebarProps) {
  const TEXT_VAR = useAccountsPageText();

  return (
    <nav className="fixed start-0 top-0 z-30 hidden h-screen w-60 flex-col bg-white p-4 shadow-sm md:flex">
      <div className="mb-8 flex items-center gap-3 px-2 pt-1">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#005c55] text-white shadow-sm">
          <WalletCards className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-black leading-tight text-[#005c55]">{TEXT_VAR.appName}</h1>
          <p className="text-xs font-semibold text-[#3e4947]">{TEXT_VAR.appSubtitle}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-y-auto text-base">
        {navItems.length > 0 ? (
          navItems.map((item) => {
            const Icon = ICONS[item.icon]

            return (
              <a
                key={item.id}
                href={item.href ?? '#'}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 transition active:scale-95 ${
                  item.isActive
                    ? 'bg-[#0f766e] font-semibold text-[#a3faef]'
                    : 'text-[#3e4947] hover:bg-[#dce9ff] hover:text-[#0b1c30]'
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{item.label}</span>
              </a>
            )
          })
        ) : (
          <div className="rounded-lg border border-dashed border-[#bdc9c6] p-3 text-sm text-[#3e4947]">
            {TEXT_VAR.emptyNav}
          </div>
        )}
      </div>

      <a
        href="#"
        className="mt-auto flex items-center gap-3 border-t border-[#bdc9c6]/30 px-3 py-4 text-[#ba1a1a] transition hover:bg-[#ffdad6]/50"
      >
        <LogOut className="h-5 w-5" aria-hidden="true" />
        <span>{TEXT_VAR.logout}</span>
      </a>
    </nav>
  )
}

function TopHeader({
  user,
  hasUnreadNotifications,
  onLanguageToggle,
  onMenuClick,
}: TopHeaderProps) {
    const TEXT_VAR = useAccountsPageText();
  return (
    <header className="fixed inset-x-0 top-0 z-20 flex h-16 items-center justify-between bg-white px-4 shadow-sm md:start-60 md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={TEXT_VAR.menuAriaLabel}
          onClick={onMenuClick}
          className="rounded-full p-2 text-[#005c55] transition hover:bg-[#eff4ff] md:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <h2 className="hidden text-xl font-semibold text-[#0b1c30] md:block">{TEXT_VAR.desktopTitle}</h2>
        <h2 className="text-xl font-black text-[#005c55] md:hidden">{TEXT_VAR.appName}</h2>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={TEXT_VAR.languageAriaLabel}
          onClick={onLanguageToggle}
          className="rounded-full p-2 text-[#3e4947] transition hover:bg-[#eff4ff] hover:text-[#005c55]"
        >
          <Globe2 className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={TEXT_VAR.notificationsAriaLabel}
          className="relative rounded-full p-2 text-[#3e4947] transition hover:bg-[#eff4ff] hover:text-[#005c55]"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {hasUnreadNotifications ? (
            <span className="absolute end-2 top-2 h-2 w-2 rounded-full bg-[#fea619]" />
          ) : null}
        </button>
        <UserAvatar user={user} />
      </div>
    </header>
  )
}

function PageHeader({ onAddAccount }: PageHeaderProps) {
  const TEXT_VAR = useAccountsPageText();

  return (
    <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
      <h1 className="hidden text-2xl font-semibold text-[#0b1c30] md:block">{TEXT_VAR.desktopTitle}</h1>
      <h1 className="text-2xl font-semibold text-[#0b1c30] md:hidden">{TEXT_VAR.mobileTitle}</h1>
      <button
        type="button"
        onClick={onAddAccount}
        className="inline-flex items-center gap-2 rounded-lg bg-[#005c55] px-6 py-3 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#006a63] active:scale-95"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        {TEXT_VAR.addAccount}
      </button>
    </div>
  )
}

function SummaryHero({ summary }: SummaryHeroProps) {
  const TEXT_VAR = useAccountsPageText();

  if (!summary) {
    return <EmptyBlock message={TEXT_VAR.emptySummary} />
  }

  return (
    <section className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-[#005c55] to-[#005e3f] p-6 text-white shadow-md sm:p-8">
      <div className="absolute inset-0 bg-white/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-white/80">
            {summary.label}
          </p>
          <h2 className="text-4xl font-bold tracking-normal sm:text-5xl">
            {summary.balanceLabel}{' '}
            <span className="text-2xl font-normal text-white/60">{summary.currencyLabel}</span>
          </h2>
        </div>
        {summary.trendLabel ? (
          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-sm">
            <TrendingUp className="h-4 w-4 text-[#6ffbbe]" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wide text-white">
              {summary.trendLabel}
            </span>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function AccountsGrid({ accounts, onAccountMenu, onArchiveAccount }: AccountsGridProps) {
  const TEXT_VAR = useAccountsPageText();

  if (accounts.length === 0) {
    return <EmptyBlock message={TEXT_VAR.emptyAccounts} />
  }

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          onAccountMenu={onAccountMenu}
          onArchiveAccount={onArchiveAccount}
        />
      ))}
    </section>
  )
}

function AccountCard({ account, onAccountMenu, onArchiveAccount }: AccountCardProps) {
  const TEXT_VAR = useAccountsPageText();

  const Icon = ICONS[account.icon]
  const isArchived = account.isArchived === true

  return (
    <article
      className={`group relative overflow-hidden rounded-xl bg-white p-4 shadow-sm transition duration-300 ${
        isArchived
          ? 'border border-[#bdc9c6]/30 opacity-70 grayscale'
          : `border-t-4 hover:-translate-y-1 ${cardBorderClass(account.tone)}`
      }`}
    >
      {isArchived ? (
        <span className="absolute end-4 top-4 rounded border border-[#bdc9c6]/50 bg-[#d3e4fe] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#3e4947]">
          {TEXT_VAR.archived}
        </span>
      ) : null}

      <div className={`mb-4 flex items-start justify-between gap-3 ${isArchived ? 'pe-20' : ''}`}>
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconToneClass(
              account.tone,
              isArchived,
            )}`}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3
              className={`truncate text-xl font-semibold leading-tight ${
                isArchived ? 'text-[#3e4947]' : 'text-[#0b1c30]'
              }`}
            >
              {account.name}
            </h3>
            <p className={`text-sm ${isArchived ? 'text-[#6e7977]' : 'text-[#3e4947]'}`}>
              {account.typeLabel} / {account.currencyLabel}
            </p>
          </div>
        </div>

        {!isArchived ? (
          <button
            type="button"
            aria-label={TEXT_VAR.accountMenuAriaLabel}
            onClick={() => onAccountMenu?.(account.id)}
            className="rounded-full bg-[#e5eeff] p-2 text-[#3e4947] opacity-100 transition hover:text-[#0b1c30] sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
          >
            <MoreVertical className="h-5 w-5" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="mb-3">
        <p className={`text-2xl font-semibold ${isArchived ? 'text-[#3e4947]' : 'text-[#0b1c30]'}`}>
          {account.balanceLabel}
        </p>
        {account.limitLabel ? (
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#3e4947]">
            {account.limitLabel}
          </p>
        ) : null}
      </div>

      {typeof account.utilizationPercent === 'number' ? (
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-[#dce9ff]">
          <div
            className={`h-full rounded-full ${progressWidthClass(account.utilizationPercent)} ${progressToneClass(
              account.tone,
            )}`}
          />
        </div>
      ) : null}

      {account.metrics && account.metrics.length > 0 ? (
        <div className="flex gap-3 border-t border-[#bdc9c6]/30 pt-3">
          {account.metrics.map((metric) => (
            <MetricBlock key={metric.id} metric={metric} />
          ))}
        </div>
      ) : null}

      {isArchived && account.archivedLabel ? (
        <div className="border-t border-[#bdc9c6]/20 pt-3">
          <p className="text-sm italic text-[#6e7977]">{account.archivedLabel}</p>
        </div>
      ) : null}

      {!isArchived ? (
        <div className="absolute inset-x-0 bottom-0 flex h-12 translate-y-2 items-center justify-center bg-gradient-to-t from-[#d3e4fe] to-transparent opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onArchiveAccount?.(account.id)}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#005c55]"
          >
            <Archive className="h-4 w-4" aria-hidden="true" />
            {TEXT_VAR.archiveAccount}
          </button>
        </div>
      ) : null}
    </article>
  )
}

function MetricBlock({ metric }: { metric: AccountMetric }) {
  const Icon = metricIcon(metric.icon)

  return (
    <div className="flex flex-1 flex-col">
      <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[#3e4947]">
        {Icon ? <Icon className={`h-3.5 w-3.5 ${metricToneClass(metric.tone)}`} aria-hidden="true" /> : null}
        {metric.label}
      </span>
      <span className={`text-sm font-medium ${metricValueClass(metric.tone)}`}>
        {metric.valueLabel}
      </span>
    </div>
  )
}

function UserAvatar({ user }: UserAvatarProps) {
  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name}
        className="h-8 w-8 rounded-full border border-[#bdc9c6] object-cover"
      />
    )
  }

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#bdc9c6] bg-[#d3e4fe] text-xs font-semibold text-[#0b1c30]">
      {user?.initials ?? <User className="h-4 w-4" aria-hidden="true" />}
    </div>
  )
}

function EmptyBlock({ message }: { message: string }) {
  return (
    <section className="flex min-h-32 items-center justify-center rounded-xl border border-dashed border-[#bdc9c6] bg-white p-6 text-center text-sm text-[#3e4947]">
      {message}
    </section>
  )
}

function cardBorderClass(tone: AccountCardTone = 'primary') {
  if (tone === 'secondary') return 'border-t-[#fea619]'
  if (tone === 'tertiary') return 'border-t-[#005e3f]'
  if (tone === 'neutral') return 'border-t-[#bdc9c6]'
  return 'border-t-[#005c55]'
}

function iconToneClass(tone: AccountCardTone = 'primary', isArchived = false) {
  if (isArchived) return 'bg-[#e5eeff] text-[#3e4947]'
  if (tone === 'secondary') return 'bg-[#fea619]/20 text-[#855300]'
  if (tone === 'tertiary') return 'bg-[#007952]/20 text-[#005e3f]'
  if (tone === 'neutral') return 'bg-[#dce9ff] text-[#3e4947]'
  return 'bg-[#0f766e]/20 text-[#005c55]'
}

function progressToneClass(tone: AccountCardTone = 'primary') {
  if (tone === 'secondary') return 'bg-[#fea619]'
  if (tone === 'tertiary') return 'bg-[#005e3f]'
  if (tone === 'neutral') return 'bg-[#6e7977]'
  return 'bg-[#005c55]'
}

function metricIcon(icon: AccountMetric['icon']) {
  if (icon === 'in') return ArrowDown
  if (icon === 'out') return ArrowUp
  if (icon === 'percent') return TrendingUp
  return null
}

function metricToneClass(tone: AccountMetricTone = 'neutral') {
  if (tone === 'income') return 'text-[#005e3f]'
  if (tone === 'expense') return 'text-[#ba1a1a]'
  if (tone === 'secondary') return 'text-[#855300]'
  return 'text-[#3e4947]'
}

function metricValueClass(tone: AccountMetricTone = 'neutral') {
  if (tone === 'income') return 'text-[#005e3f]'
  if (tone === 'expense') return 'text-[#ba1a1a]'
  if (tone === 'secondary') return 'text-[#855300]'
  return 'text-[#0b1c30]'
}

function progressWidthClass(value: number) {
  const normalizedValue = Math.max(0, Math.min(100, value))

  if (normalizedValue <= 10) return 'w-[10%]'
  if (normalizedValue <= 20) return 'w-1/5'
  if (normalizedValue <= 30) return 'w-[30%]'
  if (normalizedValue <= 40) return 'w-2/5'
  if (normalizedValue <= 50) return 'w-1/2'
  if (normalizedValue <= 60) return 'w-3/5'
  if (normalizedValue <= 70) return 'w-[70%]'
  if (normalizedValue <= 80) return 'w-4/5'
  if (normalizedValue <= 90) return 'w-[90%]'
  return 'w-full'
}

function AccountsPageContainer() {
  const language = useSelector(selectLanguage)
  const navigate = useNavigate()
  
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [newAccName, setNewAccName] = useState('')
  const [newAccType, setNewAccType] = useState('bank')
  const [newAccBalance, setNewAccBalance] = useState('0')
  const [newAccCurrency, setNewAccCurrency] = useState('USD')
  const [submitting, setSubmitting] = useState(false)

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' as const, href: '/dashboard' },
    { id: 'accounts', label: 'Accounts', icon: 'accounts' as const, href: '/accounts', isActive: true },
    { id: 'transactions', label: 'Transactions', icon: 'transactions' as const, href: '/transactions' },
    { id: 'budgets', label: 'Budgets', icon: 'budgets' as const, href: '/budgets' },
    { id: 'reports', label: 'Reports', icon: 'reports' as const, href: '/reports' },
    { id: 'settings', label: 'Settings', icon: 'settings' as const, href: '/profile-settings' },
  ]

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/accounts')
      setAccounts(response.data.accounts || [])
    } catch (err) {
      console.error('Failed to fetch accounts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAccName) return
    setSubmitting(true)
    try {
      await api.post('/accounts', {
        accountName: newAccName,
        accountType: newAccType,
        initialBalance: parseFloat(newAccBalance) || 0,
        currency: newAccCurrency,
        color: '#005c55',
        icon: 'bank',
      })
      setShowAddModal(false)
      setNewAccName('')
      setNewAccBalance('0')
      fetchAccounts()
    } catch (err) {
      console.error('Failed to add account:', err)
      alert('Failed to add account')
    } finally {
      setSubmitting(false)
    }
  }

  const handleArchiveAccount = async (id: string) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من أرشفة/حذف هذا الحساب؟' : 'Are you sure you want to archive/delete this account?')) return
    try {
      await api.delete(`/accounts/${id}`)
      fetchAccounts()
    } catch (err) {
      console.error('Failed to archive account:', err)
      alert('Failed to archive account')
    }
  }

  const isAr = language === 'ar'
  let totalBalance = 0
  accounts.forEach((acc: any) => {
    totalBalance += parseFloat(acc.currentBalance) || 0
  })

  const summary = {
    label: isAr ? 'إجمالي الرصيد' : 'Total Balance',
    balanceLabel: totalBalance.toLocaleString(isAr ? 'ar-EG' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    currencyLabel: 'USD',
    trendLabel: isAr ? 'جميع الحسابات النشطة' : 'Across all active accounts',
  }

  const mappedAccounts = accounts.map((acc: any) => {
    let income = 0
    let expense = 0
    if (acc.transactions) {
      acc.transactions.forEach((t: any) => {
        if (t.type === 'income') income += parseFloat(t.amount) || 0
        if (t.type === 'expense') expense += parseFloat(t.amount) || 0
      })
    }
    const formatVal = (v: number) => {
      return `${v.toLocaleString(isAr ? 'ar-EG' : 'en-US', { minimumFractionDigits: 2 })} USD`
    }
    return {
      id: acc.id,
      name: acc.accountName,
      typeLabel: acc.accountType,
      currencyLabel: acc.currency,
      balanceLabel: formatVal(parseFloat(acc.currentBalance) || 0),
      icon: (acc.icon as AccountsIconName) || 'wallet',
      tone: acc.color === '#EF4444' ? 'secondary' as const : (acc.color === '#005e3f' ? 'tertiary' as const : 'primary' as const),
      isArchived: acc.isArchived,
      archivedLabel: isAr ? 'مؤرشف' : 'Archived',
      metrics: [
        {
          id: `inc-${acc.id}`,
          label: isAr ? 'الدخل' : 'Income',
          valueLabel: formatVal(income),
          tone: 'income' as const,
          icon: 'in' as const,
        },
        {
          id: `exp-${acc.id}`,
          label: isAr ? 'المصروفات' : 'Expense',
          valueLabel: formatVal(expense),
          tone: 'expense' as const,
          icon: 'out' as const,
        }
      ]
    }
  })

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9ff]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#005c55] border-t-transparent"></div>
      </div>
    )
  }

  return (
    <>
      <AccountsPage
        language={language}
        data={{ summary, accounts: mappedAccounts, navItems }}
        onAddAccount={() => setShowAddModal(true)}
        onAccountMenu={(id) => navigate(`/accounts/${id}`)}
        onArchiveAccount={handleArchiveAccount}
        onLogout={() => {
          api.post('/auth/logout').finally(() => {
            api.defaults.headers.common['Authorization'] = ''
            localStorage.removeItem('pft.auth')
            window.location.href = '/login'
          })
        }}
      />

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1c30]/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-[#bdc9c6] bg-white p-6 shadow-2xl" dir={isAr ? 'rtl' : 'ltr'}>
            <h3 className="text-xl font-bold text-[#005c55] mb-4">
              {isAr ? 'إضافة حساب جديد' : 'Create New Account'}
            </h3>
            <form onSubmit={handleAddAccount} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase text-[#0b1c30]">
                  {isAr ? 'إسم الحساب' : 'Account Name'}
                </span>
                <input
                  type="text"
                  required
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="w-full rounded-lg border border-[#bdc9c6] bg-[#eff4ff] p-3 text-base text-[#0b1c30] outline-none"
                  placeholder={isAr ? 'مثال: حساب البنك الشخصي' : 'e.g. Checking Account'}
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase text-[#0b1c30]">
                  {isAr ? 'نوع الحساب' : 'Account Type'}
                </span>
                <select
                  value={newAccType}
                  onChange={(e) => setNewAccType(e.target.value)}
                  className="w-full rounded-lg border border-[#bdc9c6] bg-[#eff4ff] p-3 text-base text-[#0b1c30] outline-none"
                >
                  <option value="bank">{isAr ? 'بنكي' : 'Bank'}</option>
                  <option value="cash">{isAr ? 'نقدي' : 'Cash'}</option>
                  <option value="credit">{isAr ? 'بطاقة ائتمان' : 'Credit Card'}</option>
                  <option value="savings">{isAr ? 'توفير' : 'Savings'}</option>
                  <option value="investment">{isAr ? 'استثمار' : 'Investment'}</option>
                  <option value="custom">{isAr ? 'مخصص' : 'Custom'}</option>
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase text-[#0b1c30]">
                  {isAr ? 'الرصيد الإبتدائي' : 'Initial Balance'}
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newAccBalance}
                  onChange={(e) => setNewAccBalance(e.target.value)}
                  className="w-full rounded-lg border border-[#bdc9c6] bg-[#eff4ff] p-3 text-base text-[#0b1c30] outline-none"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase text-[#0b1c30]">
                  {isAr ? 'العملة' : 'Currency'}
                </span>
                <input
                  type="text"
                  required
                  value={newAccCurrency}
                  onChange={(e) => setNewAccCurrency(e.target.value)}
                  className="w-full rounded-lg border border-[#bdc9c6] bg-[#eff4ff] p-3 text-base text-[#0b1c30] outline-none"
                  maxLength={3}
                />
              </label>

              <div className="flex gap-3 mt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#bdc9c6] rounded-lg text-sm font-semibold text-[#3e4947] hover:bg-[#f8f9ff]"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#005c55] text-white rounded-lg text-sm font-semibold hover:bg-[#0f766e] disabled:opacity-50"
                >
                  {submitting ? (isAr ? 'جاري الإضافة...' : 'Adding...') : (isAr ? 'إضافة' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default AccountsPageContainer
