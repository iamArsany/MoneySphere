import { useSelector, useDispatch } from 'react-redux'
import { selectLanguage, setLanguage, setSession } from '../../store'
import { useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import {
  AlertTriangle,
  Lock,
  LogIn,
  Mail,
  Wifi,
  BatteryFull,
  Signal,
} from 'lucide-react'

export type LoginLanguage = 'en' | 'ar'

export interface LoginFormValues {
  email: string
  password: string
  rememberMe: boolean
}

export interface LoginErrorState {
  title: string
  message: string
  detail?: string
  detailDirection?: 'ltr' | 'rtl'
}

export interface LoginBranding {
  appName: string
  appSubtitle: string
  headline: string
  description: string
  imageUrl?: string
  imageAlt?: string
}

export interface LoginPageProps {
  values: LoginFormValues
  language?: LoginLanguage
  languageToggleLabel?: string
  branding?: LoginBranding
  errorState?: LoginErrorState
  isSubmitting?: boolean
  isDisabled?: boolean
  onValuesChange: (values: LoginFormValues) => void
  onSubmit: (values: LoginFormValues) => void
  onLanguageToggle?: () => void
  onForgotPassword?: () => void
  onRegister?: () => void
}

interface BrandPanelProps {
  branding: LoginBranding
}

interface LoginFormPanelProps {
  values: LoginFormValues
  languageToggleLabel?: string
  errorState?: LoginErrorState
  isSubmitting: boolean
  isDisabled: boolean
  onValuesChange: (values: LoginFormValues) => void
  onSubmit: (values: LoginFormValues) => void
  onLanguageToggle?: () => void
  onForgotPassword?: () => void
  onRegister?: () => void
}

interface LoginFieldProps {
  id: string
  label: string
  value: string
  type: 'email' | 'password'
  placeholder: string
  icon: typeof Mail
  disabled: boolean
  onChange: (value: string) => void
}

interface ErrorBannerProps {
  errorState: LoginErrorState
}

interface MobilePreviewProps {
  values: LoginFormValues
  languageToggleLabel?: string
  errorState?: LoginErrorState
  isDisabled: boolean
}

interface CheckboxLabelProps {
  checked: boolean
  disabled: boolean
  onChange: (checked: boolean) => void
}

interface ActionButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
}

const EN_TEXT = {
  appName: 'PFT',
  appSubtitle: 'Personal Finance Tracker',
  headline: 'Manage your wealth securely.',
  description:
    'Access your portfolio, track transactions, and generate institutional-grade reports with our bilingual platform.',
  welcomeTitle: 'Welcome back',
  welcomeMobileTitle: 'Welcome',
  welcomeSubtitle: 'Please enter your details to sign in.',
  welcomeMobileSubtitle: 'Sign in to continue.',
  emailLabel: 'Email Address',
  passwordLabel: 'Password',
  emailPlaceholder: 'name@company.com',
  passwordPlaceholder: 'Password',
  rememberMe: 'Remember me',
  forgotPassword: 'Forgot Password?',
  login: 'Login',
  loggingIn: 'Signing in...',
  registerPrompt: "Don't have an account?",
  mobileRegisterPrompt: 'New user?',
  register: 'Register',
  mobilePreviewLabel: 'Mobile Preview (375px)',
  statusTime: '9:41',
}

const AR_TEXT = {
  appName: 'PFT',
  appSubtitle: 'متتبع الشؤون المالية الشخصية',
  headline: 'إدارة ثروتك بأمان.',
  description: 'الوصول إلى محفظتك، وتتبع المعاملات، وإنشاء تقارير على مستوى مؤسسي من خلال منصتنا ثنائية اللغة.',
  welcomeTitle: 'مرحباً بعودتك',
  welcomeMobileTitle: 'مرحباً',
  welcomeSubtitle: 'يرجى إدخال التفاصيل الخاصة بك لتسجيل الدخول.',
  welcomeMobileSubtitle: 'قم بتسجيل الدخول للمتابعة.',
  emailLabel: 'عنوان البريد الإلكتروني',
  passwordLabel: 'كلمة المرور',
  emailPlaceholder: 'name@company.com',
  passwordPlaceholder: 'كلمة المرور',
  rememberMe: 'تذكرني',
  forgotPassword: 'هل نسيت كلمة المرور؟',
  login: 'تسجيل الدخول',
  loggingIn: 'جارٍ تسجيل الدخول...',
  registerPrompt: 'ليس لديك حساب؟',
  mobileRegisterPrompt: 'مستخدم جديد؟',
  register: 'سجل الآن',
  mobilePreviewLabel: 'معاينة الجوال (375 بكسل)',
  statusTime: '9:41',
};

