import { useState, useEffect, useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'
import { selectLanguage } from '../../store'
import {
  ArrowDown,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  FileText,
  Filter,
  Home,
  LayoutDashboard,
  LogOut,
  MoreVertical,
  Plus,
  ReceiptText,
  Repeat,
  Settings,
  ShoppingCart,
  Trash2,
  Utensils,
  WalletCards,
  X,
  Pencil,
  type LucideIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

export type TransactionsLanguage = 'en' | 'ar'
export type TransactionsViewMode = 'list' | 'calendar'
export type TransactionType = 'income' | 'expense' | 'transfer'

export interface TransactionsUser {
  name: string
  avatarUrl?: string
  initials?: string
}

export interface TransactionsNavItem {
  id: string
  label: string
  icon: TransactionsIconName
  href?: string
  isActive?: boolean
}

export interface TransactionsFilterOption {
  value: string
  label: string
  type?: TransactionType | 'system'
}

export interface TransactionsActiveFilter {
  id: string
  label: string
  onRemove?: () => void
}

export interface TransactionCategory {
  label: string
  icon: TransactionsIconName
  tone?: 'neutral' | 'income' | 'expense' | 'primary'
}

export interface TransactionRow {
  id: string
  dateLabel: string
  accountLabel: string
  accountTone?: 'primary' | 'secondary'
  category: TransactionCategory
  description: string
  amountLabel: string
  balanceLabel: string
  type: TransactionType
  isRecurring?: boolean
}

export interface TransactionsPagination {
  currentPage: number
  totalPages: number
  summaryLabel: string
  canGoPrevious: boolean
  canGoNext: boolean
  pages: Array<number | 'ellipsis'>
  onPageChange?: (page: number) => void
  onPrevious?: () => void
  onNext?: () => void
}

export interface TransactionsFilters {
  dateRangeLabel?: string
  accountOptions: TransactionsFilterOption[]
  categoryOptions: TransactionsFilterOption[]
  activeFilters: TransactionsActiveFilter[]
  onClearAll?: () => void
}

export interface TransactionsPageData {
  user?: TransactionsUser
  navItems: TransactionsNavItem[]
  filters: TransactionsFilters
  transactions: TransactionRow[]
  pagination?: TransactionsPagination
}

// ---------------------------------------------------------------------------
// API shapes (backend contract)
// ---------------------------------------------------------------------------

interface ApiTransaction {
  id: string | number
  date?: string
  transactionDate?: string
  accountId?: string | number
  account_id?: string | number
  accountID?: string | number
  account_name?: string
  accountName?: string
  account?: string | { id?: string | number; accountId?: string | number; account_id?: string | number; name?: string; accountName?: string; account_name?: string; title?: string }
  category?: string | null | {
    id?: string | number
    categoryId?: string | number
    category_id?: string | number
    name?: string
    nameEn?: string
    nameAr?: string
    categoryName?: string
    category_name?: string
    label?: string
    title?: string
  }
  categoryId?: string | number
  category_id?: string | number
  categoryName?: string
  category_name?: string
  transactionCategory?: string
  description?: string
  amount: string | number          // DECIMAL(18,2) arrives as string from most drivers
  running_balance?: string | number
  runningBalance?: string | number
  type?: TransactionType
  transactionType?: TransactionType
  is_recurring?: boolean
  isRecurring?: boolean
}

interface ApiTransactionsResponse {
  data?: ApiTransaction[]
  transactions?: ApiTransaction[]
  pagination?: {
    page?: number
    total_pages?: number
    totalPages?: number
    total?: number
    per_page?: number
    perPage?: number
  }
}

interface ApiAccount {
  id?: string | number
  accountId?: string | number
  account_id?: string | number
  name?: string
  accountName?: string
  account_name?: string
  title?: string
  type?: string
}

interface ApiListResponse<T> {
  data?: T[]
  accounts?: T[]
  transactions?: T[]
}

interface CreateTransactionPayload {
  accountId: string
  toAccountId?: string
  type: TransactionType
  categoryId: string
  description: string
  amount: string          // always sent as fixed-decimal string
  transactionDate: string            // ISO date string
}

interface UpdateTransactionPayload {
  toAccountId?: string
  type?: TransactionType
  categoryId?: string
  description?: string
  amount?: string
  transactionDate?: string
}

// ---------------------------------------------------------------------------
// Currency helpers – guard against DECIMAL(18,2) precision issues
// ---------------------------------------------------------------------------

/** Parse any user-supplied amount string to a DECIMAL(18,2)-safe fixed string. */
function parseDecimal(raw: string): string {
  const cleaned = raw.replace(/[^0-9.\-]/g, '')
  const n = parseFloat(cleaned)
  if (!isFinite(n)) return '0.00'
  return n.toFixed(2)
}

/** Format a numeric/string amount for display. */
function formatAmount(raw: string | number | undefined, type: TransactionType): string {
  if (raw === undefined || raw === null) return '—'
  const n = parseFloat(String(raw))
  if (!isFinite(n)) return '—'
  const abs = Math.abs(n).toFixed(2)
  const formatted = Number(abs).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (type === 'income') return `+$${formatted}`
  if (type === 'expense') return `-$${formatted}`
  return `$${formatted}`
}

/** Format running balance. */
function formatBalance(raw: string | number | undefined): string {
  if (raw === undefined || raw === null) return '—'
  const n = parseFloat(String(raw))
  if (!isFinite(n)) return '—'
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/** Format ISO date string to locale date. */
function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return iso
  }
}

function listFromResponse<T>(body: T[] | ApiListResponse<T>): T[] {
  if (Array.isArray(body)) return body
  return body.data ?? body.transactions ?? body.accounts ?? []
}

function optionLabel(options: TransactionsFilterOption[], value: string): string | undefined {
  return options.find((option) => option.value === value)?.label
}

function categoryLabel(category: ApiTransaction['category'], fallback?: string): string {
  if (typeof category === 'string') return category
  return category?.nameEn
    ?? category?.nameAr
    ?? category?.name
    ?? category?.categoryName
    ?? category?.category_name
    ?? category?.label
    ?? category?.title
    ?? fallback
    ?? ''
}

function categoryId(transaction: ApiTransaction): string {
  const category = transaction.category && typeof transaction.category === 'object' ? transaction.category : undefined
  return String(transaction.categoryId ?? transaction.category_id ?? category?.categoryId ?? category?.category_id ?? category?.id ?? '')
}

// ---------------------------------------------------------------------------
// Map backend transaction → UI row
// ---------------------------------------------------------------------------

const CATEGORY_META: Record<string, { icon: TransactionsIconName; tone: TransactionCategory['tone'] }> = {
  salary: { icon: 'salary', tone: 'income' },
  income: { icon: 'salary', tone: 'income' },
  groceries: { icon: 'groceries', tone: 'expense' },
  dining: { icon: 'dining', tone: 'expense' },
  food: { icon: 'dining', tone: 'expense' },
  home: { icon: 'home', tone: 'expense' },
  recurring: { icon: 'recurring', tone: 'primary' },
  transfer: { icon: 'recurring', tone: 'primary' },
  analytics: { icon: 'analytics', tone: 'neutral' },
}

function mapApiTransaction(
  t: ApiTransaction,
  accountOptions: TransactionsFilterOption[] = [],
  categoryOptions: TransactionsFilterOption[] = DEFAULT_CATEGORY_OPTIONS,
): TransactionRow {
  const type = t.type ?? t.transactionType ?? 'expense'
  const categoryIdValue = categoryId(t)
  const categoryValue = categoryLabel(t.category, t.categoryName ?? t.category_name ?? t.transactionCategory)
  const category = optionLabel(categoryOptions, categoryIdValue)
    || optionLabel(categoryOptions, categoryValue)
    || categoryValue
    || optionLabel(DEFAULT_CATEGORY_OPTIONS, categoryIdValue)
    || categoryIdValue
    || 'Uncategorized'
  const nestedAccount = typeof t.account === 'object' ? t.account : undefined
  const accountFromString = typeof t.account === 'string' ? t.account : undefined
  const accountId = String(t.accountId ?? t.account_id ?? t.accountID ?? nestedAccount?.accountId ?? nestedAccount?.account_id ?? nestedAccount?.id ?? accountFromString ?? '')
  const accountName = t.accountName
    ?? t.account_name
    ?? nestedAccount?.accountName
    ?? nestedAccount?.account_name
    ?? nestedAccount?.name
    ?? nestedAccount?.title
    ?? optionLabel(accountOptions, accountId)
    ?? accountFromString
  const date = t.transactionDate ?? t.date ?? ''
  const catKey = category.toLowerCase().trim()
  const meta = CATEGORY_META[catKey] ?? { icon: 'transactions' as TransactionsIconName, tone: 'neutral' as const }

  return {
    id: String(t.id),
    dateLabel: date ? formatDate(date) : '—',
    accountLabel: accountName ?? `Acct ${accountId}`,
    accountTone: 'primary',
    category: { label: category, icon: meta.icon, tone: meta.tone },
    description: t.description ?? '',
    amountLabel: formatAmount(t.amount, type),
    balanceLabel: formatBalance(t.runningBalance ?? t.running_balance),
    type,
    isRecurring: t.isRecurring ?? t.is_recurring ?? false,
  }
}

// ---------------------------------------------------------------------------
// Build pagination pages array (compact window)
// ---------------------------------------------------------------------------

function buildPages(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: Array<number | 'ellipsis'> = [1]
  if (current > 3) pages.push('ellipsis')
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p)
  if (current < total - 2) pages.push('ellipsis')
  pages.push(total)
  return pages
}

