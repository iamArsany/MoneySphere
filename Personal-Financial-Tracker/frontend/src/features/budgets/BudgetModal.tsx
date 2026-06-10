import type { FormEvent, ReactNode } from 'react'
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Car,
  ChevronDown,
  Dumbbell,
  Home,
  ShoppingBag,
  ShoppingCart,
  Utensils,
  X,
  type LucideIcon,
} from 'lucide-react'

export type BudgetModalLanguage = 'en' | 'ar'
export type BudgetModalMode = 'add' | 'edit'

export interface BudgetModalOption {
  value: string
  label: string
}

export interface BudgetModalCategoryOption extends BudgetModalOption {
  icon: BudgetModalIconName
  tone?: BudgetModalTone
}

export interface BudgetModalValues {
  categoryId: string
  month: string
  year: string
  limit: string
}

export interface BudgetModalInsight {
  title: string
  description: string
}

export interface BudgetModalError {
  message: string
}

export interface BudgetModalData {
  categoryOptions: BudgetModalCategoryOption[]
  monthOptions: BudgetModalOption[]
  yearOptions: BudgetModalOption[]
  currencyLabel?: string
  insight?: BudgetModalInsight
}

export interface BudgetModalProps {
  isOpen: boolean
  mode?: BudgetModalMode
  values: BudgetModalValues
  data?: BudgetModalData
  language?: BudgetModalLanguage
  error?: BudgetModalError
  isSubmitting?: boolean
  isSaveDisabled?: boolean
  onClose: () => void
  onCancel?: () => void
  onValuesChange: (values: BudgetModalValues) => void
  onSubmit: (values: BudgetModalValues) => void
}

interface ModalHeaderProps {
  title: string
  onClose: () => void
}

interface BudgetFormProps {
  values: BudgetModalValues
  data: BudgetModalData
  error?: BudgetModalError
  onValuesChange: (values: BudgetModalValues) => void
}

interface CategorySelectProps {
  value: string
  options: BudgetModalCategoryOption[]
  error?: BudgetModalError
  onChange: (value: string) => void
}

interface SelectFieldProps {
  label: string
  value: string
  options: BudgetModalOption[]
  onChange: (value: string) => void
}

interface LimitFieldProps {
  value: string
  currencyLabel?: string
  onChange: (value: string) => void
}

interface InsightPanelProps {
  insight: BudgetModalInsight
}

interface ModalFooterProps {
  isSubmitting: boolean
  isSaveDisabled: boolean
  onCancel: () => void
}

interface FieldGroupProps {
  label: string
  children: ReactNode
}

type BudgetModalTone = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'neutral'

export type BudgetModalIconName =
  | 'analytics'
  | 'dining'
  | 'education'
  | 'fitness'
  | 'groceries'
  | 'home'
  | 'shopping'
  | 'transportation'

const TEXT = {
  addTitle: 'Add Budget',
  editTitle: 'Edit Budget',
  closeAriaLabel: 'Close budget modal',
  categoryLabel: 'Category',
  categoryPlaceholder: 'Select category',
  monthLabel: 'Month',
  yearLabel: 'Year',
  budgetLimitLabel: 'Budget Limit',
  limitPlaceholder: '0.00',
  cancel: 'Cancel',
  save: 'Save',
  saving: 'Saving...',
}

const ICONS: Record<BudgetModalIconName, LucideIcon> = {
  analytics: BarChart3,
  dining: Utensils,
  education: BookOpen,
  fitness: Dumbbell,
  groceries: ShoppingCart,
  home: Home,
  shopping: ShoppingBag,
  transportation: Car,
}

const DEFAULT_DATA: BudgetModalData = {
  categoryOptions: [],
  monthOptions: [],
  yearOptions: [],
}

export function useBudgetModalData(): BudgetModalData {
  return DEFAULT_DATA
}

export function BudgetModal({
  isOpen,
  mode = 'add',
  values,
  data,
  language = 'en',
  error,
  isSubmitting = false,
  isSaveDisabled = false,
  onClose,
  onCancel,
  onValuesChange,
  onSubmit,
}: BudgetModalProps) {
  const fallbackData = useBudgetModalData()
  const modalData = data ?? fallbackData
  const isRtl = language === 'ar'
  const title = mode === 'edit' ? TEXT.editTitle : TEXT.addTitle

  if (!isOpen) {
    return null
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isSaveDisabled && !isSubmitting) {
      onSubmit(values)
    }
  }

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#213145]/40 p-4 backdrop-blur-sm"
      role="presentation"
    >
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="budget-modal-title"
        className="flex max-h-[calc(100svh-2rem)] w-full max-w-[480px] flex-col overflow-hidden rounded-xl bg-white shadow-xl"
      >
        <ModalHeader title={title} onClose={onClose} />

        <BudgetForm
          values={values}
          data={modalData}
          error={error}
          onValuesChange={onValuesChange}
        />

        <ModalFooter
          isSubmitting={isSubmitting}
          isSaveDisabled={isSaveDisabled || Boolean(error)}
          onCancel={onCancel ?? onClose}
        />
      </form>
    </div>
  )
}

function ModalHeader({ title, onClose }: ModalHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-[#bdc9c6]/40 p-6">
      <h2 id="budget-modal-title" className="text-xl font-semibold text-[#0b1c30]">
        {title}
      </h2>
      <button
        type="button"
        aria-label={TEXT.closeAriaLabel}
        onClick={onClose}
        className="rounded-full p-1 text-[#3e4947] transition hover:bg-[#dce9ff] hover:text-[#0b1c30]"
      >
        <X className="h-6 w-6" aria-hidden="true" />
      </button>
    </header>
  )
}

