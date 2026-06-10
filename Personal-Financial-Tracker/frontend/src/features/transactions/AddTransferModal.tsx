import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import {
  ArrowRightLeft,
  CalendarDays,
  ChevronDown,
  DollarSign,
  FileUp,
  ReceiptText,
  Utensils,
  X,
  type LucideIcon,
} from 'lucide-react'

export type AddTransferLanguage = 'en' | 'ar'
export type AddTransferMode = 'transaction' | 'transfer'
export type AddTransferTransactionType = 'income' | 'expense'

export interface AddTransferOption {
  value: string
  label: string
}

export interface AddTransferCategoryOption extends AddTransferOption {
  icon?: AddTransferIconName
}

export interface AddTransferTransactionValues {
  accountId: string
  type: AddTransferTransactionType
  amount: string
  categoryId: string
  date: string
  description: string
  notes: string
  receiptFile?: File | null
}

export interface AddTransferValues {
  fromAccountId: string
  toAccountId: string
  amount: string
  date: string
  description: string
  notes: string
}

export interface AddTransferModalData {
  accountOptions: AddTransferOption[]
  categoryOptions: AddTransferCategoryOption[]
}

export interface AddTransferModalProps {
  isOpen: boolean
  mode: AddTransferMode
  data?: AddTransferModalData
  transactionValues: AddTransferTransactionValues
  transferValues: AddTransferValues
  language?: AddTransferLanguage
  isSubmitting?: boolean
  onClose: () => void
  onCancel?: () => void
  onModeChange: (mode: AddTransferMode) => void
  onTransactionChange: (values: AddTransferTransactionValues) => void
  onTransferChange: (values: AddTransferValues) => void
  onSubmit: (mode: AddTransferMode) => void
}

interface ModalHeaderProps {
  mode: AddTransferMode
  onModeChange: (mode: AddTransferMode) => void
  onClose: () => void
}

interface TransactionFormProps {
  values: AddTransferTransactionValues
  accountOptions: AddTransferOption[]
  categoryOptions: AddTransferCategoryOption[]
  onChange: (values: AddTransferTransactionValues) => void
}

interface TransferFormProps {
  values: AddTransferValues
  accountOptions: AddTransferOption[]
  onChange: (values: AddTransferValues) => void
}

interface SelectFieldProps {
  label: string
  value: string
  options: AddTransferOption[]
  placeholder: string
  icon?: LucideIcon
  onChange: (value: string) => void
}

interface TextFieldProps {
  label: string
  value: string
  placeholder?: string
  type?: 'text' | 'date' | 'number'
  inputMode?: 'decimal' | 'text'
  icon?: LucideIcon
  onChange: (value: string) => void
}

interface TextAreaFieldProps {
  label: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
}

interface TypeSelectorProps {
  value: AddTransferTransactionType
  onChange: (value: AddTransferTransactionType) => void
}

interface ReceiptUploadProps {
  fileName?: string
  onChange: (file: File | null) => void
}

interface ModalFooterProps {
  mode: AddTransferMode
  isSubmitting: boolean
  onCancel: () => void
}

interface TabButtonProps {
  label: string
  isActive: boolean
  onClick: () => void
}

interface FieldGroupProps {
  label: string
  children: ReactNode
}

type AddTransferIconName = 'dining' | 'receipt' | 'transfer'