// ---------------------------------------------------------------------------
// i18n
// ---------------------------------------------------------------------------

type TransactionsIconName =
  | 'accounts'
  | 'analytics'
  | 'budgets'
  | 'calendar'
  | 'dashboard'
  | 'dining'
  | 'groceries'
  | 'home'
  | 'notifications'
  | 'recurring'
  | 'reports'
  | 'salary'
  | 'settings'
  | 'transactions'

const EN_TEXT = {
  appName: 'Personal Finance Tracker',
  sidebarTitle: 'PFT Admin',
  sidebarSubtitle: 'Portfolio Manager',
  pageTitle: 'Transactions',
  addTransaction: 'Add Transaction',
  listView: 'List',
  calendarView: 'Calendar',
  filtersTitle: 'Filters',
  dateRangeLabel: 'Date Range',
  dateRangePlaceholder: 'Last 30 Days',
  accountLabel: 'Account',
  allAccounts: 'All Accounts',
  categoryLabel: 'Category',
  allCategories: 'All Categories',
  typeLabel: 'Type',
  allType: 'All',
  incomeType: 'Income',
  expenseType: 'Expense',
  activeFiltersLabel: 'Active Filters:',
  clearAll: 'Clear All',
  emptyTransactions: 'No transactions match the current filters.',
  emptyNav: 'No navigation items available.',
  selectedLabel: 'selected',
  deleteSelected: 'Delete Selected',
  editCategory: 'Edit Category',
  recurringTitle: 'Recurring Transaction',
  notificationsAriaLabel: 'Notifications',
  rowActionsAriaLabel: 'Open transaction actions',
  selectAllAriaLabel: 'Select all transactions',
  selectRowAriaLabel: 'Select transaction',
  previousPageAriaLabel: 'Previous page',
  nextPageAriaLabel: 'Next page',
  logout: 'Logout',
  loading: 'Loading transactions…',
  errorLoading: 'Failed to load transactions.',
  retry: 'Retry',
  confirmDelete: (n: number) => `Delete ${n} transaction${n === 1 ? '' : 's'}? This cannot be undone.`,
  modalAddTitle: 'Add Transaction',
  modalEditTitle: 'Edit Transaction',
  fieldDate: 'Date',
  fieldAccount: 'Account ID',
  fieldType: 'Type',
  fieldCategory: 'Category',
  fieldDescription: 'Description',
  fieldAmount: 'Amount',
  save: 'Save',
  cancel: 'Cancel',
  tableHeaders: {
    date: 'Date',
    account: 'Account',
    category: 'Category',
    description: 'Description',
    amount: 'Amount',
    balance: 'Balance',
    actions: 'Actions',
  },
}