function BudgetForm({ values, data, error, onValuesChange }: BudgetFormProps) {
  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
      <CategorySelect
        value={values.categoryId}
        options={data.categoryOptions}
        error={error}
        onChange={(categoryId) => onValuesChange({ ...values, categoryId })}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField
          label={TEXT.monthLabel}
          value={values.month}
          options={data.monthOptions}
          onChange={(month) => onValuesChange({ ...values, month })}
        />
        <SelectField
          label={TEXT.yearLabel}
          value={values.year}
          options={data.yearOptions}
          onChange={(year) => onValuesChange({ ...values, year })}
        />
      </div>

      <LimitField
        value={values.limit}
        currencyLabel={data.currencyLabel}
        onChange={(limit) => onValuesChange({ ...values, limit })}
      />

      {data.insight ? <InsightPanel insight={data.insight} /> : null}
    </div>
  )
}

function CategorySelect({ value, options, error, onChange }: CategorySelectProps) {
  const selectedOption = options.find((option) => option.value === value)
  const SelectedIcon = selectedOption ? ICONS[selectedOption.icon] : Utensils
  const hasError = Boolean(error)

  return (
    <FieldGroup label={TEXT.categoryLabel}>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full appearance-none rounded-lg border bg-[#f8f9ff] py-3 pe-10 ps-14 text-base text-[#0b1c30] outline-none transition focus:ring-2 ${
            hasError
              ? 'border-[#ba1a1a] focus:border-[#ba1a1a] focus:ring-[#ba1a1a]/40'
              : 'border-[#bdc9c6] focus:border-[#005c55] focus:ring-[#005c55]/40'
          }`}
        >
          <option value="">{TEXT.categoryPlaceholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span
          className={`pointer-events-none absolute start-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full ${categoryToneClass(
            selectedOption?.tone,
            hasError,
          )}`}
        >
          <SelectedIcon className="h-4 w-4" aria-hidden="true" />
        </span>
        <ChevronDown
          className="pointer-events-none absolute end-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#3e4947]"
          aria-hidden="true"
        />
      </div>

      {error ? (
        <p className="mt-1 flex items-start gap-1 text-sm text-[#ba1a1a]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error.message}
        </p>
      ) : null}
    </FieldGroup>
  )
}

function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <FieldGroup label={label}>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-lg border border-[#bdc9c6] bg-[#f8f9ff] p-3 pe-10 text-base text-[#0b1c30] outline-none transition focus:border-[#005c55] focus:ring-2 focus:ring-[#005c55]/40"
        >
          <option value="" />
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute end-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#3e4947]"
          aria-hidden="true"
        />
      </div>
    </FieldGroup>
  )
}

function LimitField({ value, currencyLabel, onChange }: LimitFieldProps) {
  return (
    <FieldGroup label={TEXT.budgetLimitLabel}>
      <div className="relative">
        {currencyLabel ? (
          <span className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 select-none text-base text-[#3e4947]">
            {currencyLabel}
          </span>
        ) : null}
        <input
          type="number"
          inputMode="decimal"
          value={value}
          placeholder={TEXT.limitPlaceholder}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full rounded-lg border border-[#bdc9c6] bg-[#f8f9ff] py-3 pe-4 text-base text-[#0b1c30] outline-none transition placeholder:text-[#6e7977] focus:border-[#005c55] focus:ring-2 focus:ring-[#005c55]/40 ${
            currencyLabel ? 'ps-16' : 'ps-4'
          }`}
        />
      </div>
    </FieldGroup>
  )
}

function InsightPanel({ insight }: InsightPanelProps) {
  return (
    <aside className="flex items-start gap-3 rounded-lg border border-[#bdc9c6]/50 bg-[#eff4ff] p-4">
      <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-[#855300]" aria-hidden="true" />
      <div>
        <h3 className="text-xs font-semibold uppercase text-[#0b1c30]">{insight.title}</h3>
        <p className="mt-1 text-sm text-[#3e4947]">{insight.description}</p>
      </div>
    </aside>
  )
}

function ModalFooter({ isSubmitting, isSaveDisabled, onCancel }: ModalFooterProps) {
  return (
    <footer className="flex justify-end gap-3 border-t border-[#bdc9c6]/40 bg-white p-6">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg border border-[#005c55] bg-transparent px-4 py-2 text-xs font-semibold uppercase text-[#005c55] transition hover:bg-[#eff4ff] focus:outline-none focus:ring-2 focus:ring-[#005c55] focus:ring-offset-2"
      >
        {TEXT.cancel}
      </button>
      <button
        type="submit"
        disabled={isSaveDisabled || isSubmitting}
        className="rounded-lg bg-[#005c55] px-4 py-2 text-xs font-semibold uppercase text-white transition hover:bg-[#006a63] focus:outline-none focus:ring-2 focus:ring-[#005c55] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? TEXT.saving : TEXT.save}
      </button>
    </footer>
  )
}

function FieldGroup({ label, children }: FieldGroupProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase text-[#3e4947]">{label}</span>
      {children}
    </label>
  )
}

function categoryToneClass(tone: BudgetModalTone = 'neutral', hasError: boolean) {
  if (hasError) return 'bg-[#ffdad6] text-[#93000a]'
  if (tone === 'secondary') return 'bg-[#ffddb8] text-[#855300]'
  if (tone === 'tertiary') return 'bg-[#6ffbbe] text-[#005e3f]'
  if (tone === 'danger') return 'bg-[#ffdad6] text-[#ba1a1a]'
  if (tone === 'primary') return 'bg-[#dce9ff] text-[#005c55]'
  return 'bg-[#e5eeff] text-[#3e4947]'
}

export default BudgetModal
