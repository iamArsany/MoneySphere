import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { selectLanguage } from '../../store'
import {
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  Edit3,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  PauseCircle,
  Plus,
  Play,
  ReceiptText,
  Repeat,
  Settings,
  SkipForward,
  Trash2,
  UserCircle2,
  WalletCards,
  ChevronDown,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'

export type RecurringLanguage = 'en' | 'ar'
export type RecurringStatus = 'active' | 'paused' | 'completed'
export type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'
export type RecurringTransactionType = 'income' | 'expense' | 'transfer' | 'initial_balance'

export type RecurringIconName =
  | 'accounts'
  | 'analytics'
  | 'budgets'
  | 'dashboard'
  | 'home'
  | 'notifications'
  | 'recurring'
  | 'reports'
  | 'salary'
  | 'settings'
  | 'transactions'
  | 'transfer'
  | 'dining'
  | 'car'
  | 'fitness'
  | 'music'

export interface RecurringUser {
  name: string
  avatarUrl?: string
  initials?: string
}

export interface RecurringNavItem {
  id: string
  label: string
  icon: RecurringIconName
  href?: string
  isActive?: boolean
}

export interface RecurringFilterOption {
  value: string
  label: string
  type?: 'income' | 'expense' | 'system'
}

export interface RecurringTemplateActionLabels {
  skip?: string
  edit?: string
  delete?: string
  pause?: string
  resume?: string
  deleteHistory?: string
}

export interface RecurringTemplateRow {
  id: string
  title: string
  accountLabel: string
  frequencyLabel: string
  nextLabel: string
  amountLabel: string
  status: RecurringStatus
  icon: RecurringIconName
  completedAtLabel?: string
  actionLabels?: RecurringTemplateActionLabels
}

export interface RecurringPageData {
  user?: RecurringUser
  navItems: RecurringNavItem[]
  filters: RecurringFilterOption[]
  templates: RecurringTemplateRow[]
}

// ---------------------------------------------------------------------------
// API shapes (backend contract)
// ---------------------------------------------------------------------------

interface ApiAccount {
  id?: string | number
  accountId?: string | number
  account_id?: string | number
  name?: string
  accountName?: string
  account_name?: string
  title?: string
}

interface ApiCategory {
  id: string
  nameEn?: string
  nameAr?: string
  name?: string
  type?: 'income' | 'expense' | 'system'
}

interface ApiRecurringTemplate {
  id: string
  userId?: string
  accountId?: string | number
  account?: string | { id?: string | number; name?: string; accountName?: string; account_name?: string }
  type?: RecurringTransactionType
  amount: string | number
  categoryId?: string
  category?: string | { id?: string; nameEn?: string; nameAr?: string; name?: string }
  description?: string
  frequency: RecurringFrequency
  startDate: string
  endDate?: string | null
  nextRunDate: string
  status: RecurringStatus
  skippedDates?: string[]
  createdAt?: string
}

// ---------------------------------------------------------------------------
// Helpers – DECIMAL(18,2) safety
// ---------------------------------------------------------------------------

function parseDecimal(raw: string): string {
  const cleaned = raw.replace(/[^0-9.\-]/g, '')
  const n = parseFloat(cleaned)
  if (!isFinite(n)) return '0.00'
  return n.toFixed(2)
}

function formatAmount(raw: string | number | undefined): string {
  if (raw === undefined || raw === null) return '$0.00'
  const n = parseFloat(String(raw))
  if (!isFinite(n)) return '$0.00'
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return iso
  }
}

function frequencyLabel(freq: RecurringFrequency): string {
  const labels: Record<RecurringFrequency, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    biweekly: 'Biweekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly',
  }
  return labels[freq] ?? freq
}

function frequencyLabelAr(freq: RecurringFrequency): string {
  const labels: Record<RecurringFrequency, string> = {
    daily: 'يومي',
    weekly: 'أسبوعي',
    biweekly: 'كل أسبوعين',
    monthly: 'شهري',
    quarterly: 'ربع سنوي',
    yearly: 'سنوي',
  }
  return labels[freq] ?? freq
}

function accountName(template: ApiRecurringTemplate): string {
  const acc = typeof template.account === 'object' ? template.account : undefined
  return acc?.name ?? acc?.accountName ?? acc?.account_name ?? String(template.accountId ?? '')
}

