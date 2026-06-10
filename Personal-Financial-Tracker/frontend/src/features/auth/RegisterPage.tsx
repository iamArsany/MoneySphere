import { useSelector, useDispatch } from 'react-redux'
import { selectLanguage, setLanguage } from '../../store'
import { useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, LockKeyhole, Mail, Phone, User, AlertTriangle, type LucideIcon } from 'lucide-react'
import { api } from '../../services/api'

export type RegisterLanguage = 'en' | 'ar'
export type RegisterPasswordStrengthLevel = 0 | 1 | 2 | 3 | 4

export interface RegisterFormValues {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

export interface RegisterTextContent {
  appName: string
  pageTitle: string
  pageSubtitle: string
  fullNameLabel: string
  fullNamePlaceholder: string
  emailLabel: string
  emailPlaceholder: string
  passwordLabel: string
  passwordPlaceholder: string
  confirmPasswordLabel: string
  confirmPasswordPlaceholder: string
  passwordVisibilityLabel: string
  passwordHiddenLabel: string
  createAccount: string
  creatingAccount: string
  registerWithPhone: string
  loginPrompt: string
  login: string
  mobilePreviewLabel: string
  strengthLabels: [string, string, string, string]
}

export interface RegisterPasswordStrength {
  level: RegisterPasswordStrengthLevel
  label: string
}

export interface RegisterPageProps {
  values: RegisterFormValues
  language?: RegisterLanguage
  languageToggleLabel?: string
  text?: Partial<RegisterTextContent>
  passwordStrength?: RegisterPasswordStrength
  isSubmitting?: boolean
  isDisabled?: boolean
  showDevicePreview?: boolean
  errorState?: { title: string; message: string }
  onValuesChange: (values: RegisterFormValues) => void
  onSubmit: (values: RegisterFormValues) => void
  onLanguageToggle?: () => void
  onRegisterWithPhone?: () => void
  onLogin?: () => void
}

interface RegisterCardProps {
  values: RegisterFormValues
  text: RegisterTextContent
  passwordStrength: RegisterPasswordStrength
  isSubmitting: boolean
  isDisabled: boolean
  languageToggleLabel?: string
  errorState?: { title: string; message: string }
  onValuesChange: (values: RegisterFormValues) => void
  onSubmit: (values: RegisterFormValues) => void
  onLanguageToggle?: () => void
  onRegisterWithPhone?: () => void
  onLogin?: () => void
}

interface RegisterFieldProps {
  id: string
  label: string
  value: string
  type: 'email' | 'password' | 'text'
  placeholder: string
  icon: LucideIcon
  disabled: boolean
  trailingControl?: ReactNode
  onChange: (value: string) => void
}

interface PasswordFieldProps {
  id: string
  label: string
  value: string
  placeholder: string
  showLabel: string
  hideLabel: string
  disabled: boolean
  onChange: (value: string) => void
}

interface PasswordStrengthProps {
  strength: RegisterPasswordStrength
}

interface DevicePreviewProps {
  values: RegisterFormValues
  text: RegisterTextContent
  passwordStrength: RegisterPasswordStrength
  isDisabled: boolean
  languageToggleLabel?: string
}

interface MobilePreviewFieldProps {
  value: string
  placeholder: string
  icon: LucideIcon
  isSecret?: boolean
}

const EN_TEXT: RegisterTextContent = {
  appName: 'PFT',
  pageTitle: 'Create Account',
  pageSubtitle: 'Join PFT to start tracking your finances.',
  fullNameLabel: 'Full Name',
  fullNamePlaceholder: 'Full name',
  emailLabel: 'Email Address',
  emailPlaceholder: 'name@example.com',
  passwordLabel: 'Password',
  passwordPlaceholder: 'Password',
  confirmPasswordLabel: 'Confirm Password',
  confirmPasswordPlaceholder: 'Confirm password',
  passwordVisibilityLabel: 'Show password',
  passwordHiddenLabel: 'Hide password',
  createAccount: 'Create Account',
  creatingAccount: 'Creating account...',
  registerWithPhone: 'Register with Phone',
  loginPrompt: 'Already have an account?',
  login: 'Login',
  mobilePreviewLabel: 'Mobile Preview',
  strengthLabels: ['Weak', 'Fair', 'Good', 'Strong'],
}

const AR_TEXT: RegisterTextContent = {
  appName: 'PFT',
  pageTitle: '\u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628',
  pageSubtitle:
    '\u0627\u0646\u0636\u0645 \u0625\u0644\u0649 PFT \u0644\u0628\u062f\u0621 \u062a\u062a\u0628\u0639 \u0623\u0645\u0648\u0627\u0644\u0643.',
  fullNameLabel:
    '\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644',
  fullNamePlaceholder: '\u0627\u0644\u0627\u0633\u0645',
  emailLabel:
    '\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a',
  emailPlaceholder: 'name@example.com',
  passwordLabel:
    '\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631',
  passwordPlaceholder:
    '\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631',
  confirmPasswordLabel:
    '\u062a\u0623\u0643\u064a\u062f \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631',
  confirmPasswordPlaceholder:
    '\u062a\u0623\u0643\u064a\u062f \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631',
  passwordVisibilityLabel:
    '\u0625\u0638\u0647\u0627\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631',
  passwordHiddenLabel:
    '\u0625\u062e\u0641\u0627\u0621 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631',
  createAccount: '\u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628',
  creatingAccount:
    '\u062c\u0627\u0631 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062d\u0633\u0627\u0628...',
  registerWithPhone:
    '\u0627\u0644\u062a\u0633\u062c\u064a\u0644 \u0628\u0627\u0644\u0647\u0627\u062a\u0641',
  loginPrompt:
    '\u0644\u062f\u064a\u0643 \u062d\u0633\u0627\u0628 \u0628\u0627\u0644\u0641\u0639\u0644\u061f',
  login:
    '\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644',
  mobilePreviewLabel:
    '\u0645\u0639\u0627\u064a\u0646\u0629 \u0627\u0644\u0647\u0627\u062a\u0641',
  strengthLabels: ['ضعيف', 'مقبول', 'جيد', 'قوي'],
}

const DEFAULT_PASSWORD_STRENGTH: RegisterPasswordStrength = {
  level: 0,
  label: '',
}

export function useRegisterPageText(language: RegisterLanguage = 'en'): RegisterTextContent {
  return language === 'ar' ? AR_TEXT : EN_TEXT
}

export function RegisterPage({
  values,
  language = 'en',
  languageToggleLabel,
  text,
  passwordStrength = DEFAULT_PASSWORD_STRENGTH,
  isSubmitting = false,
  isDisabled = false,
  showDevicePreview = true,
  errorState,
  onValuesChange,
  onSubmit,
  onLanguageToggle,
  onRegisterWithPhone,
  onLogin,
}: RegisterPageProps) {
  const pageText = { ...useRegisterPageText(language), ...text }
  const controlsDisabled = isDisabled || isSubmitting

  return (
    <section
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="flex min-h-screen items-center justify-center bg-[#f8f9ff] px-4 py-6 font-sans text-[#0b1c30] sm:px-6 lg:px-8"
    >
      <main className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-center gap-8 lg:flex-row">
        <RegisterCard
          values={values}
          text={pageText}
          passwordStrength={passwordStrength}
          isSubmitting={isSubmitting}
          isDisabled={controlsDisabled}
          languageToggleLabel={languageToggleLabel}
          errorState={errorState}
          onValuesChange={onValuesChange}
          onSubmit={onSubmit}
          onLanguageToggle={onLanguageToggle}
          onRegisterWithPhone={onRegisterWithPhone}
          onLogin={onLogin}
        />

      </main>
    </section>
  )
}

function RegisterCard({
  values,
  text,
  passwordStrength,
  isSubmitting,
  isDisabled,
  languageToggleLabel,
  errorState,
  onValuesChange,
  onSubmit,
  onLanguageToggle,
  onRegisterWithPhone,
  onLogin,
}: RegisterCardProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!isDisabled) {
      onSubmit(values)
    }
  }

  return (
    <section className="w-full max-w-[480px] rounded-xl bg-white p-6 shadow-lg ring-1 ring-[#bdc9c6]/40 sm:p-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="text-2xl font-bold text-[#005c55]">{text.appName}</div>
        {languageToggleLabel ? (
          <button
            type="button"
            onClick={onLanguageToggle}
            className="rounded-full bg-[#e5eeff] px-3 py-1 text-xs font-semibold text-[#3e4947] transition hover:text-[#005c55] focus:outline-none focus:ring-2 focus:ring-[#005c55]"
          >
            {languageToggleLabel}
          </button>
        ) : null}
      </div>

      <header className="mb-8 text-center">
        <h1 className="text-3xl font-semibold text-[#005c55] sm:text-4xl">{text.pageTitle}</h1>
        <p className="mt-3 text-base text-[#3e4947]">{text.pageSubtitle}</p>
      </header>

      {errorState ? (
        <div
          className="mb-4 flex items-start gap-3 rounded-lg border border-[#ffb4ab] bg-[#ffdad6] p-4 text-[#93000a]"
          role="alert"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#ba1a1a]" aria-hidden="true" />
          <div className="text-sm">
            <p className="font-bold">{errorState.title}</p>
            <p>{errorState.message}</p>
          </div>
        </div>
      ) : null}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <RegisterField
          id="register-full-name"
          label={text.fullNameLabel}
          value={values.fullName}
          type="text"
          placeholder={text.fullNamePlaceholder}
          icon={User}
          disabled={isDisabled}
          onChange={(fullName) => onValuesChange({ ...values, fullName })}
        />

        <RegisterField
          id="register-email"
          label={text.emailLabel}
          value={values.email}
          type="email"
          placeholder={text.emailPlaceholder}
          icon={Mail}
          disabled={isDisabled}
          onChange={(email) => onValuesChange({ ...values, email })}
        />

        <PasswordField
          id="register-password"
          label={text.passwordLabel}
          value={values.password}
          placeholder={text.passwordPlaceholder}
          showLabel={text.passwordVisibilityLabel}
          hideLabel={text.passwordHiddenLabel}
          disabled={isDisabled}
          onChange={(password) => onValuesChange({ ...values, password })}
        />

        <PasswordStrength strength={passwordStrength} />

        <RegisterField
          id="register-confirm-password"
          label={text.confirmPasswordLabel}
          value={values.confirmPassword}
          type="password"
          placeholder={text.confirmPasswordPlaceholder}
          icon={LockKeyhole}
          disabled={isDisabled}
          onChange={(confirmPassword) => onValuesChange({ ...values, confirmPassword })}
        />

        <div className="mt-2 flex flex-col gap-3">
          <button
            type="submit"
            disabled={isDisabled}
            className="w-full rounded-lg bg-[#005c55] px-6 py-3 text-xl font-semibold text-white shadow-sm transition hover:bg-[#00504a] focus:outline-none focus:ring-2 focus:ring-[#005c55] focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#d3e4fe] disabled:text-[#3e4947]"
          >
            {isSubmitting ? text.creatingAccount : text.createAccount}
          </button>

          <button
            type="button"
            disabled={isDisabled}
            onClick={onRegisterWithPhone}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#855300] px-6 py-3 text-xl font-semibold text-white shadow-sm transition hover:bg-[#653e00] focus:outline-none focus:ring-2 focus:ring-[#855300] focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#d3e4fe] disabled:text-[#3e4947]"
          >
            <Phone className="h-5 w-5" aria-hidden="true" />
            {text.registerWithPhone}
          </button>
        </div>
      </form>

      <div className="mt-8 border-t border-[#bdc9c6] pt-4 text-center text-sm text-[#3e4947]">
        {text.loginPrompt}{' '}
        <button
          type="button"
          onClick={onLogin}
          className="font-bold text-[#005c55] transition hover:underline focus:outline-none focus:ring-2 focus:ring-[#005c55]"
        >
          {text.login}
        </button>
      </div>
    </section>
  )
}

