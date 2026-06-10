import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Bell,
  Building2,
  Download,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  PictureInPicture2,
  ReceiptText,
  Repeat,
  Settings,
  Sparkles,
  WalletCards,
  type LucideIcon,
} from 'lucide-react'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { selectLanguage } from '../../store'
import { api } from '../../services/api'
import { useNavigate } from 'react-router-dom'

export type ReportsLanguage = 'en' | 'ar'
export type ReportTone = 'income' | 'expense' | 'primary' | 'neutral'
export type ReportsIconName =
  | 'accounts'
  | 'budgets'
  | 'dashboard'
  | 'notifications'
  | 'recurring'
  | 'reports'
  | 'settings'
  | 'transactions'
  | 'wallet'

export interface ReportsUser {
  name: string
  avatarUrl?: string
  initials?: string
}

export interface ReportsNavItem {
  id: string
  label: string
  icon: ReportsIconName
  href?: string
  isActive?: boolean
}

export interface ReportsFilterOption {
  value: string
  label: string
}

export interface ReportsSummaryStat {
  id: string
  label: string
  valueLabel: string
  tone: ReportTone
}

export interface ReportsCashFlowBar {
  id: string
  label: string
  valueLabel: string
  percent: number
  tone: ReportTone
}

export interface ReportsExpenseCategory {
  id: string
  label: string
  amountLabel: string
  percentLabel: string
  tone?: ReportTone
}

export interface ReportsTransaction {
  id: string
  dateLabel: string
  description: string
  categoryLabel: string
  accountLabel: string
  amountLabel: string
  tone: ReportTone
}

export interface ReportsHistoryItem {
  id: string
  title: string
  subtitle: string
  icon: 'chart' | 'pie'
}

export interface ReportsDocument {
  reportMode: 'monthly' | 'annual'
  title: string
  periodLabel: string
  clientName: string
  generatedAtLabel: string
  summaryStats: ReportsSummaryStat[]
  cashFlowTitle: string
  cashFlowBars: ReportsCashFlowBar[]
  expenseCategoriesTitle: string
  expenseCategories: ReportsExpenseCategory[]
  transactionsTitle: string
  transactions: ReportsTransaction[]
  historyTitle: string
  historyItems: ReportsHistoryItem[]
}

export interface ReportsPageData {
  user?: ReportsUser
  navItems: ReportsNavItem[]
  report?: ReportsDocument
  monthOptions: ReportsFilterOption[]
  yearOptions: ReportsFilterOption[]
  accountOptions: ReportsFilterOption[]
  categoryOptions: ReportsFilterOption[]
}

export interface ReportsTextContent {
  appName: string
  appSubtitle: string
  pageTitle: string
  languageToggleLabel: string
  notificationsAriaLabel: string
  menuAriaLabel: string
  generateReport: string
  monthlyReport: string
  annualReport: string
  monthLabel: string
  yearLabel: string
  accountLabel: string
  categoryLabel: string
  allAccounts: string
  allCategories: string
  generate: string
  exportPdf: string
  exportAriaLabel: string
  totalIncome: string
  totalExpenses: string
  netSavings: string
  savingsRate: string
  cashFlowTrend: string
  topExpenseCategories: string
  recentTransactions: string
  viewAll: string
  previouslyGeneratedReports: string
  emptyReport: string
  emptyHistory: string
  emptyCashFlow: string
  emptyCategories: string
  emptyTransactions: string
  clientLabel: string
  generatedLabel: string
  yearSuffix: string
  monthSuffix: string
  incomeIndicator: string
  expenseIndicator: string
  noDataLabel: string
  mobileMenuLabel: string
  logoutLabel: string
  userMenuLabel: string
}

export interface ReportsPageProps {
  data?: ReportsPageData
  language?: ReportsLanguage
  text?: Partial<ReportsTextContent>
  activeReportMode?: 'monthly' | 'annual'
  isGenerateDisabled?: boolean
  hasUnreadNotifications?: boolean
  onLanguageToggle?: () => void
  onMenuClick?: () => void
  onGenerateReport?: () => void
  onExportPdf?: () => void
  onHistoryItemClick?: (itemId: string) => void
  onNavItemClick?: (itemId: string) => void
  onReportModeChange?: (mode: 'monthly' | 'annual') => void
  onLogout?: () => void
}

interface SidebarProps {
  text: ReportsTextContent
  navItems: ReportsNavItem[]
  onNavItemClick?: (itemId: string) => void
  onLogout?: () => void
}

interface TopHeaderProps {
  text: ReportsTextContent
  user?: ReportsUser
  hasUnreadNotifications: boolean
  onLanguageToggle?: () => void
  onMenuClick?: () => void
  onLogout?: () => void
}

