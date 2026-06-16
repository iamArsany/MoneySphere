import { useSelector } from 'react-redux'
import { selectLanguage } from '../../store'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  Coffee,
  Globe2,
  Home,
  LayoutDashboard,
  LogOut,
  MoreVertical,
  PlusCircle,
  ReceiptText,
  Repeat,
  Settings,
  ShoppingBag,
  Utensils,
  WalletCards,
  Wifi,
  Dumbbell,
  PlayCircle,
  type LucideIcon,
} from 'lucide-react'

export type DashboardLanguage = 'en' | 'ar'
export type DashboardTrendTone = 'positive' | 'negative' | 'neutral'
export type DashboardStatTone = 'primary' | 'secondary' | 'tertiary' | 'danger'
export type DashboardCategoryTone = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'neutral'
export type DashboardTransactionType = 'income' | 'expense' | 'transfer'
export type DashboardBudgetStatus = 'onTrack' | 'warning' | 'exceeded'

export interface DashboardUser {
  name: string
  avatarUrl?: string
  initials?: string
}

export interface DashboardNavItem {
  id: string
  label: string
  icon: DashboardIconName
  href?: string
  isActive?: boolean
}

export interface DashboardPeriodOption {
  id: string
  label: string
  isActive?: boolean
}

export interface DashboardStatCard {
  id: string
  label: string
  valueLabel: string
  helperLabel?: string
  trendLabel?: string
  trendTone?: DashboardTrendTone
  icon: DashboardIconName
  tone: DashboardStatTone
}

export interface DashboardChartBar {
  id: string
  label: string
  incomePercent: number
  expensePercent: number
}

export interface DashboardCategoryShare {
  id: string
  label: string
  valueLabel: string
  tone: DashboardCategoryTone
}

export interface DashboardTransaction {
  id: string
  title: string
  timestampLabel: string
  amountLabel: string
  type: DashboardTransactionType
  icon: DashboardIconName
}

export interface DashboardBudget {
  id: string
  label: string
  amountLabel: string
  progressValue: number
  status: DashboardBudgetStatus
  statusLabel: string
  icon: DashboardIconName
}

export interface DashboardRecurringItem {
  id: string
  title: string
  dueLabel: string
  amountLabel: string
  icon: DashboardIconName
}

export interface DashboardPageData {
  user?: DashboardUser
  navItems: DashboardNavItem[]
  periodOptions: DashboardPeriodOption[]
  stats: DashboardStatCard[]
  chartBars: DashboardChartBar[]
  categoryShares: DashboardCategoryShare[]
  recentTransactions: DashboardTransaction[]
  activeBudgets: DashboardBudget[]
  upcomingRecurring: DashboardRecurringItem[]
}

export interface DashboardPageProps {
  data?: DashboardPageData
  language?: DashboardLanguage
  hasUnreadNotifications?: boolean
  onLanguageToggle?: () => void
  onPeriodChange?: (periodId: string) => void
  onChartMenu?: () => void
  onCategoryMenu?: () => void
  onViewAllTransactions?: () => void
  onAddBudget?: () => void
  onManageRecurring?: () => void
}

interface DesktopSidebarProps {
  navItems: DashboardNavItem[]
}

interface DesktopHeaderProps {
  user?: DashboardUser
  hasUnreadNotifications: boolean
  onLanguageToggle?: () => void
}

interface MobileHeaderProps {
  user?: DashboardUser
  hasUnreadNotifications: boolean
  onLanguageToggle?: () => void
}

interface NotificationButtonProps {
  hasUnreadNotifications: boolean
}

interface PeriodSelectorProps {
  options: DashboardPeriodOption[]
  onPeriodChange?: (periodId: string) => void
}

interface StatGridProps {
  stats: DashboardStatCard[]
}

interface StatCardProps {
  stat: DashboardStatCard
}

interface IncomeExpenseChartProps {
  bars: DashboardChartBar[]
  onChartMenu?: () => void
}

interface CategorySharePanelProps {
  shares: DashboardCategoryShare[]
  onCategoryMenu?: () => void
}

interface RecentTransactionsProps {
  transactions: DashboardTransaction[]
  onViewAllTransactions?: () => void
}

interface ActiveBudgetsProps {
  budgets: DashboardBudget[]
  onAddBudget?: () => void
}

interface UpcomingRecurringProps {
  items: DashboardRecurringItem[]
  onManageRecurring?: () => void
}

interface EmptyPanelProps {
  message: string
}

interface PanelHeaderProps {
  title: string
  ariaLabel: string
  onMenuClick?: () => void
}

interface UserAvatarProps {
  user?: DashboardUser
}

