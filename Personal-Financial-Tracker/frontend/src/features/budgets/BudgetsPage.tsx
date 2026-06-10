import { useSelector } from 'react-redux'
import { selectLanguage } from '../../store'
import {
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  Car,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Edit3,
  Home,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Plus,
  ReceiptText,
  Repeat,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  Utensils,
  WalletCards,
  type LucideIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export type BudgetsLanguage = 'en' | 'ar'
export type BudgetStatus = 'onTrack' | 'warning' | 'exceeded'

export interface BudgetsUser {
  initials: string
  name?: string
}

export interface BudgetsNavItem {
  id: string
  label: string
  mobileLabel?: string
  icon: BudgetsIconName
  href?: string
  isActive?: boolean
}

export interface BudgetSummaryItem {
  id: string
  label: string
  value: string
  icon: BudgetsIconName
  tone: 'primary' | 'secondary' | 'tertiary'
}

export interface BudgetCardItem {
  id: string
  title: string
  periodLabel: string
  spentLabel: string
  limitLabel: string
  progressLabel: string
  progressValue: number
  status: BudgetStatus
  icon: BudgetsIconName
}

export interface BudgetsPageData {
  user?: BudgetsUser
  navItems: BudgetsNavItem[]
  mobileNavItems: BudgetsNavItem[]
  summaryItems: BudgetSummaryItem[]
  budgets: BudgetCardItem[]
  monthLabel?: string
}

export interface BudgetsPageProps {
  data?: BudgetsPageData
  language?: BudgetsLanguage
  hasUnreadNotifications?: boolean
  languageToggleLabel?: string
  onAddBudget?: () => void
  onAddTransaction?: () => void
  onPreviousMonth?: () => void
  onNextMonth?: () => void
  onEditBudget?: (budgetId: string) => void
  onRollOverBudget?: (budgetId: string) => void
  onDeleteBudget?: (budgetId: string) => void
  onLogout?: () => void
}

type BudgetsIconName =
  | 'accounts'
  | 'analytics'
  | 'budgets'
  | 'dashboard'
  | 'dining'
  | 'education'
  | 'fitness'
  | 'groceries'
  | 'home'
  | 'more'
  | 'notifications'
  | 'recurring'
  | 'reports'
  | 'settings'
  | 'shopping'
  | 'transactions'
  | 'transportation'

const EN_TEXT = {
  appName: 'Personal Finance Tracker',
  sidebarTitle: 'PFT Admin',
  sidebarSubtitle: 'Portfolio Manager',
  pageTitle: 'Budgets',
  pageSubtitle: 'Manage your monthly spending limits.',
  addBudget: 'Add Budget',
  addTransaction: 'Add Transaction',
  logout: 'Logout',
  spentPrefix: 'Spent:',
  noBudgetsTitle: 'No budgets this month',
  noBudgetsDescription:
    "You haven't set up any budget limits for this month. Start tracking your spending by adding a new budget category.",
  createFirstBudget: 'Create First Budget',
  editAction: 'Edit',
  rollOverAction: 'Roll Over',
  deleteAction: 'Delete',
  notificationsAriaLabel: 'Notifications',
  previousMonthAriaLabel: 'Previous month',
  nextMonthAriaLabel: 'Next month',
}

const AR_TEXT = {
  appName: 'متتبع الشؤون المالية الشخصية',
  sidebarTitle: 'مسؤول PFT',
  sidebarSubtitle: 'مدير المحفظة',
  pageTitle: 'الميزانيات',
  pageSubtitle: 'إدارة حدود الإنفاق الشهرية الخاصة بك.',
  addBudget: 'إضافة ميزانية',
  addTransaction: 'إضافة معاملة',
  logout: 'تسجيل خروج',
  spentPrefix: 'المنفق:',
  noBudgetsTitle: 'لا توجد ميزانيات هذا الشهر',
  noBudgetsDescription: 'لم تقم بإعداد أي حدود للميزانية هذا الشهر. ابدأ بتتبع إنفاقك عن طريق إضافة فئة ميزانية جديدة.',
  createFirstBudget: 'إنشاء أول ميزانية',
  editAction: 'تعديل',
  rollOverAction: 'ترحيل',
  deleteAction: 'حذف',
  notificationsAriaLabel: 'الإشعارات',
  previousMonthAriaLabel: 'الشهر السابق',
  nextMonthAriaLabel: 'الشهر التالي',
};

export function useBudgetsPageText() {
  const language = useSelector(selectLanguage);
  return language === 'ar' ? AR_TEXT : EN_TEXT;
}


const ICONS: Record<BudgetsIconName, LucideIcon> = {
  accounts: Building2,
  analytics: BarChart3,
  budgets: WalletCards,
  dashboard: LayoutDashboard,
  dining: Utensils,
  education: BookOpen,
  fitness: Dumbbell,
  groceries: ShoppingCart,
  home: Home,
  more: MoreHorizontal,
  notifications: Bell,
  recurring: Repeat,
  reports: ReceiptText,
  settings: Settings,
  shopping: ShoppingBag,
  transactions: ReceiptText,
  transportation: Car,
}

const DEFAULT_DATA: BudgetsPageData = {
  navItems: [],
  mobileNavItems: [],
  summaryItems: [],
  budgets: [],
}

export function useBudgetsPageData(): BudgetsPageData {
  return DEFAULT_DATA
}

export function BudgetsPage({
  data,
  language = 'en',
  hasUnreadNotifications = false,
  languageToggleLabel,
  onAddBudget,
  onAddTransaction,
  onPreviousMonth,
  onNextMonth,
  onEditBudget,
  onRollOverBudget,
  onDeleteBudget,
  onLogout,
}: BudgetsPageProps) {
  const fallbackData = useBudgetsPageData()
  const pageData = data ?? fallbackData
  const isRtl = language === 'ar'

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          monthLabel={pageData.monthLabel}
          onAddBudget={onAddBudget}
          onPreviousMonth={onPreviousMonth}
          onNextMonth={onNextMonth}
        />

        <SummaryStrip items={pageData.summaryItems} />

        {pageData.budgets.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {pageData.budgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onEditBudget={onEditBudget}
                onRollOverBudget={onRollOverBudget}
                onDeleteBudget={onDeleteBudget}
              />
            ))}
          </div>
        ) : (
          <EmptyState onAddBudget={onAddBudget} />
        )}
      </div>
    </>
  )
}

