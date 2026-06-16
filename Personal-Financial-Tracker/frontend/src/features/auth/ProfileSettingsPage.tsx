import { useSelector, useDispatch } from 'react-redux'
import { selectLanguage, setLanguage, clearSession } from '../../store'
import { useState, useEffect, type ChangeEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import {
  Bell,
  Camera,
  FileText,
  LayoutDashboard,
  LogIn,
  ReceiptText,
  Settings,
  ShieldCheck,
  User,
  WalletCards,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react'

export type ProfileSettingsLanguage = 'en' | 'ar'
export type ProfileSettingsSection = 'profile' | 'security' | 'notifications' | 'preferences' | 'danger'

export interface ProfileSettingsNavItem {
  id: string
  label: string
  href?: string
  icon: ProfileSettingsIconName
  isActive?: boolean
}

export interface ProfileSettingsOption {
  value: string
  label: string
}

export interface ProfileSettingsProfileValues {
  fullName: string
  email: string
  phone: string
  interfaceLanguage: ProfileSettingsLanguage
  baseCurrency: string
  avatarUrl?: string
  avatarAlt?: string
}

export interface ProfileSettingsNotificationChannel {
  id: string
  label: string
  enabled: boolean
}

export interface ProfileSettingsNotificationPreference {
  id: string
  title: string
  description: string
  channels: ProfileSettingsNotificationChannel[]
}

export interface ProfileSettingsFooterLink {
  id: string
  label: string
  href?: string
}

export interface ProfileSettingsPageData {
  topNavItems: ProfileSettingsNavItem[]
  settingsNavItems: ProfileSettingsNavItem[]
  currencyOptions: ProfileSettingsOption[]
  profile: ProfileSettingsProfileValues
  notificationPreferences: ProfileSettingsNotificationPreference[]
  footerLinks: ProfileSettingsFooterLink[]
}

export interface ProfileSettingsPageProps {
  data?: ProfileSettingsPageData
  language?: ProfileSettingsLanguage
  languageToggleLabel?: string
  isSavingProfile?: boolean
  onLanguageToggle?: () => void
  onLogin?: () => void
  onProfileChange: (values: ProfileSettingsProfileValues) => void
  onAvatarChange?: (file: File) => void
  onSaveProfile?: () => void
  onNotificationChannelChange?: (
    preferenceId: string,
    channelId: string,
    enabled: boolean,
  ) => void
  onDeleteAccount?: () => void
}

interface TopNavProps {
  navItems: ProfileSettingsNavItem[]
  languageToggleLabel?: string
  onLanguageToggle?: () => void
  onLogin?: () => void
}

interface SettingsSidebarProps {
  items: ProfileSettingsNavItem[]
}

interface ProfileSectionProps {
  profile: ProfileSettingsProfileValues
  currencyOptions: ProfileSettingsOption[]
  isSavingProfile: boolean
  onProfileChange: (values: ProfileSettingsProfileValues) => void
  onAvatarChange?: (file: File) => void
  onSaveProfile?: () => void
}

interface NotificationsSectionProps {
  preferences: ProfileSettingsNotificationPreference[]
  onNotificationChannelChange?: (
    preferenceId: string,
    channelId: string,
    enabled: boolean,
  ) => void
}

interface DangerZoneProps {
  onDeleteAccount?: () => void
}

interface FooterProps {
  links: ProfileSettingsFooterLink[]
}

interface TextFieldProps {
  label: string
  value: string
  type: 'text' | 'email' | 'tel'
  onChange: (value: string) => void
}

interface SelectFieldProps {
  label: string
  value: string
  options: ProfileSettingsOption[]
  onChange: (value: string) => void
}

interface RadioOptionProps {
  label: string
  value: ProfileSettingsLanguage
  checked: boolean
  onChange: (value: ProfileSettingsLanguage) => void
}

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

interface FieldGroupProps {
  label: string
  children: ReactNode
}

type ProfileSettingsIconName =
  | 'budgets'
  | 'dashboard'
  | 'danger'
  | 'login'
  | 'notifications'
  | 'preferences'
  | 'profile'
  | 'reports'
  | 'security'
  | 'transactions'

const EN_TEXT = {
  appName: 'PFT',
  login: 'Login',
  pageTitle: 'Profile & Settings',
  pageSubtitle: 'Manage your personal information, preferences, and account security.',
  personalInformationTitle: 'Personal Information',
  changePhoto: 'Change Photo',
  changePhotoAriaLabel: 'Change profile photo',
  fullNameLabel: 'Full Name',
  emailLabel: 'Email Address',
  phoneLabel: 'Phone Number',
  interfaceLanguageLabel: 'Preferred Interface Language',
  englishLanguage: 'English',
  arabicLanguage: 'Arabic',
  baseCurrencyLabel: 'Base Currency',
  saveProfile: 'Save Profile',
  savingProfile: 'Saving...',
  notificationPreferencesTitle: 'Notification Preferences',
  notificationPreferencesDescription:
    'Control how and when PFT communicates with you regarding your financial tracking.',
  dangerZoneTitle: 'Danger Zone',
  dangerZoneDescription: 'Irreversible actions regarding your PFT account and financial data.',
  deleteAccountTitle: 'Delete Account',
  deleteAccountDescription:
    'Permanently remove your account and all associated data. This action cannot be undone, and all transaction history, budgets, and reports will be lost.',
  deleteAccount: 'Delete Account',
  copyright: '© 2026 PFT Personal Finance Tracker. All rights reserved.',
  emptyNotifications: 'No notification preferences available.',
  emptyNavigation: 'No navigation items available.',
}

const AR_TEXT = {
  appName: 'PFT',
  login: 'تسجيل الدخول',
  pageTitle: 'الملف الشخصي والإعدادات',
  pageSubtitle: 'إدارة معلوماتك الشخصية والتفضيلات وأمان الحساب.',
  personalInformationTitle: 'المعلومات الشخصية',
  changePhoto: 'تغيير الصورة',
  changePhotoAriaLabel: 'تغيير صورة الملف الشخصي',
  fullNameLabel: 'الاسم الكامل',
  emailLabel: 'عنوان البريد الإلكتروني',
  phoneLabel: 'رقم الهاتف',
  interfaceLanguageLabel: 'لغة الواجهة المفضلة',
  englishLanguage: 'الإنجليزية (English)',
  arabicLanguage: 'العربية (Arabic)',
  baseCurrencyLabel: 'العملة الأساسية',
  saveProfile: 'حفظ الملف الشخصي',
  savingProfile: 'جارٍ الحفظ...',
  notificationPreferencesTitle: 'تفضيلات الإشعارات',
  notificationPreferencesDescription: 'تحكم في كيفية ووقت تواصل PFT معك بخصوص التتبع المالي الخاص بك.',
  dangerZoneTitle: 'منطقة الخطر',
  dangerZoneDescription: 'إجراءات لا رجعة فيها بخصوص حساب PFT الخاص بك وبياناتك المالية.',
  deleteAccountTitle: 'حذف الحساب',
  deleteAccountDescription: 'إزالة حسابك وجميع البيانات المرتبطة به نهائيًا. لا يمكن التراجع عن هذا الإجراء، وسيتم فقدان جميع سجلات المعاملات والميزانيات والتقارير.',
  deleteAccount: 'حذف الحساب',
  copyright: '© 2026 PFT متتبع الشؤون المالية الشخصية. جميع الحقوق محفوظة.',
  emptyNotifications: 'لا تتوفر تفضيلات الإشعارات.',
  emptyNavigation: 'لا تتوفر عناصر تنقل.',
};

export function useProfileSettingsPageText() {
  const language = useSelector(selectLanguage);
  return language === 'ar' ? AR_TEXT : EN_TEXT;
}


const ICONS: Record<ProfileSettingsIconName, LucideIcon> = {
  budgets: WalletCards,
  dashboard: LayoutDashboard,
  danger: TriangleAlert,
  login: LogIn,
  notifications: Bell,
  preferences: Settings,
  profile: User,
  reports: FileText,
  security: ShieldCheck,
  transactions: ReceiptText,
}

const DEFAULT_PROFILE: ProfileSettingsProfileValues = {
  fullName: '',
  email: '',
  phone: '',
  interfaceLanguage: 'en',
  baseCurrency: '',
}

const CURRENCY_OPTIONS: ProfileSettingsOption[] = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'AED', label: 'AED - UAE Dirham' },
  { value: 'SAR', label: 'SAR - Saudi Riyal' },
  { value: 'EGP', label: 'EGP - Egyptian Pound' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'CHF', label: 'CHF - Swiss Franc' },
  { value: 'CNY', label: 'CNY - Chinese Yuan' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'BRL', label: 'BRL - Brazilian Real' },
  { value: 'MXN', label: 'MXN - Mexican Peso' },
  { value: 'SGD', label: 'SGD - Singapore Dollar' },
  { value: 'HKD', label: 'HKD - Hong Kong Dollar' },
  { value: 'NOK', label: 'NOK - Norwegian Krone' },
  { value: 'SEK', label: 'SEK - Swedish Krona' },
  { value: 'DKK', label: 'DKK - Danish Krone' },
  { value: 'NZD', label: 'NZD - New Zealand Dollar' },
  { value: 'ZAR', label: 'ZAR - South African Rand' },
  { value: 'TRY', label: 'TRY - Turkish Lira' },
  { value: 'KWD', label: 'KWD - Kuwaiti Dinar' },
  { value: 'QAR', label: 'QAR - Qatari Riyal' },
  { value: 'JOD', label: 'JOD - Jordanian Dinar' },
  { value: 'MAD', label: 'MAD - Moroccan Dirham' },
  { value: 'TND', label: 'TND - Tunisian Dinar' },
  { value: 'PKR', label: 'PKR - Pakistani Rupee' },
  { value: 'BDT', label: 'BDT - Bangladeshi Taka' },
  { value: 'IDR', label: 'IDR - Indonesian Rupiah' },
  { value: 'MYR', label: 'MYR - Malaysian Ringgit' },
  { value: 'THB', label: 'THB - Thai Baht' },
  { value: 'NGN', label: 'NGN - Nigerian Naira' },
  { value: 'KES', label: 'KES - Kenyan Shilling' },
]

