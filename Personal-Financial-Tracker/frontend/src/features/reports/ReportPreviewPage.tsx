import { useSelector } from 'react-redux'
import { selectLanguage } from '../../store'
import {
  BarChart3,
  Bell,
  Building2,
  Download,
  Globe2,
  LayoutDashboard,
  LogOut,
  Menu,
  Printer,
  ReceiptText,
  Repeat,
  Settings,
  ShieldCheck,
  WalletCards,
  type LucideIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export type ReportPreviewLanguage = 'en' | 'ar'
export type ReportPreviewIconName =
  | 'accounts'
  | 'budgets'
  | 'dashboard'
  | 'notifications'
  | 'recurring'
  | 'reports'
  | 'settings'
  | 'transactions'
  | 'wallet'

export type ReportAmountTone = 'income' | 'expense' | 'primary' | 'neutral'

export interface ReportPreviewUser {
  name: string
  avatarUrl?: string
  initials?: string
}

export interface ReportPreviewNavItem {
  id: string
  label: string
  icon: ReportPreviewIconName
  href?: string
  isActive?: boolean
}

export interface ReportSummaryStat {
  id: string
  label: string
  valueLabel: string
  tone: ReportAmountTone
}

export interface ReportCashFlowBar {
  id: string
  label: string
  valueLabel: string
  percent: number
  tone: ReportAmountTone
}

export interface ReportExpenseCategory {
  id: string
  label: string
  amountLabel: string
  percentLabel: string
}

export interface ReportTransaction {
  id: string
  dateLabel: string
  description: string
  categoryLabel: string
  amountLabel: string
  tone: ReportAmountTone
}

export interface ReportBreakdown {
  title: string
  centerValueLabel: string
  centerLabel: string
}

export interface ReportDocument {
  brandName: string
  brandInitials: string
  title: string
  periodLabel: string
  clientName: string
  accountId: string
  generatedAtLabel: string
  summaryStats: ReportSummaryStat[]
  cashFlowTitle: string
  cashFlowBars: ReportCashFlowBar[]
  breakdown: ReportBreakdown
  expenseCategoriesTitle: string
  expenseCategories: ReportExpenseCategory[]
  transactionsTitle: string
  transactions: ReportTransaction[]
  footerStatement: string
  confidentialityLabel: string
  pageLabel: string
}

export interface ReportPreviewPageData {
  user?: ReportPreviewUser
  navItems: ReportPreviewNavItem[]
  report?: ReportDocument
}

export interface ReportPreviewPageProps {
  data?: ReportPreviewPageData
  language?: ReportPreviewLanguage
  hasUnreadNotifications?: boolean
  onLanguageToggle?: () => void
  onMenuClick?: () => void
  onPrint?: () => void
  onDownload?: () => void
  onLogout?: () => void
}

interface SidebarProps {
  navItems: ReportPreviewNavItem[]
  onLogout?: () => void
}

interface TopHeaderProps {
  user?: ReportPreviewUser
  hasUnreadNotifications: boolean
  onLanguageToggle?: () => void
  onMenuClick?: () => void
}

interface FloatingToolbarProps {
  onPrint?: () => void
  onDownload?: () => void
}

interface ReportSheetProps {
  report?: ReportDocument
}

interface UserAvatarProps {
  user?: ReportPreviewUser
}

const TEXT = {
  appName: 'FinancePro',
  appSubtitle: 'Institutional Grade',
  pageTitle: 'Report Preview',
  languageLabel: 'EN / Arabic',
  languageAriaLabel: 'Change language',
  notificationsAriaLabel: 'Notifications',
  menuAriaLabel: 'Open navigation',
  printAriaLabel: 'Print or save as PDF',
  downloadAriaLabel: 'Download data',
  logout: 'Logout',
  clientLabel: 'Client:',
  accountIdLabel: 'Account ID:',
  generatedLabel: 'Generated:',
  emptyReport: 'No report preview is available.',
  emptyNav: 'No navigation items available.',
  emptyStats: 'No report summary available.',
  emptyCashFlow: 'No cash flow data available.',
  emptyExpenseCategories: 'No expense categories available.',
  emptyTransactions: 'No transactions available.',
  tableHeaders: {
    category: 'Category',
    amount: 'Amount',
    percentTotal: '% Total',
    date: 'Date',
    description: 'Description',
  },
}

const ICONS: Record<ReportPreviewIconName, LucideIcon> = {
  accounts: Building2,
  budgets: WalletCards,
  dashboard: LayoutDashboard,
  notifications: Bell,
  recurring: Repeat,
  reports: BarChart3,
  settings: Settings,
  transactions: ReceiptText,
  wallet: WalletCards,
}

const DEFAULT_DATA: ReportPreviewPageData = {
  navItems: [],
}

export function useReportPreviewPageData(): ReportPreviewPageData {
  return DEFAULT_DATA
}

export function ReportPreviewPage({
  data,
  language = 'en',
  hasUnreadNotifications: _hasUnreadNotifications = false,
  onLanguageToggle: _onLanguageToggle,
  onMenuClick: _onMenuClick,
  onPrint,
  onDownload,
  onLogout: _onLogout,
}: ReportPreviewPageProps) {
  const fallbackData = useReportPreviewPageData()
  const pageData = data ?? fallbackData
  const _isRtl = language === 'ar'

  return (
    <>
      <div className="relative flex-1 overflow-auto bg-[#dce9ff] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <FloatingToolbar onPrint={onPrint} onDownload={onDownload} />
        <ReportSheet report={pageData.report} />
        <div className="h-16 w-full shrink-0 print:hidden" />
      </div>
    </>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Sidebar({ navItems, onLogout }: SidebarProps) {
  return (
    <nav className="fixed start-0 top-0 z-40 hidden h-screen w-60 flex-col border-e border-[#bdc9c6] bg-[#f8f9ff] px-4 py-6 shadow-sm md:flex print:hidden">
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f766e] text-white">
          <WalletCards className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-semibold text-[#005c55]">{TEXT.appName}</h1>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#3e4947]">
            {TEXT.appSubtitle}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {navItems.length > 0 ? (
          navItems.map((item) => {
            const Icon = ICONS[item.icon]

            return (
              <a
                key={item.id}
                href={item.href ?? '#'}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  item.isActive
                    ? 'border-e-4 border-[#005c55] bg-[#e5eeff] font-bold text-[#005c55]'
                    : 'text-[#3e4947] hover:bg-[#e5eeff] hover:text-[#005c55]'
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{item.label}</span>
              </a>
            )
          })
        ) : (
          <div className="rounded-lg border border-dashed border-[#bdc9c6] p-3 text-sm text-[#3e4947]">
            {TEXT.emptyNav}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="mt-auto flex items-center gap-3 border-t border-[#d3e4fe] px-3 py-4 text-sm text-[#3e4947] transition hover:text-[#005c55]"
      >
        <LogOut className="h-5 w-5" aria-hidden="true" />
        <span>{TEXT.logout}</span>
      </button>
    </nav>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function TopHeader({
  user,
  hasUnreadNotifications,
  onLanguageToggle,
  onMenuClick,
}: TopHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#bdc9c6] bg-[#f8f9ff] px-4 shadow-sm sm:px-6 print:hidden">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={TEXT.menuAriaLabel}
          onClick={onMenuClick}
          className="rounded-full p-2 text-[#3e4947] transition hover:bg-[#e5eeff] md:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <h2 className="text-lg font-semibold text-[#005c55] sm:text-xl">{TEXT.pageTitle}</h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          aria-label={TEXT.languageAriaLabel}
          onClick={onLanguageToggle}
          className="hidden items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#3e4947] transition hover:bg-[#e5eeff] hover:text-[#005c55] sm:inline-flex"
        >
          <Globe2 className="h-4 w-4" aria-hidden="true" />
          {TEXT.languageLabel}
        </button>
        <button
          type="button"
          aria-label={TEXT.notificationsAriaLabel}
          className="relative rounded-full p-2 text-[#3e4947] transition hover:bg-[#e5eeff] hover:text-[#005c55]"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {hasUnreadNotifications ? (
            <span className="absolute end-2 top-2 h-2.5 w-2.5 rounded-full border border-[#f8f9ff] bg-[#fea619]" />
          ) : null}
        </button>
        <UserAvatar user={user} />
      </div>
    </header>
  )
}

function FloatingToolbar({ onPrint, onDownload }: FloatingToolbarProps) {
  const handlePrint = () => {
    if (onPrint) {
      onPrint()
      return
    }

    window.print()
  }

  return (
    <div className="fixed bottom-6 end-4 z-40 flex gap-3 sm:end-6 lg:bottom-auto lg:top-24 lg:flex-col print:hidden">
      <button
        type="button"
        aria-label={TEXT.printAriaLabel}
        onClick={handlePrint}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#005c55] text-white shadow-lg transition hover:scale-105 hover:bg-[#0f766e] active:scale-95"
      >
        <Printer className="h-5 w-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label={TEXT.downloadAriaLabel}
        onClick={onDownload}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-[#bdc9c6] bg-white text-[#005c55] shadow-lg transition hover:scale-105 hover:bg-[#eff4ff] active:scale-95"
      >
        <Download className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  )
}

function ReportSheet({ report }: ReportSheetProps) {
  if (!report) {
    return (
      <section className="mx-auto flex min-h-96 w-full max-w-4xl items-center justify-center rounded-lg border border-dashed border-[#bdc9c6] bg-white p-8 text-center text-sm text-[#3e4947] shadow-lg">
        {TEXT.emptyReport}
      </section>
    )
  }

  return (
    <article className="mx-auto flex w-full max-w-[210mm] flex-col bg-white p-4 shadow-xl sm:p-8 lg:min-h-[297mm] lg:p-[20mm] print:min-h-screen print:max-w-none print:p-0 print:shadow-none">
      <ReportHeader report={report} />

      <div className="flex flex-1 flex-col gap-8">
        <SummaryStats stats={report.summaryStats} />

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <CashFlowCard title={report.cashFlowTitle} bars={report.cashFlowBars} />
          <ExpenseBreakdownCard breakdown={report.breakdown} />
        </section>

        <section className="grid grid-cols-1 gap-8">
          <ExpenseCategoriesTable
            title={report.expenseCategoriesTitle}
            categories={report.expenseCategories}
          />
          <TransactionsTable title={report.transactionsTitle} transactions={report.transactions} />
        </section>
      </div>

      <ReportFooter report={report} />
    </article>
  )
}

function ReportHeader({ report }: { report: ReportDocument }) {
  return (
    <header className="mb-8 flex flex-col gap-5 border-b-2 border-[#bdc9c6] pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-[#005c55] text-sm font-bold text-white">
            {report.brandInitials}
          </span>
          <span className="text-xl font-semibold text-[#005c55]">{report.brandName}</span>
        </div>
        <h1 className="text-3xl font-bold text-[#0b1c30] sm:text-4xl">{report.title}</h1>
        <p className="mt-1 text-sm text-[#3e4947] sm:text-base">{report.periodLabel}</p>
      </div>

      <div className="space-y-1 text-sm text-[#3e4947] sm:text-end">
        <p>
          {TEXT.clientLabel} <strong className="text-[#0b1c30]">{report.clientName}</strong>
        </p>
        <p>
          {TEXT.accountIdLabel} <strong className="text-[#0b1c30]">{report.accountId}</strong>
        </p>
        <p>
          {TEXT.generatedLabel} {report.generatedAtLabel}
        </p>
      </div>
    </header>
  )
}

function SummaryStats({ stats }: { stats: ReportSummaryStat[] }) {
  if (stats.length === 0) {
    return <EmptyBlock message={TEXT.emptyStats} />
  }

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <article
          key={stat.id}
          className="rounded-lg border border-[#bdc9c6] bg-white p-4 shadow-sm"
        >
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#3e4947]">
            {stat.label}
          </p>
          <p className={`text-2xl font-bold ${amountToneClass(stat.tone)}`}>{stat.valueLabel}</p>
        </article>
      ))}
    </section>
  )
}

function CashFlowCard({
  title,
  bars,
}: {
  title: string
  bars: ReportCashFlowBar[]
}) {
  return (
    <section className="flex min-h-72 flex-col rounded-lg border border-[#bdc9c6] bg-white p-5 shadow-sm">
      <h3 className="mb-6 text-xl font-semibold text-[#0b1c30]">{title}</h3>
      {bars.length > 0 ? (
        <div className="relative flex flex-1 items-end justify-around gap-4 border-b border-s border-[#bdc9c6] px-4 pb-8 pt-8">
          {bars.map((bar) => (
            <div key={bar.id} className="flex h-48 min-w-14 flex-col items-center justify-end gap-2">
              <span className="text-xs font-semibold text-[#0b1c30]">{bar.valueLabel}</span>
              <span
                className={`w-12 rounded-t-sm sm:w-16 ${heightClass(bar.percent)} ${barToneClass(
                  bar.tone,
                )}`}
              />
              <span className="text-center text-xs font-semibold text-[#3e4947]">{bar.label}</span>
            </div>
          ))}
        </div>
      ) : (
        <EmptyBlock message={TEXT.emptyCashFlow} />
      )}
    </section>
  )
}

function ExpenseBreakdownCard({ breakdown }: { breakdown: ReportBreakdown }) {
  return (
    <section className="flex min-h-72 flex-col rounded-lg border border-[#bdc9c6] bg-white p-5 shadow-sm">
      <h3 className="mb-6 text-xl font-semibold text-[#0b1c30]">{breakdown.title}</h3>
      <div className="flex flex-1 items-center justify-center">
        <div className="relative flex h-44 w-44 items-center justify-center">
          <div className="h-44 w-44 rotate-45 rounded-full border-[20px] border-[#005c55] border-b-[#fea619] border-l-[#855300] border-r-[#ffddb8]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold text-[#0b1c30]">{breakdown.centerValueLabel}</span>
            <span className="text-xs font-bold uppercase text-[#3e4947]">
              {breakdown.centerLabel}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

function ExpenseCategoriesTable({
  title,
  categories,
}: {
  title: string
  categories: ReportExpenseCategory[]
}) {
  return (
    <section>
      <h3 className="mb-4 text-xl font-semibold text-[#0b1c30]">{title}</h3>
      <div className="overflow-hidden rounded-lg border border-[#bdc9c6] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-start">
            <thead className="border-b border-[#bdc9c6] bg-[#eff4ff] text-xs font-semibold uppercase tracking-wide text-[#3e4947]">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">{TEXT.tableHeaders.category}</th>
                <th className="px-4 py-3 text-end font-semibold">{TEXT.tableHeaders.amount}</th>
                <th className="px-4 py-3 text-end font-semibold">
                  {TEXT.tableHeaders.percentTotal}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bdc9c6]/60 text-sm text-[#0b1c30]">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <tr key={category.id} className="even:bg-[#f8f9ff] hover:bg-[#eff4ff]">
                    <td className="px-4 py-3">{category.label}</td>
                    <td className="px-4 py-3 text-end font-medium">{category.amountLabel}</td>
                    <td className="px-4 py-3 text-end">{category.percentLabel}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-sm text-[#3e4947]">
                    {TEXT.emptyExpenseCategories}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function TransactionsTable({
  title,
  transactions,
}: {
  title: string
  transactions: ReportTransaction[]
}) {
  return (
    <section>
      <h3 className="mb-4 text-xl font-semibold text-[#0b1c30]">{title}</h3>
      <div className="overflow-hidden rounded-lg border border-[#bdc9c6] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-start">
            <thead className="border-b border-[#bdc9c6] bg-[#eff4ff] text-xs font-semibold uppercase tracking-wide text-[#3e4947]">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">{TEXT.tableHeaders.date}</th>
                <th className="px-4 py-3 text-start font-semibold">
                  {TEXT.tableHeaders.description}
                </th>
                <th className="px-4 py-3 text-start font-semibold">{TEXT.tableHeaders.category}</th>
                <th className="px-4 py-3 text-end font-semibold">{TEXT.tableHeaders.amount}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bdc9c6]/60 text-sm text-[#0b1c30]">
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="even:bg-[#f8f9ff] hover:bg-[#eff4ff]">
                    <td className="whitespace-nowrap px-4 py-3 text-[#3e4947]">
                      {transaction.dateLabel}
                    </td>
                    <td className="px-4 py-3 font-medium">{transaction.description}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-bold uppercase ${pillToneClass(transaction.tone)}`}>
                        {transaction.categoryLabel}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-end font-bold ${amountToneClass(transaction.tone)}`}>
                      {transaction.amountLabel}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-sm text-[#3e4947]">
                    {TEXT.emptyTransactions}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function ReportFooter({ report }: { report: ReportDocument }) {
  return (
    <footer className="mt-auto flex flex-col gap-3 border-t border-[#bdc9c6] pt-8 text-xs font-semibold text-[#3e4947] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        <span>{report.footerStatement}</span>
      </div>
      <div className="flex items-center gap-4">
        <span>{report.confidentialityLabel}</span>
        <span>{report.pageLabel}</span>
      </div>
    </footer>
  )
}

function UserAvatar({ user }: UserAvatarProps) {
  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name}
        className="h-8 w-8 rounded-full border-2 border-[#0f766e] object-cover"
      />
    )
  }

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#bdc9c6] bg-[#d3e4fe] text-xs font-semibold text-[#0b1c30]">
      {user?.initials}
    </div>
  )
}

function EmptyBlock({ message }: { message: string }) {
  return (
    <div className="flex min-h-28 items-center justify-center rounded-lg border border-dashed border-[#bdc9c6] bg-white p-6 text-center text-sm text-[#3e4947]">
      {message}
    </div>
  )
}

function amountToneClass(tone: ReportAmountTone) {
  if (tone === 'income') return 'text-[#005e3f]'
  if (tone === 'expense') return 'text-[#ba1a1a]'
  if (tone === 'primary') return 'text-[#005c55]'
  return 'text-[#0b1c30]'
}

function barToneClass(tone: ReportAmountTone) {
  if (tone === 'income') return 'bg-[#007952]/80'
  if (tone === 'expense') return 'bg-[#ba1a1a]/80'
  if (tone === 'primary') return 'bg-[#005c55]/80'
  return 'bg-[#6e7977]/80'
}

function pillToneClass(tone: ReportAmountTone) {
  if (tone === 'income') return 'bg-[#007952]/10 text-[#005e3f]'
  if (tone === 'expense') return 'bg-[#d3e4fe] text-[#3e4947]'
  if (tone === 'primary') return 'bg-[#005c55]/10 text-[#005c55]'
  return 'bg-[#eff4ff] text-[#3e4947]'
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

function ReportPreviewPageContainer() {
  const language = useSelector(selectLanguage)
  const navigate = useNavigate()
  const fallbackData = useReportPreviewPageData()

  const navItems: ReportPreviewNavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
    { id: 'accounts', label: 'Accounts', icon: 'accounts', href: '/accounts' },
    { id: 'transactions', label: 'Transactions', icon: 'transactions', href: '/transactions' },
    { id: 'budgets', label: 'Budgets', icon: 'budgets', href: '/budgets' },
    { id: 'reports', label: 'Reports', icon: 'reports', href: '/reports', isActive: true },
    { id: 'settings', label: 'Settings', icon: 'settings', href: '/profile-settings' },
  ]

  return (
    <ReportPreviewPage
      language={language}
      data={{ ...fallbackData, navItems }}
      onLogout={() => navigate('/login')}
      onDownload={() => alert('Download – backend not connected yet')}
    />
  )
}

export default ReportPreviewPageContainer
