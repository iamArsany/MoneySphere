import { useSelector } from 'react-redux'
import { selectLanguage } from '../../store'
import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import {
  ArrowDown,
  ArrowUp,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  FileText,
  Globe2,
  Home,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  Repeat,
  Settings,
  ShoppingCart,
  Trash2,
  User,
  WalletCards,
  type LucideIcon,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

export type AccountDetailLanguage = 'en' | 'ar'
export type AccountTransactionType = 'income' | 'expense' | 'transfer'
export type AccountFilterValue = 'all' | 'income' | 'expense' | 'transfer'
export type AccountCategoryTone = 'primary' | 'secondary' | 'neutral' | 'danger' | 'tertiary'

export interface AccountDetailUser {
  name: string
  avatarUrl?: string
  initials?: string
}

export interface AccountDetailNavItem {
  id: string
  label: string
  icon: AccountDetailIconName
  href?: string
  isActive?: boolean
}

export interface AccountDetailSummary {
  name: string
  typeLabel: string
  currencyLabel: string
  balanceLabel: string
  incomeLabel?: string
  expenseLabel?: string
  icon?: AccountDetailIconName
}

export interface AccountDetailFilter {
  value: AccountFilterValue
  label: string
}

export interface AccountDetailDateRange {
  id: string
  label: string
}

export interface AccountTransactionCategory {
  label: string
  icon: AccountDetailIconName
  tone?: AccountCategoryTone
}

export interface AccountTransactionRow {
  id: string
  dateLabel: string
  category: AccountTransactionCategory
  description: string
  amountLabel: string
  balanceLabel: string
  type: AccountTransactionType
}

export interface AccountDetailPagination {
  currentPage: number
  pages: Array<number | 'ellipsis'>
  canGoPrevious: boolean
  canGoNext: boolean
}

export interface AccountDetailPageData {
  user?: AccountDetailUser
  navItems: AccountDetailNavItem[]
  account?: AccountDetailSummary
  filters: AccountDetailFilter[]
  dateRanges: AccountDetailDateRange[]
  selectedDateRangeId?: string
  transactions: AccountTransactionRow[]
  pagination?: AccountDetailPagination
}

export interface AccountDetailPageProps {
  data?: AccountDetailPageData
  language?: AccountDetailLanguage
  selectedFilter?: AccountFilterValue
  hasUnreadNotifications?: boolean
  onLanguageToggle?: () => void
  onEditAccount?: () => void
  onArchiveAccount?: () => void
  onFilterChange?: (filter: AccountFilterValue) => void
  onDateRangeChange?: (dateRangeId: string) => void
  onEditTransaction?: (transactionId: string) => void
  onDeleteTransaction?: (transactionId: string) => void
  onPageChange?: (page: number) => void
  onPreviousPage?: () => void
  onNextPage?: () => void
}

interface SidebarProps {
  navItems: AccountDetailNavItem[]
}

interface TopHeaderProps {
  user?: AccountDetailUser
  hasUnreadNotifications: boolean
  onLanguageToggle?: () => void
}

interface AccountHeaderCardProps {
  account?: AccountDetailSummary
  onEditAccount?: () => void
  onArchiveAccount?: () => void
}

interface FilterBarProps {
  filters: AccountDetailFilter[]
  selectedFilter: AccountFilterValue
  dateRanges: AccountDetailDateRange[]
  selectedDateRangeId?: string
  onFilterChange?: (filter: AccountFilterValue) => void
  onDateRangeChange?: (dateRangeId: string) => void
}

interface TransactionsTableProps {
  transactions: AccountTransactionRow[]
  pagination?: AccountDetailPagination
  onEditTransaction?: (transactionId: string) => void
  onDeleteTransaction?: (transactionId: string) => void
  onPageChange?: (page: number) => void
  onPreviousPage?: () => void
  onNextPage?: () => void
}

interface UserAvatarProps {
  user?: AccountDetailUser
}

type AccountDetailIconName =
  | 'accounts'
  | 'budgets'
  | 'calendar'
  | 'dashboard'
  | 'home'
  | 'notifications'
  | 'recurring'
  | 'reports'
  | 'salary'
  | 'settings'
  | 'shopping'
  | 'transactions'
  | 'wallet'

const TEXT = {
  appName: 'PFT',
  appSubtitle: 'Personal Finance Tracker',
  pageTitle: 'Account Details',
  logout: 'Logout',
  currentBalance: 'Current Balance',
  edit: 'Edit',
  archive: 'Archive',
  languageAriaLabel: 'Change language',
  notificationsAriaLabel: 'Notifications',
  emptyAccount: 'No account details available.',
  emptyTransactions: 'No transactions found for this account.',
  tableHeaders: {
    date: 'Date',
    category: 'Category',
    description: 'Description',
    amount: 'Amount',
    balance: 'Balance',
    actions: 'Actions',
  },
  editTransactionAriaLabel: 'Edit transaction',
  deleteTransactionAriaLabel: 'Delete transaction',
  previous: 'Previous',
  next: 'Next',
}

const ICONS: Record<AccountDetailIconName, LucideIcon> = {
  accounts: Building2,
  budgets: WalletCards,
  calendar: CalendarDays,
  dashboard: LayoutDashboard,
  home: Home,
  notifications: Bell,
  recurring: Repeat,
  reports: FileText,
  salary: BriefcaseBusiness,
  settings: Settings,
  shopping: ShoppingCart,
  transactions: ReceiptText,
  wallet: WalletCards,
}

const DEFAULT_DATA: AccountDetailPageData = {
  navItems: [],
  filters: [],
  dateRanges: [],
  transactions: [],
}

export function useAccountDetailPageData(): AccountDetailPageData {
  return DEFAULT_DATA
}

export function AccountDetailPage({
  data,
  language = 'en',
  selectedFilter = 'all',
  hasUnreadNotifications = false,
  onLanguageToggle,
  onEditAccount,
  onArchiveAccount,
  onFilterChange,
  onDateRangeChange,
  onEditTransaction,
  onDeleteTransaction,
  onPageChange,
  onPreviousPage,
  onNextPage,
}: AccountDetailPageProps) {
  const fallbackData = useAccountDetailPageData()
  const pageData = data ?? fallbackData
  const isRtl = language === 'ar'

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <AccountHeaderCard
          account={pageData.account}
          onEditAccount={onEditAccount}
          onArchiveAccount={onArchiveAccount}
        />

        <FilterBar
          filters={pageData.filters}
          selectedFilter={selectedFilter}
          dateRanges={pageData.dateRanges}
          selectedDateRangeId={pageData.selectedDateRangeId}
          onFilterChange={onFilterChange}
          onDateRangeChange={onDateRangeChange}
        />

        <TransactionsTable
          transactions={pageData.transactions}
          pagination={pageData.pagination}
          onEditTransaction={onEditTransaction}
          onDeleteTransaction={onDeleteTransaction}
          onPageChange={onPageChange}
          onPreviousPage={onPreviousPage}
          onNextPage={onNextPage}
        />
      </div>
    </>
  )
}