interface ReportBuilderProps {
  text: ReportsTextContent
  data: ReportsPageData
  activeReportMode: 'monthly' | 'annual'
  isGenerateDisabled: boolean
  filterMonth: string
  filterYear: string
  filterAccount: string
  filterCategory: string
  onGenerateReport?: () => void
  onReportModeChange?: (mode: 'monthly' | 'annual') => void
  onFilterMonthChange?: (v: string) => void
  onFilterYearChange?: (v: string) => void
  onFilterAccountChange?: (v: string) => void
  onFilterCategoryChange?: (v: string) => void
}

interface SummaryCardProps {
  stat: ReportsSummaryStat
  text: ReportsTextContent
}

interface HistoryItemProps {
  item: ReportsHistoryItem
  onHistoryItemClick?: (itemId: string) => void
}

interface ToneLegendProps {
  tone: ReportTone
}

const TEXT: Record<ReportsLanguage, ReportsTextContent> = {
  en: {
    appName: 'FinancePro',
    appSubtitle: 'Institutional Grade',
    pageTitle: 'Financial Reports',
    languageToggleLabel: 'EN / Arabic',
    notificationsAriaLabel: 'Notifications',
    menuAriaLabel: 'Open navigation',
    generateReport: 'Generate Report',
    monthlyReport: 'Monthly Report',
    annualReport: 'Annual Report',
    monthLabel: 'Month',
    yearLabel: 'Year',
    accountLabel: 'Account',
    categoryLabel: 'Category',
    allAccounts: 'All Accounts',
    allCategories: 'All Categories',
    generate: 'Generate Report',
    exportPdf: 'Export as PDF',
    exportAriaLabel: 'Export report as PDF',
    totalIncome: 'Total Income',
    totalExpenses: 'Total Expenses',
    netSavings: 'Net Savings',
    savingsRate: 'Savings Rate',
    cashFlowTrend: 'Cash Flow Trend',
    topExpenseCategories: 'Top Expense Categories',
    recentTransactions: 'Recent Transactions',
    viewAll: 'View All',
    previouslyGeneratedReports: 'Previously Generated Reports',
    emptyReport: 'No report data is available.',
    emptyHistory: 'No report history is available.',
    emptyCashFlow: 'No cash flow data is available.',
    emptyCategories: 'No expense categories are available.',
    emptyTransactions: 'No transactions are available.',
    clientLabel: 'Prepared for',
    generatedLabel: 'Generated:',
    yearSuffix: 'Year',
    monthSuffix: 'Month',
    incomeIndicator: 'Income',
    expenseIndicator: 'Expense',
    noDataLabel: 'No data',
    mobileMenuLabel: 'Open menu',
    logoutLabel: 'Logout',
    userMenuLabel: 'Open user menu',
  },
  ar: {
    appName: 'FinancePro',
    appSubtitle: 'مستوى مؤسسي',
    pageTitle: 'التقارير المالية',
    languageToggleLabel: 'EN / العربية',
    notificationsAriaLabel: 'الإشعارات',
    menuAriaLabel: 'فتح التنقل',
    generateReport: 'إنشاء التقرير',
    monthlyReport: 'تقرير شهري',
    annualReport: 'تقرير سنوي',
    monthLabel: 'الشهر',
    yearLabel: 'السنة',
    accountLabel: 'الحساب',
    categoryLabel: 'الفئة',
    allAccounts: 'كل الحسابات',
    allCategories: 'كل الفئات',
    generate: 'إنشاء التقرير',
    exportPdf: 'تصدير PDF',
    exportAriaLabel: 'تصدير التقرير كملف PDF',
    totalIncome: 'إجمالي الدخل',
    totalExpenses: 'إجمالي المصروفات',
    netSavings: 'صافي الادخار',
    savingsRate: 'معدل الادخار',
    cashFlowTrend: 'اتجاه التدفق النقدي',
    topExpenseCategories: 'أعلى فئات المصروفات',
    recentTransactions: 'آخر المعاملات',
    viewAll: 'عرض الكل',
    previouslyGeneratedReports: 'التقارير المنشأة سابقًا',
    emptyReport: 'لا توجد بيانات تقرير.',
    emptyHistory: 'لا يوجد سجل تقارير.',
    emptyCashFlow: 'لا توجد بيانات للتدفق النقدي.',
    emptyCategories: 'لا توجد فئات مصروفات.',
    emptyTransactions: 'لا توجد معاملات.',
    clientLabel: 'مُعد لـ',
    generatedLabel: 'تم الإنشاء:',
    yearSuffix: 'السنة',
    monthSuffix: 'الشهر',
    incomeIndicator: 'دخل',
    expenseIndicator: 'مصروف',
    noDataLabel: 'لا توجد بيانات',
    mobileMenuLabel: 'فتح القائمة',
    logoutLabel: 'تسجيل الخروج',
    userMenuLabel: 'فتح قائمة المستخدم',
  },
}

