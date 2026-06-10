import { useSelector, useDispatch } from 'react-redux'
import { selectLanguage, setLanguage } from '../../store'
import { useNavigate } from 'react-router-dom'
import {
  ArrowDown,
  ArrowUp,
  CheckCircle,
  Globe2,
  Lock,
  LogIn,
  Menu,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

export type LandingLanguage = 'en' | 'ar'
export type LandingMetricTone = 'income' | 'expense' | 'balance' | 'savings'
export type LandingTrendTone = 'positive' | 'negative' | 'neutral'
export type LandingCategoryTone = 'primary' | 'secondary' | 'tertiary' | 'danger'

export interface LandingNavItem {
  id: string
  label: string
  href?: string
  isActive?: boolean
}

export interface LandingFooterLink {
  id: string
  label: string
  href?: string
}

export interface LandingDashboardMetric {
  id: string
  label: string
  valueLabel: string
  trendLabel: string
  tone: LandingMetricTone
  trendTone: LandingTrendTone
}

export interface LandingCashFlowBar {
  id: string
  label: string
  heightPercent: number
  tone: LandingCategoryTone
}

export interface LandingCategoryShare {
  id: string
  label: string
  valueLabel: string
  tone: LandingCategoryTone
}

export interface LandingPageData {
  navItems: LandingNavItem[]
  footerLinks: LandingFooterLink[]
  metrics: LandingDashboardMetric[]
  cashFlowBars: LandingCashFlowBar[]
  categoryShares: LandingCategoryShare[]
}

export interface LandingTextContent {
  appName: string
  languageToggleLabel: string
  login: string
  getStarted: string
  heroTitle: string
  heroDescription: string
  registerNow: string
  demoTitle: string
  demoDescription: string
  createFreeAccount: string
  cashFlowTitle: string
  expenseBreakdownTitle: string
  categoryTotalLabel: string
  mobileMenuLabel: string
  emptyMetrics: string
  emptyCashFlow: string
  emptyCategories: string
  copyright: string
}

export interface LandingPageProps {
  data?: LandingPageData
  language?: LandingLanguage
  text?: Partial<LandingTextContent>
  onLanguageToggle?: () => void
  onLogin?: () => void
  onGetStarted?: () => void
  onRegister?: () => void
  onCreateFreeAccount?: () => void
}

interface TopNavProps {
  navItems: LandingNavItem[]
  text: LandingTextContent
  onLanguageToggle?: () => void
  onLogin?: () => void
  onGetStarted?: () => void
}

interface HeroSectionProps {
  text: LandingTextContent
  data: LandingPageData
  onRegister?: () => void
  onCreateFreeAccount?: () => void
}

interface DashboardPreviewProps {
  metrics: LandingDashboardMetric[]
  cashFlowBars: LandingCashFlowBar[]
  categoryShares: LandingCategoryShare[]
  text: LandingTextContent
  isLocked?: boolean
  onCreateFreeAccount?: () => void
}

interface MetricCardProps {
  metric: LandingDashboardMetric
}

interface FooterProps {
  links: LandingFooterLink[]
  text: LandingTextContent
}

const EN_TEXT: LandingTextContent = {
  appName: 'PFT',
  languageToggleLabel: 'EN / العربية',
  login: 'Login',
  getStarted: 'Get Started',
  heroTitle: 'Take Control of Your Finances',
  heroDescription:
    'Experience institutional-grade tracking with an intuitive dashboard for expenses, savings, and financial goals.',
  registerNow: 'Register Now',
  demoTitle: 'Demo Dashboard',
  demoDescription:
    'This is demo data. Register to connect your accounts and see your real finances.',
  createFreeAccount: 'Create Free Account',
  cashFlowTitle: 'Cash Flow Overview',
  expenseBreakdownTitle: 'Expense Breakdown',
  categoryTotalLabel: 'Total',
  mobileMenuLabel: 'Open menu',
  emptyMetrics: 'No dashboard metrics available.',
  emptyCashFlow: 'No cash flow preview available.',
  emptyCategories: 'No expense category preview available.',
  copyright: '© 2026 PFT Personal Finance Tracker. All rights reserved.',
}

const AR_TEXT: LandingTextContent = {
  appName: 'PFT',
  languageToggleLabel: 'EN / العربية',
  login: 'تسجيل الدخول',
  getStarted: 'البدء',
  heroTitle: 'سيطر على شؤونك المالية',
  heroDescription: 'جرب تتبعًا على مستوى مؤسسي باستخدام لوحة قيادة بديهية للنفقات والمدخرات والأهداف المالية.',
  registerNow: 'سجل الآن',
  demoTitle: 'لوحة القيادة التجريبية',
  demoDescription: 'هذه بيانات تجريبية. قم بالتسجيل لربط حساباتك ورؤية أموالك الحقيقية.',
  createFreeAccount: 'إنشاء حساب مجاني',
  cashFlowTitle: "نظرة عامة على التدفق النقدي",
  expenseBreakdownTitle: 'تفصيل النفقات',
  categoryTotalLabel: 'الإجمالي',
  mobileMenuLabel: 'فتح القائمة',
  emptyMetrics: 'لا تتوفر مقاييس للوحة القيادة.',
  emptyCashFlow: 'لا تتوفر معاينة للتدفق النقدي.',
  emptyCategories: 'لا تتوفر معاينة لفئة النفقات.',
  copyright: '© 2026 PFT متتبع الشؤون المالية الشخصية. جميع الحقوق محفوظة.',
};

export function useLandingPageText() {
  const language = useSelector(selectLanguage);
  return language === 'ar' ? AR_TEXT : EN_TEXT;
}


const DEFAULT_DATA: LandingPageData = {
  navItems: [],
  footerLinks: [],
  metrics: [],
  cashFlowBars: [],
  categoryShares: [],
}

const METRIC_ICONS: Record<LandingMetricTone, LucideIcon> = {
  income: ArrowUp,
  expense: ArrowDown,
  balance: Wallet,
  savings: PiggyBank,
}

export function useLandingPageData(): LandingPageData {
  return DEFAULT_DATA
}

export function LandingPage({
  data,
  language = 'en',
  text,
  onLanguageToggle,
  onLogin,
  onGetStarted,
  onRegister,
  onCreateFreeAccount,
}: LandingPageProps) {
  const fallbackData = useLandingPageData()
  const pageData = data ?? fallbackData
  const pageText = { ...useLandingPageText(), ...text }

  return (
    <section
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="flex min-h-screen flex-col bg-[#f8f9ff] font-sans text-[#0b1c30]"
    >
      <TopNav
        navItems={pageData.navItems}
        text={pageText}
        onLanguageToggle={onLanguageToggle}
        onLogin={onLogin}
        onGetStarted={onGetStarted}
      />

      <main className="flex-1">
        <HeroSection
          text={pageText}
          data={pageData}
          onRegister={onRegister}
          onCreateFreeAccount={onCreateFreeAccount}
        />
      </main>

      <Footer links={pageData.footerLinks} text={pageText} />
    </section>
  )
}

function TopNav({
  navItems,
  text,
  onLanguageToggle,
  onLogin,
  onGetStarted,
}: TopNavProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#bdc9c6] bg-white shadow-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <a href="#" className="text-2xl font-bold text-[#005c55]">
          {text.appName}
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href ?? '#'}
              className={`text-lg font-semibold transition ${
                item.isActive
                  ? 'border-b-2 border-[#005c55] pb-1 text-[#005c55]'
                  : 'text-[#3e4947] hover:text-[#005c55]'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <button
            type="button"
            onClick={onLanguageToggle}
            className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-semibold uppercase text-[#3e4947] transition hover:bg-[#eff4ff] hover:text-[#005c55]"
          >
            <Globe2 className="h-4 w-4" aria-hidden="true" />
            {text.languageToggleLabel}
          </button>
          <button
            type="button"
            onClick={onLogin}
            className="inline-flex items-center gap-2 rounded-lg border border-[#005c55] px-4 py-2 text-xs font-semibold uppercase text-[#005c55] transition hover:bg-[#eff4ff]"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            {text.login}
          </button>
          <button
            type="button"
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 rounded-lg bg-[#005c55] px-4 py-2 text-xs font-semibold uppercase text-white transition hover:bg-[#00504a]"
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            {text.getStarted}
          </button>
        </div>

        <button
          type="button"
          aria-label={text.mobileMenuLabel}
          className="rounded-lg p-2 text-[#3e4947] transition hover:bg-[#eff4ff] md:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}

function HeroSection({
  text,
  data,
  onRegister,
  onCreateFreeAccount,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-[#213145] text-white">
      <div className="absolute inset-0 opacity-30">
        <DashboardPreview
          metrics={data.metrics}
          cashFlowBars={data.cashFlowBars}
          categoryShares={data.categoryShares}
          text={text}
        />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-72px)] w-full max-w-7xl grid-cols-1 items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="max-w-2xl py-8">
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            {text.heroTitle}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/85 sm:text-lg">
            {text.heroDescription}
          </p>
          <button
            type="button"
            onClick={onRegister}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#fea619] px-6 py-3 text-lg font-semibold text-[#684000] shadow-lg transition hover:bg-[#ffb95f] focus:outline-none focus:ring-2 focus:ring-[#fea619] focus:ring-offset-2 focus:ring-offset-[#213145]"
          >
            <UserPlus className="h-5 w-5" aria-hidden="true" />
            {text.registerNow}
          </button>
        </div>

        <div className="pb-8 lg:py-10">
          <DashboardPreview
            metrics={data.metrics}
            cashFlowBars={data.cashFlowBars}
            categoryShares={data.categoryShares}
            text={text}
            isLocked
            onCreateFreeAccount={onCreateFreeAccount}
          />
        </div>
      </div>
    </section>
  )
}

function DashboardPreview({
  metrics,
  cashFlowBars,
  categoryShares,
  text,
  isLocked = false,
  onCreateFreeAccount,
}: DashboardPreviewProps) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-[#bdc9c6]/40 bg-[#eff4ff] p-4 text-[#0b1c30] shadow-2xl sm:p-5">
      {isLocked ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#f8f9ff]/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-[#bdc9c6]/60 bg-white p-6 text-center shadow-xl">
            <Lock className="mx-auto mb-3 h-12 w-12 text-[#005c55]" aria-hidden="true" />
            <h2 className="text-2xl font-semibold text-[#0b1c30]">{text.demoTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-[#3e4947]">{text.demoDescription}</p>
            <button
              type="button"
              onClick={onCreateFreeAccount}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#005c55] px-4 py-3 text-xs font-semibold uppercase text-white transition hover:bg-[#00504a]"
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              {text.createFreeAccount}
            </button>
          </div>
        </div>
      ) : null}

      <div className={isLocked ? 'pointer-events-none opacity-45' : ''}>
        <MetricGrid metrics={metrics} text={text} />

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <CashFlowPreview bars={cashFlowBars} text={text} />
          <CategoryPreview shares={categoryShares} text={text} />
        </div>
      </div>
    </section>
  )
}

function MetricGrid({
  metrics,
  text,
}: {
  metrics: LandingDashboardMetric[]
  text: LandingTextContent
}) {
  if (metrics.length === 0) {
    return <EmptyPreview message={text.emptyMetrics} />
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.id} metric={metric} />
      ))}
    </div>
  )
}

function MetricCard({ metric }: MetricCardProps) {
  const Icon = METRIC_ICONS[metric.tone]
  const TrendIcon = metric.trendTone === 'negative' ? TrendingDown : metric.trendTone === 'positive' ? TrendingUp : CheckCircle

  return (
    <article className="rounded-xl border border-[#bdc9c6]/40 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase text-[#3e4947]">{metric.label}</h3>
        <Icon className={`h-5 w-5 ${metricIconClass(metric.tone)}`} aria-hidden="true" />
      </div>
      <div className="text-2xl font-semibold text-[#0b1c30]">{metric.valueLabel}</div>
      <div className={`mt-2 flex items-center gap-1 text-sm ${trendClass(metric.trendTone)}`}>
        <TrendIcon className="h-4 w-4" aria-hidden="true" />
        {metric.trendLabel}
      </div>
    </article>
  )
}

function CashFlowPreview({
  bars,
  text,
}: {
  bars: LandingCashFlowBar[]
  text: LandingTextContent
}) {
  return (
    <article className="rounded-xl border border-[#bdc9c6]/40 bg-white p-5 shadow-sm lg:col-span-2">
      <h3 className="text-xl font-semibold text-[#0b1c30]">{text.cashFlowTitle}</h3>
      {bars.length > 0 ? (
        <>
          <div className="mt-4 flex h-48 items-end gap-3 border-b border-[#bdc9c6]/60 px-2 pb-2">
            {bars.map((bar) => (
              <div key={bar.id} className="flex h-full min-w-0 flex-1 items-end">
                <div
                  className={`w-full rounded-t ${heightClass(bar.heightPercent)} ${barClass(bar.tone)}`}
                  title={bar.label}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between gap-2 px-2 text-xs font-semibold text-[#3e4947]">
            {bars.map((bar) => (
              <span key={bar.id} className="truncate">
                {bar.label}
              </span>
            ))}
          </div>
        </>
      ) : (
        <EmptyPreview message={text.emptyCashFlow} />
      )}
    </article>
  )
}

function CategoryPreview({
  shares,
  text,
}: {
  shares: LandingCategoryShare[]
  text: LandingTextContent
}) {
  return (
    <article className="rounded-xl border border-[#bdc9c6]/40 bg-white p-5 shadow-sm">
      <h3 className="text-xl font-semibold text-[#0b1c30]">{text.expenseBreakdownTitle}</h3>
      {shares.length > 0 ? (
        <>
          <div className="my-5 flex justify-center">
            <div className="flex h-32 w-32 items-center justify-center rounded-full border-[10px] border-[#005c55] border-b-[#005e3f] border-r-[#ba1a1a] border-t-[#fea619]">
              <span className="text-lg font-semibold text-[#0b1c30]">{text.categoryTotalLabel}</span>
            </div>
          </div>
          <div className="space-y-3">
            {shares.map((share) => (
              <div key={share.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <span className={`h-3 w-3 shrink-0 rounded-full ${dotClass(share.tone)}`} />
                  <span className="truncate text-[#0b1c30]">{share.label}</span>
                </div>
                <span className="shrink-0 font-semibold text-[#3e4947]">{share.valueLabel}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <EmptyPreview message={text.emptyCategories} />
      )}
    </article>
  )
}

function Footer({ links, text }: FooterProps) {
  return (
    <footer className="border-t border-[#bdc9c6] bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-center sm:px-6 md:flex-row md:text-start lg:px-8">
        <div className="text-xl font-bold text-[#005c55]">{text.appName}</div>
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
        <div className="text-sm text-[#3e4947]">{text.copyright}</div>
      </div>
    </footer>
  )
}

function EmptyPreview({ message }: { message: string }) {
  return (
    <div className="flex min-h-28 items-center justify-center rounded-lg border border-dashed border-[#bdc9c6] bg-white p-4 text-center text-sm text-[#3e4947]">
      {message}
    </div>
  )
}

function metricIconClass(tone: LandingMetricTone) {
  if (tone === 'expense') return 'text-[#ba1a1a]'
  if (tone === 'savings') return 'text-[#855300]'
  return 'text-[#005c55]'
}

function trendClass(tone: LandingTrendTone) {
  if (tone === 'negative') return 'text-[#ba1a1a]'
  if (tone === 'positive') return 'text-[#005e3f]'
  return 'text-[#3e4947]'
}

function barClass(tone: LandingCategoryTone) {
  if (tone === 'secondary') return 'bg-[#fea619]'
  if (tone === 'tertiary') return 'bg-[#005e3f]'
  if (tone === 'danger') return 'bg-[#ba1a1a]'
  return 'bg-[#005c55]'
}

function dotClass(tone: LandingCategoryTone) {
  if (tone === 'secondary') return 'bg-[#fea619]'
  if (tone === 'tertiary') return 'bg-[#005e3f]'
  if (tone === 'danger') return 'bg-[#ba1a1a]'
  return 'bg-[#005c55]'
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

function LandingPageContainer() {
  const language = useSelector(selectLanguage)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  return (
    <LandingPage
      language={language}
      onLanguageToggle={() => dispatch(setLanguage(language === 'en' ? 'ar' : 'en'))}
      onLogin={() => navigate('/login')}
      onGetStarted={() => navigate('/register')}
      onRegister={() => navigate('/register')}
      onCreateFreeAccount={() => navigate('/register')}
    />
  )
}

export default LandingPageContainer
