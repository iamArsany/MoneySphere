import { useSelector, useDispatch } from 'react-redux'
import { selectLanguage, setLanguage } from '../../store'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Mail, MailCheck, Menu, type LucideIcon } from 'lucide-react'

export type ForgotPasswordLanguage = 'en' | 'ar'
export type ForgotPasswordStatus = 'input' | 'success'

export interface ForgotPasswordValues {
  email: string
}

export interface ForgotPasswordTextContent {
  appName: string
  languageToggleLabel: string
  login: string
  pageTitle: string
  pageSubtitle: string
  emailLabel: string
  emailPlaceholder: string
  sendResetLink: string
  sendingResetLink: string
  backToLogin: string
  successTitle: string
  successDescription: string
  successHint: string
  returnToLogin: string
  resendPrompt: string
  resendAction: string
  mobileMenuLabel: string
  mobileSubtitle: string
  mobileSendLink: string
  mobileBack: string
  mobilePreviewLabel: string
}

export interface ForgotPasswordPageProps {
  values: ForgotPasswordValues
  language?: ForgotPasswordLanguage
  status?: ForgotPasswordStatus
  text?: Partial<ForgotPasswordTextContent>
  isSubmitting?: boolean
  isDisabled?: boolean
  showDevicePreview?: boolean
  onValuesChange: (values: ForgotPasswordValues) => void
  onSubmit: (values: ForgotPasswordValues) => void
  onLanguageToggle?: () => void
  onLogin?: () => void
  onResend?: () => void
}

interface HeaderProps {
  text: ForgotPasswordTextContent
  onLanguageToggle?: () => void
  onLogin?: () => void
}

interface RequestResetCardProps {
  values: ForgotPasswordValues
  text: ForgotPasswordTextContent
  isSubmitting: boolean
  isDisabled: boolean
  onValuesChange: (values: ForgotPasswordValues) => void
  onSubmit: (values: ForgotPasswordValues) => void
  onLogin?: () => void
}

interface SuccessCardProps {
  text: ForgotPasswordTextContent
  isDisabled: boolean
  onLogin?: () => void
  onResend?: () => void
}

interface TextFieldProps {
  id: string
  label: string
  value: string
  placeholder: string
  icon: LucideIcon
  disabled: boolean
  onChange: (value: string) => void
}

interface MobilePreviewProps {
  values: ForgotPasswordValues
  text: ForgotPasswordTextContent
  status: ForgotPasswordStatus
  isDisabled: boolean
}

const EN_TEXT: ForgotPasswordTextContent = {
  appName: 'PFT',
  languageToggleLabel: 'EN / \u0627\u0644\u0639\u0631\u0628\u064a\u0629',
  login: 'Login',
  pageTitle: 'Forgot Password',
  pageSubtitle: 'Enter your email address and we will send you a reset link.',
  emailLabel: 'Email Address',
  emailPlaceholder: 'name@company.com',
  sendResetLink: 'Send Reset Link',
  sendingResetLink: 'Sending reset link...',
  backToLogin: 'Back to Login',
  successTitle: 'Check your email',
  successDescription: "We've sent a password reset link to your email address.",
  successHint: 'Follow the link in that message to create a new password.',
  returnToLogin: 'Return to Login',
  resendPrompt: "Didn't receive it?",
  resendAction: 'Click to resend',
  mobileMenuLabel: 'Open menu',
  mobileSubtitle: 'Enter your email to reset.',
  mobileSendLink: 'Send Link',
  mobileBack: 'Back',
  mobilePreviewLabel: 'Mobile Preview (375px)',
}

