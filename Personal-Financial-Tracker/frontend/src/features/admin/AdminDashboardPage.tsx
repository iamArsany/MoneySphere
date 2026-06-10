import { useSelector } from 'react-redux'
import { selectLanguage } from '../../store'
import { useMemo, useState, useEffect, type ChangeEvent, type KeyboardEvent } from 'react'
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  Gauge,
  LayoutDashboard,
  Lock,
  Megaphone,
  MoreVertical,
  Phone,
  ReceiptText,
  Repeat,
  Smartphone,
  Tags,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { api } from '../../services/api'

export type AdminDashboardLanguage = 'en' | 'ar'

export interface AdminDashboardUser {
  initials: string
  name: string
  accessLabel: string
}

export interface AdminDashboardNavItem {
  id: string
  label: string
  icon: AdminDashboardIconName
  href?: string
  isActive?: boolean
}

export interface AdminDashboardMetric {
  id: string
  label: string
  value: string
  icon: AdminDashboardIconName
  changeLabel: string
  changeDirection: 'up' | 'down'
}

export interface AdminDashboardLinePoint {
  label: string
  x: number
  y: number
}

export interface AdminDashboardBarPoint {
  label: string
  value: number
}

export interface AdminDashboardChartCopy {
  title: string
  subtitle: string
}

export interface AdminDashboardVerification {
  isRequired: boolean
  errorMessage?: string
  codeLength?: number
  onVerify?: (code: string) => boolean | Promise<boolean>
}

export interface AdminDashboardData {
  currentUser?: AdminDashboardUser
  navItems: AdminDashboardNavItem[]
  metrics: AdminDashboardMetric[]
  activeUsersTrend: AdminDashboardLinePoint[]
  registrations: AdminDashboardBarPoint[]
}

export interface AdminDashboardPageProps {
  data?: AdminDashboardData
  language?: AdminDashboardLanguage
  dateRangeLabel?: string
  hasUnreadNotifications?: boolean
  verification?: AdminDashboardVerification
}

type AdminDashboardIconName =
  | 'analytics'
  | 'audit'
  | 'broadcast'
  | 'calendar'
  | 'categories'
  | 'dashboard'
  | 'lock'
  | 'monitoring'
  | 'notifications'
  | 'phone'
  | 'registrations'
  | 'transactions'
  | 'userCheck'
  | 'userPlus'
  | 'users'

const TEXT = {
  brand: 'PFT Admin',
  pageTitle: 'System Overview',
  verifyTitle: 'Admin Verification Required',
  verifyDescription:
    'Please enter the 6-digit code from your authenticator app to access the panel.',
  verifyButton: 'Verify',
  authenticatorHint: 'Use Google Authenticator',
  defaultVerificationError: 'Invalid code. Please try again.',
  metricsEmpty: 'No metrics available.',
  trendEmpty: 'No trend data available.',
  registrationsEmpty: 'No registration data available.',
  activeUsersChart: {
    title: 'Daily Active Users',
    subtitle: '90 Day Trend Analysis',
  },
  registrationsChart: {
    title: 'Registrations',
    subtitle: 'Last 30 Days',
  },
  notificationsAriaLabel: 'Notifications',
  chartOptionsAriaLabel: 'More chart options',
  verificationDigitAriaLabel: 'Verification digit',
}

const ICONS: Record<AdminDashboardIconName, LucideIcon> = {
  analytics: BarChart3,
  audit: ReceiptText,
  broadcast: Megaphone,
  calendar: CalendarDays,
  categories: Tags,
  dashboard: LayoutDashboard,
  lock: Lock,
  monitoring: Gauge,
  notifications: Bell,
  phone: Smartphone,
  registrations: UserPlus,
  transactions: Repeat,
  userCheck: UserCheck,
  userPlus: UserPlus,
  users: Users,
}

const BAR_HEIGHT_CLASSES = [
  'h-1/6',
  'h-1/4',
  'h-1/3',
  'h-2/5',
  'h-1/2',
  'h-3/5',
  'h-2/3',
  'h-3/4',
  'h-5/6',
  'h-full',
]

const DEFAULT_DATA: AdminDashboardData = {
  navItems: [],
  metrics: [],
  activeUsersTrend: [],
  registrations: [],
}

export function useAdminDashboardData(): AdminDashboardData {
  return DEFAULT_DATA
}