const DEFAULT_DATA: ProfileSettingsPageData = {
  topNavItems: [],
  settingsNavItems: [],
  currencyOptions: CURRENCY_OPTIONS,
  profile: DEFAULT_PROFILE,
  notificationPreferences: [],
  footerLinks: [],
}

export function useProfileSettingsPageData(): ProfileSettingsPageData {
  return DEFAULT_DATA
}

export function ProfileSettingsPage({
  data,
  language = 'en',
  languageToggleLabel,
  isSavingProfile = false,
  onLanguageToggle,
  onLogin,
  onProfileChange,
  onAvatarChange,
  onSaveProfile,
  onNotificationChannelChange,
  onDeleteAccount,
}: ProfileSettingsPageProps) {
    const TEXT_VAR = useProfileSettingsPageText();
  const fallbackData = useProfileSettingsPageData()
  const pageData = data ?? fallbackData
  const isRtl = language === 'ar'

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 md:flex-row lg:px-8">
        <SettingsSidebar items={pageData.settingsNavItems} />

        <div className="flex min-w-0 flex-1 flex-col gap-8">
          <header>
            <h1 className="text-4xl font-bold text-[#005c55] sm:text-5xl">
              {TEXT_VAR.pageTitle}
            </h1>
            <p className="mt-2 text-base text-[#3e4947]">{TEXT_VAR.pageSubtitle}</p>
          </header>

          <ProfileSection
            profile={pageData.profile}
            currencyOptions={pageData.currencyOptions}
            isSavingProfile={isSavingProfile}
            onProfileChange={onProfileChange}
            onAvatarChange={onAvatarChange}
            onSaveProfile={onSaveProfile}
          />

          <NotificationsSection
            preferences={pageData.notificationPreferences}
            onNotificationChannelChange={onNotificationChannelChange}
          />

          <DangerZone onDeleteAccount={onDeleteAccount} />
        </div>
      </div>
    </>
  )
}