const AR_TEXT: ForgotPasswordTextContent = {
  appName: 'PFT',
  languageToggleLabel:
    '\u0627\u0644\u0639\u0631\u0628\u064a\u0629 / EN',
  login:
    '\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644',
  pageTitle:
    '\u0646\u0633\u064a\u062a \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631',
  pageSubtitle:
    '\u0623\u062f\u062e\u0644 \u0628\u0631\u064a\u062f\u0643 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0648\u0633\u0646\u0631\u0633\u0644 \u0644\u0643 \u0631\u0627\u0628\u0637 \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0639\u064a\u064a\u0646.',
  emailLabel:
    '\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a',
  emailPlaceholder: 'name@company.com',
  sendResetLink:
    '\u0625\u0631\u0633\u0627\u0644 \u0631\u0627\u0628\u0637 \u0627\u0644\u062a\u0639\u064a\u064a\u0646',
  sendingResetLink:
    '\u062c\u0627\u0631 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0627\u0628\u0637...',
  backToLogin:
    '\u0627\u0644\u0639\u0648\u062f\u0629 \u0625\u0644\u0649 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644',
  successTitle:
    '\u062a\u062d\u0642\u0642 \u0645\u0646 \u0628\u0631\u064a\u062f\u0643',
  successDescription:
    '\u0644\u0642\u062f \u0623\u0631\u0633\u0644\u0646\u0627 \u0631\u0627\u0628\u0637 \u0625\u0639\u0627\u062f\u0629 \u062a\u0639\u064a\u064a\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0625\u0644\u0649 \u0628\u0631\u064a\u062f\u0643.',
  successHint:
    '\u0627\u062a\u0628\u0639 \u0627\u0644\u0631\u0627\u0628\u0637 \u0644\u0625\u0646\u0634\u0627\u0621 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u062c\u062f\u064a\u062f\u0629.',
  returnToLogin:
    '\u0627\u0644\u0639\u0648\u062f\u0629 \u0644\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644',
  resendPrompt:
    '\u0644\u0645 \u064a\u0635\u0644\u0643 \u0627\u0644\u0631\u0627\u0628\u0637\u061f',
  resendAction:
    '\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0625\u0631\u0633\u0627\u0644',
  mobileMenuLabel:
    '\u0641\u062a\u062d \u0627\u0644\u0642\u0627\u0626\u0645\u0629',
  mobileSubtitle:
    '\u0623\u062f\u062e\u0644 \u0628\u0631\u064a\u062f\u0643 \u0644\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0639\u064a\u064a\u0646.',
  mobileSendLink:
    '\u0625\u0631\u0633\u0627\u0644',
  mobileBack:
    '\u0631\u062c\u0648\u0639',
  mobilePreviewLabel:
    '\u0645\u0639\u0627\u064a\u0646\u0629 \u0627\u0644\u0647\u0627\u062a\u0641',
}

export function useForgotPasswordText(
  language: ForgotPasswordLanguage = 'en',
): ForgotPasswordTextContent {
  return language === 'ar' ? AR_TEXT : EN_TEXT
}

export function ForgotPasswordPage({
  values,
  language = 'en',
  status = 'input',
  text,
  isSubmitting = false,
  isDisabled = false,
  showDevicePreview = true,
  onValuesChange,
  onSubmit,
  onLanguageToggle,
  onLogin,
  onResend,
}: ForgotPasswordPageProps) {
  const pageText = { ...useForgotPasswordText(language), ...text }
  const controlsDisabled = isDisabled || isSubmitting

  return (
    <section
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="flex min-h-screen flex-col bg-[#f8f9ff] font-sans text-[#0b1c30]"
    >
      <Header text={pageText} onLanguageToggle={onLanguageToggle} onLogin={onLogin} />

      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col items-center justify-center gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
        {status === 'success' ? (
          <SuccessCard
            text={pageText}
            isDisabled={controlsDisabled}
            onLogin={onLogin}
            onResend={onResend}
          />
        ) : (
          <RequestResetCard
            values={values}
            text={pageText}
            isSubmitting={isSubmitting}
            isDisabled={controlsDisabled}
            onValuesChange={onValuesChange}
            onSubmit={onSubmit}
            onLogin={onLogin}
          />
        )}

        </main>
    </section>
  )
}