type DashboardIconName =
  | 'accounts'
  | 'budgets'
  | 'calendar'
  | 'category'
  | 'coffee'
  | 'dashboard'
  | 'dining'
  | 'expense'
  | 'fitness'
  | 'home'
  | 'income'
  | 'language'
  | 'notifications'
  | 'recurring'
  | 'reports'
  | 'settings'
  | 'shopping'
  | 'subscriptions'
  | 'transactions'
  | 'wallet'
  | 'wifi'

const EN_TEXT = {
  appName: 'PFT',
  appSubtitle: 'Personal Finance Tracker',
  pageTitle: 'Dashboard',
  logout: 'Logout',
  customPeriod: 'Custom',
  incomeVsExpensesTitle: 'Income vs Expenses',
  spendingByCategoryTitle: 'Spending by Category',
  recentTransactionsTitle: 'Recent Transactions',
  activeBudgetsTitle: 'Active Budgets',
  upcomingTitle: 'Upcoming (7 Days)',
  viewAll: 'View All',
  manageSubscriptions: 'Manage Subscriptions',
  languageAriaLabel: 'Change language',
  notificationsAriaLabel: 'Notifications',
  chartMenuAriaLabel: 'Open income and expenses chart menu',
  categoryMenuAriaLabel: 'Open category chart menu',
  addBudgetAriaLabel: 'Add budget',
  fullCategoryShare: '100%',
  noPeriods: 'No period filters available.',
  noStats: 'No dashboard summary available.',
  noChartData: 'No income or expense history available.',
  noCategoryData: 'No category spending available.',
  noTransactions: 'No recent transactions available.',
  noBudgets: 'No active budgets available.',
  noRecurring: 'No upcoming recurring transactions.',
}

const AR_TEXT = {
  appName: 'PFT',
  appSubtitle: 'متتبع الشؤون المالية الشخصية',
  pageTitle: 'لوحة القيادة',
  logout: 'تسجيل خروج',
  customPeriod: 'مخصص',
  incomeVsExpensesTitle: 'الدخل مقابل النفقات',
  spendingByCategoryTitle: 'الإنفاق حسب الفئة',
  recentTransactionsTitle: 'المعاملات الأخيرة',
  activeBudgetsTitle: 'الميزانيات النشطة',
  upcomingTitle: 'القادمة (7 أيام)',
  viewAll: 'عرض الكل',
  manageSubscriptions: 'إدارة الاشتراكات',
  languageAriaLabel: 'تغيير اللغة',
  notificationsAriaLabel: 'الإشعارات',
  chartMenuAriaLabel: 'فتح قائمة الرسم البياني للدخل والنفقات',
  categoryMenuAriaLabel: 'فتح قائمة الرسم البياني للفئات',
  addBudgetAriaLabel: 'إضافة ميزانية',
  fullCategoryShare: '100%',
  noPeriods: 'لا تتوفر فلاتر للفترة.',
  noStats: 'لا يتوفر ملخص للوحة القيادة.',
  noChartData: 'لا يتوفر سجل للدخل أو النفقات.',
  noCategoryData: 'لا يتوفر إنفاق للفئات.',
  noTransactions: 'لا تتوفر معاملات أخيرة.',
  noBudgets: 'لا تتوفر ميزانيات نشطة.',
  noRecurring: 'لا تتوفر معاملات متكررة قادمة.',
};

export function useDashboardPageText() {
  const language = useSelector(selectLanguage);
  return language === 'ar' ? AR_TEXT : EN_TEXT;
}


const ICONS: Record<DashboardIconName, LucideIcon> = {
  accounts: Building2,
  budgets: WalletCards,
  calendar: CalendarDays,
  category: BarChart3,
  coffee: Coffee,
  dashboard: LayoutDashboard,
  dining: Utensils,
  expense: ArrowDown,
  fitness: Dumbbell,
  home: Home,
  income: ArrowUp,
  language: Globe2,
  notifications: Bell,
  recurring: Repeat,
  reports: ReceiptText,
  settings: Settings,
  shopping: ShoppingBag,
  subscriptions: PlayCircle,
  transactions: ReceiptText,
  wallet: WalletCards,
  wifi: Wifi,
}

const DEFAULT_DATA: DashboardPageData = {
  navItems: [],
  periodOptions: [],
  stats: [],
  chartBars: [],
  categoryShares: [],
  recentTransactions: [],
  activeBudgets: [],
  upcomingRecurring: [],
}

export function useDashboardPageData(): DashboardPageData {
  return DEFAULT_DATA
}