function isDateInPast(dateStr: string): boolean {
  try {
    const date = new Date(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  } catch {
    return false
  }
}

function mapApiRecurringTemplate(
  t: ApiRecurringTemplate,
  lang: RecurringLanguage,
  accountFallback?: (id: string) => string,
): RecurringTemplateRow {
  const freq = frequencyLabel(t.frequency)
  const freqLabel = lang === 'ar' ? frequencyLabelAr(t.frequency) : freq
  const pastDue = t.status === 'active' && isDateInPast(t.nextRunDate)
  const isCompleted = pastDue || t.status === 'completed'
  const iconName: RecurringIconName = t.type === 'income' ? 'salary' : 'recurring'

  return {
    id: t.id,
    title: t.description ?? `${freq} Transaction`,
    accountLabel: accountName(t) || accountFallback?.(String(t.accountId)) || `Account ${t.accountId}`,
    frequencyLabel: freqLabel,
    nextLabel: isCompleted
      ? `${lang === 'ar' ? 'انتهى' : 'Ended'}: ${formatDate(t.endDate ?? t.nextRunDate)}`
      : `${lang === 'ar' ? 'التالي' : 'Next'}: ${formatDate(t.nextRunDate)}`,
    amountLabel: formatAmount(t.amount),
    status: isCompleted ? 'completed' : t.status,
    icon: iconName,
    completedAtLabel: isCompleted && t.endDate ? formatDate(t.endDate) : undefined,
  }
}

export interface RecurringTextContent {
  appName: string
  sidebarTitle: string
  sidebarSubtitle: string
  pageTitle: string
  pageSubtitle: string
  createTemplate: string
  filterAll: string
  emptyTitle: string
  emptySubtitle: string
  emptyAction: string
  allAccounts: string
  recurringLabel: string
  activeLabel: string
  pausedLabel: string
  completedLabel: string
  activeUntilPrefix: string
  nextOccurrencePrefix: string
  endedPrefix: string
  selectedTemplatePrefix: string
  statusActive: string
  statusPaused: string
  statusCompleted: string
  actionSkip: string
  actionEdit: string
  actionDelete: string
  actionPause: string
  actionResume: string
  actionDeleteHistory: string
  tooltipSkipPrompt: string
  tooltipCancel: string
  tooltipConfirm: string
  mobileMenuLabel: string
  notificationsLabel: string
  logoutLabel: string
  userMenuLabel: string
  mobilePreviewLabel: string
}

export interface RecurringPageProps {
  data?: RecurringPageData
  language?: RecurringLanguage
  text?: Partial<RecurringTextContent>
  activeFilter?: string
  isCreateDisabled?: boolean
  onCreateTemplate?: () => void
  onFilterChange?: (value: string) => void
  onNavItemClick?: (itemId: string) => void
  onPauseTemplate?: (templateId: string) => void
  onSkipTemplate?: (templateId: string) => void
  onEditTemplate?: (templateId: string) => void
  onDeleteTemplate?: (templateId: string) => void
  onResumeTemplate?: (templateId: string) => void
  onDeleteHistory?: (templateId: string) => void
  onLogout?: () => void
}

interface SidebarProps {
  text: RecurringTextContent
  navItems: RecurringNavItem[]
  onNavItemClick?: (itemId: string) => void
  onLogout?: () => void
}

interface HeaderProps {
  text: RecurringTextContent
  user?: RecurringUser
  onCreateTemplate?: () => void
  onLogout?: () => void
}

interface FilterTabsProps {
  text: RecurringTextContent
  filters: RecurringFilterOption[]
  activeFilter: string
  onFilterChange?: (value: string) => void
}

interface TemplateListProps {
  text: RecurringTextContent
  templates: RecurringTemplateRow[]
  isCreateDisabled: boolean
  onCreateTemplate?: () => void
  onPauseTemplate?: (templateId: string) => void
  onSkipTemplate?: (templateId: string) => void
  onEditTemplate?: (templateId: string) => void
  onDeleteTemplate?: (templateId: string) => void
  onResumeTemplate?: (templateId: string) => void
  onDeleteHistory?: (templateId: string) => void
}

interface TemplateCardProps {
  template: RecurringTemplateRow
  text: RecurringTextContent
  onPauseTemplate?: (templateId: string) => void
  onSkipTemplate?: (templateId: string) => void
  onEditTemplate?: (templateId: string) => void
  onDeleteTemplate?: (templateId: string) => void
  onResumeTemplate?: (templateId: string) => void
  onDeleteHistory?: (templateId: string) => void
}

interface ActionButtonProps {
  label: string
  icon: LucideIcon
  tone?: 'neutral' | 'primary' | 'danger'
  onClick?: () => void
  disabled?: boolean
}

const TEXT: Record<RecurringLanguage, RecurringTextContent> = {
  en: {
    appName: 'FinancePro',
    sidebarTitle: 'PFT Admin',
    sidebarSubtitle: 'Institutional Grade',
    pageTitle: 'Recurring Transactions',
    pageSubtitle: 'Manage your subscriptions, bills, and automated transfers.',
    createTemplate: 'New Template',
    filterAll: 'All',
    emptyTitle: 'No Recurring Transactions',
    emptySubtitle:
      'Automate your finances. Add bills, subscriptions, or transfers here to keep track of your cash flow.',
    emptyAction: 'Create Your First Template',
    allAccounts: 'All Accounts',
    recurringLabel: 'Recurring',
    activeLabel: 'Active',
    pausedLabel: 'Paused',
    completedLabel: 'Completed',
    activeUntilPrefix: 'Active until',
    nextOccurrencePrefix: 'Next:',
    endedPrefix: 'Ended:',
    selectedTemplatePrefix: 'Selected:',
    statusActive: 'Active',
    statusPaused: 'Paused',
    statusCompleted: 'Completed',
    actionSkip: 'Skip Next Occurrence',
    actionEdit: 'Edit',
    actionDelete: 'Delete',
    actionPause: 'Pause',
    actionResume: 'Resume',
    actionDeleteHistory: 'Delete History',
    tooltipSkipPrompt: 'Skip the next occurrence?',
    tooltipCancel: 'Cancel',
    tooltipConfirm: 'Confirm',
    mobileMenuLabel: 'Open menu',
    notificationsLabel: 'Notifications',
    logoutLabel: 'Logout',
    userMenuLabel: 'Open user menu',
    mobilePreviewLabel: 'Mobile Preview',
  },
  ar: {
    appName: 'FinancePro',
    sidebarTitle: 'مدير PFT',
    sidebarSubtitle: 'مستوى مؤسسي',
    pageTitle: 'المعاملات المتكررة',
    pageSubtitle: 'أدر الاشتراكات والفواتير والتحويلات التلقائية.',
    createTemplate: 'قالب جديد',
    filterAll: 'الكل',
    emptyTitle: 'لا توجد معاملات متكررة',
    emptySubtitle: 'أتمت أموالك. أضف الفواتير أو الاشتراكات أو التحويلات هنا.', 
    emptyAction: 'إنشاء أول قالب',
    allAccounts: 'كل الحسابات',
    recurringLabel: 'المتكرر',
    activeLabel: 'نشط',
    pausedLabel: 'متوقف',
    completedLabel: 'مكتمل',
    activeUntilPrefix: 'نشط حتى',
    nextOccurrencePrefix: 'التالي:',
    endedPrefix: 'انتهى:',
    selectedTemplatePrefix: 'المحدد:',
    statusActive: 'نشط',
    statusPaused: 'متوقف',
    statusCompleted: 'مكتمل',
    actionSkip: 'تخطي التكرار التالي',
    actionEdit: 'تعديل',
    actionDelete: 'حذف',
    actionPause: 'إيقاف',
    actionResume: 'استئناف',
    actionDeleteHistory: 'حذف السجل',
    tooltipSkipPrompt: 'هل تريد تخطي التكرار التالي؟',
    tooltipCancel: 'إلغاء',
    tooltipConfirm: 'تأكيد',
    mobileMenuLabel: 'فتح القائمة',
    notificationsLabel: 'الإشعارات',
    logoutLabel: 'تسجيل الخروج',
    userMenuLabel: 'فتح قائمة المستخدم',
    mobilePreviewLabel: 'معاينة الهاتف',
  },
}

const ICONS: Record<RecurringIconName, LucideIcon> = {
  accounts: Building2,
  analytics: BarChart3,
  budgets: WalletCards,
  dashboard: LayoutDashboard,
  home: Home,
  notifications: Bell,
  recurring: Repeat,
  reports: ReceiptText,
  salary: CircleDollarSign,
  settings: Settings,
  transactions: ReceiptText,
  transfer: Repeat,
  dining: ReceiptText,
  car: Home,
  fitness: UserCircle2,
  music: Play,
}

const DEFAULT_DATA: RecurringPageData = {
  navItems: [],
  filters: [],
  templates: [],
}

export function useRecurringPageText(language: RecurringLanguage = 'en'): RecurringTextContent {
  return TEXT[language]
}

export function useRecurringPageData(): RecurringPageData {
  return DEFAULT_DATA
}

export function RecurringPage({
  data,
  language = 'en',
  text,
  activeFilter,
  isCreateDisabled = false,
  onCreateTemplate,
  onFilterChange,
  onNavItemClick: _onNavItemClick,
  onPauseTemplate,
  onSkipTemplate,
  onEditTemplate,
  onDeleteTemplate,
  onResumeTemplate,
  onDeleteHistory,
  onLogout: _onLogout,
}: RecurringPageProps) {
  const pageText = { ...useRecurringPageText(language), ...text }
  const fallbackData = useRecurringPageData()
  const pageData = data ?? fallbackData
  const resolvedFilter = activeFilter ?? pageText.filterAll
  const _isRtl = language === 'ar'

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#0b1c30] sm:text-4xl">
              {pageText.pageTitle}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#3e4947] sm:text-base">
              {pageText.pageSubtitle}
            </p>
          </div>

          {onCreateTemplate ? (
            <button
              type="button"
              onClick={onCreateTemplate}
              disabled={isCreateDisabled}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#005c55] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#005c55]/20 transition hover:bg-[#0f766e] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {pageText.createTemplate}
            </button>
          ) : null}
        </section>

        <FilterTabs
          text={pageText}
          filters={pageData.filters}
          activeFilter={resolvedFilter}
          onFilterChange={onFilterChange}
        />

        <TemplateList
          text={pageText}
          templates={pageData.templates}
          isCreateDisabled={isCreateDisabled}
          onCreateTemplate={onCreateTemplate}
          onPauseTemplate={onPauseTemplate}
          onSkipTemplate={onSkipTemplate}
          onEditTemplate={onEditTemplate}
          onDeleteTemplate={onDeleteTemplate}
          onResumeTemplate={onResumeTemplate}
          onDeleteHistory={onDeleteHistory}
        />
      </div>
    </>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Sidebar({ text, navItems, onNavItemClick, onLogout }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 hidden w-[240px] flex-col border-r border-[#d3e4fe] bg-white px-4 py-6 shadow-sm md:flex">
      <div className="px-2">
        <p className="text-2xl font-bold tracking-tight text-[#005c55]">{text.sidebarTitle}</p>
        <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-[#3e4947]">
          {text.sidebarSubtitle}
        </p>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const Icon = ICONS[item.icon]
          const active = item.isActive
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavItemClick?.(item.id)}
              className={[
                'flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition',
                active
                  ? 'border-r-4 border-[#005c55] bg-[#eff4ff] text-[#005c55]'
                  : 'text-[#3e4947] hover:bg-[#eff4ff] hover:text-[#0b1c30]',
              ].join(' ')}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {onLogout ? (
        <button
          type="button"
          onClick={onLogout}
          className="mt-auto flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#3e4947] transition hover:bg-[#eff4ff] hover:text-[#0b1c30]"
        >
          <LogOut className="h-5 w-5" aria-hidden="true" />
          <span>{text.logoutLabel}</span>
        </button>
      ) : null}
    </aside>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Header({ text, user, onCreateTemplate, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#d3e4fe] bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 md:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#eff4ff] text-[#3e4947] md:hidden"
            aria-label={text.mobileMenuLabel}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="hidden md:block">
            <h2 className="text-xl font-semibold text-[#0b1c30]">{text.pageTitle}</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="hidden rounded-full border border-[#bdc9c6] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#3e4947] sm:inline-flex"
          >
            EN
          </button>
          <button
            type="button"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-[#3e4947] transition hover:bg-[#eff4ff] hover:text-[#005c55]"
            aria-label={text.notificationsLabel}
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#fea619]" />
          </button>

          {user ? (
            <button
              type="button"
              aria-label={text.userMenuLabel}
              className="inline-flex items-center gap-2 rounded-full border border-[#bdc9c6] bg-white px-2 py-1 pr-3 shadow-sm"
            >
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#eff4ff] text-xs font-bold text-[#005c55]">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span>{user.initials ?? user.name.slice(0, 2)}</span>
                )}
              </div>
              <span className="hidden text-sm font-medium text-[#0b1c30] sm:inline">{user.name}</span>
            </button>
          ) : null}

          {onCreateTemplate ? (
            <button
              type="button"
              onClick={onCreateTemplate}
              className="hidden rounded-xl bg-[#005c55] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0f766e] md:inline-flex"
            >
              {text.createTemplate}
            </button>
          ) : null}

          {onLogout ? (
            <button
              type="button"
              onClick={onLogout}
              className="hidden rounded-xl border border-[#bdc9c6] px-3 py-2 text-sm font-medium text-[#3e4947] transition hover:text-[#0b1c30] md:inline-flex"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>
    </header>
  )
}

function FilterTabs({ text, filters, activeFilter, onFilterChange }: FilterTabsProps) {
  const tabs = filters.length > 0 ? filters : [{ value: text.filterAll, label: text.filterAll }]

  return (
    <div className="overflow-x-auto border-b border-[#d3e4fe] pb-1">
      <div className="flex min-w-max gap-2">
        {tabs.map((filter) => {
          const active = filter.value === activeFilter
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => onFilterChange?.(filter.value)}
              className={[
                'whitespace-nowrap border-b-2 px-4 py-2 text-sm font-semibold transition',
                active
                  ? 'border-[#005c55] text-[#005c55]'
                  : 'border-transparent text-[#3e4947] hover:text-[#0b1c30]',
              ].join(' ')}
            >
              {filter.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function TemplateList({
  text,
  templates,
  isCreateDisabled,
  onCreateTemplate,
  onPauseTemplate,
  onSkipTemplate,
  onEditTemplate,
  onDeleteTemplate,
  onResumeTemplate,
  onDeleteHistory,
}: TemplateListProps) {
  if (templates.length === 0) {
    return (
      <section className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center rounded-3xl border border-dashed border-[#bdc9c6] bg-white px-6 py-12 text-center shadow-sm">
        <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-[#eff4ff] text-[#80d5cb]">
          <Repeat className="h-12 w-12" aria-hidden="true" />
        </div>
        <h3 className="text-2xl font-bold text-[#0b1c30]">{text.emptyTitle}</h3>
        <p className="mt-3 max-w-md text-sm leading-6 text-[#3e4947] sm:text-base">
          {text.emptySubtitle}
        </p>
        {onCreateTemplate ? (
          <button
            type="button"
            onClick={onCreateTemplate}
            disabled={isCreateDisabled}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#005c55] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f766e] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {text.emptyAction}
          </button>
        ) : null}
      </section>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          text={text}
          onPauseTemplate={onPauseTemplate}
          onSkipTemplate={onSkipTemplate}
          onEditTemplate={onEditTemplate}
          onDeleteTemplate={onDeleteTemplate}
          onResumeTemplate={onResumeTemplate}
          onDeleteHistory={onDeleteHistory}
        />
      ))}
    </div>
  )
}

function TemplateCard({
  template,
  text,
  onPauseTemplate,
  onSkipTemplate,
  onEditTemplate,
  onDeleteTemplate,
  onResumeTemplate,
  onDeleteHistory,
}: TemplateCardProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const Icon = ICONS[template.icon]
  const status = template.status
  const labels = template.actionLabels ?? {}

  const statusTone =
    status === 'active'
      ? 'bg-[#e8f5e9] text-[#2e7d32]'
      : status === 'paused'
        ? 'bg-[#dce9ff] text-[#3e4947]'
        : 'border border-[#bdc9c6] bg-white text-[#3e4947]'

  const titleTone = status === 'completed' ? 'text-[#6e7977] line-through' : 'text-[#0b1c30]'
  const amountTone = status === 'active' ? 'text-[#ba1a1a]' : 'text-[#6e7977]'
  const iconTone =
    status === 'active'
      ? 'bg-[#eff4ff] text-[#005c55]'
      : status === 'paused'
        ? 'bg-[#d3e4fe] text-[#3e4947]'
        : 'bg-[#eff4ff] text-[#6e7977]'

  return (
    <article
      className={[
        'group relative overflow-visible rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5',
        status === 'completed' ? 'border-dashed opacity-60 grayscale-[50%]' : 'border-[#bdc9c6]',
      ].join(' ')}
    >
      <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr] md:items-center">
        <div className="flex items-center gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconTone}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className={`text-base font-semibold leading-6 sm:text-lg ${titleTone}`}>{template.title}</h3>
            <p className="mt-0.5 flex items-center gap-2 text-sm text-[#3e4947]">
              <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
              {template.accountLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#d3e4fe] pt-4 md:flex-col md:items-center md:justify-center md:border-t-0 md:pt-0">
          <div className="flex flex-col gap-1">
            <span className="inline-flex self-start rounded-md bg-[#eff4ff] px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#3e4947]">
              {template.frequencyLabel}
            </span>
            <span className="text-sm text-[#3e4947]">{template.nextLabel}</span>
          </div>
          <div className="text-right md:text-center">
            <span className={`block text-lg font-semibold sm:text-xl ${amountTone}`}>{template.amountLabel}</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#d3e4fe] pt-4 md:justify-end md:border-t-0 md:pt-0">
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusTone}`}>
            {status === 'active' ? (
              <span className="h-2 w-2 rounded-full bg-[#2e7d32]" />
            ) : status === 'paused' ? (
              <span className="h-2 w-2 rounded-full bg-[#6e7977]" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {status === 'active' ? text.statusActive : status === 'paused' ? text.statusPaused : text.statusCompleted}
          </span>

          <div className="relative flex items-center gap-1 opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
            {status === 'active' ? (
              <>
                <ActionButton
                  label={labels.pause ?? text.actionPause}
                  icon={PauseCircle}
                  tone="neutral"
                  onClick={() => onPauseTemplate?.(template.id)}
                />
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowTooltip((value) => !value)}
                    className="rounded-full p-2 text-[#3e4947] transition hover:bg-[#eff4ff] hover:text-[#855300]"
                    aria-label={labels.skip ?? text.actionSkip}
                  >
                    <SkipForward className="h-5 w-5" aria-hidden="true" />
                  </button>

                  {showTooltip ? (
                    <div className="absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-xl bg-[#213145] p-3 text-white shadow-xl">
                      <p className="text-center text-sm">{text.tooltipSkipPrompt}</p>
                      <div className="mt-3 flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowTooltip(false)}
                          className="rounded-md bg-[#d3e4fe] px-3 py-1 text-xs font-semibold text-[#3e4947]"
                        >
                          {text.tooltipCancel}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowTooltip(false)
                            onSkipTemplate?.(template.id)
                          }}
                          className="rounded-md bg-[#fea619] px-3 py-1 text-xs font-semibold text-[#684000]"
                        >
                          {text.tooltipConfirm}
                        </button>
                      </div>
                      <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[#213145]" />
                    </div>
                  ) : null}
                </div>
              </>
            ) : status === 'paused' ? (
              <ActionButton
                label={labels.resume ?? text.actionResume}
                icon={Play}
                onClick={() => onResumeTemplate?.(template.id)}
              />
            ) : (
              <ActionButton
                label={labels.deleteHistory ?? text.actionDeleteHistory}
                icon={Trash2}
                tone="danger"
                onClick={() => onDeleteHistory?.(template.id)}
              />
            )}

            {status !== 'completed' ? (
              <>
                <ActionButton
                  label={labels.edit ?? text.actionEdit}
                  icon={Edit3}
                  onClick={() => onEditTemplate?.(template.id)}
                />
                <ActionButton
                  label={labels.delete ?? text.actionDelete}
                  icon={Trash2}
                  tone="danger"
                  onClick={() => onDeleteTemplate?.(template.id)}
                />
              </>
            ) : null}
          </div>
        </div>
      </div>

      {template.completedAtLabel ? (
        <p className="mt-3 text-xs text-[#6e7977]">
          {text.endedPrefix} {template.completedAtLabel}
        </p>
      ) : null}
    </article>
  )
}

function ActionButton({ label, icon: Icon, tone = 'neutral', onClick, disabled }: ActionButtonProps) {
  const toneClass =
    tone === 'danger'
      ? 'text-[#ba1a1a] hover:bg-[#ffdad6] hover:text-[#93000a]'
      : tone === 'primary'
        ? 'text-[#005c55] hover:bg-[#eff4ff] hover:text-[#0f766e]'
        : 'text-[#3e4947] hover:bg-[#eff4ff] hover:text-[#0b1c30]'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`rounded-full p-2 transition disabled:cursor-not-allowed disabled:opacity-50 ${toneClass}`}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </button>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function MobilePreviewLabel({ text }: { text: RecurringTextContent }) {
  return (
    <div className="mt-2 flex justify-center md:hidden">
      <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#3e4947] shadow-sm ring-1 ring-[#bdc9c6]">
        {text.mobilePreviewLabel}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// RecurringTemplateModal (Create / Edit)
// ---------------------------------------------------------------------------

interface RecurringFormState {
  description: string
  amount: string
  type: RecurringTransactionType
  frequency: RecurringFrequency
  accountId: string
  categoryId: string
  startDate: string
  endDate: string
}

const EMPTY_RECURRING_FORM: RecurringFormState = {
  description: '',
  amount: '',
  type: 'expense',
  frequency: 'monthly',
  accountId: '',
  categoryId: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
}

interface RecurringTemplateModalProps {
  mode: 'add' | 'edit'
  initial?: Partial<RecurringFormState> & { id?: string }
  accountOptions: RecurringFilterOption[]
  categoryOptions: RecurringFilterOption[]
  onClose: () => void
  onSaved: () => void
  language: RecurringLanguage
}

function RecurringTemplateModal({
  mode,
  initial,
  accountOptions,
  categoryOptions,
  onClose,
  onSaved,
  language,
}: RecurringTemplateModalProps) {
  const pageText = useRecurringPageText(language)
  const [form, setForm] = useState<RecurringFormState>({ ...EMPTY_RECURRING_FORM, ...initial })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isRtl = language === 'ar'

  const visibleCategoryOptions = categoryOptions.filter((cat) => {
    if (form.type === 'transfer') return cat.type === 'system'
    if (!cat.type) return true
    return cat.type === form.type
  })

  const field = (key: keyof RecurringFormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as RecurringTransactionType
    const defaultCategoryId = type === 'transfer' ? categoryOptions.find((c) => c.type === 'system')?.value ?? '' : ''
    setForm((prev) => ({ ...prev, type, categoryId: defaultCategoryId }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const decimalAmount = parseDecimal(form.amount)
    if (decimalAmount === '0.00') {
      setError('Please enter a valid amount.')
      return
    }
    if (!form.accountId.trim()) {
      setError('Please select an account.')
      return
    }
    if (!form.categoryId.trim()) {
      setError('Please select a category.')
      return
    }

    setSaving(true)
    try {
      const payload: Record<string, string> = {
        accountId: form.accountId.trim(),
        type: form.type,
        categoryId: form.categoryId.trim(),
        description: form.description.trim(),
        amount: decimalAmount,
        frequency: form.frequency,
        startDate: form.startDate,
      }
      if (form.endDate.trim()) payload.endDate = form.endDate.trim()

      if (mode === 'add') {
        await api.post('/recurring', payload)
      } else if (initial?.id) {
        await api.patch(`/recurring/${initial.id}`, payload)
      }
      onSaved()
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'An error occurred.')
    } finally {
      setSaving(false)
    }
  }

  const inputCls =
    'w-full rounded-lg border border-[#bdc9c6] bg-white px-3 py-2.5 text-sm text-[#0b1c30] outline-none transition focus:border-[#005c55] focus:ring-1 focus:ring-[#005c55]'

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-10"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div dir={isRtl ? 'rtl' : 'ltr'} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0b1c30]">
            {mode === 'add' ? pageText.createTemplate : pageText.actionEdit}
          </h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-[#3e4947] hover:bg-[#e5eeff]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'add' && (
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#3e4947]">Account</span>
              <div className="relative">
                <select value={form.accountId} onChange={field('accountId')} required className={inputCls + ' appearance-none pr-8'}>
                  <option value="">Select account</option>
                  {accountOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3e4947]" />
              </div>
            </label>
          )}

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#3e4947]">Type</span>
            <div className="relative">
              <select value={form.type} onChange={handleTypeChange} required className={inputCls + ' appearance-none pr-8'}>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="transfer">Transfer</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3e4947]" />
            </div>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#3e4947]">Frequency</span>
            <div className="relative">
              <select value={form.frequency} onChange={field('frequency')} required className={inputCls + ' appearance-none pr-8'}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Biweekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3e4947]" />
            </div>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#3e4947]">Category</span>
            <div className="relative">
              <select value={form.categoryId} onChange={field('categoryId')} required className={inputCls + ' appearance-none pr-8'}>
                <option value="">Select category</option>
                {visibleCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3e4947]" />
            </div>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#3e4947]">Description</span>
            <input type="text" value={form.description} onChange={field('description')} placeholder="e.g. Monthly subscription" required className={inputCls} />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#3e4947]">Amount</span>
            <input type="number" min="0.01" step="0.01" value={form.amount} onChange={field('amount')} placeholder="0.00" required className={inputCls} />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#3e4947]">Start Date</span>
            <input type="date" value={form.startDate} onChange={field('startDate')} required className={inputCls} />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#3e4947]">End Date (optional)</span>
            <input type="date" value={form.endDate} onChange={field('endDate')} className={inputCls} />
          </label>

          {error && (
            <p className="rounded-lg bg-[#ffdad6] px-3 py-2 text-sm text-[#ba1a1a]">{error}</p>
          )}

          <div className="mt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-[#bdc9c6] py-2.5 text-sm font-semibold text-[#3e4947] transition hover:bg-[#e5eeff]">
              {pageText.tooltipCancel}
            </button>
            <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-[#005c55] py-2.5 text-sm font-semibold text-white transition hover:bg-[#004943] disabled:opacity-60">
              {saving ? '…' : (mode === 'add' ? pageText.createTemplate : pageText.actionEdit)}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main container – all data-fetching & state lives here
// ---------------------------------------------------------------------------

function RecurringPageContainer() {
  const language = useSelector(selectLanguage)
  const navigate = useNavigate()
  const pageText = useRecurringPageText(language)

  // --- fetch state ---
  const [rawTemplates, setRawTemplates] = useState<RecurringTemplateRow[]>([])
  const [accountOptions, setAccountOptions] = useState<RecurringFilterOption[]>([])
  const [categoryOptions, setCategoryOptions] = useState<RecurringFilterOption[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // --- filter state ---
  const [activeFilter, setActiveFilter] = useState<string>('all')

  // --- modals ---
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<(Partial<RecurringFormState> & { id: string }) | null>(null)

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await api.get<{ data?: ApiAccount[]; accounts?: ApiAccount[] } | ApiAccount[]>('/accounts')
      const body = res.data
      const accounts = Array.isArray(body) ? body : body.data ?? body.accounts ?? []
      setAccountOptions(
        accounts
          .map((account) => {
            const value = String(account.id ?? account.accountId ?? account.account_id ?? '')
            const label = account.name ?? account.accountName ?? account.account_name ?? account.title ?? (value ? `Account ${value}` : '')
            return { value, label }
          })
          .filter((option) => option.value && option.label),
      )
    } catch {
      setAccountOptions([])
    }
  }, [])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get<{ data?: ApiCategory[]; categories?: ApiCategory[] } | ApiCategory[]>('/categories')
      const body = res.data
      const cats = Array.isArray(body) ? body : body.categories ?? body.data ?? []
      setCategoryOptions(
        cats.map((cat) => ({
          value: cat.id,
          label: cat.nameEn ?? cat.name ?? cat.id,
          type: cat.type,
        })),
      )
    } catch {
      setCategoryOptions([])
    }
  }, [])

  useEffect(() => {
    fetchAccounts()
    fetchCategories()
  }, [fetchAccounts, fetchCategories])

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const res = await api.get<{ data?: ApiRecurringTemplate[]; recurring?: ApiRecurringTemplate[] } | ApiRecurringTemplate[]>('/recurring')
      const body = res.data
      const raw = Array.isArray(body) ? body : body.data ?? body.recurring ?? []
      setRawTemplates(raw.map((t) => mapApiRecurringTemplate(t, language)))
    } catch {
      setFetchError('Failed to load recurring transactions.')
    } finally {
      setLoading(false)
    }
  }, [language])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  // ---------------------------------------------------------------------------
  // Client-side filtering
  // ---------------------------------------------------------------------------

  const filteredTemplates = useMemo(() => {
    if (activeFilter === 'all') return rawTemplates
    return rawTemplates.filter((t) => t.status === activeFilter)
  }, [rawTemplates, activeFilter])

  // ---------------------------------------------------------------------------
  // Filter helpers
  // ---------------------------------------------------------------------------

  const filterOptions: RecurringFilterOption[] = [
    { value: 'all', label: pageText.filterAll },
    { value: 'active', label: pageText.activeLabel },
    { value: 'paused', label: pageText.pausedLabel },
    { value: 'completed', label: pageText.completedLabel },
  ]

  // ---------------------------------------------------------------------------
  // Action handlers
  // ---------------------------------------------------------------------------

  const handlePause = async (id: string) => {
    try {
      await api.patch(`/recurring/${id}`, { status: 'paused' })
      await fetchTemplates()
    } catch {
      // silent
    }
  }

  const handleSkip = async (id: string) => {
    try {
      await api.post(`/recurring/${id}/skip`)
      await fetchTemplates()
    } catch {
      // silent
    }
  }

  const handleResume = async (id: string) => {
    try {
      await api.patch(`/recurring/${id}`, { status: 'active' })
      await fetchTemplates()
    } catch {
      // silent
    }
  }

  const handleEdit = (id: string) => {
    const template = rawTemplates.find((t) => t.id === id)
    if (!template) return
    setEditTarget({
      id,
      description: template.title,
      amount: template.amountLabel.replace(/[^0-9.]/g, ''),
      type: 'expense',
      frequency: 'monthly',
      accountId: '',
      categoryId: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    })
  }

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/recurring/${id}`)
      await fetchTemplates()
    } catch {
      // silent
    }
  }

  const handleDeleteHistory = async (id: string) => {
    await handleDelete(id)
  }

  const navItems: RecurringNavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' as const, href: '/dashboard' },
    { id: 'accounts', label: 'Accounts', icon: 'accounts' as const, href: '/accounts' },
    { id: 'transactions', label: 'Transactions', icon: 'transactions' as const, href: '/transactions' },
    { id: 'recurring', label: 'Recurring', icon: 'recurring' as const, href: '/transactions/recurring', isActive: true },
    { id: 'budgets', label: 'Budgets', icon: 'budgets' as const, href: '/budgets' },
    { id: 'reports', label: 'Reports', icon: 'reports' as const, href: '/reports' },
    { id: 'settings', label: 'Settings', icon: 'settings' as const, href: '/profile-settings' },
  ]

  const pageData: RecurringPageData = {
    navItems,
    filters: filterOptions,
    templates: filteredTemplates,
  }

  return (
    <>
      {/* ── Modals ── */}
      {addModalOpen && (
        <RecurringTemplateModal
          mode="add"
          accountOptions={accountOptions}
          categoryOptions={categoryOptions}
          onClose={() => setAddModalOpen(false)}
          onSaved={fetchTemplates}
          language={language}
        />
      )}
      {editTarget && (
        <RecurringTemplateModal
          mode="edit"
          initial={editTarget}
          accountOptions={accountOptions}
          categoryOptions={categoryOptions}
          onClose={() => setEditTarget(null)}
          onSaved={fetchTemplates}
          language={language}
        />
      )}

      {/* Loading / Error banners */}
      {loading && (
        <p className="mx-auto mt-6 max-w-7xl px-4 text-center text-sm text-[#3e4947] sm:px-6 lg:px-8">
          {language === 'ar' ? 'جارٍ التحميل…' : 'Loading…'}
        </p>
      )}
      {fetchError && !loading && (
        <div className="mx-auto mt-6 flex max-w-7xl items-center justify-center gap-4 rounded-xl border border-[#ffdad6] bg-[#fff8f7] px-4 py-4 text-sm text-[#ba1a1a] sm:px-6 lg:px-8">
          {fetchError}
          <button
            type="button"
            onClick={fetchTemplates}
            className="font-semibold underline"
          >
            {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      )}

      {/* ── Page ── */}
      <RecurringPage
        language={language}
        data={pageData}
        activeFilter={activeFilter}
        isCreateDisabled={loading}
        onCreateTemplate={() => setAddModalOpen(true)}
        onFilterChange={(value) => setActiveFilter(value)}
        onPauseTemplate={handlePause}
        onSkipTemplate={handleSkip}
        onEditTemplate={handleEdit}
        onDeleteTemplate={handleDelete}
        onResumeTemplate={handleResume}
        onDeleteHistory={handleDeleteHistory}
        onLogout={() => navigate('/login')}
      />
    </>
  )
}

export default RecurringPageContainer