function Header({ text, onLanguageToggle, onLogin }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#bdc9c6] bg-white shadow-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="text-2xl font-bold text-[#005c55]">{text.appName}</div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onLanguageToggle}
            className="rounded px-2 py-1 text-xs font-semibold uppercase text-[#3e4947] transition hover:text-[#005c55] focus:outline-none focus:ring-2 focus:ring-[#005c55]"
          >
            {text.languageToggleLabel}
          </button>
          <button
            type="button"
            onClick={onLogin}
            className="hidden rounded px-2 py-1 text-xs font-semibold uppercase text-[#3e4947] transition hover:text-[#005c55] focus:outline-none focus:ring-2 focus:ring-[#005c55] sm:inline-flex"
          >
            {text.login}
          </button>
        </div>
      </div>
    </header>
  )
}

function RequestResetCard({
  values,
  text,
  isSubmitting,
  isDisabled,
  onValuesChange,
  onSubmit,
  onLogin,
}: RequestResetCardProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!isDisabled) {
      onSubmit(values)
    }
  }

  return (
    <section className="w-full max-w-[480px] rounded-xl bg-white p-6 shadow-xl ring-1 ring-[#bdc9c6]/40 sm:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-semibold text-[#0b1c30]">{text.pageTitle}</h1>
        <p className="mt-3 text-sm leading-6 text-[#3e4947]">{text.pageSubtitle}</p>
      </header>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <TextField
          id="forgot-password-email"
          label={text.emailLabel}
          value={values.email}
          placeholder={text.emailPlaceholder}
          icon={Mail}
          disabled={isDisabled}
          onChange={(email) => onValuesChange({ ...values, email })}
        />

        <button
          type="submit"
          disabled={isDisabled}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#005c55] px-6 py-3 text-xs font-semibold uppercase text-white shadow-sm transition hover:bg-[#00504a] focus:outline-none focus:ring-2 focus:ring-[#005c55] focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#d3e4fe] disabled:text-[#3e4947]"
        >
          {isSubmitting ? text.sendingResetLink : text.sendResetLink}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
        </button>
      </form>

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={onLogin}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#005c55] transition hover:text-[#00504a] hover:underline focus:outline-none focus:ring-2 focus:ring-[#005c55]"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          {text.backToLogin}
        </button>
      </div>
    </section>
  )
}

function SuccessCard({ text, isDisabled, onLogin, onResend }: SuccessCardProps) {
  return (
    <section className="flex min-h-[400px] w-full max-w-[480px] flex-col items-center justify-center rounded-xl bg-white p-6 text-center shadow-xl ring-1 ring-[#bdc9c6]/40 sm:p-8">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#eff4ff]">
        <MailCheck className="h-10 w-10 text-[#005c55]" aria-hidden="true" />
      </div>

      <h1 className="text-3xl font-semibold text-[#0b1c30]">{text.successTitle}</h1>
      <p className="mt-3 text-base leading-6 text-[#3e4947]">{text.successDescription}</p>
      <p className="mt-2 text-sm leading-6 text-[#3e4947]">{text.successHint}</p>

      <button
        type="button"
        disabled={isDisabled}
        onClick={onLogin}
        className="mt-8 w-full rounded-lg border-2 border-[#005c55] bg-white px-6 py-3 text-xs font-semibold uppercase text-[#005c55] transition hover:bg-[#eff4ff] focus:outline-none focus:ring-2 focus:ring-[#005c55] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {text.returnToLogin}
      </button>

      <p className="mt-6 text-sm text-[#3e4947]">
        {text.resendPrompt}{' '}
        <button
          type="button"
          disabled={isDisabled}
          onClick={onResend}
          className="font-semibold text-[#005c55] hover:underline disabled:cursor-not-allowed disabled:opacity-60"
        >
          {text.resendAction}
        </button>
      </p>
    </section>
  )
}