export function AdminDashboardPage({
  data,
  language = 'en',
  dateRangeLabel,
  hasUnreadNotifications = false,
  verification,
}: AdminDashboardPageProps) {
  const fallbackData = useAdminDashboardData()
  const dashboardData = data ?? fallbackData
  const isRtl = language === 'ar'
  const [verificationCode, setVerificationCode] = useState<string[]>(
    Array.from({ length: verification?.codeLength ?? 6 }, () => ''),
  )
  const [verificationError, setVerificationError] = useState('')
  const [isVerified, setIsVerified] = useState(!verification?.isRequired)
  const shouldShowOverlay = verification?.isRequired === true && !isVerified

  const linePath = useMemo(
    () => buildLinePath(dashboardData.activeUsersTrend),
    [dashboardData.activeUsersTrend],
  )

  const handleCodeChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value.replace(/\D/g, '').slice(-1)
    const nextCode = [...verificationCode]
    nextCode[index] = nextValue
    setVerificationCode(nextCode)
    setVerificationError('')

    if (nextValue) {
      const nextInput = event.target
        .closest('form')
        ?.querySelector<HTMLInputElement>(`input[name="totp-${index + 1}"]`)
      nextInput?.focus()
    }
  }

  const handleCodeKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Backspace' || verificationCode[index]) {
      return
    }

    const previousInput = event.currentTarget
      .closest('form')
      ?.querySelector<HTMLInputElement>(`input[name="totp-${index - 1}"]`)
    previousInput?.focus()
  }

  const handleVerify = async () => {
    const code = verificationCode.join('')
    const expectedLength = verification?.codeLength ?? 6

    if (code.length !== expectedLength) {
      setVerificationError(verification?.errorMessage ?? TEXT.defaultVerificationError)
      return
    }

    const result = verification?.onVerify ? await verification.onVerify(code) : true
    if (result) {
      setIsVerified(true)
      return
    }

    setVerificationError(verification?.errorMessage ?? TEXT.defaultVerificationError)
  }

  return (
    <>
      {shouldShowOverlay ? (
        <VerificationOverlay
          code={verificationCode}
          error={verificationError}
          onChange={handleCodeChange}
          onKeyDown={handleCodeKeyDown}
          onVerify={handleVerify}
        />
      ) : null}

      <div
        className={`mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 transition duration-300 ${
          shouldShowOverlay ? 'pointer-events-none select-none blur-sm' : ''
        }`}
      >
        <div className="flex w-full flex-col gap-5">
          <MetricGrid metrics={dashboardData.metrics} />

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <LineChartCard copy={TEXT.activeUsersChart} path={linePath} />
            <BarChartCard copy={TEXT.registrationsChart} data={dashboardData.registrations} />
          </div>
        </div>
      </div>
    </>
  )
}