const TEXT = {
  addTransaction: 'Add Transaction',
  transferFunds: 'Transfer Funds',
  closeModalAriaLabel: 'Close modal',
  accountLabel: 'Account',
  fromAccountLabel: 'From Account',
  toAccountLabel: 'To Account',
  accountPlaceholder: 'Select account',
  categoryLabel: 'Category',
  categoryPlaceholder: 'Select category',
  typeLabel: 'Type',
  incomeType: 'Income',
  expenseType: 'Expense',
  amountLabel: 'Amount',
  amountPlaceholder: '0.00',
  dateLabel: 'Date',
  descriptionLabel: 'Description',
  transactionDescriptionPlaceholder: 'Describe this transaction',
  transferDescriptionPlaceholder: 'Describe this transfer',
  notesLabel: 'Notes (Optional)',
  notesPlaceholder: 'Add any extra details here',
  receiptLabel: 'Receipt',
  receiptUploadAction: 'Click to upload',
  receiptUploadHint: 'or drag and drop',
  receiptFileHint: 'SVG, PNG, JPG or PDF (max. 5MB)',
  replaceReceiptPrefix: 'Selected:',
  cancel: 'Cancel',
  saveTransaction: 'Save Transaction',
  saveTransfer: 'Save Transfer',
  saving: 'Saving...',
}

const ICONS: Record<AddTransferIconName, LucideIcon> = {
  dining: Utensils,
  receipt: ReceiptText,
  transfer: ArrowRightLeft,
}

const DEFAULT_DATA: AddTransferModalData = {
  accountOptions: [],
  categoryOptions: [],
}

export function useAddTransferModalData(): AddTransferModalData {
  return DEFAULT_DATA
}

export function AddTransferModal({
  isOpen,
  mode,
  data,
  transactionValues,
  transferValues,
  language = 'en',
  isSubmitting = false,
  onClose,
  onCancel,
  onModeChange,
  onTransactionChange,
  onTransferChange,
  onSubmit,
}: AddTransferModalProps) {
  const fallbackData = useAddTransferModalData()
  const modalData = data ?? fallbackData
  const isRtl = language === 'ar'

  if (!isOpen) {
    return null
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit(mode)
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
        aria-labelledby="add-transfer-modal-title"
        className="flex max-h-[calc(100svh-2rem)] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
      >
        <ModalHeader mode={mode} onModeChange={onModeChange} onClose={onClose} />

        <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
          {mode === 'transaction' ? (
            <TransactionForm
              values={transactionValues}
              accountOptions={modalData.accountOptions}
              categoryOptions={modalData.categoryOptions}
              onChange={onTransactionChange}
            />
          ) : (
            <TransferForm
              values={transferValues}
              accountOptions={modalData.accountOptions}
              onChange={onTransferChange}
            />
          )}
        </div>

        <ModalFooter
          mode={mode}
          isSubmitting={isSubmitting}
          onCancel={onCancel ?? onClose}
        />
      </form>
    </div>
  )
}

function ModalHeader({ mode, onModeChange, onClose }: ModalHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-[#d3e4fe] px-4 pt-5 sm:px-6">
      <div id="add-transfer-modal-title" className="flex min-w-0 gap-5 overflow-x-auto">
        <TabButton
          label={TEXT.addTransaction}
          isActive={mode === 'transaction'}
          onClick={() => onModeChange('transaction')}
        />
        <TabButton
          label={TEXT.transferFunds}
          isActive={mode === 'transfer'}
          onClick={() => onModeChange('transfer')}
        />
      </div>

      <button
        type="button"
        aria-label={TEXT.closeModalAriaLabel}
        onClick={onClose}
        className="mb-3 shrink-0 rounded-full p-1 text-[#3e4947] transition hover:bg-[#e5eeff] hover:text-[#0b1c30]"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
    </header>
  )
}

