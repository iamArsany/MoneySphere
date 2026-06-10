import { useSelector } from 'react-redux'
import { selectLanguage } from '../../store'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import {
  Ban,
  Download,
  Eye,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  PlayCircle,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export type AdminUsersLanguage = 'en' | 'ar'
export type AdminUserStatus = 'active' | 'suspended' | 'unverified'
export type AuditActionTone = 'default' | 'success' | 'warning' | 'danger'

export interface AdminUsersNavItem {
  id: string
  label: string
  icon: AdminUsersIconName
  href?: string
  isActive?: boolean
}

export interface AdminManagedUser {
  id: string
  initials: string
  name: string
  email: string
  registrationDate: string
  lastLogin: string
  status: AdminUserStatus
}

export interface AdminAuditLogEntry {
  id: string
  timestampUtc: string
  adminUser: string
  action: string
  actionTone?: AuditActionTone
  affectedEntity: string
  entityId: string
  ipAddress: string
}

export interface AdminUsersPageData {
  navItems: AdminUsersNavItem[]
  users: AdminManagedUser[]
  auditLog: AdminAuditLogEntry[]
}

export interface AdminUsersTextContent {
  brand: string
  mobileMenuLabel: string
  pageTitle: string
  pageSubtitle: string
  searchPlaceholder: string
  registeredUsersTitle: string
  inviteAdmin: string
  userColumn: string
  registrationDateColumn: string
  lastLoginColumn: string
  statusColumn: string
  actionsColumn: string
  viewDetails: string
  suspendUser: string
  reactivateUser: string
  deleteUser: string
  auditLogTitle: string
  immutableBadge: string
  exportLog: string
  timestampColumn: string
  adminUserColumn: string
  actionColumn: string
  affectedEntityColumn: string
  entityIdColumn: string
  ipAddressColumn: string
  suspendDialogTitle: string
  suspendDialogDescription: string
  suspensionReasonLabel: string
  suspensionReasonPlaceholder: string
  cancel: string
  confirmSuspension: string
  emptyUsers: string
  emptyAuditLog: string
  activeStatus: string
  suspendedStatus: string
  unverifiedStatus: string
}

export interface AdminUsersPageProps {
  data?: AdminUsersPageData
  language?: AdminUsersLanguage
  text?: Partial<AdminUsersTextContent>
  searchValue?: string
  isSuspending?: boolean
  onSearchChange?: (value: string) => void
  onInviteAdmin?: () => void
  onViewUser?: (user: AdminManagedUser) => void
  onSuspendUser?: (user: AdminManagedUser, reason: string) => void
  onReactivateUser?: (user: AdminManagedUser) => void
  onDeleteUser?: (user: AdminManagedUser) => void
  onExportAuditLog?: () => void
}

interface SidebarProps {
  navItems: AdminUsersNavItem[]
  text: AdminUsersTextContent
}

interface PageHeaderProps {
  text: AdminUsersTextContent
  searchValue: string
  onSearchChange?: (value: string) => void
}

interface UsersSectionProps {
  users: AdminManagedUser[]
  text: AdminUsersTextContent
  onInviteAdmin?: () => void
  onViewUser?: (user: AdminManagedUser) => void
  onSuspendRequest: (user: AdminManagedUser) => void
  onReactivateUser?: (user: AdminManagedUser) => void
  onDeleteUser?: (user: AdminManagedUser) => void
}

interface UserStatusBadgeProps {
  status: AdminUserStatus
  text: AdminUsersTextContent
}

interface AuditLogSectionProps {
  entries: AdminAuditLogEntry[]
  text: AdminUsersTextContent
  onExportAuditLog?: () => void
}

interface SuspendDialogProps {
  user: AdminManagedUser
  text: AdminUsersTextContent
  isSuspending: boolean
  onCancel: () => void
  onConfirm?: (user: AdminManagedUser, reason: string) => void
}

type AdminUsersIconName = 'dashboard' | 'settings' | 'shield' | 'users' | 'logout'

const TEXT: AdminUsersTextContent = {
  brand: 'PFT Admin',
  mobileMenuLabel: 'Open admin menu',
  pageTitle: 'User Management',
  pageSubtitle: 'Manage platform access and review system activity.',
  searchPlaceholder: 'Search users or logs...',
  registeredUsersTitle: 'Registered Users',
  inviteAdmin: 'Invite Admin',
  userColumn: 'User',
  registrationDateColumn: 'Registration Date',
  lastLoginColumn: 'Last Login',
  statusColumn: 'Status',
  actionsColumn: 'Actions',
  viewDetails: 'View Details',
  suspendUser: 'Suspend User',
  reactivateUser: 'Reactivate User',
  deleteUser: 'Delete User',
  auditLogTitle: 'System Audit Log',
  immutableBadge: 'Immutable - Read Only',
  exportLog: 'Export Log',
  timestampColumn: 'Timestamp (UTC)',
  adminUserColumn: 'Admin User',
  actionColumn: 'Action',
  affectedEntityColumn: 'Affected Entity',
  entityIdColumn: 'Entity ID',
  ipAddressColumn: 'IP Address',
  suspendDialogTitle: 'Suspend User Account',
  suspendDialogDescription:
    'This user will immediately lose access to their PFT dashboard and API integrations.',
  suspensionReasonLabel: 'Reason for suspension',
  suspensionReasonPlaceholder: 'Enter suspension reason...',
  cancel: 'Cancel',
  confirmSuspension: 'Confirm Suspension',
  emptyUsers: 'No registered users found.',
  emptyAuditLog: 'No audit log entries found.',
  activeStatus: 'Active',
  suspendedStatus: 'Suspended',
  unverifiedStatus: 'Unverified',
}

const DEFAULT_DATA: AdminUsersPageData = {
  navItems: [],
  users: [],
  auditLog: [],
}

const ICONS: Record<AdminUsersIconName, LucideIcon> = {
  dashboard: LayoutDashboard,
  settings: Settings,
  shield: ShieldCheck,
  users: Users,
  logout: LogOut,
}

export function useAdminUsersPageData(): AdminUsersPageData {
  return DEFAULT_DATA
}

export function AdminUsersPage({
  data,
  language = 'en',
  text,
  searchValue = '',
  isSuspending = false,
  onSearchChange,
  onInviteAdmin,
  onViewUser,
  onSuspendUser,
  onReactivateUser,
  onDeleteUser,
  onExportAuditLog,
}: AdminUsersPageProps) {
  const fallbackData = useAdminUsersPageData()
  const pageData = data ?? fallbackData
  const pageText = { ...TEXT, ...text }
  const [suspendTarget, setSuspendTarget] = useState<AdminManagedUser | null>(null)

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          text={pageText}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
        />

        <div className="flex w-full flex-col gap-8 mt-6">
          <UsersSection
            users={pageData.users}
            text={pageText}
            onInviteAdmin={onInviteAdmin}
            onViewUser={onViewUser}
            onSuspendRequest={setSuspendTarget}
            onReactivateUser={onReactivateUser}
            onDeleteUser={onDeleteUser}
          />

          <AuditLogSection
            entries={pageData.auditLog}
            text={pageText}
            onExportAuditLog={onExportAuditLog}
          />
        </div>
      </div>

      {suspendTarget ? (
        <SuspendDialog
          user={suspendTarget}
          text={pageText}
          isSuspending={isSuspending}
          onCancel={() => setSuspendTarget(null)}
          onConfirm={(user, reason) => {
            onSuspendUser?.(user, reason)
            setSuspendTarget(null)
          }}
        />
      ) : null}
    </>
  )
}