export function useLoginPageText() {

  const language = useSelector(selectLanguage);
  return language === 'ar' ? AR_TEXT : EN_TEXT;
}

export function LoginPage({
  values,
  language = 'en',
  languageToggleLabel,
  branding,
  errorState,
  isSubmitting = false,
  isDisabled = false,
  onValuesChange,
  onSubmit,
  onLanguageToggle,
  onForgotPassword,
  onRegister,
}: LoginPageProps) {
    const TEXT_VAR = useLoginPageText();
  const isRtl = language === 'ar'
  const pageBranding = branding ?? {
              appName: TEXT_VAR.appName,
              appSubtitle: TEXT_VAR.appSubtitle,
              headline: TEXT_VAR.headline,
              description: TEXT_VAR.description,
            }

  return (
    <section
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#f8f9ff] bg-[radial-gradient(#d3e4fe_1px,transparent_1px)] [background-size:24px_24px] font-sans text-[#0b1c30]"
    >
      <div className="mx-auto flex min-h-screen w-full items-center justify-center p-4 lg:p-8">
        <main className="flex min-h-[720px] w-full max-w-[1100px] overflow-hidden rounded-xl border border-[#bdc9c6] bg-white shadow-2xl">
          <div className="flex w-full">
            <BrandPanel branding={pageBranding} />
            <LoginFormPanel
              values={values}
              languageToggleLabel={languageToggleLabel}
              errorState={errorState}
              isSubmitting={isSubmitting}
              isDisabled={isDisabled}
              onValuesChange={onValuesChange}
              onSubmit={onSubmit}
              onLanguageToggle={onLanguageToggle}
              onForgotPassword={onForgotPassword}
              onRegister={onRegister}
            />
          </div>
        </main>
      </div>
    </section>
  )
}

function BrandPanel({ branding }: BrandPanelProps) {
  return (
    <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#005c55] p-8 text-white lg:flex">
      {branding.imageUrl ? (
        <img
          src={branding.imageUrl}
          alt={branding.imageAlt ?? ''}
          className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-multiply"
        />
      ) : (
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#005c55_0%,#0f766e_55%,#213145_100%)]" />
      )}
      <div className="relative z-10 text-2xl font-bold">
        {branding.appName}
        <span className="mt-1 block text-base font-normal opacity-80">{branding.appSubtitle}</span>
      </div>
      <div className="relative z-10 max-w-md">
        <h1 className="mb-4 text-5xl font-bold leading-tight">{branding.headline}</h1>
        <p className="text-base leading-6 opacity-90">{branding.description}</p>
      </div>
    </aside>
  )
}

