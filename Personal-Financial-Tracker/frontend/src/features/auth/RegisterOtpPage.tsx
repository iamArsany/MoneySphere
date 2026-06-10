import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectLanguage, setLanguage } from '../../store'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Phone,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'

export type RegisterOtpLanguage = 'en' | 'ar'

export interface RegisterOtpPageData {
  countryCode: string
  phoneNumber: string
  otp: string[]
  resendCountdownSeconds?: number
}

export interface RegisterOtpTextContent {
  appName: string
  languageToggleLabel: string
  pageTitle: string
  pageSubtitle: string
  phoneLabel: string
  otpLabel: string
  otpInstruction: string
  verifyCode: string
  verifyingCode: string
  resendPrompt: string
  resendAction: string
  changePhoneNumber: string
  back: string
  securityNote: string
  codeSentPrefix: string
  countdownPrefix: string
  otpDigitLabel: string
  supportHeading: string
  supportBody: string
  featureSecure: string
  featureFast: string
  featurePrivate: string
  footerNote: string
}

export interface RegisterOtpPageProps {
  data?: RegisterOtpPageData
  language?: RegisterOtpLanguage
  text?: Partial<RegisterOtpTextContent>
  otpLength?: number
  isSubmitting?: boolean
  isDisabled?: boolean
  showLanguageToggle?: boolean
  onDataChange?: (data: RegisterOtpPageData) => void
  onSubmit?: (data: RegisterOtpPageData) => void
  onResendCode?: () => void
  onChangePhone?: () => void
  onBack?: () => void
  onLanguageToggle?: () => void
}

interface VerifyOtpCardProps {
  data: RegisterOtpPageData
  text: RegisterOtpTextContent
  otpLength: number
  isSubmitting: boolean
  isDisabled: boolean
  isRtl: boolean
  onDataChange?: (data: RegisterOtpPageData) => void
  onSubmit?: (data: RegisterOtpPageData) => void
  onResendCode?: () => void
  onChangePhone?: () => void
  onBack?: () => void
}

interface FeatureRowProps {
  icon: LucideIcon
  title: string
  description: string
}

interface OtpFieldProps {
  value: string
  index: number
  label: string
  disabled: boolean
  inputRef: (node: HTMLInputElement | null) => void
  onChange: (value: string) => void
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  onPaste: (event: ClipboardEvent<HTMLInputElement>) => void
}

const DEFAULT_OTP_LENGTH = 6

const EN_TEXT: RegisterOtpTextContent = {
  appName: 'PFT',
  languageToggleLabel: 'AR',
  pageTitle: 'Verify your phone',
  pageSubtitle: 'We sent a one-time code to your phone number.',
  phoneLabel: 'Phone number',
  otpLabel: 'One-time passcode',
  otpInstruction: 'Enter the 6-digit code to continue your registration.',
  verifyCode: 'Verify code',
  verifyingCode: 'Verifying...',
  resendPrompt: "Didn't receive the code?",
  resendAction: 'Resend code',
  changePhoneNumber: 'Change phone number',
  back: 'Back',
  securityNote: 'We only use your phone number to secure your account.',
  codeSentPrefix: 'Code sent to',
  countdownPrefix: 'Resend available in',
  otpDigitLabel: 'OTP digit',
  supportHeading: 'A secure handoff',
  supportBody: 'Keep the verification flow quick, calm, and protected.',
  featureSecure: 'Encrypted delivery for every verification message.',
  featureFast: 'Move forward as soon as the code is entered.',
  featurePrivate: 'Your number stays private and is never shared.',
  footerNote: 'Personal Finance Tracker',
}