const AR_TEXT = {
  appName: 'متتبع الشؤون المالية الشخصية',
  sidebarTitle: 'مسؤول PFT',
  sidebarSubtitle: 'مدير المحفظة',
  pageTitle: 'المعاملات',
  addTransaction: 'إضافة معاملة',
  listView: 'قائمة',
  calendarView: 'تقويم',
  filtersTitle: 'الفلاتر',
  dateRangeLabel: 'نطاق التاريخ',
  dateRangePlaceholder: 'آخر 30 يومًا',
  accountLabel: 'الحساب',
  allAccounts: 'جميع الحسابات',
  categoryLabel: 'الفئة',
  allCategories: 'جميع الفئات',
  typeLabel: 'النوع',
  allType: 'الكل',
  incomeType: 'دخل',
  expenseType: 'مصروف',
  activeFiltersLabel: 'الفلاتر النشطة:',
  clearAll: 'مسح الكل',
  emptyTransactions: 'لا توجد معاملات تطابق الفلاتر الحالية.',
  emptyNav: 'لا تتوفر عناصر تنقل.',
  selectedLabel: 'محدد',
  deleteSelected: 'حذف المحدد',
  editCategory: 'تعديل الفئة',
  recurringTitle: 'معاملة متكررة',
  notificationsAriaLabel: 'الإشعارات',
  rowActionsAriaLabel: 'فتح إجراءات المعاملة',
  selectAllAriaLabel: 'تحديد جميع المعاملات',
  selectRowAriaLabel: 'تحديد معاملة',
  previousPageAriaLabel: 'الصفحة السابقة',
  nextPageAriaLabel: 'الصفحة التالية',
  logout: 'تسجيل خروج',
  loading: 'جارٍ تحميل المعاملات…',
  errorLoading: 'فشل تحميل المعاملات.',
  retry: 'إعادة المحاولة',
  confirmDelete: (n: number) => `حذف ${n} معاملة؟ لا يمكن التراجع عن هذا الإجراء.`,
  modalAddTitle: 'إضافة معاملة',
  modalEditTitle: 'تعديل المعاملة',
  fieldDate: 'التاريخ',
  fieldAccount: 'معرّف الحساب',
  fieldType: 'النوع',
  fieldCategory: 'الفئة',
  fieldDescription: 'الوصف',
  fieldAmount: 'المبلغ',
  save: 'حفظ',
  cancel: 'إلغاء',
  tableHeaders: {
    date: 'التاريخ',
    account: 'الحساب',
    category: 'الفئة',
    description: 'الوصف',
    amount: 'المبلغ',
    balance: 'الرصيد',
    actions: 'الإجراءات',
  },
}

export function useTransactionsPageText() {
  const language = useSelector(selectLanguage)
  return language === 'ar' ? AR_TEXT : EN_TEXT
}

const ICONS: Record<TransactionsIconName, LucideIcon> = {
  accounts: Building2,
  analytics: BarChart3,
  budgets: WalletCards,
  calendar: CalendarDays,
  dashboard: LayoutDashboard,
  dining: Utensils,
  groceries: ShoppingCart,
  home: Home,
  notifications: Bell,
  recurring: Repeat,
  reports: FileText,
  salary: CircleDollarSign,
  settings: Settings,
  transactions: ReceiptText,
}

// ---------------------------------------------------------------------------
// Filter state shape
// ---------------------------------------------------------------------------

interface FilterState {
  dateFrom: string
  dateTo: string
  accountId: string
  category: string
  type: '' | TransactionType
}

const EMPTY_FILTERS: FilterState = {
  dateFrom: '',
  dateTo: '',
  accountId: '',
  category: '',
  type: '',
}

// ---------------------------------------------------------------------------
// Transaction Modal (Add / Edit)
// ---------------------------------------------------------------------------

interface TransactionFormState {
  date: string
  accountId: string
  toAccountId: string
  type: TransactionType
  category: string
  description: string
  amount: string
}

const EMPTY_FORM: TransactionFormState = {
  date: new Date().toISOString().split('T')[0],
  accountId: '',
  toAccountId: '',
  type: 'expense',
  category: '',
  description: '',
  amount: '',
}