function TextField({
  id,
  label,
  value,
  placeholder,
  icon: Icon,
  disabled,
  onChange,
}: TextFieldProps) {
  return (
    <label className="flex flex-col gap-2" htmlFor={id}>
      <span className="text-xs font-semibold uppercase text-[#3e4947]">{label}</span>
      <span className="relative">
        <Icon
          className="pointer-events-none absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6e7977]"
          aria-hidden="true"
        />
        <input
          id={id}
          value={value}
          type="email"
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-lg border border-[#bdc9c6] bg-white py-3 pe-4 ps-11 text-base text-[#0b1c30] outline-none transition placeholder:text-[#6e7977] focus:border-[#005c55] focus:ring-1 focus:ring-[#005c55] disabled:cursor-not-allowed disabled:opacity-60"
        />
      </span>
    </label>
  )
}

function MobilePreview({ values, text, status, isDisabled }: MobilePreviewProps) {
  return (
    <aside className="hidden shrink-0 flex-col items-center gap-3 lg:flex">
      <div className="text-xs font-semibold uppercase text-[#6e7977]">
        {text.mobilePreviewLabel}
      </div>
      <div className="relative flex h-[812px] w-[375px] flex-col overflow-hidden rounded-[40px] border-[8px] border-[#d3e4fe] bg-[#f8f9ff] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#d3e4fe] bg-white p-4">
          <div className="text-2xl font-bold text-[#005c55]">{text.appName}</div>
          <button
            type="button"
            aria-label={text.mobileMenuLabel}
            className="rounded-lg p-2 text-[#3e4947]"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-center p-4">
          <div className="rounded-xl bg-white p-6 shadow-xl ring-1 ring-[#bdc9c6]/40">
            {status === 'success' ? (
              <div className="text-center">
                <MailCheck className="mx-auto mb-4 h-12 w-12 text-[#005c55]" aria-hidden="true" />
                <h2 className="text-xl font-semibold text-[#0b1c30]">{text.successTitle}</h2>
                <p className="mt-2 text-sm text-[#3e4947]">{text.successDescription}</p>
                <button
                  type="button"
                  disabled={isDisabled}
                  className="mt-6 w-full rounded-lg border border-[#005c55] px-4 py-3 text-xs font-semibold uppercase text-[#005c55] disabled:opacity-60"
                >
                  {text.returnToLogin}
                </button>
              </div>
            ) : (
              <>
                <header className="mb-6 text-center">
                  <h2 className="text-xl font-semibold text-[#0b1c30]">{text.pageTitle}</h2>
                  <p className="mt-2 text-sm text-[#3e4947]">{text.mobileSubtitle}</p>
                </header>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6e7977]"
                    aria-hidden="true"
                  />
                  <input
                    value={values.email}
                    readOnly
                    placeholder={text.emailLabel}
                    className="w-full rounded-lg border border-[#bdc9c6] bg-white py-3 pe-4 ps-11 text-sm text-[#0b1c30] placeholder:text-[#6e7977]"
                  />
                </div>
                <button
                  type="button"
                  disabled={isDisabled}
                  className="mt-5 w-full rounded-lg bg-[#005c55] px-4 py-3 text-xs font-semibold uppercase text-white disabled:bg-[#d3e4fe] disabled:text-[#3e4947]"
                >
                  {text.mobileSendLink}
                </button>
                <div className="mt-5 text-center text-sm font-semibold text-[#005c55]">
                  {text.mobileBack}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}

function ForgotPasswordPageContainer() {
  const language = useSelector(selectLanguage)
  const navigate = useNavigate()
  const [values, setValues] = useState<ForgotPasswordValues>({ email: '' })
  const [status, setStatus] = useState<ForgotPasswordStatus>('input')
  const dispatch = useDispatch()

  return (
    <ForgotPasswordPage
      values={values}
      language={language}
      status={status}
      showDevicePreview={false}
      onValuesChange={setValues}
      onSubmit={(vals) => {
        // TODO: wire up real password reset logic
        console.log('forgot password', vals)
        setStatus('success')
      }}
      onLanguageToggle={() => dispatch(setLanguage(language === 'en' ? 'ar' : 'en'))}
      onLogin={() => navigate('/login')}
      onResend={() => {
        setStatus('input')
        setValues({ email: '' })
      }}
    />
  )
}

export default ForgotPasswordPageContainer