const AR_TEXT: RegisterOtpTextContent = {
  appName: 'PFT',
  languageToggleLabel: 'EN',
  pageTitle: 'تحقق من رقم الهاتف',
  pageSubtitle: 'أرسلنا رمزًا لمرة واحدة إلى رقم هاتفك.',
  phoneLabel: 'رقم الهاتف',
  otpLabel: 'رمز التحقق',
  otpInstruction: 'أدخل الرمز المكون من 6 أرقام للمتابعة.',
  verifyCode: 'تحقق من الرمز',
  verifyingCode: 'جارٍ التحقق...',
  resendPrompt: 'لم يصلك الرمز؟',
  resendAction: 'إعادة إرسال الرمز',
  changePhoneNumber: 'تغيير رقم الهاتف',
  back: 'رجوع',
  securityNote: 'نستخدم رقم الهاتف فقط لتأمين حسابك.',
  codeSentPrefix: 'تم الإرسال إلى',
  countdownPrefix: 'يمكنك إعادة الإرسال بعد',
  otpDigitLabel: 'رقم التحقق',
  supportHeading: 'تسليم آمن',
  supportBody: 'حافظ على التدفق سريعًا وواضحًا ومحمياً.',
  featureSecure: 'رسائل التحقق تصل بشكل مشفر وآمن.',
  featureFast: 'تابع مباشرة بعد إدخال الرمز.',
  featurePrivate: 'يبقى رقمك خاصًا ولا تتم مشاركته.',
  footerNote: 'متتبع المالية الشخصية',
}

export function useRegisterOtpPageText(language: RegisterOtpLanguage = 'en'): RegisterOtpTextContent {
  return language === 'ar' ? AR_TEXT : EN_TEXT
}

export function useRegisterOtpPageData(otpLength: number = DEFAULT_OTP_LENGTH): RegisterOtpPageData {
  return {
    countryCode: '',
    phoneNumber: '',
    otp: Array.from({ length: otpLength }, () => ''),
    resendCountdownSeconds: undefined,
  }
}