const DEFAULT_CATEGORY_OPTIONS: TransactionsFilterOption[] = [
  { value: '9d5b0be7-26c7-4b7e-b4f0-2c7eb41f7890', label: 'Food', type: 'expense' },
  { value: 'df9a270f-8b68-450f-819a-d39066e19e6f', label: 'Transport', type: 'expense' },
  { value: '82a5d218-9025-438d-a40a-aeccc2f398b2', label: 'Bills', type: 'expense' },
  { value: 'f47bdf3d-d098-412d-883d-a1f9a61e297e', label: 'Entertainment', type: 'expense' },
  { value: 'de7d4807-14c0-4fa7-8fb0-5cbc44d19cfd', label: 'Health', type: 'expense' },
  { value: '5bf70799-2fe8-49c1-a2cd-57ba795f84fd', label: 'Education', type: 'expense' },
  { value: '0627e31c-94ca-4ded-a59e-914969601ac7', label: 'Housing', type: 'expense' },
  { value: '7c331152-ad82-4001-a638-768a9ca7ea51', label: 'Clothing', type: 'expense' },
  { value: 'bc19855d-fad8-4461-97d9-531ce76f00d3', label: 'Salary', type: 'income' },
  { value: '44eb73f1-2dc0-40f3-9cf3-68d3dd2c1808', label: 'Freelance', type: 'income' },
  { value: 'cbf808c4-3ba6-4a51-8961-85a0961a04fb', label: 'Investment', type: 'income' },
  { value: '8130c334-8473-4eef-b2af-adadce3e499e', label: 'Other Income', type: 'income' },
  { value: '230e5693-9bd6-43d1-9ba3-a1e932eb22dd', label: 'Transfer', type: 'system' },
]

function mergeOptions(base: TransactionsFilterOption[], next: TransactionsFilterOption[]): TransactionsFilterOption[] {
  const byValue = new Map<string, TransactionsFilterOption>()
  for (const option of [...base, ...next]) {
    if (!option.value) continue
    byValue.set(option.value, option)
  }
  return Array.from(byValue.values()).sort((a, b) => a.label.localeCompare(b.label))
}

function categoriesForType(options: TransactionsFilterOption[], type: TransactionType): TransactionsFilterOption[] {
  return options.filter((option) => {
    if (!option.type) return true
    if (type === 'transfer') return option.type === 'system'
    return option.type === type
  })
}