function LoginFormPanel({
  values,
  languageToggleLabel,
  errorState,
  isSubmitting,
  isDisabled,
  onValuesChange,
  onSubmit,
  onLanguageToggle,
  onForgotPassword,
  onRegister,
}: LoginFormPanelProps) {
    const TEXT_VAR = useLoginPageText();
  const controlsDisabled = isDisabled || isSubmitting

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!controlsDisabled) {
      onSubmit(values)
    }
  }

  return (
    <section className="flex w-full items-center justify-center bg-white p-4 sm:p-8 lg:w-1/2">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="text-center text-2xl font-bold text-[#005c55] lg:hidden">{TEXT_VAR.appName}</div>

        {languageToggleLabel ? (
          <div className="flex justify-end">
            <ActionButton onClick={onLanguageToggle}>{languageToggleLabel}</ActionButton>
          </div>
        ) : null}

        <header className="text-center sm:text-start">
          <h2 className="text-4xl font-bold text-[#0b1c30] sm:text-5xl">{TEXT_VAR.welcomeTitle}</h2>
          <p className="mt-2 text-base text-[#3e4947]">{TEXT_VAR.welcomeSubtitle}</p>
        </header>

        {errorState ? <ErrorBanner errorState={errorState} /> : null}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <LoginField
            id="login-email"
            label={TEXT_VAR.emailLabel}
            value={values.email}
            type="email"
            placeholder={TEXT_VAR.emailPlaceholder}
            icon={Mail}
            disabled={controlsDisabled}
            onChange={(email) => onValuesChange({ ...values, email })}
          />

          <LoginField
            id="login-password"
            label={TEXT_VAR.passwordLabel}
            value={values.password}
            type="password"
            placeholder={TEXT_VAR.passwordPlaceholder}
            icon={Lock}
            disabled={controlsDisabled}
            onChange={(password) => onValuesChange({ ...values, password })}
          />

          <div className="mt-1 flex items-center justify-between gap-3">
            <CheckboxLabel
              checked={values.rememberMe}
              disabled={controlsDisabled}
              onChange={(rememberMe) => onValuesChange({ ...values, rememberMe })}
            />
            <ActionButton onClick={onForgotPassword} disabled={controlsDisabled}>
              {TEXT_VAR.forgotPassword}
            </ActionButton>
          </div>

          <button
            type="submit"
            disabled={controlsDisabled}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#005c55] px-6 py-3 text-xl font-semibold text-white shadow-sm transition hover:bg-[#0f766e] focus:outline-none focus:ring-2 focus:ring-[#005c55] focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#d3e4fe] disabled:text-[#3e4947]"
          >
            {isSubmitting ? TEXT_VAR.loggingIn : TEXT_VAR.login}
            <LogIn className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="mt-2 text-center text-sm text-[#3e4947]">
            {TEXT_VAR.registerPrompt}{' '}
            <button
              type="button"
              onClick={onRegister}
              className="font-bold text-[#005c55] hover:underline"
            >
              {TEXT_VAR.register}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

function LoginField({
  id,
  label,
  value,
  type,
  placeholder,
  icon: Icon,
  disabled,
  onChange,
}: LoginFieldProps) {
  return (
    <label className="flex flex-col gap-2" htmlFor={id}>
      <span className="text-xs font-semibold uppercase text-[#0b1c30]">{label}</span>
      <span className="relative">
        <Icon
          className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#3e4947]"
          aria-hidden="true"
        />
        <input
          id={id}
          value={value}
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-lg border border-[#bdc9c6] bg-[#eff4ff] py-3 pe-4 ps-11 text-base text-[#0b1c30] outline-none transition placeholder:text-[#6e7977] focus:border-[#005c55] focus:ring-1 focus:ring-[#005c55] disabled:cursor-not-allowed disabled:opacity-60"
        />
      </span>
    </label>
  )
}

function ErrorBanner({ errorState }: ErrorBannerProps) {
  return (
    <div
      className="flex items-start gap-3 rounded-lg border border-[#ffb4ab] bg-[#ffdad6] p-4 text-[#93000a]"
      role="alert"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#ba1a1a]" aria-hidden="true" />
      <div className="text-sm">
        <p className="font-bold">{errorState.title}</p>
        <p>{errorState.message}</p>
        {errorState.detail ? (
          <p className="mt-1 text-xs opacity-80" dir={errorState.detailDirection ?? 'ltr'}>
            {errorState.detail}
          </p>
        ) : null}
      </div>
    </div>
  )
}

function CheckboxLabel({ checked, disabled, onChange }: CheckboxLabelProps) {
  const TEXT_VAR = useLoginPageText();

  return (
    <label className={`flex items-center gap-2 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-[#bdc9c6] text-[#005c55] focus:ring-[#005c55] disabled:cursor-not-allowed"
      />
      <span className="text-sm text-[#3e4947]">{TEXT_VAR.rememberMe}</span>
    </label>
  )
}

function ActionButton({ children, onClick, disabled = false }: ActionButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded px-2 py-1 text-xs font-semibold uppercase text-[#005c55] transition hover:text-[#0f766e] focus:outline-none focus:ring-2 focus:ring-[#005c55] disabled:pointer-events-none disabled:opacity-60"
    >
      {children}
    </button>
  )
}

function MobilePreview({
  values,
  languageToggleLabel,
  errorState,
  isDisabled,
}: MobilePreviewProps) {
    const TEXT_VAR = useLoginPageText();
  return (
    <aside className="hidden flex-col items-center gap-4 xl:flex">
      <div className="text-xs font-semibold uppercase tracking-widest text-[#3e4947]">
        {TEXT_VAR.mobilePreviewLabel}
      </div>
      <div className="relative flex h-[812px] w-[375px] flex-col overflow-hidden rounded-[40px] border-[8px] border-[#213145] bg-[#f8f9ff] shadow-2xl">
        <div className="z-10 flex h-6 items-center justify-between bg-[#f8f9ff] px-4 text-[10px] font-medium text-[#0b1c30]">
          <span>{TEXT_VAR.statusTime}</span>
          <div className="flex items-center gap-1">
            <Signal className="h-3 w-3" aria-hidden="true" />
            <Wifi className="h-3 w-3" aria-hidden="true" />
            <BatteryFull className="h-3 w-3" aria-hidden="true" />
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
          <div className="mb-8 flex items-center justify-between">
            <div className="text-2xl font-bold text-[#005c55]">{TEXT_VAR.appName}</div>
            {languageToggleLabel ? (
              <span className="text-xs font-semibold uppercase text-[#005c55]">
                {languageToggleLabel}
              </span>
            ) : null}
          </div>

          <header className="mb-6">
            <h2 className="text-4xl font-bold text-[#0b1c30]">{TEXT_VAR.welcomeMobileTitle}</h2>
            <p className="mt-1 text-base text-[#3e4947]">{TEXT_VAR.welcomeMobileSubtitle}</p>
          </header>

          {errorState ? (
            <div className="mb-6 flex items-start gap-2 rounded-lg border border-[#ffb4ab] bg-[#ffdad6] p-3 text-sm text-[#93000a]">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#ba1a1a]" aria-hidden="true" />
              <span>{errorState.title}</span>
            </div>
          ) : null}

          <div className="flex flex-col gap-4">
            <MobileInput label={TEXT_VAR.emailLabel} value={values.email} disabled={isDisabled} />
            <MobileInput label={TEXT_VAR.passwordLabel} value={values.password} disabled={isDisabled} />
            <div className="flex justify-start">
              <span className="text-xs font-semibold uppercase text-[#005c55]">
                {TEXT_VAR.forgotPassword}
              </span>
            </div>
            <button
              type="button"
              disabled={isDisabled}
              className="rounded-lg bg-[#005c55] px-6 py-3 text-xl font-semibold text-white disabled:bg-[#d3e4fe] disabled:text-[#3e4947]"
            >
              {TEXT_VAR.login}
            </button>
            <div className="text-center text-sm text-[#3e4947]">
              {TEXT_VAR.mobileRegisterPrompt}{' '}
              <span className="font-bold text-[#005c55]">{TEXT_VAR.register}</span>
            </div>
          </div>
        </div>

        <div className="flex h-4 justify-center bg-[#f8f9ff] pt-1">
          <div className="h-1 w-1/3 rounded-full bg-[#0b1c30]/20" />
        </div>
      </div>
    </aside>
  )
}

function MobileInput({
  label,
  value,
  disabled,
}: {
  label: string
  value: string
  disabled: boolean
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase text-[#0b1c30]">{label}</span>
      <input
        value={value}
        disabled={disabled}
        readOnly
        className="w-full rounded-lg border border-[#bdc9c6] bg-[#eff4ff] px-4 py-3 text-base text-[#0b1c30] disabled:opacity-60"
      />
    </label>
  )
}

function LoginPageContainer() {
  const language = useSelector(selectLanguage)
  const navigate = useNavigate()
  const [values, setValues] = useState<LoginFormValues>({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorState, setErrorState] = useState<LoginErrorState | undefined>(undefined)
  const dispatch = useDispatch()

  const handleSubmit = async (vals: LoginFormValues) => {
    setIsSubmitting(true)
    setErrorState(undefined)
    try {
      const response = await api.post('/auth/login', {
        email: vals.email,
        password: vals.password,
      })
      const { accessToken, refreshToken, user: resUser } = response.data
      const initials = resUser.fullName
        ? resUser.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase()
        : 'U'
      dispatch(
        setSession({
          accessToken,
          refreshToken,
          user: {
            id: resUser.id,
            name: resUser.fullName,
            role: resUser.role?.name || 'user',
            email: resUser.email,
            avatarUrl: resUser.avatarUrl || undefined,
            initials,
          },
        })
      )
      navigate('/dashboard')
    } catch (err: any) {
      console.error(err)
      const errorMsg = err.response?.data?.error?.message || err.message || 'Login failed'
      setErrorState({
        title: language === 'ar' ? 'فشل تسجيل الدخول' : 'Login Failed',
        message: errorMsg,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <LoginPage
      values={values}
      language={language}
      languageToggleLabel={language === 'en' ? 'العربية' : 'EN'}
      isSubmitting={isSubmitting}
      errorState={errorState}
      onValuesChange={setValues}
      onSubmit={handleSubmit}
      onLanguageToggle={() => dispatch(setLanguage(language === 'en' ? 'ar' : 'en'))}
      onForgotPassword={() => navigate('/forgot-password')}
      onRegister={() => navigate('/register')}
    />
  )
}

export default LoginPageContainer