function DesktopSidebar({
  navItems,
  user,
  onAddTransaction,
  onLogout,
}: {
  navItems: BudgetsNavItem[]
  user?: BudgetsUser
  onAddTransaction?: () => void
  onLogout?: () => void
}) {
    const TEXT_VAR = useBudgetsPageText();
  return (
    <nav className="fixed start-0 top-0 z-40 hidden h-screen w-64 flex-col gap-3 border-e border-[#bdc9c6] bg-white p-4 shadow-sm md:flex">
      <div className="mb-6 flex items-center gap-4 px-4 py-2">
        <UserInitials initials={user?.initials} size="large" />
        <div>
          <h1 className="text-xl font-bold text-[#005c55]">{TEXT_VAR.sidebarTitle}</h1>
          <p className="text-sm text-[#3e4947]">{TEXT_VAR.sidebarSubtitle}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const Icon = ICONS[item.icon]

          return (
            <a
              key={item.id}
              href={item.href ?? '#'}
              className={`flex items-center gap-4 rounded-lg px-4 py-3 text-xs font-semibold uppercase tracking-wide transition ${
                item.isActive
                  ? 'bg-[#0f766e] text-[#a3faef]'
                  : 'text-[#3e4947] hover:bg-[#dce9ff]'
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </a>
          )
        })}
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <button
          type="button"
          onClick={onAddTransaction}
          className="w-full rounded-lg bg-[#005c55] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#004943] focus:outline-none focus:ring-2 focus:ring-[#005c55] focus:ring-offset-2"
        >
          {TEXT_VAR.addTransaction}
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-4 rounded-lg px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#3e4947] transition hover:bg-[#dce9ff]"
        >
          <LogOut className="h-5 w-5" aria-hidden="true" />
          {TEXT_VAR.logout}
        </button>
      </div>
    </nav>
  )
}

function MobileTopNav({
  user,
  hasUnreadNotifications,
  languageToggleLabel,
}: {
  user?: BudgetsUser
  hasUnreadNotifications: boolean
  languageToggleLabel?: string
}) {
    const TEXT_VAR = useBudgetsPageText();
  return (
    <nav className="sticky top-0 z-40 flex w-full items-center justify-between bg-[#f8f9ff] px-4 py-4 shadow-sm md:hidden">
      <h1 className="text-base font-bold text-[#005c55] sm:text-xl">{TEXT_VAR.appName}</h1>
      <div className="flex items-center gap-3">
        {languageToggleLabel ? (
          <button type="button" className="text-sm text-[#3e4947] transition hover:text-[#005c55]">
            {languageToggleLabel}
          </button>
        ) : null}
        <button
          type="button"
          aria-label={TEXT_VAR.notificationsAriaLabel}
          className="relative text-[#005c55] transition hover:text-[#004943]"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {hasUnreadNotifications ? (
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[#f8f9ff] bg-[#fea619]" />
          ) : null}
        </button>
        <UserInitials initials={user?.initials} />
      </div>
    </nav>
  )
}

function PageHeader({
  monthLabel,
  onAddBudget,
  onPreviousMonth,
  onNextMonth,
}: {
  monthLabel?: string
  onAddBudget?: () => void
  onPreviousMonth?: () => void
  onNextMonth?: () => void
}) {
    const TEXT_VAR = useBudgetsPageText();
  return (
    <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h2 className="text-3xl font-semibold text-[#0b1c30]">{TEXT_VAR.pageTitle}</h2>
        <p className="mt-2 text-sm text-[#3e4947]">{TEXT_VAR.pageSubtitle}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {monthLabel ? (
          <div className="flex items-center rounded-lg border border-[#bdc9c6] bg-white p-1 shadow-sm">
            <MonthButton
              ariaLabel={TEXT_VAR.previousMonthAriaLabel}
              onClick={onPreviousMonth}
              icon={ChevronLeft}
            />
            <span className="min-w-28 px-4 text-center text-xs font-semibold uppercase tracking-wide text-[#0b1c30]">
              {monthLabel}
            </span>
            <MonthButton
              ariaLabel={TEXT_VAR.nextMonthAriaLabel}
              onClick={onNextMonth}
              icon={ChevronRight}
            />
          </div>
        ) : null}

        <button
          type="button"
          onClick={onAddBudget}
          className="flex items-center gap-2 rounded-lg bg-[#005c55] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#004943] focus:outline-none focus:ring-2 focus:ring-[#005c55] focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {TEXT_VAR.addBudget}
        </button>
      </div>
    </header>
  )
}

function MonthButton({
  ariaLabel,
  onClick,
  icon: Icon,
}: {
  ariaLabel: string
  onClick?: () => void
  icon: LucideIcon
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="rounded p-2 text-[#3e4947] transition hover:bg-[#e5eeff] hover:text-[#005c55]"
    >
      <Icon className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
    </button>
  )
}

function SummaryStrip({ items }: { items: BudgetSummaryItem[] }) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
      {items.map((item) => {
        const Icon = ICONS[item.icon]

        return (
          <article
            key={item.id}
            className="flex items-center gap-4 rounded-xl border border-[#bdc9c6] bg-white p-4 shadow-sm"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${summaryToneClass(
                item.tone,
              )}`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-[#3e4947]">{item.label}</p>
              <p className="text-xl font-semibold text-[#0b1c30]">{item.value}</p>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function BudgetCard({
  budget,
  onEditBudget,
  onRollOverBudget,
  onDeleteBudget,
}: {
  budget: BudgetCardItem
  onEditBudget?: (budgetId: string) => void
  onRollOverBudget?: (budgetId: string) => void
  onDeleteBudget?: (budgetId: string) => void
}) {
    const TEXT_VAR = useBudgetsPageText();
  const Icon = ICONS[budget.icon]
  const status = statusClasses(budget.status)
  const progressClass = progressWidthClass(budget.progressValue)

  return (
    <article className="group relative rounded-xl border border-[#bdc9c6] bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e5eeff] text-[#005c55]">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-xl font-semibold text-[#0b1c30]">{budget.title}</h3>
            <p className="text-sm text-[#3e4947]">{budget.periodLabel}</p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${status.badge}`}
        >
          {status.label}
        </span>
      </div>

      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-sm text-[#3e4947]">
          {TEXT_VAR.spentPrefix}{' '}
          <span className={`ms-1 text-xl font-semibold ${status.value}`}>
            {budget.spentLabel}
          </span>{' '}
          <span className="text-xs">/ {budget.limitLabel}</span>
        </p>
        <p className={`text-xs font-semibold uppercase tracking-wide ${status.value}`}>
          {budget.progressLabel}
        </p>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-[#e5eeff]">
        <div className={`h-2 rounded-full ${status.progress} ${progressClass}`} />
      </div>

      <div className="absolute end-4 top-4 flex gap-1 rounded-lg border border-[#bdc9c6] bg-white/90 p-1 opacity-100 shadow-sm backdrop-blur transition sm:opacity-0 sm:group-hover:opacity-100">
        <IconButton
          title={TEXT_VAR.editAction}
          icon={Edit3}
          onClick={() => onEditBudget?.(budget.id)}
        />
        <IconButton
          title={TEXT_VAR.rollOverAction}
          icon={Repeat}
          onClick={() => onRollOverBudget?.(budget.id)}
        />
        <IconButton
          title={TEXT_VAR.deleteAction}
          icon={Trash2}
          danger
          onClick={() => onDeleteBudget?.(budget.id)}
        />
      </div>
    </article>
  )
}

function IconButton({
  title,
  icon: Icon,
  danger = false,
  onClick,
}: {
  title: string
  icon: LucideIcon
  danger?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded p-1 transition ${
        danger ? 'text-[#3e4947] hover:text-[#ba1a1a]' : 'text-[#3e4947] hover:text-[#005c55]'
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  )
}

function EmptyState({ onAddBudget }: { onAddBudget?: () => void }) {
  const TEXT_VAR = useBudgetsPageText();

  return (
    <section className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-[#bdc9c6] bg-white p-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#e5eeff] text-[#6e7977]">
        <WalletCards className="h-8 w-8" aria-hidden="true" />
      </div>
      <h3 className="mb-2 text-2xl font-semibold text-[#0b1c30]">{TEXT_VAR.noBudgetsTitle}</h3>
      <p className="mb-6 max-w-md text-base text-[#3e4947]">{TEXT_VAR.noBudgetsDescription}</p>
      <button
        type="button"
        onClick={onAddBudget}
        className="flex items-center gap-2 rounded-lg bg-[#005c55] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#004943]"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        {TEXT_VAR.createFirstBudget}
      </button>
    </section>
  )
}

function MobileBottomNav({ items }: { items: BudgetsNavItem[] }) {
  if (items.length === 0) {
    return null
  }

  return (
    <nav className="fixed bottom-0 start-0 z-40 flex w-full items-center justify-around bg-white px-2 py-2 shadow-[0_-1px_3px_rgba(0,0,0,0.05)] md:hidden">
      {items.map((item) => {
        const Icon = ICONS[item.icon]

        return (
          <a
            key={item.id}
            href={item.href ?? '#'}
            className={`flex min-w-0 flex-1 flex-col items-center gap-1 p-2 text-[10px] font-medium transition ${
              item.isActive
                ? 'border-t-2 border-[#005c55] text-[#005c55]'
                : 'text-[#3e4947] hover:text-[#005c55]'
            }`}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            <span className="truncate">{item.mobileLabel ?? item.label}</span>
          </a>
        )
      })}
    </nav>
  )
}

function UserInitials({
  initials,
  size = 'default',
}: {
  initials?: string
  size?: 'default' | 'large'
}) {
  const sizeClass = size === 'large' ? 'h-10 w-10 text-base' : 'h-8 w-8 text-xs'

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-[#0f766e] font-bold text-[#a3faef] ${sizeClass}`}
    >
      {initials}
    </div>
  )
}

function summaryToneClass(tone: BudgetSummaryItem['tone']) {
  if (tone === 'secondary') {
    return 'bg-[#ffddb8] text-[#855300]'
  }

  if (tone === 'tertiary') {
    return 'bg-[#6ffbbe] text-[#005e3f]'
  }

  return 'bg-[#e5eeff] text-[#005c55]'
}

function statusClasses(status: BudgetStatus) {
  if (status === 'warning') {
    return {
      label: 'Warning',
      badge: 'bg-[#ffddb8] text-[#2a1700]',
      value: 'text-[#855300]',
      progress: 'bg-[#855300]',
    }
  }

  if (status === 'exceeded') {
    return {
      label: 'Exceeded',
      badge: 'bg-[#ffdad6] text-[#93000a]',
      value: 'text-[#ba1a1a]',
      progress: 'bg-[#ba1a1a]',
    }
  }

  return {
    label: 'On Track',
    badge: 'bg-[#6ffbbe] text-[#002113]',
    value: 'text-[#005e3f]',
    progress: 'bg-[#005e3f]',
  }
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

function BudgetsPageContainer() {
  const language = useSelector(selectLanguage)
  const navigate = useNavigate()
  const fallbackData = useBudgetsPageData()

  const navItems: BudgetsNavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
    { id: 'accounts', label: 'Accounts', icon: 'accounts', href: '/accounts' },
    { id: 'transactions', label: 'Transactions', icon: 'transactions', href: '/transactions' },
    { id: 'budgets', label: 'Budgets', icon: 'budgets', href: '/budgets', isActive: true },
    { id: 'reports', label: 'Reports', icon: 'reports', href: '/reports' },
    { id: 'settings', label: 'Settings', icon: 'settings', href: '/profile-settings' },
  ]

  return (
    <BudgetsPage
      language={language}
      data={{ ...fallbackData, navItems, mobileNavItems: navItems }}
      onAddBudget={() => alert('Add Budget – backend not connected yet')}
      onAddTransaction={() => alert('Add Transaction – backend not connected yet')}
      onLogout={() => navigate('/login')}
    />
  )
}

export default BudgetsPageContainer