function TransactionModal({
  mode,
  initial,
  accountOptions,
  categoryOptions,
  onClose,
  onSaved,
}: {
  mode: 'add' | 'edit'
  initial?: Partial<TransactionFormState> & { id?: string }
  accountOptions: TransactionsFilterOption[]
  categoryOptions: TransactionsFilterOption[]
  onClose: () => void
  onSaved: () => void
}) {
  const TEXT_VAR = useTransactionsPageText()
  const [form, setForm] = useState<TransactionFormState>({ ...EMPTY_FORM, ...initial })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const visibleCategoryOptions = categoriesForType(categoryOptions, form.type)

  const field = (key: keyof TransactionFormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const decimalAmount = parseDecimal(form.amount)
    if (decimalAmount === '0.00' || isNaN(parseFloat(form.amount))) {
      setError('Please enter a valid amount.')
      return
    }
    if (form.type === 'transfer' && !form.toAccountId.trim()) {
      setError('Please choose the destination account.')
      return
    }
    if (form.type === 'transfer' && form.accountId.trim() === form.toAccountId.trim()) {
      setError('Transfer accounts must be different.')
      return
    }

    setSaving(true)
    try {
      if (mode === 'add') {
        const payload: CreateTransactionPayload = {
          accountId: form.accountId.trim(),
          ...(form.type === 'transfer' ? { toAccountId: form.toAccountId.trim() } : {}),
          type: form.type,
          categoryId: form.category.trim(),
          description: form.description.trim(),
          amount: decimalAmount,
          transactionDate: form.date,
        }
        await api.post('/transactions', payload)
      } else if (initial?.id) {
        const payload: UpdateTransactionPayload = {
          ...(form.type === 'transfer' ? { toAccountId: form.toAccountId.trim() } : {}),
          type: form.type,
          categoryId: form.category.trim(),
          description: form.description.trim(),
          amount: decimalAmount,
          transactionDate: form.date,
        }
        await api.patch(`/transactions/${initial.id}`, payload)
      }
      onSaved()
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'An error occurred. Please try again.')
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0b1c30]">
            {mode === 'add' ? TEXT_VAR.modalAddTitle : TEXT_VAR.modalEditTitle}
          </h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-[#3e4947] hover:bg-[#e5eeff]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Date */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#3e4947]">{TEXT_VAR.fieldDate}</span>
            <input type="date" value={form.date} onChange={field('date')} required className={inputCls} />
          </label>

          {/* Account ID (only on add) */}
          {mode === 'add' && (
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#3e4947]">{TEXT_VAR.fieldAccount}</span>
              {accountOptions.length > 0 ? (
                <div className="relative">
                  <select value={form.accountId} onChange={field('accountId')} required className={inputCls + ' appearance-none pr-8'}>
                    <option value="">Select account</option>
                    {accountOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3e4947]" />
                </div>
              ) : (
                <input
                  type="text"
                  value={form.accountId}
                  onChange={field('accountId')}
                  placeholder="e.g. 1"
                  required
                  className={inputCls}
                />
              )}
            </label>
          )}

          {/* Type */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#3e4947]">{TEXT_VAR.fieldType}</span>
            <div className="relative">
              <select
                value={form.type}
                onChange={(e) => {
                  const type = e.target.value as TransactionType
                  setForm((prev) => ({
                    ...prev,
                    type,
                    toAccountId: '',
                    category: type === 'transfer' ? '230e5693-9bd6-43d1-9ba3-a1e932eb22dd' : '',
                  }))
                }}
                required
                className={inputCls + ' appearance-none pr-8'}
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="transfer">Transfer</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3e4947]" />
            </div>
          </label>

          {form.type === 'transfer' && (
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#3e4947]">To Account</span>
              {accountOptions.length > 0 ? (
                <div className="relative">
                  <select value={form.toAccountId} onChange={field('toAccountId')} required className={inputCls + ' appearance-none pr-8'}>
                    <option value="">Select destination account</option>
                    {accountOptions
                      .filter((option) => option.value !== form.accountId)
                      .map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3e4947]" />
                </div>
              ) : (
                <input
                  type="text"
                  value={form.toAccountId}
                  onChange={field('toAccountId')}
                  placeholder="e.g. 2"
                  required
                  className={inputCls}
                />
              )}
            </label>
          )}

          {/* Category */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#3e4947]">{TEXT_VAR.fieldCategory}</span>
            <div className="relative">
              <select
                value={form.category}
                onChange={field('category')}
                required
                className={inputCls + ' appearance-none pr-8'}
              >
                <option value="">Select category</option>
                {visibleCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3e4947]" />
            </div>
          </label>

          {/* Description */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#3e4947]">{TEXT_VAR.fieldDescription}</span>
            <input
              type="text"
              value={form.description}
              onChange={field('description')}
              placeholder="e.g. Weekly grocery run"
              required
              className={inputCls}
            />
          </label>

          {/* Amount */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#3e4947]">{TEXT_VAR.fieldAmount}</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={field('amount')}
              placeholder="0.00"
              required
              className={inputCls}
            />
          </label>

          {error && (
            <p className="rounded-lg bg-[#ffdad6] px-3 py-2 text-sm text-[#ba1a1a]">{error}</p>
          )}

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[#bdc9c6] py-2.5 text-sm font-semibold text-[#3e4947] transition hover:bg-[#e5eeff]"
            >
              {TEXT_VAR.cancel}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-[#005c55] py-2.5 text-sm font-semibold text-white transition hover:bg-[#004943] disabled:opacity-60"
            >
              {saving ? '…' : TEXT_VAR.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TransactionsCalendarComingSoon() {
  return (
    <section className="min-h-[320px] rounded-xl border border-[#bdc9c6] bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[#0b1c30]">Coming soon</h2>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Main container – all data-fetching & state lives here
// ---------------------------------------------------------------------------

const PAGE_SIZE = 20

function TransactionsPageContainer() {
  const language = useSelector(selectLanguage)
  void useNavigate() // keep router context; navigate reserved for future logout redirect
  const TEXT_VAR = useTransactionsPageText()

  // --- fetch state ---
  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [accountOptions, setAccountOptions] = useState<TransactionsFilterOption[]>([])
  const [categoryOptions, setCategoryOptions] = useState<TransactionsFilterOption[]>(DEFAULT_CATEGORY_OPTIONS)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Refs to avoid stale closures in callbacks
  const categoryOptionsRef = useRef(categoryOptions)
  categoryOptionsRef.current = categoryOptions
  const accountOptionsRef = useRef(accountOptions)
  accountOptionsRef.current = accountOptions

  // --- filter state ---
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [pendingFilters, setPendingFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [areFiltersOpen, setAreFiltersOpen] = useState(false)

  // --- view mode ---
  const [viewMode, setViewMode] = useState<TransactionsViewMode>('list')

  // --- modals ---
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<(TransactionFormState & { id: string }) | null>(null)

  // --- row action menu ---
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLTableDataCellElement>(null)

  // Close row-action menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await api.get<ApiListResponse<ApiAccount> | ApiAccount[]>('/accounts')
      const accounts = listFromResponse(res.data)
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
      const res = await api.get<{ categories: any[] }>('/categories')
      const cats = res.data?.categories ?? []
      setCategoryOptions(
        cats.map((cat) => ({
          value: cat.id,
          label: cat.nameEn,
          type: cat.type === 'system' ? ('system' as const) : (cat.type as TransactionType),
        })),
      )
    } catch {
      // keep existing options as fallback
    }
  }, [])

  useEffect(() => {
    fetchAccounts()
    fetchCategories()
  }, [fetchAccounts, fetchCategories])

  // ---------------------------------------------------------------------------
  // Fetch transactions
  // ---------------------------------------------------------------------------

  const fetchTransactions = useCallback(async (page: number, applied: FilterState) => {
    setLoading(true)
    setFetchError(null)
    try {
      const params: Record<string, string | number> = { page, per_page: PAGE_SIZE }
      if (applied.dateFrom) params.date_from = applied.dateFrom
      if (applied.dateTo) params.date_to = applied.dateTo
      if (applied.accountId) params.accountId = applied.accountId
      if (applied.category) params.categoryId = applied.category
      if (applied.type) params.type = applied.type

      const res = await api.get<ApiTransactionsResponse | ApiTransaction[]>('/transactions', { params })
      const body = res.data
      const rawTransactions = listFromResponse(body)

      setTransactions(
        rawTransactions.map((transaction) =>
          mapApiTransaction(transaction, accountOptionsRef.current, categoryOptionsRef.current),
        ),
      )

      if (!Array.isArray(body) && body.pagination) {
        setTotalPages(body.pagination.totalPages ?? body.pagination.total_pages ?? 1)
        setTotalCount(body.pagination.total ?? 0)
      } else {
        setTotalPages(1)
        setTotalCount(rawTransactions.length)
      }
    } catch {
      setFetchError(TEXT_VAR.errorLoading)
    } finally {
      setLoading(false)
    }
  }, [TEXT_VAR.errorLoading])

  useEffect(() => {
    fetchTransactions(currentPage, filters)
  }, [currentPage, filters, fetchTransactions])

  // ---------------------------------------------------------------------------
  // Pagination helpers
  // ---------------------------------------------------------------------------

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  const pagination: TransactionsPagination = {
    currentPage,
    totalPages,
    summaryLabel: `${Math.min((currentPage - 1) * PAGE_SIZE + 1, totalCount)}–${Math.min(currentPage * PAGE_SIZE, totalCount)} of ${totalCount}`,
    canGoPrevious: currentPage > 1,
    canGoNext: currentPage < totalPages,
    pages: buildPages(currentPage, totalPages),
    onPageChange: handlePageChange,
    onPrevious: () => handlePageChange(currentPage - 1),
    onNext: () => handlePageChange(currentPage + 1),
  }

  // ---------------------------------------------------------------------------
  // Filter helpers
  // ---------------------------------------------------------------------------

  const applyFilters = () => {
    setFilters(pendingFilters)
    setCurrentPage(1)
  }

  const clearAllFilters = () => {
    setPendingFilters(EMPTY_FILTERS)
    setFilters(EMPTY_FILTERS)
    setCurrentPage(1)
  }

  // Build active-filter chips (exclude transfers from type chips per isolation rule)
  const activeFilterChips: TransactionsActiveFilter[] = []
  if (filters.dateFrom || filters.dateTo) {
    activeFilterChips.push({
      id: 'date',
      label: [filters.dateFrom, filters.dateTo].filter(Boolean).join(' → '),
      onRemove: () => { setFilters((f) => ({ ...f, dateFrom: '', dateTo: '' })); setCurrentPage(1) },
    })
  }
  if (filters.accountId) {
    activeFilterChips.push({
      id: 'account',
      label: `Account: ${optionLabel(accountOptions, filters.accountId) ?? filters.accountId}`,
      onRemove: () => { setFilters((f) => ({ ...f, accountId: '' })); setCurrentPage(1) },
    })
  }
  if (filters.category) {
    activeFilterChips.push({
      id: 'category',
      label: `Category: ${filters.category}`,
      onRemove: () => { setFilters((f) => ({ ...f, category: '' })); setCurrentPage(1) },
    })
  }
  if (filters.type) {
    activeFilterChips.push({
      id: 'type',
      label: filters.type.charAt(0).toUpperCase() + filters.type.slice(1),
      onRemove: () => { setFilters((f) => ({ ...f, type: '' })); setCurrentPage(1) },
    })
  }

  // ---------------------------------------------------------------------------
  // Edit modal opener
  // ---------------------------------------------------------------------------

  const handleOpenEdit = (row: TransactionRow) => {
    // Reconstruct a form-compatible shape from the display row
    setEditTarget({
      id: row.id,
      date: new Date().toISOString().split('T')[0], // server's running_balance doesn't expose original ISO; we leave blank
      accountId: '',
      toAccountId: '',
      type: row.type,
      category: categoryOptions.find((option) => option.label === row.category.label)?.value ?? '',
      description: row.description,
      amount: parseDecimal(row.amountLabel.replace(/[^0-9.]/g, '')),
    })
    setOpenMenuId(null)
  }

  // ---------------------------------------------------------------------------
  // Sidebar nav
  // ---------------------------------------------------------------------------

  const navItems: TransactionsNavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
    { id: 'accounts', label: 'Accounts', icon: 'accounts', href: '/accounts' },
    { id: 'transactions', label: 'Transactions', icon: 'transactions', href: '/transactions', isActive: true },
    { id: 'recurring', label: 'Recurring', icon: 'recurring', href: '/transactions/recurring' },
    { id: 'budgets', label: 'Budgets', icon: 'budgets', href: '/budgets' },
    { id: 'reports', label: 'Reports', icon: 'reports', href: '/reports' },
    { id: 'settings', label: 'Settings', icon: 'settings', href: '/profile-settings' },
  ]

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      {/* ── Modals ── */}
      {addModalOpen && (
        <TransactionModal
          mode="add"
          accountOptions={accountOptions}
          categoryOptions={categoryOptions}
          onClose={() => setAddModalOpen(false)}
          onSaved={() => fetchTransactions(currentPage, filters)}
        />
      )}
      {editTarget && (
        <TransactionModal
          mode="edit"
          initial={editTarget}
          accountOptions={accountOptions}
          categoryOptions={categoryOptions}
          onClose={() => setEditTarget(null)}
          onSaved={() => fetchTransactions(currentPage, filters)}
        />
      )}

      {/* ── Layout ── */}
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">

        {/* Page header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-4xl font-bold text-[#0b1c30] sm:text-5xl">{TEXT_VAR.pageTitle}</h1>
          <div className="flex w-full items-center gap-3 sm:w-auto">
            {/* Mobile add button */}
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#005c55] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#004943] sm:hidden"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {TEXT_VAR.addTransaction}
            </button>

            {/* Desktop view-mode toggle */}
            <div className="hidden rounded-lg bg-[#e5eeff] p-1 sm:flex">
              {(['list', 'calendar'] as TransactionsViewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${viewMode === mode ? 'bg-white text-[#0b1c30] shadow-sm' : 'text-[#3e4947] hover:text-[#0b1c30]'
                    }`}
                >
                  {mode === 'list' ? TEXT_VAR.listView : TEXT_VAR.calendarView}
                </button>
              ))}
            </div>

            {/* Desktop add button */}
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="hidden items-center gap-2 rounded-lg bg-[#005c55] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#004943] sm:flex"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {TEXT_VAR.addTransaction}
            </button>
          </div>
        </div>

        {/* Filters card */}
        <section className="flex flex-col gap-4 rounded-xl border border-[#bdc9c6] bg-white p-4 shadow-sm">
          <button
            type="button"
            onClick={() => setAreFiltersOpen((v) => !v)}
            className="flex items-center justify-between gap-4 text-[#0b1c30]"
          >
            <span className="flex items-center gap-3 text-xl font-semibold">
              <Filter className="h-5 w-5" aria-hidden="true" />
              {TEXT_VAR.filtersTitle}
            </span>
            <ChevronDown
              className={`h-5 w-5 text-[#3e4947] transition ${areFiltersOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>

          {areFiltersOpen && (
            <div className="grid grid-cols-1 gap-4 border-t border-[#bdc9c6] pt-4 md:grid-cols-2 xl:grid-cols-5">
              {/* Date from */}
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#3e4947]">{TEXT_VAR.dateRangeLabel} (From)</span>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3e4947]" />
                  <input
                    type="date"
                    value={pendingFilters.dateFrom}
                    onChange={(e) => setPendingFilters((f) => ({ ...f, dateFrom: e.target.value }))}
                    className="w-full rounded-lg border border-[#bdc9c6] bg-white py-3 pe-3 ps-10 text-sm text-[#0b1c30] outline-none transition focus:border-[#005c55] focus:ring-1 focus:ring-[#005c55]"
                  />
                </div>
              </label>

              {/* Date to */}
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#3e4947]">{TEXT_VAR.dateRangeLabel} (To)</span>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3e4947]" />
                  <input
                    type="date"
                    value={pendingFilters.dateTo}
                    onChange={(e) => setPendingFilters((f) => ({ ...f, dateTo: e.target.value }))}
                    className="w-full rounded-lg border border-[#bdc9c6] bg-white py-3 pe-3 ps-10 text-sm text-[#0b1c30] outline-none transition focus:border-[#005c55] focus:ring-1 focus:ring-[#005c55]"
                  />
                </div>
              </label>

              {/* Account */}
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#3e4947]">{TEXT_VAR.accountLabel}</span>
                <div className="relative">
                  <select
                    value={pendingFilters.accountId}
                    onChange={(e) => setPendingFilters((f) => ({ ...f, accountId: e.target.value }))}
                    className="w-full appearance-none rounded-lg border border-[#bdc9c6] bg-white px-3 py-3 pr-8 text-sm text-[#0b1c30] outline-none transition focus:border-[#005c55] focus:ring-1 focus:ring-[#005c55]"
                  >
                    <option value="">{TEXT_VAR.allAccounts}</option>
                    {accountOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3e4947]" />
                </div>
              </label>

              {/* Category */}
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#3e4947]">{TEXT_VAR.categoryLabel}</span>
                <div className="relative">
                  <select
                    value={pendingFilters.category}
                    onChange={(e) => setPendingFilters((f) => ({ ...f, category: e.target.value }))}
                    className="w-full appearance-none rounded-lg border border-[#bdc9c6] bg-white px-3 py-3 pr-8 text-sm text-[#0b1c30] outline-none transition focus:border-[#005c55] focus:ring-1 focus:ring-[#005c55]"
                  >
                    <option value="">{TEXT_VAR.allCategories}</option>
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3e4947]" />
                </div>
              </label>

              {/* Type – income/expense only; transfer excluded from aggregates */}
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#3e4947]">{TEXT_VAR.typeLabel}</span>
                <div className="flex h-11 rounded-lg bg-[#e5eeff] p-1">
                  {([
                    { value: '', label: TEXT_VAR.allType },
                    { value: 'income', label: TEXT_VAR.incomeType },
                    { value: 'expense', label: TEXT_VAR.expenseType },
                  ] as { value: '' | TransactionType; label: string }[]).map(({ value, label }) => (
                    <button
                      key={value || 'all'}
                      type="button"
                      onClick={() => setPendingFilters((f) => ({ ...f, type: value }))}
                      className={`flex-1 rounded-md text-xs font-semibold uppercase tracking-wide transition ${pendingFilters.type === value
                        ? 'bg-white text-[#0b1c30] shadow-sm'
                        : 'text-[#3e4947] hover:text-[#0b1c30]'
                        }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </label>

              {/* Apply button */}
              <div className="col-span-full flex justify-end">
                <button
                  type="button"
                  onClick={applyFilters}
                  className="rounded-lg bg-[#005c55] px-6 py-2.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#004943]"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Active filter chips */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#3e4947]">
              {TEXT_VAR.activeFiltersLabel}
            </span>
            {activeFilterChips.map((chip) => (
              <span
                key={chip.id}
                className="flex items-center gap-2 rounded-full bg-[#e5eeff] px-3 py-1 text-sm text-[#0b1c30]"
              >
                {chip.label}
                <button
                  type="button"
                  onClick={chip.onRemove}
                  className="text-[#3e4947] transition hover:text-[#ba1a1a]"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </span>
            ))}
            {activeFilterChips.length > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs font-semibold uppercase tracking-wide text-[#005c55] hover:underline"
              >
                {TEXT_VAR.clearAll}
              </button>
            )}
          </div>
        </section>

        {/* Loading / Error banners */}
        {loading && (
          <p className="text-center text-sm text-[#3e4947]">{TEXT_VAR.loading}</p>
        )}
        {fetchError && !loading && (
          <div className="flex items-center justify-center gap-4 rounded-xl border border-[#ffdad6] bg-[#fff8f7] p-4 text-sm text-[#ba1a1a]">
            {fetchError}
            <button
              type="button"
              onClick={() => fetchTransactions(currentPage, filters)}
              className="font-semibold underline"
            >
              {TEXT_VAR.retry}
            </button>
          </div>
        )}

        {!loading && !fetchError && viewMode === 'calendar' && (
          <TransactionsCalendarComingSoon />
        )}

        {/* Transactions table */}
        {!loading && !fetchError && viewMode === 'list' && (
          <section className="flex flex-col overflow-hidden rounded-xl border border-[#bdc9c6] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[790px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#bdc9c6] bg-[#eff4ff] text-xs font-semibold uppercase tracking-wide text-[#3e4947]">
                    <th className="p-4 font-semibold">
                      <button type="button" className="inline-flex items-center gap-1 hover:text-[#0b1c30]">
                        {TEXT_VAR.tableHeaders.date}
                        <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </th>
                    <th className="p-4 font-semibold">{TEXT_VAR.tableHeaders.account}</th>
                    <th className="p-4 font-semibold">{TEXT_VAR.tableHeaders.category}</th>
                    <th className="p-4 font-semibold">{TEXT_VAR.tableHeaders.description}</th>
                    <th className="p-4 text-right font-semibold">{TEXT_VAR.tableHeaders.amount}</th>
                    <th className="p-4 text-right font-semibold">{TEXT_VAR.tableHeaders.balance}</th>
                    <th className="w-16 p-4 text-center font-semibold">{TEXT_VAR.tableHeaders.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#bdc9c6] text-sm text-[#0b1c30]">
                  {transactions.length > 0 ? (
                    transactions.map((row) => (
                      <tr key={row.id} className="group transition hover:bg-[#eff4ff]">
                        <td className="whitespace-nowrap p-4">{row.dateLabel}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${row.accountTone === 'primary'
                              ? 'bg-[#0f766e]/20 text-[#005c55]'
                              : 'bg-[#fea619]/20 text-[#855300]'
                              }`}
                          >
                            {row.accountLabel}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded-full ${row.category.tone === 'income'
                                ? 'bg-[#007952]/20 text-[#005e3f]'
                                : row.category.tone === 'primary'
                                  ? 'bg-[#0f766e]/20 text-[#005c55]'
                                  : row.category.tone === 'expense'
                                    ? 'bg-[#ffdad6] text-[#ba1a1a]'
                                    : 'bg-[#e5eeff] text-[#3e4947]'
                                }`}
                            >
                              {(() => { const Icon = ICONS[row.category.icon]; return <Icon className="h-3.5 w-3.5" aria-hidden="true" /> })()}
                            </span>
                            {row.category.label}
                          </div>
                        </td>
                        <td className="max-w-[220px] truncate p-4">
                          <span className="inline-flex max-w-full items-center gap-2">
                            <span className="truncate">{row.description}</span>
                            {row.isRecurring && (
                              <Repeat className="h-3.5 w-3.5 shrink-0 text-[#005e3f]" aria-label={TEXT_VAR.recurringTitle} />
                            )}
                          </span>
                        </td>
                        <td
                          className={`p-4 text-right font-semibold ${row.type === 'income' ? 'text-[#005e3f]' : row.type === 'expense' ? 'text-[#ba1a1a]' : 'text-[#3e4947]'
                            }`}
                        >
                          {row.amountLabel}
                        </td>
                        <td className="p-4 text-right text-[#3e4947]">{row.balanceLabel}</td>
                        <td className="relative p-4 text-center" ref={openMenuId === row.id ? menuRef : undefined}>
                          <button
                            type="button"
                            aria-label={TEXT_VAR.rowActionsAriaLabel}
                            onClick={() => setOpenMenuId((id) => (id === row.id ? null : row.id))}
                            className="text-[#3e4947] opacity-100 transition hover:text-[#005c55] sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                          >
                            <MoreVertical className="h-5 w-5" aria-hidden="true" />
                          </button>
                          {openMenuId === row.id && (
                            <div className="absolute right-2 top-10 z-20 min-w-[140px] rounded-xl border border-[#bdc9c6] bg-white py-1 shadow-lg">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(row)}
                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-[#0b1c30] hover:bg-[#eff4ff]"
                              >
                                <Pencil className="h-4 w-4" aria-hidden="true" />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!window.confirm(TEXT_VAR.confirmDelete(1))) return
                                  await api.delete('/transactions/bulk', { data: { ids: [row.id] } })
                                  setOpenMenuId(null)
                                  fetchTransactions(currentPage, filters)
                                }}
                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-[#ba1a1a] hover:bg-[#fff8f7]"
                              >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-sm text-[#3e4947]">
                        {TEXT_VAR.emptyTransactions}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table footer – pagination */}
            <div className="flex flex-col items-center justify-end gap-4 border-t border-[#bdc9c6] bg-white p-4 sm:flex-row">
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center gap-3 text-sm sm:flex-row">
                  <span className="text-[#3e4947]">{pagination.summaryLabel}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!pagination.canGoPrevious}
                      onClick={pagination.onPrevious}
                      aria-label={TEXT_VAR.previousPageAriaLabel}
                      className="rounded p-1 text-[#3e4947] transition hover:bg-[#e5eeff] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronLeft className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
                    </button>

                    <div className="flex items-center gap-1">
                      {pagination.pages.map((page, index) =>
                        page === 'ellipsis' ? (
                          <span key={`ellipsis-${index}`} className="px-1 text-[#3e4947]">
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            type="button"
                            onClick={() => pagination.onPageChange?.(page)}
                            className={`flex h-8 w-8 items-center justify-center rounded transition ${page === pagination.currentPage
                              ? 'bg-[#0f766e] font-semibold text-[#a3faef]'
                              : 'text-[#0b1c30] hover:bg-[#e5eeff]'
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
                      onClick={pagination.onNext}
                      aria-label={TEXT_VAR.nextPageAriaLabel}
                      className="rounded p-1 text-[#3e4947] transition hover:bg-[#e5eeff] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronRight className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

    </>
  )
}

export default TransactionsPageContainer

// ---------------------------------------------------------------------------
// Legacy named export kept for any existing import consumers
// ---------------------------------------------------------------------------
export function useTransactionsPageData(): TransactionsPageData {
  return {
    navItems: [],
    filters: { accountOptions: [], categoryOptions: [], activeFilters: [] },
    transactions: [],
  }
}