function Sidebar({ navItems }: SidebarProps) {
  return (
    <nav className="fixed start-0 top-0 z-30 hidden h-screen w-60 flex-col border-e border-[#d3e4fe] bg-white p-4 shadow-sm md:flex">
      <div className="mb-8 px-3">
        <div className="text-xl font-black text-[#005c55]">{TEXT.appName}</div>
        <p className="mt-1 text-xs font-semibold uppercase text-[#3e4947]">{TEXT.appSubtitle}</p>
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = ICONS[item.icon]

          return (
            <a
              key={item.id}
              href={item.href ?? '#'}
              className={`flex items-center gap-4 rounded-lg px-4 py-3 text-sm transition ${
                item.isActive
                  ? 'bg-[#0f766e] font-semibold text-[#a3faef]'
                  : 'text-[#3e4947] hover:bg-[#dce9ff] hover:text-[#0b1c30]'
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </a>
          )
        })}
      </div>

      <a
        href="#"
        className="mt-4 flex items-center gap-4 border-t border-[#d3e4fe] px-4 py-4 text-sm text-[#3e4947] transition hover:text-[#005c55]"
      >
        <LogOut className="h-5 w-5" aria-hidden="true" />
        {TEXT.logout}
      </a>
    </nav>
  )
}

function TopHeader({ user, hasUnreadNotifications, onLanguageToggle }: TopHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#d3e4fe] bg-white px-4 py-4 shadow-sm md:fixed md:end-0 md:start-60 md:h-16 md:px-6">
      <h1 className="border-b-2 border-[#005c55] pb-1 text-xl font-bold text-[#005c55]">
        {TEXT.pageTitle}
      </h1>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={TEXT.languageAriaLabel}
          onClick={onLanguageToggle}
          className="rounded-full p-2 text-[#3e4947] transition hover:bg-[#eff4ff] hover:text-[#005c55]"
        >
          <Globe2 className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={TEXT.notificationsAriaLabel}
          className="relative rounded-full p-2 text-[#3e4947] transition hover:bg-[#eff4ff] hover:text-[#005c55]"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {hasUnreadNotifications ? (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#fea619] rtl:left-2 rtl:right-auto" />
          ) : null}
        </button>
        <UserAvatar user={user} />
      </div>
    </header>
  )
}

function AccountHeaderCard({
  account,
  onEditAccount,
  onArchiveAccount,
}: AccountHeaderCardProps) {
  if (!account) {
    return (
      <section className="rounded-xl border border-dashed border-[#bdc9c6] bg-white p-6 text-center text-sm text-[#3e4947]">
        {TEXT.emptyAccount}
      </section>
    )
  }

  const AccountIcon = account.icon ? ICONS[account.icon] : Building2

  return (
    <section className="flex flex-col gap-6 rounded-xl border border-[#bdc9c6]/40 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#0f766e] text-[#a3faef]">
          <AccountIcon className="h-8 w-8" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-[#0b1c30]">{account.name}</h2>
          <p className="mt-1 text-sm text-[#3e4947]">
            {account.typeLabel} • {account.currencyLabel}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 lg:items-end">
        <div className="w-full lg:text-end">
          <p className="text-xs font-semibold uppercase text-[#3e4947]">{TEXT.currentBalance}</p>
          <p className="text-4xl font-bold text-[#0b1c30] sm:text-5xl">{account.balanceLabel}</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          {account.incomeLabel ? (
            <span className="flex items-center gap-1 text-[#005c55]">
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
              {account.incomeLabel}
            </span>
          ) : null}
          {account.expenseLabel ? (
            <span className="flex items-center gap-1 text-[#ba1a1a]">
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
              {account.expenseLabel}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onEditAccount}
          className="rounded border border-[#005c55] px-4 py-2 text-sm font-semibold text-[#005c55] transition hover:bg-[#eff4ff]"
        >
          {TEXT.edit}
        </button>
        <button
          type="button"
          onClick={onArchiveAccount}
          className="rounded border border-[#bdc9c6] px-4 py-2 text-sm font-semibold text-[#3e4947] transition hover:bg-[#d3e4fe]"
        >
          {TEXT.archive}
        </button>
      </div>
    </section>
  )
}

function FilterBar({
  filters,
  selectedFilter,
  dateRanges,
  selectedDateRangeId,
  onFilterChange,
  onDateRangeChange,
}: FilterBarProps) {
  return (
    <section className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex rounded-lg border border-[#bdc9c6]/60 bg-white p-1 shadow-sm">
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => onFilterChange?.(filter.value)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition sm:flex-none ${
              selectedFilter === filter.value
                ? 'bg-[#d3e4fe] text-[#0b1c30]'
                : 'text-[#3e4947] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <CalendarDays className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3e4947]" />
        <select
          value={selectedDateRangeId ?? ''}
          onChange={(event) => onDateRangeChange?.(event.target.value)}
          className="w-full appearance-none rounded-lg border border-[#bdc9c6]/60 bg-white py-2 pe-10 ps-10 text-sm font-semibold text-[#0b1c30] shadow-sm outline-none transition hover:border-[#005c55] focus:border-[#005c55] focus:ring-2 focus:ring-[#005c55]/20 sm:w-auto"
        >
          <option value="" />
          {dateRanges.map((dateRange) => (
            <option key={dateRange.id} value={dateRange.id}>
              {dateRange.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3e4947]" />
      </div>
    </section>
  )
}

function TransactionsTable({
  transactions,
  pagination,
  onEditTransaction,
  onDeleteTransaction,
  onPageChange,
  onPreviousPage,
  onNextPage,
}: TransactionsTableProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#bdc9c6]/40 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#bdc9c6]/40 bg-[#eff4ff]/70 text-xs font-semibold uppercase tracking-wide text-[#3e4947]">
              <th className="p-4">{TEXT.tableHeaders.date}</th>
              <th className="p-4">{TEXT.tableHeaders.category}</th>
              <th className="p-4">{TEXT.tableHeaders.description}</th>
              <th className="p-4 text-right">{TEXT.tableHeaders.amount}</th>
              <th className="hidden p-4 text-right sm:table-cell">{TEXT.tableHeaders.balance}</th>
              <th className="w-20 p-4 text-center">{TEXT.tableHeaders.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#bdc9c6]/30 text-sm">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  onEditTransaction={onEditTransaction}
                  onDeleteTransaction={onDeleteTransaction}
                />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-sm text-[#3e4947]">
                  {TEXT.emptyTransactions}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination ? (
        <Pagination
          pagination={pagination}
          onPageChange={onPageChange}
          onPreviousPage={onPreviousPage}
          onNextPage={onNextPage}
        />
      ) : null}
    </section>
  )
}

function TransactionRow({
  transaction,
  onEditTransaction,
  onDeleteTransaction,
}: {
  transaction: AccountTransactionRow
  onEditTransaction?: (transactionId: string) => void
  onDeleteTransaction?: (transactionId: string) => void
}) {
  const CategoryIcon = ICONS[transaction.category.icon]

  return (
    <tr className="group transition hover:bg-[#eff4ff]/50">
      <td className="whitespace-nowrap p-4 text-[#0b1c30]">{transaction.dateLabel}</td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <span className={`flex h-6 w-6 items-center justify-center rounded-full ${categoryToneClass(transaction.category.tone)}`}>
            <CategoryIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span className="text-[#0b1c30]">{transaction.category.label}</span>
        </div>
      </td>
      <td className="max-w-[240px] truncate p-4 text-[#3e4947]">{transaction.description}</td>
      <td className={`p-4 text-right font-semibold ${amountClass(transaction.type)}`}>
        {transaction.amountLabel}
      </td>
      <td className="hidden p-4 text-right text-[#3e4947] sm:table-cell">
        {transaction.balanceLabel}
      </td>
      <td className="p-4 text-center">
        <div className="flex justify-center gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <button
            type="button"
            aria-label={TEXT.editTransactionAriaLabel}
            onClick={() => onEditTransaction?.(transaction.id)}
            className="rounded p-1 text-[#3e4947] transition hover:bg-[#d3e4fe] hover:text-[#005c55]"
          >
            <Edit3 className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={TEXT.deleteTransactionAriaLabel}
            onClick={() => onDeleteTransaction?.(transaction.id)}
            className="rounded p-1 text-[#3e4947] transition hover:bg-[#ffdad6] hover:text-[#ba1a1a]"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </td>
    </tr>
  )
}

function Pagination({
  pagination,
  onPageChange,
  onPreviousPage,
  onNextPage,
}: {
  pagination: AccountDetailPagination
  onPageChange?: (page: number) => void
  onPreviousPage?: () => void
  onNextPage?: () => void
}) {
  return (
    <footer className="flex flex-col items-center justify-between gap-4 border-t border-[#bdc9c6]/40 bg-white p-4 text-sm text-[#3e4947] sm:flex-row">
      <button
        type="button"
        disabled={!pagination.canGoPrevious}
        onClick={onPreviousPage}
        className="flex items-center gap-1 transition hover:text-[#005c55] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
        {TEXT.previous}
      </button>

      <div className="flex items-center gap-2">
        {pagination.pages.map((page, index) =>
          page === 'ellipsis' ? (
            <span key={`ellipsis-${index}`}>...</span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange?.(page)}
              className={`flex h-8 w-8 items-center justify-center rounded transition ${
                page === pagination.currentPage
                  ? 'bg-[#0f766e] font-semibold text-[#a3faef]'
                  : 'text-[#0b1c30] hover:bg-[#d3e4fe]'
              }`}
            >
              {page}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        disabled={!pagination.canGoNext}
        onClick={onNextPage}
        className="flex items-center gap-1 transition hover:text-[#005c55] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {TEXT.next}
        <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
      </button>
    </footer>
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

function categoryToneClass(tone: AccountCategoryTone = 'neutral') {
  if (tone === 'primary') return 'bg-[#0f766e]/20 text-[#005c55]'
  if (tone === 'secondary') return 'bg-[#fea619]/20 text-[#855300]'
  if (tone === 'danger') return 'bg-[#ffdad6] text-[#ba1a1a]'
  if (tone === 'tertiary') return 'bg-[#007952]/20 text-[#005e3f]'
  return 'bg-[#d3e4fe] text-[#3e4947]'
}

function amountClass(type: AccountTransactionType) {
  if (type === 'income') return 'text-[#005c55]'
  if (type === 'expense') return 'text-[#ba1a1a]'
  return 'text-[#855300]'
}

function AccountDetailPageContainer() {
  const language = useSelector(selectLanguage)
  const authState = useSelector((state: any) => state.auth)
  const navigate = useNavigate()
  const { accountId } = useParams()
  
  const [account, setAccount] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [totals, setTotals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Edit Account Modal state
  const [showEditModal, setShowEditModal] = useState(false)
  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState('')
  const [editColor, setEditColor] = useState('#005c55')
  const [editSubmitting, setEditSubmitting] = useState(false)

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' as const, href: '/dashboard' },
    { id: 'accounts', label: 'Accounts', icon: 'accounts' as const, href: '/accounts', isActive: true },
    { id: 'transactions', label: 'Transactions', icon: 'transactions' as const, href: '/transactions' },
    { id: 'budgets', label: 'Budgets', icon: 'budgets' as const, href: '/budgets' },
    { id: 'reports', label: 'Reports', icon: 'reports' as const, href: '/reports' },
    { id: 'settings', label: 'Settings', icon: 'settings' as const, href: '/profile-settings' },
  ]

  const loadData = async () => {
    if (!accountId) return
    try {
      setLoading(true)
      const typeParam = filter === 'all' ? '' : `&type=${filter}`
      const [accountRes, transactionsRes] = await Promise.all([
        api.get(`/accounts/${accountId}`),
        api.get(`/transactions?accountId=${accountId}&page=${page}&limit=10${typeParam}`)
      ])
      
      setAccount(accountRes.data.account)
      setTotals(accountRes.data.totals || [])
      setTransactions(transactionsRes.data.transactions || [])
      
      const pag = transactionsRes.data.pagination
      if (pag) {
        setTotalPages(Math.ceil(pag.total / pag.limit) || 1)
      }
    } catch (err) {
      console.error('Failed to load account details:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [accountId, page, filter])

  const handleArchiveAccount = async () => {
    if (!accountId) return
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من أرشفة/حذف هذا الحساب؟' : 'Are you sure you want to archive/delete this account?')) return
    try {
      await api.delete(`/accounts/${accountId}`)
      navigate('/accounts')
    } catch (err) {
      console.error('Failed to archive account:', err)
      alert('Failed to archive account')
    }
  }

  const handleOpenEditModal = () => {
    if (account) {
      setEditName(account.accountName || '')
      setEditType(account.accountType || 'bank')
      setEditColor(account.color || '#005c55')
      setShowEditModal(true)
    }
  }

  const handleEditAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accountId || !editName.trim()) return
    setEditSubmitting(true)
    try {
      await api.patch(`/accounts/${accountId}`, {
        accountName: editName.trim(),
        accountType: editType,
        color: editColor,
      })
      setShowEditModal(false)
      loadData()
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Failed to update account.')
    } finally {
      setEditSubmitting(false)
    }
  }

  if (loading || !account) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9ff]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#005c55] border-t-transparent"></div>
      </div>
    )
  }

  const isAr = language === 'ar'
  const formatMoney = (v: number) => {
    return `${v.toLocaleString(isAr ? 'ar-EG' : 'en-US', { minimumFractionDigits: 2 })} ${account.currency}`
  }

  const accountHeader = {
    name: account.accountName,
    typeLabel: account.accountType,
    balanceLabel: parseFloat(account.currentBalance).toLocaleString(isAr ? 'ar-EG' : 'en-US', { minimumFractionDigits: 2 }),
    currencyLabel: account.currency,
  }

  let incSum = 0
  let expSum = 0
  totals.forEach((t: any) => {
    if (t.type === 'income') incSum = parseFloat(t._sum.amount) || 0
    if (t.type === 'expense') expSum = parseFloat(t._sum.amount) || 0
  })

  const stats = [
    {
      id: 'stat-inc',
      label: isAr ? 'إجمالي الدخل' : 'Total Income',
      valueLabel: formatMoney(incSum),
      tone: 'income' as const,
      icon: 'in' as const,
    },
    {
      id: 'stat-exp',
      label: isAr ? 'إجمالي المصروفات' : 'Total Expense',
      valueLabel: formatMoney(expSum),
      tone: 'expense' as const,
      icon: 'out' as const,
    }
  ]

  const mappedTransactions = transactions.map((t: any) => {
    const isIncome = t.type === 'income'
    const isExpense = t.type === 'expense'
    const catName = t.category ? (isAr ? t.category.nameAr : t.category.nameEn) : (isAr ? 'بدون تصنيف' : 'Uncategorized')
    const date = new Date(t.transactionDate)
    return {
      id: t.id,
      dateLabel: date.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      category: {
        label: catName,
        icon: 'wallet' as any,
        tone: isIncome ? 'primary' as const : (isExpense ? 'danger' as const : 'neutral' as const),
      },
      description: t.description || '',
      amountLabel: `${isExpense ? '-' : ''}${formatMoney(parseFloat(t.amount))}`,
      balanceLabel: '',
      type: t.type,
    }
  })

  const pages: (number | 'ellipsis')[] = []
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i)
  }

  const pagination = {
    currentPage: page,
    totalPages,
    pages,
    canGoPrevious: page > 1,
    canGoNext: page < totalPages,
  }

  return (
    <>
      {/* Edit Account Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-xl font-bold text-[#005c55]">
              {language === 'ar' ? 'تعديل الحساب' : 'Edit Account'}
            </h2>
            <form onSubmit={handleEditAccount} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase text-[#3e4947]">
                  {language === 'ar' ? 'اسم الحساب' : 'Account Name'}
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  required
                  className="rounded-lg border border-[#bdc9c6] px-3 py-2 text-base outline-none focus:border-[#005c55] focus:ring-2 focus:ring-[#005c55]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase text-[#3e4947]">
                  {language === 'ar' ? 'نوع الحساب' : 'Account Type'}
                </label>
                <select
                  value={editType}
                  onChange={e => setEditType(e.target.value)}
                  className="rounded-lg border border-[#bdc9c6] px-3 py-2 text-base outline-none focus:border-[#005c55] focus:ring-2 focus:ring-[#005c55]"
                >
                  <option value="bank">{language === 'ar' ? 'بنك' : 'Bank'}</option>
                  <option value="cash">{language === 'ar' ? 'نقدي' : 'Cash'}</option>
                  <option value="credit">{language === 'ar' ? 'بطاقة ائتمان' : 'Credit Card'}</option>
                  <option value="savings">{language === 'ar' ? 'مدخرات' : 'Savings'}</option>
                  <option value="investment">{language === 'ar' ? 'استثمار' : 'Investment'}</option>
                  <option value="custom">{language === 'ar' ? 'مخصص' : 'Custom'}</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase text-[#3e4947]">
                  {language === 'ar' ? 'لون الحساب' : 'Account Color'}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={editColor}
                    onChange={e => setEditColor(e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded-lg border border-[#bdc9c6]"
                  />
                  <span className="text-sm text-[#3e4947]">{editColor}</span>
                </div>
              </div>
              <div className="mt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-lg border border-[#bdc9c6] px-5 py-2 text-sm font-semibold text-[#3e4947] hover:bg-[#f0f4f8]"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="rounded-lg bg-[#005c55] px-5 py-2 text-sm font-semibold text-white hover:bg-[#006a63] disabled:opacity-60"
                >
                  {editSubmitting ? (language === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <AccountDetailPage
        language={language}
        selectedFilter={filter}
        data={{
          user: authState.user ? {
            name: authState.user.name,
            avatarUrl: authState.user.avatarUrl,
            initials: authState.user.initials,
          } : undefined,
          navItems,
          account: {
            name: accountHeader.name,
            typeLabel: accountHeader.typeLabel,
            balanceLabel: accountHeader.balanceLabel,
            currencyLabel: accountHeader.currencyLabel,
            incomeLabel: formatMoney(incSum),
            expenseLabel: formatMoney(expSum),
          },
          filters: [
            { value: 'all', label: isAr ? 'الكل' : 'All' },
            { value: 'income', label: isAr ? 'دخل' : 'Income' },
            { value: 'expense', label: isAr ? 'مصروف' : 'Expense' },
            { value: 'transfer', label: isAr ? 'تحويل' : 'Transfer' },
          ],
          dateRanges: [
            { id: '1m', label: isAr ? 'آخر شهر' : 'Last Month' },
            { id: '3m', label: isAr ? 'آخر ٣ أشهر' : 'Last 3 Months' },
            { id: '1y', label: isAr ? 'آخر سنة' : 'Last Year' },
          ],
          transactions: mappedTransactions,
          pagination,
        }}
        onFilterChange={(f) => {
          setFilter(f as any)
          setPage(1)
        }}
        onPageChange={(p) => setPage(p)}
        onPreviousPage={() => setPage(p => Math.max(1, p - 1))}
        onNextPage={() => setPage(p => Math.min(totalPages, p + 1))}
        onArchiveAccount={handleArchiveAccount}
        onEditAccount={handleOpenEditModal}
      />
    </>
  )
}

export default AccountDetailPageContainer