function TabButton({ label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative top-px shrink-0 border-b-2 pb-3 text-base font-bold transition sm:text-xl ${
        isActive
          ? 'border-[#005c55] text-[#005c55]'
          : 'border-transparent text-[#3e4947] hover:text-[#0b1c30]'
      }`}
    >
      {label}
    </button>
  )
}

function TransactionForm({
  values,
  accountOptions,
  categoryOptions,
  onChange,
}: TransactionFormProps) {
  const selectedCategory = categoryOptions.find((category) => category.value === values.categoryId)
  const CategoryIcon = selectedCategory?.icon ? ICONS[selectedCategory.icon] : Utensils

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField
          label={TEXT.accountLabel}
          value={values.accountId}
          options={accountOptions}
          placeholder={TEXT.accountPlaceholder}
          onChange={(accountId) => onChange({ ...values, accountId })}
        />
        <TypeSelector
          value={values.type}
          onChange={(type) => onChange({ ...values, type })}
        />
      </div>

      <TextField
        label={TEXT.amountLabel}
        value={values.amount}
        placeholder={TEXT.amountPlaceholder}
        type="number"
        inputMode="decimal"
        icon={DollarSign}
        onChange={(amount) => onChange({ ...values, amount })}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField
          label={TEXT.categoryLabel}
          value={values.categoryId}
          options={categoryOptions}
          placeholder={TEXT.categoryPlaceholder}
          icon={CategoryIcon}
          onChange={(categoryId) => onChange({ ...values, categoryId })}
        />
        <TextField
          label={TEXT.dateLabel}
          value={values.date}
          type="date"
          onChange={(date) => onChange({ ...values, date })}
        />
      </div>

      <TextField
        label={TEXT.descriptionLabel}
        value={values.description}
        placeholder={TEXT.transactionDescriptionPlaceholder}
        onChange={(description) => onChange({ ...values, description })}
      />

      <TextAreaField
        label={TEXT.notesLabel}
        value={values.notes}
        placeholder={TEXT.notesPlaceholder}
        onChange={(notes) => onChange({ ...values, notes })}
      />

      <ReceiptUpload
        fileName={values.receiptFile?.name}
        onChange={(receiptFile) => onChange({ ...values, receiptFile })}
      />
    </>
  )
}

function TransferForm({ values, accountOptions, onChange }: TransferFormProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField
          label={TEXT.fromAccountLabel}
          value={values.fromAccountId}
          options={accountOptions}
          placeholder={TEXT.accountPlaceholder}
          icon={ArrowRightLeft}
          onChange={(fromAccountId) => onChange({ ...values, fromAccountId })}
        />
        <SelectField
          label={TEXT.toAccountLabel}
          value={values.toAccountId}
          options={accountOptions}
          placeholder={TEXT.accountPlaceholder}
          icon={ArrowRightLeft}
          onChange={(toAccountId) => onChange({ ...values, toAccountId })}
        />
      </div>

      <TextField
        label={TEXT.amountLabel}
        value={values.amount}
        placeholder={TEXT.amountPlaceholder}
        type="number"
        inputMode="decimal"
        icon={DollarSign}
        onChange={(amount) => onChange({ ...values, amount })}
      />

      <TextField
        label={TEXT.dateLabel}
        value={values.date}
        type="date"
        icon={CalendarDays}
        onChange={(date) => onChange({ ...values, date })}
      />

      <TextField
        label={TEXT.descriptionLabel}
        value={values.description}
        placeholder={TEXT.transferDescriptionPlaceholder}
        onChange={(description) => onChange({ ...values, description })}
      />

      <TextAreaField
        label={TEXT.notesLabel}
        value={values.notes}
        placeholder={TEXT.notesPlaceholder}
        onChange={(notes) => onChange({ ...values, notes })}
      />
    </>
  )
}

function SelectField({
  label,
  value,
  options,
  placeholder,
  icon: Icon,
  onChange,
}: SelectFieldProps) {
  return (
    <FieldGroup label={label}>
      <div className="relative">
        {Icon ? (
          <Icon
            className="pointer-events-none absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#855300]"
            aria-hidden="true"
          />
        ) : null}
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full appearance-none rounded-lg border border-[#bdc9c6] bg-white py-2.5 pe-10 text-base text-[#0b1c30] outline-none transition focus:border-[#005c55] focus:ring-1 focus:ring-[#005c55] ${
            Icon ? 'ps-10' : 'ps-3'
          }`}
        >
          <option value="">{placeholder}</option>
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

function TextField({
  label,
  value,
  placeholder,
  type = 'text',
  inputMode = 'text',
  icon: Icon,
  onChange,
}: TextFieldProps) {
  return (
    <FieldGroup label={label}>
      <div className="relative">
        {Icon ? (
          <Icon
            className="pointer-events-none absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#3e4947]"
            aria-hidden="true"
          />
        ) : null}
        <input
          value={value}
          type={type}
          inputMode={inputMode}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full rounded-lg border border-[#bdc9c6] bg-white py-2.5 pe-3 text-base text-[#0b1c30] outline-none transition placeholder:text-[#6e7977] focus:border-[#005c55] focus:ring-1 focus:ring-[#005c55] ${
            Icon ? 'ps-10' : 'ps-3'
          } ${type === 'number' ? 'text-2xl font-semibold' : ''}`}
        />
      </div>
    </FieldGroup>
  )
}

function TextAreaField({ label, value, placeholder, onChange }: TextAreaFieldProps) {
  return (
    <FieldGroup label={label}>
      <textarea
        value={value}
        placeholder={placeholder}
        rows={2}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-none rounded-lg border border-[#bdc9c6] bg-white px-3 py-2.5 text-base text-[#0b1c30] outline-none transition placeholder:text-[#6e7977] focus:border-[#005c55] focus:ring-1 focus:ring-[#005c55]"
      />
    </FieldGroup>
  )
}

function TypeSelector({ value, onChange }: TypeSelectorProps) {
  return (
    <FieldGroup label={TEXT.typeLabel}>
      <div className="flex rounded-lg border border-[#bdc9c6] bg-[#eff4ff] p-1">
        <TypeButton
          label={TEXT.incomeType}
          isActive={value === 'income'}
          onClick={() => onChange('income')}
        />
        <TypeButton
          label={TEXT.expenseType}
          isActive={value === 'expense'}
          onClick={() => onChange('expense')}
        />
      </div>
    </FieldGroup>
  )
}

function TypeButton({
  label,
  isActive,
  onClick,
}: {
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded px-2 py-1.5 text-sm transition ${
        isActive
          ? 'border border-[#bdc9c6]/50 bg-white font-semibold text-[#005c55] shadow-sm'
          : 'text-[#3e4947] hover:bg-[#e5eeff] hover:text-[#0b1c30]'
      }`}
    >
      {label}
    </button>
  )
}