export function DashboardPage({
  data,
  language = 'en',
  hasUnreadNotifications = false,
  onLanguageToggle,
  onPeriodChange,
  onChartMenu,
  onCategoryMenu,
  onViewAllTransactions,
  onAddBudget,
  onManageRecurring,
}: DashboardPageProps) {
  const fallbackData = useDashboardPageData()
  const pageData = data ?? fallbackData
  const isRtl = language === 'ar'

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <PeriodSelector options={pageData.periodOptions} onPeriodChange={onPeriodChange} />
        <StatGrid stats={pageData.stats} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <IncomeExpenseChart bars={pageData.chartBars} onChartMenu={onChartMenu} />
          <CategorySharePanel shares={pageData.categoryShares} onCategoryMenu={onCategoryMenu} />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <RecentTransactions
            transactions={pageData.recentTransactions}
            onViewAllTransactions={onViewAllTransactions}
          />
          <ActiveBudgets budgets={pageData.activeBudgets} onAddBudget={onAddBudget} />
          <UpcomingRecurring
            items={pageData.upcomingRecurring}
            onManageRecurring={onManageRecurring}
          />
        </div>
      </div>
    </>
  )
}

function DesktopSidebar({ navItems }: DesktopSidebarProps) {
  const TEXT_VAR = useDashboardPageText();

  return (
    <nav className="fixed start-0 top-0 z-40 hidden h-screen w-60 flex-col border-e border-[#bdc9c6] bg-white p-4 shadow-sm md:flex">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-black text-[#005c55]">{TEXT_VAR.appName}</h1>
        <p className="mt-1 text-sm text-[#3e4947]">{TEXT_VAR.appSubtitle}</p>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const Icon = ICONS[item.icon]

          return (
            <a
              key={item.id}
              href={item.href ?? '#'}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                item.isActive
                  ? 'bg-[#0f766e] text-[#a3faef]'
                  : 'text-[#3e4947] hover:bg-[#dce9ff] hover:text-[#0b1c30]'
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.label}</span>
            </a>
          )
        })}
      </div>

      <a
        href="#"
        className="mt-auto flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-[#3e4947] transition hover:bg-[#dce9ff] hover:text-[#0b1c30]"
      >
        <LogOut className="h-5 w-5" aria-hidden="true" />
        <span>{TEXT_VAR.logout}</span>
      </a>
    </nav>
  )
}

function DesktopHeader({
  user,
  hasUnreadNotifications,
  onLanguageToggle,
}: DesktopHeaderProps) {
    const TEXT_VAR = useDashboardPageText();
  return (
    <header className="fixed end-0 start-60 top-0 z-30 hidden h-16 items-center justify-between border-b border-[#bdc9c6] bg-white px-6 shadow-sm md:flex">
      <h2 className="text-xl font-semibold text-[#005c55]">{TEXT_VAR.pageTitle}</h2>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={TEXT_VAR.languageAriaLabel}
          onClick={onLanguageToggle}
          className="rounded-full p-2 text-[#3e4947] transition hover:bg-[#eff4ff] hover:text-[#005c55]"
        >
          <Globe2 className="h-5 w-5" aria-hidden="true" />
        </button>
        <NotificationButton hasUnreadNotifications={hasUnreadNotifications} />
        <UserAvatar user={user} />
      </div>
    </header>
  )
}

function MobileHeader({
  user,
  hasUnreadNotifications,
  onLanguageToggle,
}: MobileHeaderProps) {
    const TEXT_VAR = useDashboardPageText();
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#bdc9c6] bg-white px-4 py-4 shadow-sm md:hidden">
      <div>
        <p className="text-lg font-black text-[#005c55]">{TEXT_VAR.appName}</p>
        <p className="text-xs text-[#3e4947]">{TEXT_VAR.pageTitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={TEXT_VAR.languageAriaLabel}
          onClick={onLanguageToggle}
          className="rounded-full p-2 text-[#3e4947] transition hover:bg-[#eff4ff]"
        >
          <Globe2 className="h-5 w-5" aria-hidden="true" />
        </button>
        <NotificationButton hasUnreadNotifications={hasUnreadNotifications} />
        <UserAvatar user={user} />
      </div>
    </header>
  )
}

function NotificationButton({ hasUnreadNotifications }: NotificationButtonProps) {
  const TEXT_VAR = useDashboardPageText();

  return (
    <button
      type="button"
      aria-label={TEXT_VAR.notificationsAriaLabel}
      className="relative rounded-full p-2 text-[#3e4947] transition hover:bg-[#eff4ff] hover:text-[#005c55]"
    >
      <Bell className="h-5 w-5" aria-hidden="true" />
      {hasUnreadNotifications ? (
        <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#fea619] rtl:left-2 rtl:right-auto" />
      ) : null}
    </button>
  )
}