function PasswordField({
  id,
  label,
  value,
  placeholder,
  showLabel,
  hideLabel,
  disabled,
  onChange,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false)
  const Icon = isVisible ? EyeOff : Eye

  return (
    <RegisterField
      id={id}
      label={label}
      value={value}
      type={isVisible ? 'text' : 'password'}
      placeholder={placeholder}
      icon={Lock}
      disabled={disabled}
      onChange={onChange}
      trailingControl={
        <button
          type="button"
          disabled={disabled}
          aria-label={isVisible ? hideLabel : showLabel}
          onClick={() => setIsVisible(!isVisible)}
          className="absolute end-3 top-1/2 -translate-y-1/2 rounded p-1 text-[#6e7977] transition hover:text-[#005c55] focus:outline-none focus:ring-2 focus:ring-[#005c55] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </button>
      }
    />
  )
}

function RegisterField({
  id,
  label,
  value,
  type,
  placeholder,
  icon: Icon,
  disabled,
  trailingControl,
  onChange,
}: RegisterFieldProps) {
  return (
    <label className="flex flex-col gap-2" htmlFor={id}>
      <span className="text-xs font-semibold uppercase text-[#0b1c30]">{label}</span>
      <span className="relative">
        <Icon
          className="pointer-events-none absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6e7977]"
          aria-hidden="true"
        />
        <input
          id={id}
          type={type}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full rounded-lg border border-[#bdc9c6] bg-white py-3 ps-11 text-base text-[#0b1c30] outline-none transition placeholder:text-[#6e7977] focus:border-[#005c55] focus:ring-1 focus:ring-[#005c55] disabled:cursor-not-allowed disabled:opacity-60 ${
            trailingControl ? 'pe-12' : 'pe-4'
          }`}
        />
        {trailingControl}
      </span>
    </label>
  )
}

function PasswordStrength({ strength }: PasswordStrengthProps) {
  return (
    <div className="flex flex-col gap-2" aria-live="polite">
      <div className="flex gap-2" aria-hidden="true">
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className={`h-1 flex-1 rounded-full ${
              step <= strength.level ? 'bg-[#005c55]' : 'bg-[#dce9ff]'
            }`}
          />
        ))}
      </div>
      {strength.label ? (
        <p className="text-xs font-semibold uppercase text-[#3e4947]">{strength.label}</p>
      ) : null}
    </div>
  )
}

function DevicePreview({
  values,
  text,
  passwordStrength,
  isDisabled,
  languageToggleLabel,
}: DevicePreviewProps) {
  return (
    <aside className="hidden shrink-0 flex-col gap-3 lg:flex">
      <div className="text-center text-xs font-semibold uppercase text-[#3e4947]">
        {text.mobilePreviewLabel}
      </div>
      <div className="flex h-[812px] w-[375px] flex-col overflow-hidden rounded-[32px] border-[8px] border-[#d3e4fe] bg-[#f8f9ff] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-4 py-4 shadow-sm">
          <div className="text-xl font-bold text-[#005c55]">{text.appName}</div>
          {languageToggleLabel ? (
            <span className="rounded-full bg-[#e5eeff] px-3 py-1 text-xs font-semibold text-[#3e4947]">
              {languageToggleLabel}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          <header className="mt-2 text-center">
            <h2 className="text-2xl font-semibold text-[#005c55]">{text.pageTitle}</h2>
          </header>

          <MobilePreviewField
            value={values.fullName}
            placeholder={text.fullNameLabel}
            icon={User}
          />
          <MobilePreviewField value={values.email} placeholder={text.emailLabel} icon={Mail} />
          <MobilePreviewField
            value={values.password}
            placeholder={text.passwordLabel}
            icon={Lock}
            isSecret
          />
          <PasswordStrength strength={passwordStrength} />

          <button
            type="button"
            disabled={isDisabled}
            className="mt-2 rounded-lg bg-[#005c55] px-6 py-3 text-xl font-semibold text-white disabled:bg-[#d3e4fe] disabled:text-[#3e4947]"
          >
            {text.createAccount}
          </button>
        </div>
      </div>
    </aside>
  )
}

function MobilePreviewField({
  value,
  placeholder,
  icon: Icon,
  isSecret = false,
}: MobilePreviewFieldProps) {
  const displayValue = isSecret && value ? '********' : value

  return (
    <div className="relative">
      <Icon
        className="pointer-events-none absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6e7977]"
        aria-hidden="true"
      />
      <input
        value={displayValue}
        placeholder={placeholder}
        readOnly
        className="w-full rounded-lg border border-[#bdc9c6] bg-white py-2 pe-3 ps-10 text-sm text-[#0b1c30] placeholder:text-[#6e7977]"
      />
    </div>
  )
}

function calculatePasswordStrength(password: string, labels: [string, string, string, string]): RegisterPasswordStrength {
  if (!password) return { level: 0, label: '' }
  
  let strength = 0
  if (password.length >= 8) strength += 1
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength += 1
  if (/\d/.test(password)) strength += 1
  if (/[^A-Za-z0-9]/.test(password)) strength += 1

  return {
    level: Math.min(strength, 4) as RegisterPasswordStrengthLevel,
    label: strength > 0 ? labels[strength - 1] : ''
  }
}

function RegisterPageContainer() {
  const language = useSelector(selectLanguage)
  const pageText = useRegisterPageText(language)
  const navigate = useNavigate()
  const [values, setValues] = useState<RegisterFormValues>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorState, setErrorState] = useState<{ title: string; message: string } | undefined>(undefined)
  const dispatch = useDispatch()

  const handleSubmit = async (vals: RegisterFormValues) => {
    if (vals.password !== vals.confirmPassword) {
      setErrorState({
        title: language === 'ar' ? 'خطأ في التحقق' : 'Validation Error',
        message: language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match.',
      })
      return
    }

    setIsSubmitting(true)
    setErrorState(undefined)
    try {
      await api.post('/auth/register', {
        fullName: vals.fullName,
        email: vals.email,
        password: vals.password,
        preferredLanguage: language,
        preferredCurrency: 'USD',
      })
      navigate('/login', { state: { email: vals.email, registered: true } })
    } catch (err: any) {
      console.error(err)
      const errorMsg = err.response?.data?.error?.message || err.message || 'Registration failed'
      setErrorState({
        title: language === 'ar' ? 'فشل التسجيل' : 'Registration Failed',
        message: errorMsg,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <RegisterPage
      values={values}
      language={language}
      languageToggleLabel={language === 'en' ? 'العربية' : 'EN'}
      passwordStrength={calculatePasswordStrength(values.password, pageText.strengthLabels)}
      showDevicePreview={false}
      isSubmitting={isSubmitting}
      errorState={errorState}
      onValuesChange={setValues}
      onSubmit={handleSubmit}
      onLanguageToggle={() => dispatch(setLanguage(language === 'en' ? 'ar' : 'en'))}
      onRegisterWithPhone={() => navigate('/register/phone-otp')}
      onLogin={() => navigate('/login')}
    />
  )
}

export default RegisterPageContainer