export function RegisterOtpPage({
  data,
  language = 'en',
  text,
  otpLength = DEFAULT_OTP_LENGTH,
  isSubmitting = false,
  isDisabled = false,
  showLanguageToggle = true,
  onDataChange,
  onSubmit,
  onResendCode,
  onChangePhone,
  onBack,
  onLanguageToggle,
}: RegisterOtpPageProps) {
  const pageText = { ...useRegisterOtpPageText(language), ...text }
  const [localData, setLocalData] = useState<RegisterOtpPageData>(() => useRegisterOtpPageData(otpLength))
  const resolvedData = data ?? localData
  const [isEditingPhone, setIsEditingPhone] = useState(!resolvedData.phoneNumber)
  const controlsDisabled = isDisabled || isSubmitting
  const isRtl = language === 'ar'

  useEffect(() => {
    if (!data) {
      setLocalData(useRegisterOtpPageData(otpLength))
    }
  }, [data, otpLength])

  function updateData(nextData: RegisterOtpPageData) {
    if (data) {
      onDataChange?.(nextData)
      return
    }

    setLocalData(nextData)
    onDataChange?.(nextData)
  }

  return (
    <section
      dir={isRtl ? 'rtl' : 'ltr'}
      className="relative min-h-screen overflow-hidden bg-[#f8f9ff] text-[#0b1c30]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(156,242,232,0.32),transparent_28%),radial-gradient(circle_at_80%_25%,rgba(254,166,25,0.16),transparent_24%),radial-gradient(circle_at_50%_80%,rgba(33,49,69,0.08),transparent_28%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 py-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#005c55] text-white shadow-lg shadow-[#005c55]/20">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-[#005c55]">{pageText.appName}</p>
              <p className="text-xs text-[#3e4947]">{pageText.pageTitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showLanguageToggle && onLanguageToggle ? (
              <button
                type="button"
                onClick={onLanguageToggle}
                className="rounded-full border border-[#bdc9c6] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#3e4947] transition hover:border-[#005c55] hover:text-[#005c55] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005c55]"
              >
                {pageText.languageToggleLabel}
              </button>
            ) : null}
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 rounded-full border border-[#bdc9c6] bg-white px-3 py-2 text-xs font-semibold text-[#3e4947] transition hover:border-[#005c55] hover:text-[#005c55] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005c55]"
              >
                {isRtl ? (
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                )}
                <span className="hidden sm:inline">{pageText.back}</span>
              </button>
            ) : null}
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center py-6 lg:py-10">
          <div className="grid w-full items-stretch gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <aside className="hidden overflow-hidden rounded-[28px] border border-white/60 bg-white/80 p-8 shadow-[0_24px_80px_rgba(11,28,48,0.12)] backdrop-blur-xl lg:flex lg:flex-col lg:justify-between">
              <div className="max-w-xl">
                <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-[#eff4ff] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#005c55]">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  {pageText.supportHeading}
                </div>
                <h1 className="max-w-lg text-5xl font-bold tracking-tight text-[#0b1c30]">
                  {pageText.pageTitle}
                </h1>
                <p className="mt-4 max-w-lg text-base leading-7 text-[#3e4947]">
                  {pageText.pageSubtitle}
                </p>
              </div>

              <div className="space-y-4">
                <FeatureRow
                  icon={ShieldCheck}
                  title={pageText.featureSecure}
                  description={pageText.supportBody}
                />
                <FeatureRow
                  icon={Clock3}
                  title={pageText.featureFast}
                  description={pageText.otpInstruction}
                />
                <FeatureRow
                  icon={Phone}
                  title={pageText.featurePrivate}
                  description={pageText.securityNote}
                />
              </div>
            </aside>

            {isEditingPhone ? (
              <EnterPhoneCard
                data={resolvedData}
                text={pageText}
                isSubmitting={isSubmitting}
                isDisabled={controlsDisabled}
                isRtl={isRtl}
                onSendOtp={(countryCode, phoneNumber) => {
                  updateData({ ...resolvedData, countryCode, phoneNumber })
                  setIsEditingPhone(false)
                }}
                onBack={onBack}
              />
            ) : (
              <VerifyOtpCard
                data={resolvedData}
                text={pageText}
                otpLength={otpLength}
                isSubmitting={isSubmitting}
                isDisabled={controlsDisabled}
                isRtl={isRtl}
                onDataChange={updateData}
                onSubmit={onSubmit}
                onResendCode={onResendCode}
                onChangePhone={() => {
                  setIsEditingPhone(true)
                  onChangePhone?.()
                }}
                onBack={onBack}
              />
            )}
          </div>
        </main>

        <footer className="pb-3 pt-2 text-center text-xs text-[#3e4947]">
          {pageText.footerNote}
        </footer>
      </div>
    </section>
  )
}

interface EnterPhoneCardProps {
  data: RegisterOtpPageData
  text: RegisterOtpTextContent
  isSubmitting: boolean
  isDisabled: boolean
  isRtl: boolean
  onSendOtp: (countryCode: string, phoneNumber: string) => void
  onBack?: () => void
}

function EnterPhoneCard({
  data,
  text,
  isSubmitting,
  isDisabled,
  isRtl,
  onSendOtp,
  onBack,
}: EnterPhoneCardProps) {
  const [countryCode, setCountryCode] = useState(data.countryCode || '+1')
  const [phoneNumber, setPhoneNumber] = useState(data.phoneNumber || '')
  const canInteract = !isDisabled && !isSubmitting

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canInteract || !phoneNumber.trim()) return
    onSendOtp(countryCode, phoneNumber)
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_24px_80px_rgba(11,28,48,0.16)] backdrop-blur-xl">
      <div className="flex h-full flex-col p-5 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#eff4ff] text-[#0b1c30] transition hover:bg-[#dce9ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005c55]"
              aria-label={text.back}
            >
              {isRtl ? (
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              ) : (
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          ) : (
            <div />
          )}

          <div className="inline-flex items-center gap-2 rounded-full bg-[#eff4ff] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#005c55]">
            <Phone className="h-4 w-4" aria-hidden="true" />
            {text.phoneLabel}
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-[#0b1c30] sm:text-4xl">
            {text.pageTitle}
          </h2>
          <p className="max-w-xl text-sm leading-6 text-[#3e4947] sm:text-base">
            Please enter your mobile number to receive a verification code.
          </p>
        </div>

        <form className="mt-8 flex flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-[#0b1c30]">
                {text.phoneLabel}
              </span>
              <div className="flex gap-2" dir="ltr">
                <input
                  type="text"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  disabled={!canInteract}
                  className="h-12 w-20 rounded-xl border border-[#bdc9c6] bg-white px-3 text-center text-sm font-medium text-[#0b1c30] transition focus:border-[#005c55] focus:outline-none focus:ring-4 focus:ring-[#80d5cb]/30 disabled:cursor-not-allowed disabled:bg-[#f8f9ff]"
                />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  disabled={!canInteract}
                  placeholder="e.g. 555 123 4567"
                  className="h-12 flex-1 rounded-xl border border-[#bdc9c6] bg-white px-4 text-sm font-medium text-[#0b1c30] transition placeholder:text-[#889795] focus:border-[#005c55] focus:outline-none focus:ring-4 focus:ring-[#80d5cb]/30 disabled:cursor-not-allowed disabled:bg-[#f8f9ff]"
                />
              </div>
            </label>
          </div>

          <div className="mt-auto pt-8">
            <button
              type="submit"
              disabled={!canInteract || !phoneNumber.trim()}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#005c55] px-6 text-sm font-bold tracking-wide text-white transition hover:bg-[#0f766e] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send OTP
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

function VerifyOtpCard({
  data,
  text,
  otpLength,
  isSubmitting,
  isDisabled,
  isRtl,
  onDataChange,
  onSubmit,
  onResendCode,
  onChangePhone,
  onBack,
}: VerifyOtpCardProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const normalizedOtp = normalizeOtpValue(data.otp, otpLength)
  const phoneSummary = [data.countryCode, data.phoneNumber].filter(Boolean).join(' ').trim()
  const countdownLabel =
    typeof data.resendCountdownSeconds === 'number'
      ? formatCountdown(data.resendCountdownSeconds)
      : ''
  const canInteract = !isDisabled && !isSubmitting

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canInteract) {
      return
    }

    onSubmit?.({ ...data, otp: normalizedOtp })
  }

  function updateOtp(nextOtp: string[]) {
    onDataChange?.({ ...data, otp: nextOtp })
  }

  function focusDigit(index: number) {
    inputRefs.current[index]?.focus()
  }

  function handleDigitChange(index: number, nextValue: string) {
    const digit = nextValue.replace(/\D/g, '').slice(-1)
    const nextOtp = [...normalizedOtp]
    nextOtp[index] = digit
    updateOtp(nextOtp)

    if (digit && index < otpLength - 1) {
      focusDigit(index + 1)
    }
  }

  function handleDigitKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !normalizedOtp[index] && index > 0) {
      focusDigit(index - 1)
    }
  }

  function handleDigitPaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault()
    const pastedDigits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, otpLength)
    if (!pastedDigits) {
      return
    }

    const nextOtp = Array.from({ length: otpLength }, (_, index) => pastedDigits[index] ?? normalizedOtp[index] ?? '')
    updateOtp(nextOtp)
    focusDigit(Math.min(pastedDigits.length, otpLength) - 1)
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_24px_80px_rgba(11,28,48,0.16)] backdrop-blur-xl">
      <div className="flex h-full flex-col p-5 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#eff4ff] text-[#0b1c30] transition hover:bg-[#dce9ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005c55]"
              aria-label={text.back}
            >
              {isRtl ? (
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              ) : (
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          ) : (
            <div />
          )}

          <div className="inline-flex items-center gap-2 rounded-full bg-[#eff4ff] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#005c55]">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {text.otpLabel}
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-[#0b1c30] sm:text-4xl">
            {text.pageTitle}
          </h2>
          <p className="max-w-xl text-sm leading-6 text-[#3e4947] sm:text-base">
            {text.pageSubtitle}
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-[#bdc9c6]/70 bg-[#f8f9ff] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3e4947]">
            {text.phoneLabel}
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-[#0b1c30]" dir="ltr">
            <Phone className="h-4 w-4 text-[#005c55]" aria-hidden="true" />
            <span>{text.codeSentPrefix}</span>
            <span className="rounded-full bg-white px-3 py-1 text-[#005c55] ring-1 ring-[#bdc9c6]">
              {phoneSummary || '\u00a0'}
            </span>
          </p>
          <p className="mt-3 text-sm leading-6 text-[#3e4947]">{text.otpInstruction}</p>
        </div>

        <form className="mt-6 flex flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3e4947]">
              {text.otpLabel}
            </p>
            <div className="flex justify-center gap-2 sm:gap-3" dir="ltr">
              {normalizedOtp.map((value, index) => (
                <OtpField
                  key={`${index}-${otpLength}`}
                  value={value}
                  index={index}
                  label={`${text.otpDigitLabel} ${index + 1}`}
                  disabled={isDisabled}
                  inputRef={(node) => {
                    inputRefs.current[index] = node
                  }}
                  onChange={(nextValue) => handleDigitChange(index, nextValue)}
                  onKeyDown={(event) => handleDigitKeyDown(index, event)}
                  onPaste={handleDigitPaste}
                />
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#eff4ff] px-4 py-3">
              <p className="text-sm text-[#3e4947]">{text.resendPrompt}</p>
              <div className="flex items-center gap-2 text-sm font-semibold text-[#855300]">
                <Clock3 className="h-4 w-4" aria-hidden="true" />
                {countdownLabel ? (
                  <span>
                    {text.countdownPrefix} {countdownLabel}
                  </span>
                ) : (
                  <span>{text.resendAction}</span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!canInteract}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#005c55] px-5 text-sm font-semibold text-white shadow-lg shadow-[#005c55]/20 transition hover:bg-[#0f766e] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              {isSubmitting ? text.verifyingCode : text.verifyCode}
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onResendCode}
                disabled={!canInteract || !onResendCode}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#bdc9c6] bg-white px-4 text-sm font-semibold text-[#0b1c30] transition hover:border-[#005c55] hover:text-[#005c55] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                {text.resendAction}
              </button>

              <button
                type="button"
                onClick={onChangePhone}
                disabled={!canInteract || !onChangePhone}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#f8f9ff] px-4 text-sm font-semibold text-[#005c55] transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRtl ? (
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                )}
                {text.changePhoneNumber}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-6 rounded-2xl border border-[#bdc9c6]/70 bg-white p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eff4ff] text-[#005c55]">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0b1c30]">{text.supportHeading}</p>
              <p className="mt-1 text-sm leading-6 text-[#3e4947]">{text.securityNote}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function OtpField({
  value,
  index,
  label,
  disabled,
  inputRef,
  onChange,
  onKeyDown,
  onPaste,
}: OtpFieldProps) {
  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      type="text"
      inputMode="numeric"
      autoComplete={index === 0 ? 'one-time-code' : 'off'}
      maxLength={1}
      aria-label={label}
      disabled={disabled}
      className="h-14 w-11 rounded-2xl border border-[#bdc9c6] bg-white text-center text-xl font-bold tracking-[0.18em] text-[#0b1c30] shadow-sm transition placeholder:text-[#bdc9c6] focus:border-[#005c55] focus:outline-none focus:ring-4 focus:ring-[#80d5cb]/30 disabled:cursor-not-allowed disabled:bg-[#f8f9ff] sm:h-16 sm:w-12 sm:text-2xl"
    />
  )
}

function FeatureRow({ icon: Icon, title, description }: FeatureRowProps) {
  return (
    <div className="flex gap-4 rounded-2xl bg-[#f8f9ff] p-4 ring-1 ring-[#bdc9c6]/60">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#005c55] shadow-sm">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[#0b1c30]">{title}</p>
        <p className="mt-1 text-sm leading-6 text-[#3e4947]">{description}</p>
      </div>
    </div>
  )
}

function normalizeOtpValue(otp: string[], otpLength: number) {
  return Array.from({ length: otpLength }, (_, index) => otp[index] ?? '')
}

function formatCountdown(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(safeSeconds / 60)
  const seconds = String(safeSeconds % 60).padStart(2, '0')

  return `${minutes}:${seconds}`
}

function RegisterOtpPageContainer() {
  const language = useSelector(selectLanguage)
  const dispatch = useDispatch()

  function handleLanguageToggle() {
    dispatch(setLanguage(language === 'en' ? 'ar' : 'en'))
  }

  return (
    <RegisterOtpPage
      language={language}
      onLanguageToggle={handleLanguageToggle}
    />
  )
}

export default RegisterOtpPageContainer