function PeriodSelector({ options, onPeriodChange }: PeriodSelectorProps) {
  const TEXT_VAR = useDashboardPageText();

  if (options.length === 0) {
    return <EmptyPanel message={TEXT_VAR.noPeriods} />
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onPeriodChange?.(option.id)}
          className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold uppercase transition ${
            option.isActive
              ? 'bg-[#005c55] text-white'
              : 'border border-[#bdc9c6] bg-white text-[#0b1c30] hover:bg-[#eff4ff]'
          }`}
        >
          {option.label}
        </button>
      ))}
      <button
        type="button"
        className="flex shrink-0 items-center gap-2 rounded-full border border-[#bdc9c6] bg-white px-4 py-2 text-xs font-semibold uppercase text-[#0b1c30] transition hover:bg-[#eff4ff]"
      >
        <CalendarDays className="h-4 w-4" aria-hidden="true" />
        {TEXT_VAR.customPeriod}
      </button>
    </div>
  )
}

function StatGrid({ stats }: StatGridProps) {
  const TEXT_VAR = useDashboardPageText();

  if (stats.length === 0) {
    return <EmptyPanel message={TEXT_VAR.noStats} />
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.id} stat={stat} />
      ))}
    </div>
  )
}

function StatCard({ stat }: StatCardProps) {
  const Icon = ICONS[stat.icon]

  return (
    <article className="flex min-h-32 flex-col justify-between rounded-xl border border-[#cbdbf5] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm text-[#3e4947]">{stat.label}</span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${statToneClass(stat.tone)}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>

      <div>
        <p className="text-2xl font-semibold text-[#0b1c30]">{stat.valueLabel}</p>
        {stat.trendLabel ? (
          <p className={`mt-1 flex items-center gap-1 text-xs font-semibold ${trendToneClass(stat.trendTone)}`}>
            {stat.trendTone === 'negative' ? (
              <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {stat.trendLabel}
          </p>
        ) : (
          <p className="mt-1 text-xs font-semibold text-[#3e4947]">{stat.helperLabel}</p>
        )}
      </div>
    </article>
  )
}

function IncomeExpenseChart({ bars, onChartMenu }: IncomeExpenseChartProps) {
  const TEXT_VAR = useDashboardPageText();

  return (
    <section className="rounded-xl border border-[#cbdbf5] bg-white p-4 shadow-sm sm:p-6 xl:col-span-2">
      <PanelHeader
        title={TEXT_VAR.incomeVsExpensesTitle}
        ariaLabel={TEXT_VAR.chartMenuAriaLabel}
        onMenuClick={onChartMenu}
      />

      {bars.length > 0 ? (
        <div className="mt-4 flex h-72 items-end justify-between gap-3 rounded-lg border border-dashed border-[#bdc9c6] bg-[#eff4ff] px-4 pb-6 pt-8">
          {bars.map((bar) => (
            <div key={bar.id} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
              <div className="flex h-full items-end gap-1">
                <span className={`w-3 rounded-t bg-[#005c55] sm:w-5 ${heightClass(bar.incomePercent)}`} />
                <span className={`w-3 rounded-t bg-[#855300] sm:w-5 ${heightClass(bar.expensePercent)}`} />
              </div>
              <span className="w-full truncate text-center text-xs font-medium text-[#3e4947]">{bar.label}</span>
            </div>
          ))}
        </div>
      ) : (
        <EmptyPanel message={TEXT_VAR.noChartData} />
      )}
    </section>
  )
}

