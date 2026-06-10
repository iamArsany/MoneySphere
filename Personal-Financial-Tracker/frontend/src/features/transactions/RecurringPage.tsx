import { useState } from 'react'
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
  Plus,
  Play,
  ReceiptText,
  Repeat,
  Settings,
  SkipForward,
  Trash2,
  UserCircle2,
  WalletCards,
  type LucideIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export type RecurringLanguage = 'en' | 'ar'
export type RecurringStatus = 'active' | 'paused' | 'completed'
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
}

export interface RecurringTemplateActionLabels {
  skip?: string
  edit?: string
  delete?: string
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
  onSkipTemplate?: (templateId: string) => void
  onEditTemplate?: (templateId: string) => void
  onDeleteTemplate?: (templateId: string) => void
  onResumeTemplate?: (templateId: string) => void
  onDeleteHistory?: (templateId: string) => void
}

interface TemplateCardProps {
  template: RecurringTemplateRow
  text: RecurringTextContent
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

function RecurringPageContainer() {
  const language = useSelector(selectLanguage)
  const navigate = useNavigate()
  const fallbackData = useRecurringPageData()

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' as const, href: '/dashboard' },
    { id: 'accounts', label: 'Accounts', icon: 'accounts' as const, href: '/accounts' },
    { id: 'transactions', label: 'Transactions', icon: 'transactions' as const, href: '/transactions' },
    { id: 'recurring', label: 'Recurring', icon: 'recurring' as const, href: '/transactions/recurring', isActive: true },
    { id: 'budgets', label: 'Budgets', icon: 'budgets' as const, href: '/budgets' },
    { id: 'reports', label: 'Reports', icon: 'reports' as const, href: '/reports' },
    { id: 'settings', label: 'Settings', icon: 'settings' as const, href: '/profile-settings' },
  ]

  return (
    <RecurringPage
      language={language}
      data={{ ...fallbackData, navItems }}
      onCreateTemplate={() => alert('Create Template – backend not connected yet')}
      onLogout={() => navigate('/login')}
    />
  )
}

export default RecurringPageContainer