function Sidebar({ navItems, text }: SidebarProps) {
  return (
    <>
      <aside className="hidden min-h-screen w-64 shrink-0 flex-col bg-[#1e293b] text-white md:flex">
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
          <ShieldCheck className="h-7 w-7 text-[#9cf2e8]" aria-hidden="true" />
          <span className="text-2xl font-bold">{text.brand}</span>
        </div>

        <nav className="flex flex-1 flex-col gap-2 px-3 py-4">
          {navItems.map((item) => {
            const Icon = ICONS[item.icon]

            return (
              <a
                key={item.id}
                href={item.href ?? '#'}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base transition ${
                  item.isActive
                    ? 'border-s-4 border-[#9cf2e8] bg-[#0f766e] font-semibold text-[#a3faef]'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </a>
            )
          })}
        </nav>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between bg-[#1e293b] px-4 py-4 text-white md:hidden">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-[#9cf2e8]" aria-hidden="true" />
          <span className="text-xl font-bold">{text.brand}</span>
        </div>
        <button
          type="button"
          aria-label={text.mobileMenuLabel}
          className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>
    </>
  )
}

function PageHeader({ text, searchValue, onSearchChange }: PageHeaderProps) {
  return (
    <header className="border-b border-[#bdc9c6] bg-[#f8f9ff] px-4 py-5 shadow-sm sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#0b1c30]">{text.pageTitle}</h1>
          <p className="mt-1 text-sm text-[#3e4947]">{text.pageSubtitle}</p>
        </div>

        <label className="relative w-full md:w-72">
          <span className="sr-only">{text.searchPlaceholder}</span>
          <Search
            className="pointer-events-none absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6e7977]"
            aria-hidden="true"
          />
          <input
            value={searchValue}
            type="search"
            placeholder={text.searchPlaceholder}
            onChange={(event) => onSearchChange?.(event.target.value)}
            className="w-full rounded-lg border border-[#bdc9c6] bg-white py-3 pe-4 ps-11 text-sm text-[#0b1c30] outline-none transition placeholder:text-[#6e7977] focus:border-[#005c55] focus:ring-1 focus:ring-[#005c55]"
          />
        </label>
      </div>
    </header>
  )
}

function UsersSection({
  users,
  text,
  onInviteAdmin,
  onViewUser,
  onSuspendRequest,
  onReactivateUser,
  onDeleteUser,
}: UsersSectionProps) {
  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-[#bdc9c6]/40">
      <div className="flex flex-col gap-3 border-b border-[#bdc9c6] bg-[#f8f9ff] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <h2 className="text-xl font-semibold text-[#0b1c30]">{text.registeredUsersTitle}</h2>
        <button
          type="button"
          onClick={onInviteAdmin}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#855300] px-4 py-3 text-xs font-semibold uppercase text-white transition hover:bg-[#653e00] focus:outline-none focus:ring-2 focus:ring-[#855300] focus:ring-offset-2"
        >
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          {text.inviteAdmin}
        </button>
      </div>

      {users.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-start">
            <thead>
              <tr className="border-b border-[#bdc9c6] bg-[#eff4ff]/60">
                <TableHeader>{text.userColumn}</TableHeader>
                <TableHeader>{text.registrationDateColumn}</TableHeader>
                <TableHeader>{text.lastLoginColumn}</TableHeader>
                <TableHeader>{text.statusColumn}</TableHeader>
                <TableHeader align="end">{text.actionsColumn}</TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bdc9c6]/50">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className={`transition hover:bg-[#eff4ff]/50 ${
                    user.status === 'suspended' ? 'bg-[#ffdad6]/20' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#dce9ff] text-lg font-semibold text-[#005c55]">
                        {user.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium text-[#0b1c30]">{user.name}</div>
                        <div className="truncate text-sm text-[#3e4947]">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <TableCell>{user.registrationDate}</TableCell>
                  <TableCell muted={user.lastLogin.toLowerCase() === 'never'}>{user.lastLogin}</TableCell>
                  <td className="px-6 py-4">
                    <UserStatusBadge status={user.status} text={text} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      <IconButton label={text.viewDetails} icon={Eye} onClick={() => onViewUser?.(user)} />
                      {user.status === 'suspended' ? (
                        <IconButton
                          label={text.reactivateUser}
                          icon={PlayCircle}
                          tone="success"
                          onClick={() => onReactivateUser?.(user)}
                        />
                      ) : user.status === 'active' ? (
                        <IconButton
                          label={text.suspendUser}
                          icon={Ban}
                          tone="warning"
                          onClick={() => onSuspendRequest(user)}
                        />
                      ) : null}
                      <IconButton
                        label={text.deleteUser}
                        icon={Trash2}
                        tone="danger"
                        onClick={() => onDeleteUser?.(user)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState message={text.emptyUsers} />
      )}
    </section>
  )
}

function UserStatusBadge({ status, text }: UserStatusBadgeProps) {
  const statusMap: Record<AdminUserStatus, { label: string; classes: string; dot: string }> = {
    active: {
      label: text.activeStatus,
      classes: 'bg-[#d3e4fe] text-[#005c55]',
      dot: 'bg-[#4edea3]',
    },
    suspended: {
      label: text.suspendedStatus,
      classes: 'bg-[#ffdad6] text-[#93000a]',
      dot: 'bg-[#ba1a1a]',
    },
    unverified: {
      label: text.unverifiedStatus,
      classes: 'bg-[#e5eeff] text-[#3e4947]',
      dot: 'bg-[#6e7977]',
    },
  }
  const item = statusMap[status]

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase ${item.classes}`}>
      <span className={`h-2 w-2 rounded-full ${item.dot}`} />
      {item.label}
    </span>
  )
}

function AuditLogSection({ entries, text, onExportAuditLog }: AuditLogSectionProps) {
  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-[#bdc9c6]/40">
      <div className="flex flex-col gap-3 border-b border-[#bdc9c6] bg-[#f8f9ff] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold text-[#0b1c30]">{text.auditLogTitle}</h2>
          <span className="inline-flex items-center gap-1 rounded border border-[#6e7977]/30 bg-[#eff4ff] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#3e4947]">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            {text.immutableBadge}
          </span>
        </div>
        <button
          type="button"
          aria-label={text.exportLog}
          onClick={onExportAuditLog}
          className="self-start rounded-lg p-2 text-[#3e4947] transition hover:bg-[#e5eeff] hover:text-[#005c55] sm:self-auto"
        >
          <Download className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {entries.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-start text-sm">
            <thead>
              <tr className="border-b border-[#bdc9c6] bg-[#eff4ff]/60">
                <TableHeader>{text.timestampColumn}</TableHeader>
                <TableHeader>{text.adminUserColumn}</TableHeader>
                <TableHeader>{text.actionColumn}</TableHeader>
                <TableHeader>{text.affectedEntityColumn}</TableHeader>
                <TableHeader>{text.entityIdColumn}</TableHeader>
                <TableHeader>{text.ipAddressColumn}</TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bdc9c6]/50 font-mono text-xs">
              {entries.map((entry) => (
                <tr key={entry.id} className="transition hover:bg-[#eff4ff]/50">
                  <TableCell>{entry.timestampUtc}</TableCell>
                  <TableCell strong>{entry.adminUser}</TableCell>
                  <td className="px-6 py-4">
                    <ActionBadge action={entry.action} tone={entry.actionTone ?? 'default'} />
                  </td>
                  <TableCell>{entry.affectedEntity}</TableCell>
                  <TableCell strong accent>{entry.entityId}</TableCell>
                  <TableCell>{entry.ipAddress}</TableCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState message={text.emptyAuditLog} />
      )}
    </section>
  )
}

function SuspendDialog({
  user,
  text,
  isSuspending,
  onCancel,
  onConfirm,
}: SuspendDialogProps) {
  const [reason, setReason] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onConfirm?.(user, reason.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1c30]/50 p-4 backdrop-blur-sm">
      <form
        className="flex w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-xl"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center gap-3 border-b border-[#bdc9c6] p-6">
          <ShieldAlert className="h-8 w-8 text-[#ba1a1a]" aria-hidden="true" />
          <h3 className="text-2xl font-semibold text-[#0b1c30]">{text.suspendDialogTitle}</h3>
        </div>

        <div className="p-6">
          <p className="text-base leading-6 text-[#3e4947]">
            <strong className="font-semibold text-[#0b1c30]">{user.name}</strong>
            <span> ({user.email}) </span>
            {text.suspendDialogDescription}
          </p>

          <label className="mt-5 flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase text-[#0b1c30]">
              {text.suspensionReasonLabel}
            </span>
            <textarea
              value={reason}
              required
              placeholder={text.suspensionReasonPlaceholder}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setReason(event.target.value)}
              className="h-28 resize-none rounded-lg border border-[#bdc9c6] bg-white p-3 text-sm text-[#0b1c30] outline-none transition placeholder:text-[#6e7977] focus:border-[#ba1a1a] focus:ring-1 focus:ring-[#ba1a1a]"
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-[#bdc9c6] bg-[#f8f9ff] p-6">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#6e7977] px-5 py-3 text-xs font-semibold uppercase text-[#0b1c30] transition hover:bg-[#e5eeff]"
          >
            {text.cancel}
          </button>
          <button
            type="submit"
            disabled={isSuspending}
            className="rounded-lg bg-[#ba1a1a] px-5 py-3 text-xs font-semibold uppercase text-white transition hover:bg-[#93000a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {text.confirmSuspension}
          </button>
        </div>
      </form>
    </div>
  )
}

function TableHeader({
  children,
  align = 'start',
}: {
  children: string
  align?: 'start' | 'end'
}) {
  const alignClass = align === 'end' ? 'text-end' : 'text-start'

  return (
    <th
      className={`px-6 py-3 text-xs font-semibold uppercase text-[#3e4947] ${alignClass}`}
      scope="col"
    >
      {children}
    </th>
  )
}

function TableCell({
  children,
  muted = false,
  strong = false,
  accent = false,
}: {
  children: string
  muted?: boolean
  strong?: boolean
  accent?: boolean
}) {
  return (
    <td
      className={`px-6 py-4 text-sm ${
        accent ? 'text-[#005c55]' : muted ? 'text-[#6e7977]' : strong ? 'text-[#0b1c30]' : 'text-[#3e4947]'
      } ${strong ? 'font-medium' : ''}`}
    >
      {children}
    </td>
  )
}

function ActionBadge({ action, tone }: { action: string; tone: AuditActionTone }) {
  const toneClasses: Record<AuditActionTone, string> = {
    default: 'bg-[#005c55]/10 text-[#005c55]',
    success: 'bg-[#005e3f]/10 text-[#005e3f]',
    warning: 'bg-[#fea619]/20 text-[#684000]',
    danger: 'bg-[#ba1a1a]/10 text-[#ba1a1a]',
  }

  return (
    <span className={`inline-flex rounded px-2 py-1 font-semibold ${toneClasses[tone]}`}>
      {action}
    </span>
  )
}

function IconButton({
  label,
  icon: Icon,
  tone = 'default',
  onClick,
}: {
  label: string
  icon: LucideIcon
  tone?: AuditActionTone
  onClick?: () => void
}) {
  const toneClasses: Record<AuditActionTone, string> = {
    default: 'hover:text-[#005c55]',
    success: 'hover:text-[#005e3f]',
    warning: 'hover:text-[#855300]',
    danger: 'hover:text-[#ba1a1a]',
  }

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`rounded-lg p-2 text-[#3e4947] transition hover:bg-[#eff4ff] ${toneClasses[tone]}`}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </button>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-8 text-center text-sm text-[#3e4947]">
      {message}
    </div>
  )
}

function AdminUsersPageContainer() {
  const language = useSelector(selectLanguage)
  const navigate = useNavigate()
  const fallbackData = useAdminUsersPageData()

  const navItems: AdminUsersNavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: '/admin' },
    { id: 'users', label: 'Users', icon: 'users', href: '/admin/users', isActive: true },
    { id: 'settings', label: 'Settings', icon: 'settings', href: '/profile-settings' },
    { id: 'logout', label: 'Logout', icon: 'logout', href: '/login' },
  ]

  return (
    <AdminUsersPage
      language={language}
      data={{ ...fallbackData, navItems }}
      onInviteAdmin={() => alert('Invite Admin – backend not connected yet')}
      onExportAuditLog={() => alert('Export Log – backend not connected yet')}
    />
  )
}

export default AdminUsersPageContainer