function CategorySharePanel({ shares, onCategoryMenu }: CategorySharePanelProps) {
  const TEXT_VAR = useDashboardPageText();

  return (
    <section className="rounded-xl border border-[#cbdbf5] bg-white p-4 shadow-sm sm:p-6">
      <PanelHeader
        title={TEXT_VAR.spendingByCategoryTitle}
        ariaLabel={TEXT_VAR.categoryMenuAriaLabel}
        onMenuClick={onCategoryMenu}
      />

      {shares.length > 0 ? (
        <>
          <div className="my-5 flex items-center justify-center">
            <div className="flex h-32 w-32 items-center justify-center rounded-full border-[12px] border-[#005c55] border-b-[#ba1a1a] border-r-[#005e3f] border-t-[#855300]">
              <span className="text-2xl font-semibold text-[#0b1c30]">
                {TEXT_VAR.fullCategoryShare}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {shares.map((share) => (
              <div key={share.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <span className={`h-3 w-3 shrink-0 rounded-full ${categoryDotClass(share.tone)}`} />
                  <span className="truncate text-[#0b1c30]">{share.label}</span>
                </div>
                <span className="shrink-0 text-[#3e4947]">{share.valueLabel}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <EmptyPanel message={TEXT_VAR.noCategoryData} />
      )}
    </section>
  )
}

function RecentTransactions({ transactions, onViewAllTransactions }: RecentTransactionsProps) {
  const TEXT_VAR = useDashboardPageText();

  return (
    <section className="overflow-hidden rounded-xl border border-[#cbdbf5] bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-[#cbdbf5] bg-[#f8f9ff] p-4">
        <h3 className="text-xl font-semibold text-[#0b1c30]">{TEXT_VAR.recentTransactionsTitle}</h3>
        <button
          type="button"
          onClick={onViewAllTransactions}
          className="shrink-0 text-xs font-semibold uppercase text-[#005c55] hover:underline"
        >
          {TEXT_VAR.viewAll}
        </button>
      </div>

      {transactions.length > 0 ? (
        <div className="divide-y divide-[#cbdbf5]">
          {transactions.map((transaction) => {
            const Icon = ICONS[transaction.icon]

            return (
              <article
                key={transaction.id}
                className="flex items-center justify-between gap-3 p-4 transition hover:bg-[#eff4ff]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${transactionIconClass(transaction.type)}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[#0b1c30]">{transaction.title}</p>
                    <p className="text-sm text-[#3e4947]">{transaction.timestampLabel}</p>
                  </div>
                </div>
                <span className={`shrink-0 font-semibold ${amountClass(transaction.type)}`}>
                  {transaction.amountLabel}
                </span>
              </article>
            )
          })}
        </div>
      ) : (
        <EmptyPanel message={TEXT_VAR.noTransactions} />
      )}
    </section>
  )
}

function ActiveBudgets({ budgets, onAddBudget }: ActiveBudgetsProps) {
  const TEXT_VAR = useDashboardPageText();

  return (
    <section className="rounded-xl border border-[#cbdbf5] bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-[#cbdbf5] bg-[#f8f9ff] p-4">
        <h3 className="text-xl font-semibold text-[#0b1c30]">{TEXT_VAR.activeBudgetsTitle}</h3>
        <button
          type="button"
          aria-label={TEXT_VAR.addBudgetAriaLabel}
          onClick={onAddBudget}
          className="rounded-full p-1 text-[#005c55] transition hover:bg-[#eff4ff]"
        >
          <PlusCircle className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {budgets.length > 0 ? (
        <div className="space-y-5 p-4">
          {budgets.map((budget) => {
            const Icon = ICONS[budget.icon]
            const status = budgetStatusClasses(budget.status)

            return (
              <article key={budget.id}>
                <div className="mb-2 flex items-end justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Icon className={`h-4 w-4 shrink-0 ${status.text}`} aria-hidden="true" />
                    <span className="truncate text-sm font-medium text-[#0b1c30]">{budget.label}</span>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-[#3e4947]">{budget.amountLabel}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#d3e4fe]">
                  <div className={`h-full rounded-full ${status.bar} ${widthClass(budget.progressValue)}`} />
                </div>
                <p className={`mt-1 text-end text-xs font-semibold ${status.text}`}>
                  {budget.statusLabel}
                </p>
              </article>
            )
          })}
        </div>
      ) : (
        <EmptyPanel message={TEXT_VAR.noBudgets} />
      )}
    </section>
  )
}

function UpcomingRecurring({ items, onManageRecurring }: UpcomingRecurringProps) {
  const TEXT_VAR = useDashboardPageText();

  return (
    <section className="overflow-hidden rounded-xl border border-[#cbdbf5] bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-[#cbdbf5] bg-[#f8f9ff] p-4">
        <h3 className="text-xl font-semibold text-[#0b1c30]">{TEXT_VAR.upcomingTitle}</h3>
        <CalendarDays className="h-5 w-5 text-[#3e4947]" aria-hidden="true" />
      </div>

      {items.length > 0 ? (
        <div className="space-y-3 p-4">
          {items.map((item) => {
            const Icon = ICONS[item.icon]

            return (
              <article
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-[#bdc9c6] bg-[#f8f9ff] p-3 transition hover:bg-[#eff4ff]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[#d3e4fe] text-[#3e4947]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#0b1c30]">{item.title}</p>
                    <p className="text-xs font-semibold text-[#3e4947]">{item.dueLabel}</p>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-semibold text-[#0b1c30]">{item.amountLabel}</span>
              </article>
            )
          })}
        </div>
      ) : (
        <EmptyPanel message={TEXT_VAR.noRecurring} />
      )}

      <div className="border-t border-[#cbdbf5] p-3 text-center">
        <button
          type="button"
          onClick={onManageRecurring}
          className="text-xs font-semibold uppercase text-[#005c55] hover:underline"
        >
          {TEXT_VAR.manageSubscriptions}
        </button>
      </div>
    </section>
  )
}

function PanelHeader({
  title,
  ariaLabel: _ariaLabel,
  onMenuClick: _onMenuClick,
}: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-xl font-semibold text-[#0b1c30]">{title}</h3>
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
      {user?.initials}
    </div>
  )
}

function EmptyPanel({ message }: EmptyPanelProps) {
  return (
    <div className="flex min-h-28 items-center justify-center rounded-lg border border-dashed border-[#bdc9c6] bg-white p-6 text-center text-sm text-[#3e4947]">
      {message}
    </div>
  )
}

function statToneClass(tone: DashboardStatTone) {
  if (tone === 'secondary') return 'bg-[#ffddb8] text-[#855300]'
  if (tone === 'tertiary') return 'bg-[#6ffbbe] text-[#005e3f]'
  if (tone === 'danger') return 'bg-[#ffdad6] text-[#ba1a1a]'
  return 'bg-[#d3e4fe] text-[#005c55]'
}

function trendToneClass(tone: DashboardTrendTone = 'neutral') {
  if (tone === 'positive') return 'text-[#005e3f]'
  if (tone === 'negative') return 'text-[#ba1a1a]'
  return 'text-[#3e4947]'
}

function categoryDotClass(tone: DashboardCategoryTone) {
  if (tone === 'secondary') return 'bg-[#855300]'
  if (tone === 'tertiary') return 'bg-[#005e3f]'
  if (tone === 'danger') return 'bg-[#ba1a1a]'
  if (tone === 'neutral') return 'bg-[#6e7977]'
  return 'bg-[#005c55]'
}

function transactionIconClass(type: DashboardTransactionType) {
  if (type === 'income') return 'bg-[#007952]/10 text-[#005e3f]'
  if (type === 'expense') return 'bg-[#d3e4fe] text-[#3e4947]'
  return 'bg-[#ffddb8] text-[#855300]'
}

function amountClass(type: DashboardTransactionType) {
  if (type === 'income') return 'text-[#005e3f]'
  if (type === 'expense') return 'text-[#0b1c30]'
  return 'text-[#855300]'
}

function budgetStatusClasses(status: DashboardBudgetStatus) {
  if (status === 'warning') return { bar: 'bg-[#855300]', text: 'text-[#855300]' }
  if (status === 'exceeded') return { bar: 'bg-[#ba1a1a]', text: 'text-[#ba1a1a]' }
  return { bar: 'bg-[#005e3f]', text: 'text-[#005e3f]' }
}

function widthClass(value: number) {
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

function heightClass(value: number) {
  const normalizedValue = Math.max(0, Math.min(100, value))

  if (normalizedValue <= 10) return 'h-[10%]'
  if (normalizedValue <= 20) return 'h-1/5'
  if (normalizedValue <= 30) return 'h-[30%]'
  if (normalizedValue <= 40) return 'h-2/5'
  if (normalizedValue <= 50) return 'h-1/2'
  if (normalizedValue <= 60) return 'h-3/5'
  if (normalizedValue <= 70) return 'h-[70%]'
  if (normalizedValue <= 80) return 'h-4/5'
  if (normalizedValue <= 90) return 'h-[90%]'
  return 'h-full'
}

function DashboardPageContainer() {
  const language = useSelector(selectLanguage)
  const isAr = language === 'ar'
  const authState = useSelector((state: any) => state.auth)
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('1m')
  const [showCustomPicker, setShowCustomPicker] = useState(false)
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' as const, href: '/dashboard', isActive: true },
    { id: 'accounts', label: 'Accounts', icon: 'accounts' as const, href: '/accounts' },
    { id: 'transactions', label: 'Transactions', icon: 'transactions' as const, href: '/transactions' },
    { id: 'budgets', label: 'Budgets', icon: 'budgets' as const, href: '/budgets' },
    { id: 'reports', label: 'Reports', icon: 'reports' as const, href: '/reports' },
    { id: 'settings', label: 'Settings', icon: 'settings' as const, href: '/profile-settings' },
  ]

  useEffect(() => {
    let active = true
    const fetchData = async () => {
      try {
        setLoading(true)
        const now = new Date()
        let dateFrom = ''
        let dateTo = new Date().toISOString().split('T')[0]
        if (selectedPeriod === '1m') {
          const d = new Date(); d.setDate(d.getDate() - 30)
          dateFrom = d.toISOString().split('T')[0]
        } else if (selectedPeriod === '6m') {
          const d = new Date(); d.setMonth(d.getMonth() - 6)
          dateFrom = d.toISOString().split('T')[0]
        } else if (selectedPeriod === '1y') {
          const d = new Date(); d.setFullYear(d.getFullYear() - 1)
          dateFrom = d.toISOString().split('T')[0]
        } else if (selectedPeriod === 'custom' && customFrom) {
          dateFrom = customFrom
          if (customTo) dateTo = customTo
        }
        const txUrl = dateFrom
          ? `/transactions?limit=100&startDate=${dateFrom}&endDate=${dateTo}`
          : '/transactions?limit=100'
        const [accountsRes, transactionsRes, budgetsRes, recurringRes] = await Promise.all([
          api.get('/accounts'),
          api.get(txUrl),
          api.get('/budgets'),
          api.get('/recurring'),
        ])

        if (!active) return

        const accounts = accountsRes.data.accounts || []
        const transactions = transactionsRes.data.transactions || []
        const budgets = budgetsRes.data.budgets || []
        const recurring = recurringRes.data.recurringTemplates || recurringRes.data.recurring || []

        let totalBalance = 0
        let totalIncome = 0
        let totalExpense = 0

        accounts.forEach((acc: any) => {
          totalBalance += parseFloat(acc.currentBalance) || 0
        })

        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()

        transactions.forEach((tx: any) => {
          const txDate = new Date(tx.transactionDate)
          if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
            if (tx.type === 'income') {
              totalIncome += parseFloat(tx.amount) || 0
            } else if (tx.type === 'expense') {
              totalExpense += parseFloat(tx.amount) || 0
            }
          }
        })

        const currency = authState.user?.preferredCurrency || 'USD'
        const formatMoney = (val: number) => {
          return `${val.toLocaleString(isAr ? 'ar-EG' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
        }

        const periodOptions = [
          { id: '1m', label: isAr ? 'آخر شهر' : 'Last Month', isActive: selectedPeriod === '1m' },
          { id: '6m', label: isAr ? 'آخر ٦ أشهر' : 'Last 6 Months', isActive: selectedPeriod === '6m' },
          { id: '1y', label: isAr ? 'آخر سنة' : 'Last Year', isActive: selectedPeriod === '1y' },
        ]

        const stats = [
          {
            id: 'networth',
            label: isAr ? 'صافي الثروة' : 'Net Worth',
            valueLabel: formatMoney(totalBalance),
            trendLabel: isAr ? 'جميع الحسابات النشطة' : 'Across active accounts',
            trendTone: 'neutral' as const,
            tone: 'primary' as const,
            icon: 'wallet' as const,
          },
          {
            id: 'income',
            label: isAr ? 'دخل الشهر' : 'Monthly Income',
            valueLabel: formatMoney(totalIncome),
            trendLabel: isAr ? 'هذا الشهر' : 'This month',
            trendTone: totalIncome > 0 ? 'positive' as const : 'neutral' as const,
            tone: 'tertiary' as const,
            icon: 'income' as const,
          },
          {
            id: 'expense',
            label: isAr ? 'مصروفات الشهر' : 'Monthly Expense',
            valueLabel: formatMoney(totalExpense),
            trendLabel: isAr ? 'هذا الشهر' : 'This month',
            trendTone: totalExpense > 0 ? 'negative' as const : 'neutral' as const,
            tone: 'danger' as const,
            icon: 'expense' as const,
          }
        ]

        const months = isAr 
          ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
          : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        const chartBars = Array.from({ length: 6 }, (_, i) => {
          const d = new Date()
          d.setMonth(d.getMonth() - (5 - i))
          const mIdx = d.getMonth()
          const label = months[mIdx]
          
          let inc = 0
          let exp = 0
          transactions.forEach((tx: any) => {
            const txDate = new Date(tx.transactionDate)
            if (txDate.getMonth() === mIdx && txDate.getFullYear() === d.getFullYear()) {
              if (tx.type === 'income') inc += parseFloat(tx.amount) || 0
              if (tx.type === 'expense') exp += parseFloat(tx.amount) || 0
            }
          })
          const max = Math.max(inc, exp)
          return {
            id: `chart-${i}`,
            label,
            incomePercent: max > 0 ? Math.round((inc / max) * 100) : 0,
            expensePercent: max > 0 ? Math.round((exp / max) * 100) : 0,
          }
        })

        const categoryMap: Record<string, { name: string; amount: number; color: string }> = {}
        transactions.forEach((tx: any) => {
          if (tx.type === 'expense' && tx.category) {
            const catId = tx.category.id
            const catName = isAr ? tx.category.nameAr : tx.category.nameEn
            if (!categoryMap[catId]) {
              categoryMap[catId] = { name: catName, amount: 0, color: tx.category.color || '#3b82f6' }
            }
            categoryMap[catId].amount += parseFloat(tx.amount) || 0
          }
        })
        const categoryShares = Object.values(categoryMap).map((item, idx) => {
          const tones: DashboardCategoryTone[] = ['primary', 'secondary', 'tertiary', 'danger', 'neutral']
          return {
            id: `share-${idx}`,
            label: item.name,
            valueLabel: formatMoney(item.amount),
            tone: tones[idx % tones.length],
          }
        })

        const recentTransactions = transactions.slice(0, 5).map((tx: any) => {
          const date = new Date(tx.transactionDate)
          const catName = tx.category ? (isAr ? tx.category.nameAr : tx.category.nameEn) : (isAr ? 'بدون تصنيف' : 'Uncategorized')
          return {
            id: tx.id,
            title: tx.description || catName,
            timestampLabel: date.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' }),
            amountLabel: `${tx.type === 'expense' ? '-' : ''}${formatMoney(parseFloat(tx.amount))}`,
            type: tx.type === 'expense' ? 'expense' as const : (tx.type === 'income' ? 'income' as const : 'transfer' as const),
            icon: 'transactions' as const,
          }
        })

        const activeBudgets = budgets.map((b: any) => {
          const limit = parseFloat(b.amount) || 0
          let spent = 0
          transactions.forEach((tx: any) => {
            const txDate = new Date(tx.transactionDate)
            if (tx.type === 'expense' && tx.categoryId === b.categoryId && txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
              spent += parseFloat(tx.amount) || 0
            }
          })
          const percentUsed = limit > 0 ? Math.round((spent / limit) * 100) : 0
          const status = percentUsed >= 100 ? 'exceeded' as const : (percentUsed >= 80 ? 'warning' as const : 'onTrack' as const)
          const statusLabel = isAr 
            ? (percentUsed >= 100 ? 'تجاوزت الميزانية' : percentUsed >= 80 ? 'قريب من الحد' : 'في النطاق')
            : (percentUsed >= 100 ? 'Exceeded limit' : percentUsed >= 80 ? 'Approaching limit' : 'On Track')
          
          return {
            id: b.id,
            label: isAr ? b.category?.nameAr : b.category?.nameEn,
            amountLabel: formatMoney(limit),
            progressValue: Math.min(100, percentUsed),
            status,
            statusLabel,
            icon: 'budgets' as const,
          }
        })

        const upcomingRecurring = recurring.slice(0, 5).map((r: any) => {
          const nextRun = new Date(r.nextRunDate)
          return {
            id: r.id,
            title: r.description || (isAr ? 'معاملة دورية' : 'Recurring Template'),
            dueLabel: nextRun.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' }),
            amountLabel: formatMoney(parseFloat(r.amount)),
            icon: 'recurring' as const,
          }
        })

        setData({
          user: authState.user ? {
            name: authState.user.name,
            avatarUrl: authState.user.avatarUrl,
            initials: authState.user.initials,
          } : undefined,
          navItems,
          periodOptions,
          stats,
          chartBars,
          categoryShares,
          recentTransactions,
          activeBudgets,
          upcomingRecurring,
        })
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchData()
    return () => {
      active = false
    }
  }, [language, authState.user, selectedPeriod, customFrom, customTo])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9ff]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#005c55] border-t-transparent"></div>
      </div>
    )
  }

  const handlePeriodChange = (id: string) => {
    if (id === 'custom') {
      setShowCustomPicker(true)
    } else {
      setSelectedPeriod(id)
      setShowCustomPicker(false)
    }
  }

  return (
    <>
      {showCustomPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-bold text-[#0b1c30]">{isAr ? 'نطاق مخصص' : 'Custom Date Range'}</h3>
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase text-[#3e4947]">{isAr ? 'من' : 'From'}</span>
                <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                  className="rounded-lg border border-[#bdc9c6] px-3 py-2.5 text-sm outline-none focus:border-[#005c55]" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase text-[#3e4947]">{isAr ? 'إلى' : 'To'}</span>
                <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                  className="rounded-lg border border-[#bdc9c6] px-3 py-2.5 text-sm outline-none focus:border-[#005c55]" />
              </label>
            </div>
            <div className="mt-4 flex gap-3">
              <button type="button" onClick={() => setShowCustomPicker(false)}
                className="flex-1 rounded-lg border border-[#bdc9c6] py-2.5 text-sm font-semibold text-[#3e4947] hover:bg-[#f8f9ff]">
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button type="button" onClick={() => { setSelectedPeriod('custom'); setShowCustomPicker(false) }}
                className="flex-1 rounded-lg bg-[#005c55] py-2.5 text-sm font-semibold text-white hover:bg-[#004943]">
                {isAr ? 'تطبيق' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      )}
      <DashboardPage
        language={language}
        data={data || { navItems, periodOptions: [], stats: [], chartBars: [], categoryShares: [], recentTransactions: [], activeBudgets: [], upcomingRecurring: [] }}
        onPeriodChange={handlePeriodChange}
        onViewAllTransactions={() => navigate('/transactions')}
        onAddBudget={() => navigate('/budgets')}
        onManageRecurring={() => navigate('/transactions/recurring')}
      />
    </>
  )
}

export default DashboardPageContainer