function ReceiptUpload({ fileName, onChange }: ReceiptUploadProps) {
  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.files?.[0] ?? null)
  }

  return (
    <FieldGroup label={TEXT.receiptLabel}>
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#bdc9c6] p-4 text-center transition hover:border-[#005c55] hover:bg-[#eff4ff]">
        <FileUp className="mb-2 h-8 w-8 text-[#3e4947]" aria-hidden="true" />
        <span className="text-sm text-[#3e4947]">
          <span className="font-semibold text-[#005c55]">{TEXT.receiptUploadAction}</span>{' '}
          {TEXT.receiptUploadHint}
        </span>
        <span className="mt-1 text-xs font-medium text-[#6e7977]">
          {fileName ? `${TEXT.replaceReceiptPrefix} ${fileName}` : TEXT.receiptFileHint}
        </span>
        <input
          type="file"
          accept="image/svg+xml,image/png,image/jpeg,application/pdf"
          onChange={handleFileChange}
          className="sr-only"
        />
      </label>
    </FieldGroup>
  )
}

function ModalFooter({ mode, isSubmitting, onCancel }: ModalFooterProps) {
  const submitLabel = mode === 'transaction' ? TEXT.saveTransaction : TEXT.saveTransfer

  return (
    <footer className="flex flex-col-reverse gap-3 border-t border-[#d3e4fe] bg-[#f8f9ff] p-4 sm:flex-row sm:justify-end sm:p-6">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg border border-[#005c55] px-4 py-2 font-medium text-[#005c55] transition hover:bg-[#eff4ff]"
      >
        {TEXT.cancel}
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-[#005c55] px-4 py-2 font-medium text-white shadow-sm transition hover:bg-[#006a63] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? TEXT.saving : submitLabel}
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

export default AddTransferModal