const ICONS: Record<ReportsIconName, LucideIcon> = {
  accounts: Building2,
  budgets: LayoutDashboard,
  dashboard: LayoutDashboard,
  notifications: Bell,
  recurring: Repeat,
  reports: BarChart3,
  settings: Settings,
  transactions: ReceiptText,
  wallet: WalletCards,
}

function formatCurrency(value: number | string, currency: string = 'USD'): string {
  const n = typeof value === 'string' ? parseFloat(value) : value
  if (!isFinite(n)) return `${currency} 0.00`
  return `${currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDateISO(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return iso }
}

function formatShortDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } catch { return iso }
}

const DEFAULT_DATA: ReportsPageData = {
  navItems: [],
  monthOptions: [],
  yearOptions: [],
  accountOptions: [],
  categoryOptions: [],
}

export function useReportsPageText(language: ReportsLanguage = 'en'): ReportsTextContent {
  return TEXT[language]
}

export function useReportsPageData(): ReportsPageData {
  return DEFAULT_DATA
}

export interface ReportsPageFilterHandlers {
  filterMonth: string
  filterYear: string
  filterAccount: string
  filterCategory: string
  onFilterMonthChange?: (v: string) => void
  onFilterYearChange?: (v: string) => void
  onFilterAccountChange?: (v: string) => void
  onFilterCategoryChange?: (v: string) => void
}

export function ReportsPage({
  data,
  language = 'en',
  text,
  activeReportMode = 'monthly',
  isGenerateDisabled = false,
  filterMonth = '',
  filterYear = '',
  filterAccount = '',
  filterCategory = '',
  hasUnreadNotifications: _hasUnreadNotifications = false,
  onLanguageToggle: _onLanguageToggle,
  onMenuClick: _onMenuClick,
  onGenerateReport,
  onExportPdf,
  onHistoryItemClick,
  onNavItemClick: _onNavItemClick,
  onReportModeChange,
  onFilterMonthChange,
  onFilterYearChange,
  onFilterAccountChange,
  onFilterCategoryChange,
  onLogout: _onLogout,
}: ReportsPageProps & Partial<ReportsPageFilterHandlers>) {
  const pageText = { ...useReportsPageText(language), ...text }
  const fallbackData = useReportsPageData()
  const pageData = data ?? fallbackData

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <ReportBuilder
          text={pageText}
          data={pageData}
          activeReportMode={activeReportMode}
          isGenerateDisabled={isGenerateDisabled}
          filterMonth={filterMonth}
          filterYear={filterYear}
          filterAccount={filterAccount}
          filterCategory={filterCategory}
          onGenerateReport={onGenerateReport}
          onReportModeChange={onReportModeChange}
          onFilterMonthChange={onFilterMonthChange}
          onFilterYearChange={onFilterYearChange}
          onFilterAccountChange={onFilterAccountChange}
          onFilterCategoryChange={onFilterCategoryChange}
        />

        <ReportPreviewSection
          text={pageText}
          report={pageData.report}
          onExportPdf={onExportPdf}
          onHistoryItemClick={onHistoryItemClick}
        />
      </div>
    </>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Sidebar({ text, navItems, onNavItemClick, onLogout }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 start-0 z-20 hidden w-60 flex-col border-e border-[#bdc9c6] bg-[#f8f9ff] px-4 py-6 shadow-sm md:flex">
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#005c55] text-white">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-semibold text-[#005c55]">{text.appName}</h1>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3e4947]">
            {text.appSubtitle}
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {navItems.length > 0 ? (
          navItems.map((item) => {
            const Icon = ICONS[item.icon]
            const active = item.isActive

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavItemClick?.(item.id)}
                className={[
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition',
                  active
                    ? 'border-e-4 border-[#005c55] bg-[#e5eeff] font-bold text-[#005c55]'
                    : 'text-[#3e4947] hover:bg-[#e5eeff] hover:text-[#005c55]',
                ].join(' ')}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            )
          })
        ) : (
          <div className="rounded-xl border border-dashed border-[#bdc9c6] bg-white px-4 py-6 text-sm text-[#3e4947]">
            {text.noDataLabel}
          </div>
        )}
      </nav>

      {onLogout ? (
        <button
          type="button"
          onClick={onLogout}
          className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#3e4947] transition hover:bg-[#e5eeff] hover:text-[#005c55]"
        >
          <LogOut className="h-5 w-5" aria-hidden="true" />
          <span>{text.logoutLabel}</span>
        </button>
      ) : null}
    </aside>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function TopHeader({
  text,
  user,
  hasUnreadNotifications,
  onLanguageToggle,
  onMenuClick,
  onLogout,
}: TopHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#bdc9c6] bg-white/90 shadow-sm backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#3e4947] transition hover:bg-[#e5eeff] hover:text-[#005c55] md:hidden"
            aria-label={text.menuAriaLabel}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <h2 className="hidden text-xl font-semibold text-[#0b1c30] md:block">{text.pageTitle}</h2>
        </div>

        <div className="flex items-center gap-3">
          {onLanguageToggle ? (
            <button
              type="button"
              onClick={onLanguageToggle}
              className="hidden rounded-full border border-[#bdc9c6] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#3e4947] sm:inline-flex"
            >
              {text.languageToggleLabel}
            </button>
          ) : null}

          <button
            type="button"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-[#3e4947] transition hover:bg-[#e5eeff] hover:text-[#005c55]"
            aria-label={text.notificationsAriaLabel}
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            {hasUnreadNotifications ? (
              <span className="absolute end-2 top-2 h-2 w-2 rounded-full bg-[#fea619]" />
            ) : null}
          </button>

          {user ? (
            <button
              type="button"
              aria-label={text.userMenuLabel}
              className="inline-flex items-center gap-2 rounded-full border border-[#bdc9c6] bg-white px-2 py-1 pr-3 shadow-sm"
            >
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#e5eeff] text-xs font-bold text-[#005c55]">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span>{user.initials ?? user.name.slice(0, 2)}</span>
                )}
              </div>
              <span className="hidden text-sm font-medium text-[#0b1c30] sm:inline">{user.name}</span>
            </button>
          ) : null}

          {onLogout ? (
            <button
              type="button"
              onClick={onLogout}
              className="hidden rounded-xl border border-[#bdc9c6] px-3 py-2 text-sm font-medium text-[#3e4947] transition hover:text-[#0b1c30] lg:inline-flex"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>
    </header>
  )
}

function ReportBuilder({
  text,
  data,
  activeReportMode,
  isGenerateDisabled,
  filterMonth,
  filterYear,
  filterAccount,
  filterCategory,
  onGenerateReport,
  onReportModeChange,
  onFilterMonthChange,
  onFilterYearChange,
  onFilterAccountChange,
  onFilterCategoryChange,
}: ReportBuilderProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#005c55] bg-white p-5 shadow-sm sm:p-6 lg:p-8">
      <div className="absolute end-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/4 rounded-full bg-[#9cf2e8]/20 blur-3xl pointer-events-none" />

      <div className="mb-6 flex items-center border-b border-[#bdc9c6]">
        <TabButton label={text.monthlyReport} isActive={activeReportMode === 'monthly'} onClick={() => onReportModeChange?.('monthly')} />
        <TabButton label={text.annualReport} isActive={activeReportMode === 'annual'} onClick={() => onReportModeChange?.('annual')} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {activeReportMode === 'monthly' ? (
          <FilterField label={text.monthLabel} value={filterMonth} options={data.monthOptions} onChange={onFilterMonthChange} />
        ) : null}
        <FilterField label={text.yearLabel} value={filterYear} options={data.yearOptions} onChange={onFilterYearChange} />
        <FilterField label={text.accountLabel} value={filterAccount} options={data.accountOptions} onChange={onFilterAccountChange} />
        <FilterField label={text.categoryLabel} value={filterCategory} options={data.categoryOptions} onChange={onFilterCategoryChange} />
      </div>

      <div className="mt-6 flex justify-end">
        {onGenerateReport ? (
          <button
            type="button"
            onClick={onGenerateReport}
            disabled={isGenerateDisabled}
            className="inline-flex items-center gap-2 rounded-xl bg-[#005c55] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f766e] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {text.generate}
          </button>
        ) : null}
      </div>
    </section>
  )
}

function ReportPreviewSection({
  text,
  report,
  onExportPdf,
  onHistoryItemClick,
}: {
  text: ReportsTextContent
  report?: ReportsDocument
  onExportPdf?: () => void
  onHistoryItemClick?: (itemId: string) => void
}) {
  if (!report) {
    return (
      <section className="rounded-2xl border border-dashed border-[#bdc9c6] bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-[#3e4947]">{text.emptyReport}</p>
      </section>
    )
  }

  return (
    <>
      <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 border-b border-[#bdc9c6] pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-2xl font-bold text-[#0b1c30] sm:text-3xl">{report.title}</h3>
            <p className="mt-1 text-sm text-[#3e4947]">
              {text.clientLabel} {report.clientName} | {report.periodLabel}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#6e7977]">
              {text.generatedLabel} {report.generatedAtLabel}
            </p>
          </div>

          {onExportPdf ? (
            <button
              type="button"
              onClick={onExportPdf}
              className="inline-flex items-center gap-2 rounded-xl border border-[#005c55] bg-white px-4 py-3 text-sm font-semibold text-[#005c55] transition hover:bg-[#e5eeff]"
            >
              <PictureInPicture2 className="h-4 w-4" aria-hidden="true" />
              {text.exportPdf}
            </button>
          ) : null}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {report.summaryStats.length > 0 ? (
            report.summaryStats.map((stat) => (
              <SummaryCard key={stat.id} stat={stat} text={text} />
            ))
          ) : (
            <EmptyBox text={text.emptyReport} />
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="flex h-[320px] flex-col rounded-xl border border-[#bdc9c6] bg-white p-4 shadow-sm">
            <h4 className="mb-4 text-lg font-semibold text-[#0b1c30]">{report.cashFlowTitle}</h4>
            {report.cashFlowBars.length > 0 ? (
              <div className="flex h-52 items-end gap-1 rounded-lg bg-[#eff4ff] p-3">
                {report.cashFlowBars.map((bar) => (
                  <CashFlowBar key={bar.id} bar={bar} />
                ))}
              </div>
            ) : (
              <EmptyBox text={text.emptyCashFlow} />
            )}
          </section>

          <section className="flex h-[320px] flex-col overflow-hidden rounded-xl border border-[#bdc9c6] bg-white p-4 shadow-sm">
            <h4 className="mb-4 text-lg font-semibold text-[#0b1c30]">{report.expenseCategoriesTitle}</h4>
            {report.expenseCategories.length > 0 ? (
              <div className="overflow-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#bdc9c6] text-xs uppercase tracking-[0.18em] text-[#6e7977]">
                      <th className="py-2 font-medium">{text.categoryLabel}</th>
                      <th className="py-2 text-right font-medium">{text.accountLabel}</th>
                      <th className="py-2 text-right font-medium">{text.noDataLabel}</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-[#0b1c30]">
                    {report.expenseCategories.map((category, index) => (
                      <tr key={category.id} className={index < report.expenseCategories.length - 1 ? 'border-b border-[#eff4ff]' : ''}>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span className={`h-3 w-3 rounded-full ${categoryToneClass(category.tone ?? 'neutral')}`} />
                            <span>{category.label}</span>
                          </div>
                        </td>
                        <td className="py-3 text-right font-medium">{category.amountLabel}</td>
                        <td className="py-3 text-right text-[#3e4947]">{category.percentLabel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyBox text={text.emptyCategories} />
            )}
          </section>
        </div>

        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h4 className="text-lg font-semibold text-[#0b1c30]">{report.transactionsTitle}</h4>
            <button type="button" onClick={() => { window.location.href = '/transactions' }} className="text-sm font-semibold text-[#005c55] hover:underline">
              {text.viewAll}
            </button>
          </div>

          {report.transactions.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-[#bdc9c6] bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full whitespace-nowrap text-left">
                  <thead className="border-b border-[#bdc9c6] bg-[#eff4ff] text-xs uppercase tracking-[0.18em] text-[#6e7977]">
                    <tr>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Description</th>
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 font-medium">Account</th>
                      <th className="px-4 py-3 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {report.transactions.map((transaction, index) => (
                      <tr
                        key={transaction.id}
                        className={index < report.transactions.length - 1 ? 'border-b border-[#eff4ff]' : ''}
                      >
                        <td className="px-4 py-3 text-[#3e4947]">{transaction.dateLabel}</td>
                        <td className="px-4 py-3 font-medium text-[#0b1c30]">{transaction.description}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-md bg-[#eff4ff] px-2 py-1 text-xs text-[#3e4947]">
                            {transaction.categoryLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#3e4947]">{transaction.accountLabel}</td>
                        <td className={`px-4 py-3 text-right font-medium ${toneAmountClass(transaction.tone)}`}>
                          {transaction.amountLabel}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyBox text={text.emptyTransactions} />
          )}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6 lg:p-8">
        <h3 className="mb-4 text-xl font-semibold text-[#0b1c30]">{report.historyTitle}</h3>
        {report.historyItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {report.historyItems.map((item) => (
              <HistoryItem key={item.id} item={item} onHistoryItemClick={onHistoryItemClick} />
            ))}
          </div>
        ) : (
          <EmptyBox text={text.emptyHistory} />
        )}
      </section>
    </>
  )
}

function TabButton({ label, isActive, onClick }: { label: string; isActive: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'px-5 py-3 text-sm font-semibold transition sm:text-base',
        isActive
          ? 'border-b-2 border-[#005c55] text-[#005c55]'
          : 'text-[#6e7977] hover:text-[#005c55]',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

function FilterField({ label, value, options, onChange }: { label: string; value?: string; options: ReportsFilterOption[]; onChange?: (value: string) => void }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6e7977]">{label}</span>
      <select
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        className="rounded-xl border border-[#bdc9c6] bg-white px-4 py-3 text-sm text-[#0b1c30] focus:border-[#005c55] focus:outline-none focus:ring-2 focus:ring-[#80d5cb]/30"
      >
        {options.length > 0 ? (
          options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))
        ) : (
          <option value="">{label}</option>
        )}
      </select>
    </label>
  )
}

function SummaryCard({ stat, text }: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-[#bdc9c6] bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-sm text-[#6e7977]">
        {stat.tone === 'income' ? (
          <ArrowDown className="h-4 w-4" aria-hidden="true" />
        ) : stat.tone === 'expense' ? (
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
        ) : (
          <CircleIcon tone={stat.tone} />
        )}
        <span>{stat.label}</span>
      </div>
      <div className={`text-2xl font-bold ${toneTextClass(stat.tone)}`}>{stat.valueLabel}</div>
      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#6e7977]">{text.noDataLabel}</p>
    </div>
  )
}

function CashFlowBar({ bar }: { bar: ReportsCashFlowBar }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1 min-w-0">
      <div className="flex w-full flex-1 items-end justify-center">
        <div
          className={`w-5 rounded-t-sm transition-all duration-500 ${toneBarClass(bar.tone)}`}
          style={{ height: `${Math.max(4, bar.percent)}%` }}
        />
      </div>
      <div className="text-center w-full">
        <div className="text-[10px] font-semibold text-[#0b1c30] truncate">{bar.label}</div>
        <div className="text-[9px] text-[#3e4947] truncate">{bar.valueLabel}</div>
      </div>
    </div>
  )
}

function HistoryItem({ item, onHistoryItemClick }: HistoryItemProps) {
  const Icon = item.icon === 'pie' ? FileText : BarChart3

  return (
    <button
      type="button"
      onClick={() => onHistoryItemClick?.(item.id)}
      className="flex items-center justify-between rounded-xl border border-[#bdc9c6] bg-[#f8f9ff] p-4 text-left shadow-sm transition hover:border-[#80d5cb] hover:bg-white"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eff4ff] text-[#005c55]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h5 className="text-sm font-medium text-[#0b1c30]">{item.title}</h5>
          <p className="text-xs uppercase tracking-[0.18em] text-[#6e7977]">{item.subtitle}</p>
        </div>
      </div>
      <Download className="h-5 w-5 text-[#3e4947]" aria-hidden="true" />
    </button>
  )
}

function EmptyBox({ text }: { text: string }) {
  return (
    <div className="flex min-h-32 items-center justify-center rounded-xl border border-dashed border-[#bdc9c6] bg-[#f8f9ff] px-4 py-8 text-center text-sm text-[#3e4947]">
      {text}
    </div>
  )
}

function CircleIcon({ tone }: ToneLegendProps) {
  return <span className={`h-4 w-4 rounded-full ${toneLegendClass(tone)}`} aria-hidden="true" />
}

function toneTextClass(tone: ReportTone) {
  if (tone === 'income') return 'text-[#005c55]'
  if (tone === 'expense') return 'text-[#ba1a1a]'
  if (tone === 'primary') return 'text-[#005c55]'
  return 'text-[#0b1c30]'
}

function toneBarClass(tone: ReportTone) {
  if (tone === 'income') return 'bg-[#005c55]'
  if (tone === 'expense') return 'bg-[#ba1a1a]'
  if (tone === 'primary') return 'bg-[#0f766e]'
  return 'bg-[#bdc9c6]'
}

function toneLegendClass(tone: ReportTone) {
  if (tone === 'income') return 'bg-[#005c55]'
  if (tone === 'expense') return 'bg-[#fea619]'
  if (tone === 'primary') return 'bg-[#80d5cb]'
  return 'bg-[#bdc9c6]'
}

function categoryToneClass(tone: ReportTone) {
  return toneLegendClass(tone)
}

function toneAmountClass(tone: ReportTone) {
  if (tone === 'income') return 'text-[#005c55]'
  if (tone === 'expense') return 'text-[#ba1a1a]'
  if (tone === 'primary') return 'text-[#0f766e]'
  return 'text-[#0b1c30]'
}

function ReportsPageContainer() {
  const language = useSelector(selectLanguage)
  const navigate = useNavigate()
  const isAr = language === 'ar'
  const authUser = useSelector((state: any) => state.auth.user)

  const now = new Date()
  const [reportMode, setReportMode] = useState<'monthly' | 'annual'>('monthly')
  const [filterMonth, setFilterMonth] = useState(String(now.getMonth() + 1))
  const [filterYear, setFilterYear] = useState(String(now.getFullYear()))
  const [filterAccount, setFilterAccount] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  const [accounts, setAccounts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generatedReport, setGeneratedReport] = useState<ReportsDocument | null>(null)
  const [historyItems, setHistoryItems] = useState<ReportsHistoryItem[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchDropdowns = useCallback(async () => {
    try {
      setLoading(true)
      const [accountsRes, categoriesRes] = await Promise.all([
        api.get('/accounts'),
        api.get('/categories'),
      ])
      setAccounts(accountsRes.data.accounts || [])
      setCategories(categoriesRes.data.categories || [])
    } catch (err) {
      console.error('Failed to load report filters:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchHistory = useCallback(async () => {
    try {
      const res = await api.get('/reports/history')
      const reports = res.data.reports || []
      setHistoryItems(reports.map((h: any) => ({
        id: h.id,
        title: h.reportType === 'monthly'
          ? (isAr ? 'تقرير شهري' : 'Monthly Report')
          : (isAr ? 'تقرير سنوي' : 'Annual Report'),
        subtitle: h.period,
        icon: h.reportType === 'annual' ? 'pie' as const : 'chart' as const,
      })))
    } catch (err) {
      console.error('Failed to load report history:', err)
    }
  }, [isAr])

  useEffect(() => {
    fetchDropdowns()
    fetchHistory()
  }, [fetchDropdowns, fetchHistory])

  const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
  const months = isAr ? MONTHS_AR : MONTHS_EN

  const currentYear = now.getFullYear()

  const monthOptions: ReportsFilterOption[] = months.map((name, i) => ({
    value: String(i + 1),
    label: name,
  }))

  const yearOptions: ReportsFilterOption[] = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((y) => ({
    value: String(y),
    label: String(y),
  }))

  const accountOptions: ReportsFilterOption[] = [
    { value: '', label: isAr ? 'كل الحسابات' : 'All Accounts' },
    ...accounts.map((a: any) => ({ value: a.id, label: a.accountName })),
  ]

  const categoryOptions: ReportsFilterOption[] = [
    { value: '', label: isAr ? 'كل الفئات' : 'All Categories' },
    ...categories.map((c: any) => ({ value: c.id, label: isAr ? c.nameAr : c.nameEn })),
  ]

  const buildRequestBody = useCallback(() => {
    const body: Record<string, any> = {
      reportType: reportMode,
      year: parseInt(filterYear, 10),
    }
    if (reportMode === 'monthly') {
      body.month = parseInt(filterMonth, 10)
    }
    if (filterAccount) body.accountId = filterAccount
    if (filterCategory) body.categoryId = filterCategory
    return body
  }, [reportMode, filterMonth, filterYear, filterAccount, filterCategory])

  const computeCashFlowBars = (transactions: any[]): ReportsCashFlowBar[] => {
    if (!transactions || transactions.length === 0) return []

    const groups: Record<string, { income: number; expense: number }> = {}
    transactions.forEach((tx: any) => {
      if (tx.type !== 'income' && tx.type !== 'expense') return
      const d = new Date(tx.transactionDate)
      let key: string
      if (reportMode === 'annual') {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      } else {
        const weekOfMonth = Math.ceil(d.getDate() / 7)
        key = `W${weekOfMonth}`
      }
      if (!groups[key]) groups[key] = { income: 0, expense: 0 }
      if (tx.type === 'income') groups[key].income += parseFloat(tx.amount) || 0
      else groups[key].expense += parseFloat(tx.amount) || 0
    })

    const keys = Object.keys(groups).sort()
    const allValues: number[] = []
    const bars: ReportsCashFlowBar[] = []

    keys.forEach((key) => {
      const { income, expense } = groups[key]
      allValues.push(income, expense)
      bars.push(
        { id: `${key}-inc`, label: key, valueLabel: formatCurrency(income), percent: 0, tone: 'income' },
        { id: `${key}-exp`, label: key, valueLabel: formatCurrency(expense), percent: 0, tone: 'expense' },
      )
    })

    const maxVal = Math.max(...allValues, 1)
    bars.forEach((bar) => {
      const val = parseFloat(bar.valueLabel.replace(/[^0-9.\-]/g, ''))
      bar.percent = Math.round((val / maxVal) * 100)
    })

    return bars
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    try {
      const body = buildRequestBody()
      const res = await api.post('/reports/generate', body)
      const backendReport = res.data.report

      const totals = backendReport.totals
      const totalExpensesNum = parseFloat(totals.totalExpenses) || 0
      const bars = computeCashFlowBars(backendReport.transactions || [])

      const report: ReportsDocument = {
        reportMode,
        title: reportMode === 'monthly'
          ? (isAr ? 'الملخص المالي الشهري' : 'Monthly Financial Summary')
          : (isAr ? 'الملخص المالي السنوي' : 'Annual Financial Summary'),
        periodLabel: reportMode === 'monthly'
          ? `${months[(parseInt(filterMonth) || 1) - 1]} ${filterYear}`
          : filterYear,
        clientName: authUser?.name || '',
        generatedAtLabel: formatDateISO(new Date().toISOString()),
        summaryStats: [
          { id: 'income', label: isAr ? 'إجمالي الدخل' : 'Total Income', valueLabel: formatCurrency(totals.totalIncome), tone: 'income' },
          { id: 'expenses', label: isAr ? 'إجمالي المصروفات' : 'Total Expenses', valueLabel: formatCurrency(totals.totalExpenses), tone: 'expense' },
          { id: 'savings', label: isAr ? 'صافي الادخار' : 'Net Savings', valueLabel: formatCurrency(totals.netSavings), tone: 'primary' },
          { id: 'rate', label: isAr ? 'معدل الادخار' : 'Savings Rate', valueLabel: `${totals.savingsRate}%`, tone: 'neutral' },
        ],
        cashFlowTitle: isAr ? 'اتجاه التدفق النقدي' : 'Cash Flow Trend',
        cashFlowBars: bars,
        expenseCategoriesTitle: isAr ? 'أعلى فئات المصروفات' : 'Top Expense Categories',
        expenseCategories: (backendReport.topExpenseCategories || []).map((cat: any, i: number) => ({
          id: String(i),
          label: cat.category,
          amountLabel: formatCurrency(cat.amount),
          percentLabel: totalExpensesNum > 0 ? `${((parseFloat(cat.amount) / totalExpensesNum) * 100).toFixed(1)}%` : '0%',
          tone: 'expense' as const,
        })),
        transactionsTitle: reportMode === 'monthly'
          ? (isAr ? `معاملات ${months[(parseInt(filterMonth) || 1) - 1]} ${filterYear}` : `Transactions (${months[(parseInt(filterMonth) || 1) - 1]} ${filterYear})`)
          : (isAr ? `معاملات ${filterYear}` : `Transactions (${filterYear})`),
        transactions: (backendReport.transactions || []).map((tx: any) => ({
          id: tx.id,
          dateLabel: formatShortDate(tx.transactionDate),
          description: tx.description || '',
          categoryLabel: isAr ? (tx.category?.nameAr || '') : (tx.category?.nameEn || ''),
          accountLabel: tx.account?.accountName || '',
          amountLabel: `${tx.type === 'expense' ? '- ' : '+ '}${formatCurrency(tx.amount)}`,
          tone: tx.type === 'income' ? 'income' as const : 'expense' as const,
        })),
        historyTitle: isAr ? 'التقارير المنشأة سابقًا' : 'Previously Generated Reports',
        historyItems,
      }

      setGeneratedReport(report)
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || (isAr ? 'فشل إنشاء التقرير' : 'Failed to generate report')
      setError(msg)
      console.error('Report generation failed:', err)
    } finally {
      setGenerating(false)
    }
  }

  const handleExportPdf = () => {
    if (!generatedReport) return
    navigate('/reports/preview', {
      state: { report: generatedReport, requestBody: buildRequestBody() },
    })
  }

  const navItems: ReportsNavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
    { id: 'accounts', label: 'Accounts', icon: 'accounts', href: '/accounts' },
    { id: 'transactions', label: 'Transactions', icon: 'transactions', href: '/transactions' },
    { id: 'budgets', label: 'Budgets', icon: 'budgets', href: '/budgets' },
    { id: 'reports', label: 'Reports', icon: 'reports', href: '/reports', isActive: true },
    { id: 'settings', label: 'Settings', icon: 'settings', href: '/profile-settings' },
  ]

  const pageData: ReportsPageData = {
    navItems,
    monthOptions,
    yearOptions,
    accountOptions,
    categoryOptions,
    report: generatedReport ?? undefined,
  }

  const isGenerateDisabled = generating || loading

  return (
    <ReportsPage
      language={language}
      data={pageData}
      activeReportMode={reportMode}
      isGenerateDisabled={isGenerateDisabled}
      filterMonth={filterMonth}
      filterYear={filterYear}
      filterAccount={filterAccount}
      filterCategory={filterCategory}
      onReportModeChange={(mode) => {
        setReportMode(mode)
        setGeneratedReport(null)
      }}
      onFilterMonthChange={setFilterMonth}
      onFilterYearChange={setFilterYear}
      onFilterAccountChange={setFilterAccount}
      onFilterCategoryChange={setFilterCategory}
      onGenerateReport={handleGenerate}
      onExportPdf={handleExportPdf}
      onHistoryItemClick={(id) => {
        const h = historyItems.find((item) => item.id === id)
        if (h) {
          navigate('/reports/preview', { state: { report: generatedReport } })
        }
      }}
      onNavItemClick={(id) => {
        const routes: Record<string, string> = {
          dashboard: '/dashboard', accounts: '/accounts', transactions: '/transactions',
          recurring: '/transactions/recurring', budgets: '/budgets', reports: '/reports',
          notifications: '/notifications', settings: '/profile-settings',
        }
        if (routes[id]) navigate(routes[id])
      }}
      onLogout={() => navigate('/login')}
    />
  )
}

export default ReportsPageContainer