function VerificationOverlay({
  code,
  error,
  onChange,
  onKeyDown,
  onVerify,
}: {
  code: string[]
  error: string
  onChange: (index: number, event: ChangeEvent<HTMLInputElement>) => void
  onKeyDown: (index: number, event: KeyboardEvent<HTMLInputElement>) => void
  onVerify: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#213145]/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow-xl sm:p-8">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#e5eeff]">
          <Lock className="h-8 w-8 text-[#005c55]" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-semibold text-[#0b1c30]">{TEXT.verifyTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-[#3e4947]">{TEXT.verifyDescription}</p>

        <form
          className="mt-6"
          onSubmit={(event) => {
            event.preventDefault()
            void onVerify()
          }}
        >
          <div className="flex justify-center gap-2">
            {code.map((value, index) => (
              <input
                key={`totp-${index}`}
                name={`totp-${index}`}
                value={value}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                aria-label={`${TEXT.verificationDigitAriaLabel} ${index + 1}`}
                onChange={(event) => onChange(index, event)}
                onKeyDown={(event) => onKeyDown(index, event)}
                className={`h-12 w-10 rounded-lg border-2 bg-white text-center text-xl font-semibold text-[#0b1c30] outline-none transition focus:border-[#005c55] sm:h-14 sm:w-12 ${
                  error ? 'border-[#ba1a1a]' : 'border-[#bdc9c6]'
                }`}
              />
            ))}
          </div>

          {error ? <p className="mt-3 text-sm text-[#ba1a1a]">{error}</p> : null}

          <button
            type="submit"
            className="mt-6 flex w-full items-center justify-center rounded-lg bg-[#005c55] px-4 py-3 text-lg font-semibold text-white transition hover:bg-[#004943] focus:outline-none focus:ring-2 focus:ring-[#005c55] focus:ring-offset-2"
          >
            {TEXT.verifyButton}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[#3e4947]">
          <Phone className="h-4 w-4" aria-hidden="true" />
          <span>{TEXT.authenticatorHint}</span>
        </div>
      </div>
    </div>
  )
}

function Sidebar({
  currentUser,
  navItems,
}: {
  currentUser?: AdminDashboardUser
  navItems: AdminDashboardNavItem[]
}) {
  return (
    <aside className="flex w-full flex-col bg-[#1e293b] text-white shadow-lg lg:min-h-screen lg:w-64 lg:shrink-0">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded bg-[#005c55]">
          <Gauge className="h-5 w-5" aria-hidden="true" />
        </div>
        <span className="text-xl font-bold tracking-tight">{TEXT.brand}</span>
      </div>

      <nav className="flex gap-2 overflow-x-auto px-4 py-4 lg:flex-1 lg:flex-col lg:overflow-y-auto">
        {navItems.map((item) => {
          const Icon = ICONS[item.icon]

          return (
            <a
              key={item.id}
              href={item.href ?? '#'}
              className={`flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-sm transition sm:text-base ${
                item.isActive
                  ? 'bg-white/10 font-semibold text-white'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.label}</span>
            </a>
          )
        })}
      </nav>

      {currentUser ? (
        <div className="border-t border-white/10 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d3e4fe] text-lg font-semibold text-[#0b1c30]">
              {currentUser.initials}
            </div>
            <div className="min-w-0">
              <div className="truncate font-semibold text-white">{currentUser.name}</div>
              <div className="truncate text-xs font-medium uppercase tracking-wide text-white/50">
                {currentUser.accessLabel}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  )
}

function Header({
  dateRangeLabel,
  hasUnreadNotifications,
}: {
  dateRangeLabel?: string
  hasUnreadNotifications: boolean
}) {
  return (
    <header className="flex min-h-16 flex-col gap-3 border-b border-[#bdc9c6]/30 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-[#0b1c30]">{TEXT.pageTitle}</h1>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={TEXT.notificationsAriaLabel}
          className="relative rounded-full p-2 text-[#3e4947] transition hover:bg-[#e5eeff]"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {hasUnreadNotifications ? (
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#fea619]" />
          ) : null}
        </button>

        {dateRangeLabel ? (
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-[#bdc9c6] px-3 py-2 text-xs font-semibold text-[#0b1c30] transition hover:bg-[#e5eeff] sm:text-sm"
          >
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            <span>{dateRangeLabel}</span>
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </header>
  )
}

function MetricGrid({ metrics }: { metrics: AdminDashboardMetric[] }) {
  if (metrics.length === 0) {
    return (
      <div className="rounded-xl bg-white p-6 text-sm text-[#3e4947] shadow-sm">
        {TEXT.metricsEmpty}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = ICONS[metric.icon]
        const TrendIcon = metric.changeDirection === 'up' ? TrendingUp : TrendingDown
        const tone =
          metric.changeDirection === 'up'
            ? 'bg-[#007952]/10 text-[#005e3f]'
            : 'bg-[#ffdad6]/70 text-[#ba1a1a]'

        return (
          <article key={metric.id} className="rounded-xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#dce9ff]">
                <Icon className="h-5 w-5 text-[#005c55]" aria-hidden="true" />
              </div>
              <span className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold ${tone}`}>
                <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
                {metric.changeLabel}
              </span>
            </div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#3e4947]">
              {metric.label}
            </div>
            <div className="text-4xl font-bold text-[#0b1c30] sm:text-5xl">{metric.value}</div>
          </article>
        )
      })}
    </div>
  )
}

function LineChartCard({ copy, path }: { copy: AdminDashboardChartCopy; path: string }) {
  return (
    <article className="min-h-96 rounded-xl bg-white p-5 shadow-sm xl:col-span-2">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#0b1c30]">{copy.title}</h2>
          <p className="text-sm text-[#3e4947]">{copy.subtitle}</p>
        </div>
        <button
          type="button"
          aria-label={TEXT.chartOptionsAriaLabel}
          className="rounded-full p-2 text-[#3e4947] transition hover:bg-[#e5eeff]"
        >
          <MoreVertical className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {path ? (
        <div className="relative h-72 border-b border-l border-[#bdc9c6]/40">
          <svg className="h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d={`${path} L100,100 L0,100 Z`} fill="#005c5526" />
            <path d={path} fill="none" stroke="#005c55" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      ) : (
        <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-[#bdc9c6] text-sm text-[#3e4947]">
          {TEXT.trendEmpty}
        </div>
      )}
    </article>
  )
}

function BarChartCard({
  copy,
  data,
}: {
  copy: AdminDashboardChartCopy
  data: AdminDashboardBarPoint[]
}) {
  return (
    <article className="min-h-96 rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#0b1c30]">{copy.title}</h2>
        <p className="text-sm text-[#3e4947]">{copy.subtitle}</p>
      </div>

      {data.length > 0 ? (
        <>
          <div className="relative flex h-72 items-end justify-between gap-2 border-b border-[#bdc9c6]/40 pb-2">
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between border-l border-[#bdc9c6]/40">
              <div className="border-t border-[#bdc9c6]/20" />
              <div className="border-t border-[#bdc9c6]/20" />
              <div className="border-t border-[#bdc9c6]/20" />
              <div className="border-t border-[#bdc9c6]/20" />
            </div>
            {data.map((bar) => (
              <div
                key={bar.label}
                title={bar.label}
                className={`z-10 w-full rounded-t bg-[#005c55] transition hover:opacity-80 ${heightClassFor(
                  bar.value,
                )}`}
              />
            ))}
          </div>
          <div className="mt-3 flex justify-between gap-2 text-xs font-semibold text-[#3e4947]">
            {data.map((bar) => (
              <span key={bar.label}>{bar.label}</span>
            ))}
          </div>
        </>
      ) : (
        <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-[#bdc9c6] text-sm text-[#3e4947]">
          {TEXT.registrationsEmpty}
        </div>
      )}
    </article>
  )
}

function buildLinePath(points: AdminDashboardLinePoint[]) {
  if (points.length === 0) {
    return ''
  }

  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`)
    .join(' ')
}

function heightClassFor(value: number) {
  const normalizedValue = Math.max(0, Math.min(100, value))
  const bucket = Math.max(0, Math.ceil(normalizedValue / 10) - 1)
  return BAR_HEIGHT_CLASSES[bucket]
}

function AdminDashboardPageContainer() {
  const language = useSelector(selectLanguage)
  const [metrics, setMetrics] = useState<AdminDashboardMetric[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await api.get('/admin/users?limit=200')
        const users: any[] = res.data.users || []
        const now = new Date()
        const thisMonth = users.filter((u: any) => {
          const created = new Date(u.createdAt)
          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
        })
        const activeUsers = users.filter((u: any) => u.status === 'active')
        const suspendedUsers = users.filter((u: any) => u.status === 'suspended')
        setMetrics([
          { id: 'total', label: 'Total Users', value: String(users.length), icon: 'users' as const, changeLabel: `${thisMonth.length} this month`, changeDirection: 'up' as const },
          { id: 'active', label: 'Active Users', value: String(activeUsers.length), icon: 'userCheck' as const, changeLabel: `${Math.round((activeUsers.length / Math.max(users.length, 1)) * 100)}% active`, changeDirection: 'up' as const },
          { id: 'new', label: 'New This Month', value: String(thisMonth.length), icon: 'userPlus' as const, changeLabel: 'this month', changeDirection: thisMonth.length > 0 ? 'up' as const : 'down' as const },
          { id: 'suspended', label: 'Suspended', value: String(suspendedUsers.length), icon: 'lock' as const, changeLabel: suspendedUsers.length > 0 ? 'needs attention' : 'all clear', changeDirection: suspendedUsers.length > 0 ? 'down' as const : 'up' as const },
        ])
      } catch (err) {
        console.error('Admin data fetch failed:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAdminData()
  }, [])

  const navItems: AdminDashboardNavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: '/admin', isActive: true },
    { id: 'users', label: 'Users', icon: 'users', href: '/admin/users' },
    { id: 'categories', label: 'Categories', icon: 'categories', href: '/admin/categories' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications', href: '/notifications' },
  ]

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#005c55] border-t-transparent" />
      </div>
    )
  }

  return (
    <AdminDashboardPage
      language={language}
      data={{ navItems, metrics, activeUsersTrend: [], registrations: [] }}
    />
  )
}

export default AdminDashboardPageContainer