function TopNav({
  navItems,
  languageToggleLabel,
  onLanguageToggle,
  onLogin,
}: TopNavProps) {
    const TEXT_VAR = useProfileSettingsPageText();
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#bdc9c6] bg-white shadow-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <a href="#" className="text-2xl font-bold text-[#005c55]">
          {TEXT_VAR.appName}
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => {
            const Icon = ICONS[item.icon]

            return (
              <a
                key={item.id}
                href={item.href ?? '#'}
                className="flex items-center gap-2 text-base font-semibold text-[#3e4947] transition hover:text-[#005c55]"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </a>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          {languageToggleLabel ? (
            <button
              type="button"
              onClick={onLanguageToggle}
              className="text-sm font-semibold text-[#005c55] transition hover:opacity-80"
            >
              {languageToggleLabel}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onLogin}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#3e4947] transition hover:text-[#005c55]"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            {TEXT_VAR.login}
          </button>
        </div>
      </div>
    </header>
  )
}

function SettingsSidebar({ items }: SettingsSidebarProps) {
  const TEXT_VAR = useProfileSettingsPageText();

  return (
    <aside className="w-full shrink-0 md:w-60">
      <nav className="sticky top-24 flex gap-2 overflow-x-auto md:flex-col">
        {items.length > 0 ? (
          items.map((item) => {
            const Icon = ICONS[item.icon]

            return (
              <a
                key={item.id}
                href={item.href ?? '#'}
                className={`flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-base font-semibold transition ${
                  item.isActive
                    ? 'bg-[#dce9ff] text-[#005c55]'
                    : item.icon === 'danger'
                      ? 'text-[#ba1a1a] hover:bg-[#ffdad6]'
                      : 'text-[#3e4947] hover:bg-[#eff4ff]'
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </a>
            )
          })
        ) : (
          <div className="rounded-lg border border-dashed border-[#bdc9c6] px-4 py-3 text-sm text-[#3e4947]">
            {TEXT_VAR.emptyNavigation}
          </div>
        )}
      </nav>
    </aside>
  )
}

function ProfileSection({
  profile,
  currencyOptions,
  isSavingProfile,
  onProfileChange,
  onAvatarChange,
  onSaveProfile,
}: ProfileSectionProps) {
    const TEXT_VAR = useProfileSettingsPageText();
  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      onAvatarChange?.(file)
    }
  }

  return (
    <section
      id="profile"
      className="rounded-xl border border-[#bdc9c6]/40 bg-white p-4 shadow-sm sm:p-6"
    >
      <h2 className="mb-4 text-2xl font-semibold text-[#005c55]">
        {TEXT_VAR.personalInformationTitle}
      </h2>

      <div className="flex flex-col items-start gap-8 lg:flex-row">
        <div className="flex w-full flex-col items-center gap-3 sm:w-auto">
          <label className="group relative flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-[#bdc9c6] bg-[#e5eeff]">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.avatarAlt ?? profile.fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-12 w-12 text-[#3e4947]" aria-hidden="true" />
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
              <Camera className="h-8 w-8 text-white" aria-hidden="true" />
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              aria-label={TEXT_VAR.changePhotoAriaLabel}
              onChange={handleAvatarChange}
              className="sr-only"
            />
          </label>
          <span className="text-xs font-semibold uppercase text-[#005c55]">
            {TEXT_VAR.changePhoto}
          </span>
        </div>

        <div className="grid w-full flex-1 grid-cols-1 gap-4 md:grid-cols-2">
          <TextField
            label={TEXT_VAR.fullNameLabel}
            value={profile.fullName}
            type="text"
            onChange={(fullName) => onProfileChange({ ...profile, fullName })}
          />
          <TextField
            label={TEXT_VAR.emailLabel}
            value={profile.email}
            type="email"
            onChange={(email) => onProfileChange({ ...profile, email })}
          />
          <TextField
            label={TEXT_VAR.phoneLabel}
            value={profile.phone}
            type="tel"
            onChange={(phone) => onProfileChange({ ...profile, phone })}
          />
          <FieldGroup label={TEXT_VAR.interfaceLanguageLabel}>
            <div className="flex flex-wrap gap-4 py-1">
              <RadioOption
                label={TEXT_VAR.englishLanguage}
                value="en"
                checked={profile.interfaceLanguage === 'en'}
                onChange={(interfaceLanguage) => onProfileChange({ ...profile, interfaceLanguage })}
              />
              <RadioOption
                label={TEXT_VAR.arabicLanguage}
                value="ar"
                checked={profile.interfaceLanguage === 'ar'}
                onChange={(interfaceLanguage) => onProfileChange({ ...profile, interfaceLanguage })}
              />
            </div>
          </FieldGroup>
          <SelectField
            label={TEXT_VAR.baseCurrencyLabel}
            value={profile.baseCurrency}
            options={currencyOptions}
            onChange={(baseCurrency) => onProfileChange({ ...profile, baseCurrency })}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          disabled={isSavingProfile}
          onClick={onSaveProfile}
          className="rounded-lg bg-[#005c55] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#006a63] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSavingProfile ? TEXT_VAR.savingProfile : TEXT_VAR.saveProfile}
        </button>
      </div>
    </section>
  )
}

function NotificationsSection({
  preferences,
  onNotificationChannelChange,
}: NotificationsSectionProps) {
    const TEXT_VAR = useProfileSettingsPageText();
  return (
    <section
      id="notifications"
      className="rounded-xl border border-[#bdc9c6]/40 bg-white p-4 shadow-sm sm:p-6"
    >
      <h2 className="text-2xl font-semibold text-[#005c55]">
        {TEXT_VAR.notificationPreferencesTitle}
      </h2>
      <p className="mt-2 text-sm text-[#3e4947]">{TEXT_VAR.notificationPreferencesDescription}</p>

      <div className="mt-6 divide-y divide-[#bdc9c6]/40">
        {preferences.length > 0 ? (
          preferences.map((preference) => (
            <article
              key={preference.id}
              className="flex flex-col justify-between gap-4 py-4 lg:flex-row lg:items-center"
            >
              <div>
                <h3 className="text-lg font-semibold text-[#0b1c30]">{preference.title}</h3>
                <p className="mt-1 text-sm text-[#3e4947]">{preference.description}</p>
              </div>
              <div className="flex flex-wrap gap-4">
                {preference.channels.map((channel) => (
                  <label key={channel.id} className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase text-[#3e4947]">
                      {channel.label}
                    </span>
                    <Toggle
                      checked={channel.enabled}
                      onChange={(enabled) =>
                        onNotificationChannelChange?.(preference.id, channel.id, enabled)
                      }
                    />
                  </label>
                ))}
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-[#bdc9c6] p-6 text-center text-sm text-[#3e4947]">
            {TEXT_VAR.emptyNotifications}
          </div>
        )}
      </div>
    </section>
  )
}

function DangerZone({ onDeleteAccount }: DangerZoneProps) {
  const TEXT_VAR = useProfileSettingsPageText();

  return (
    <section
      id="danger-zone"
      className="relative overflow-hidden rounded-xl border border-[#ba1a1a]/30 bg-[#ffdad6]/30 p-4 sm:p-6"
    >
      <div className="absolute bottom-0 start-0 top-0 w-1 bg-[#ba1a1a]" />
      <h2 className="flex items-center gap-2 text-2xl font-semibold text-[#ba1a1a]">
        <TriangleAlert className="h-6 w-6" aria-hidden="true" />
        {TEXT_VAR.dangerZoneTitle}
      </h2>
      <p className="mt-2 text-base text-[#0b1c30]">{TEXT_VAR.dangerZoneDescription}</p>

      <div className="mt-6 flex flex-col justify-between gap-4 rounded-lg border border-[#ba1a1a]/10 bg-white/60 p-4 md:flex-row md:items-center">
        <div>
          <h3 className="text-xl font-semibold text-[#0b1c30]">{TEXT_VAR.deleteAccountTitle}</h3>
          <p className="mt-1 max-w-2xl text-sm text-[#3e4947]">
            {TEXT_VAR.deleteAccountDescription}
          </p>
        </div>
        <button
          type="button"
          onClick={onDeleteAccount}
          className="shrink-0 rounded-lg bg-[#ba1a1a] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#93000a]"
        >
          {TEXT_VAR.deleteAccount}
        </button>
      </div>
    </section>
  )
}

function Footer({ links }: FooterProps) {
  const TEXT_VAR = useProfileSettingsPageText();

  return (
    <footer className="mt-auto border-t border-[#bdc9c6] bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-center sm:px-6 md:flex-row md:text-start lg:px-8">
        <div className="text-xl font-bold text-[#005c55]">{TEXT_VAR.appName}</div>
        <div className="text-sm text-[#3e4947]">{TEXT_VAR.copyright}</div>
        <nav className="flex flex-wrap justify-center gap-4">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.href ?? '#'}
              className="text-sm text-[#3e4947] transition hover:text-[#855300]"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}

function TextField({ label, value, type, onChange }: TextFieldProps) {
  return (
    <FieldGroup label={label}>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-[#bdc9c6] bg-white px-3 py-2 text-base text-[#0b1c30] outline-none transition focus:border-[#005c55] focus:ring-2 focus:ring-[#005c55]"
      />
    </FieldGroup>
  )
}

function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <FieldGroup label={label}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-[#bdc9c6] bg-white px-3 py-2 text-base text-[#0b1c30] outline-none transition focus:border-[#005c55] focus:ring-2 focus:ring-[#005c55]"
      >
        <option value="" />
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldGroup>
  )
}

function RadioOption({ label, value, checked, onChange }: RadioOptionProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-base text-[#0b1c30]">
      <input
        type="radio"
        name="profile-interface-language"
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="text-[#005c55] focus:ring-[#005c55]"
      />
      <span>{label}</span>
    </label>
  )
}

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition ${
        checked ? 'bg-[#005c55]' : 'bg-[#bdc9c6]'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full border border-gray-300 bg-white transition ${
          checked ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0.5 rtl:-translate-x-0.5'
        }`}
      />
    </button>
  )
}

function FieldGroup({ label, children }: FieldGroupProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase text-[#3e4947]">{label}</span>
      {children}
    </label>
  )
}

function ProfileSettingsPageContainer() {
  const language = useSelector(selectLanguage)
  const authState = useSelector((state: any) => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [profile, setProfile] = useState<ProfileSettingsProfileValues>({
    fullName: authState.user?.name || authState.user?.fullName || '',
    email: authState.user?.email || '',
    phone: authState.user?.phone || '',
    interfaceLanguage: (authState.user?.preferredLanguage as ProfileSettingsLanguage) || language,
    baseCurrency: authState.user?.preferredCurrency || '',
  })
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Load fresh profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get('/auth/profile')
        const u = res.data.user
        setProfile({
          fullName: u.fullName || '',
          email: u.email || '',
          phone: u.phone || '',
          interfaceLanguage: (u.preferredLanguage as ProfileSettingsLanguage) || 'en',
          baseCurrency: u.preferredCurrency || '',
          avatarUrl: u.avatarUrl || undefined,
        })
      } catch (err) {
        console.error('Failed to load profile:', err)
        setLoadError('Could not load profile data.')
      }
    }
    loadProfile()
  }, [])

  const handleSaveProfile = async () => {
    setIsSavingProfile(true)
    setSaveSuccess(false)
    try {
      await api.put('/auth/profile', {
        fullName: profile.fullName,
        phone: profile.phone,
        preferredLanguage: profile.interfaceLanguage,
        preferredCurrency: profile.baseCurrency,
      })
      setSaveSuccess(true)
      if (profile.interfaceLanguage && profile.interfaceLanguage !== language) {
        dispatch(setLanguage(profile.interfaceLanguage))
      }
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Failed to save profile. Please try again.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  // Convert image file to Base64 and save it to the backend
  const handleAvatarChange = async (file: File) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = e.target?.result as string
      // Show preview immediately
      setProfile(prev => ({ ...prev, avatarUrl: base64 }))
      try {
        await api.patch('/users/me', { avatarUrl: base64 })
      } catch (err: any) {
        alert(err?.response?.data?.error?.message || 'Failed to upload image. Please try again.')
      }
    }
    reader.readAsDataURL(file)
  }

  // Delete account and redirect to login
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      language === 'ar'
        ? 'هل أنت متأكد أنك تريد حذف حسابك؟ لا يمكن التراجع عن هذا الإجراء.'
        : 'Are you sure you want to delete your account? This action cannot be undone.'
    )
    if (!confirmed) return
    try {
      await api.delete('/users/me')
      dispatch(clearSession())
      navigate('/login')
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Failed to delete account. Please try again.')
    }
  }

  const settingsNavItems = [
    { id: 'profile', label: 'Profile', icon: 'profile' as const, href: '#profile', isActive: true },
    { id: 'security', label: 'Security', icon: 'security' as const, href: '#security' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications' as const, href: '#notifications' },
    { id: 'preferences', label: 'Preferences', icon: 'preferences' as const, href: '#preferences' },
    { id: 'danger', label: 'Danger Zone', icon: 'danger' as const, href: '#danger-zone' },
  ]

  return (
    <>
      {saveSuccess && (
        <div className="fixed top-4 right-4 z-50 rounded-xl bg-[#005c55] px-5 py-3 text-sm font-semibold text-white shadow-lg animate-in slide-in-from-top-2">
          {language === 'ar' ? '✓ تم حفظ الملف الشخصي بنجاح' : '✓ Profile saved successfully'}
        </div>
      )}
      {loadError && (
        <div className="fixed top-4 right-4 z-50 rounded-xl bg-[#ba1a1a] px-5 py-3 text-sm font-semibold text-white shadow-lg">
          {loadError}
        </div>
      )}
      <ProfileSettingsPage
        language={language}
        data={{ ...DEFAULT_DATA, settingsNavItems, profile, currencyOptions: CURRENCY_OPTIONS }}
        isSavingProfile={isSavingProfile}
        onProfileChange={(newProfile) => {
          setProfile(newProfile)
          if (newProfile.interfaceLanguage && newProfile.interfaceLanguage !== language) {
            dispatch(setLanguage(newProfile.interfaceLanguage as 'en' | 'ar'))
          }
        }}
        onSaveProfile={handleSaveProfile}
        onAvatarChange={handleAvatarChange}
        onDeleteAccount={handleDeleteAccount}
        onLogin={() => navigate('/login')}
      />
    </>
  )
}

export default ProfileSettingsPageContainer

