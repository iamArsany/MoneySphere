import type { ComponentType } from 'react'
import { Navigate, Outlet, RouterProvider, createBrowserRouter, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectAuthState, type RootState } from '../store'
import { AppLayout } from '../components/layout/AppLayout'

type LazyPageModule = { default: ComponentType<any> }

const lazyPage = (loader: () => Promise<LazyPageModule>) => async () => {
  const module = await loader()
  return { Component: module.default }
}

function decodeJwtPayload(token: string): { exp?: number } | null {
  const parts = token.split('.')
  if (parts.length < 2) {
    return null
  }

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    return JSON.parse(atob(padded)) as { exp?: number }
  } catch {
    return null
  }
}

function isJwtValid(token: string | null | undefined) {
  if (!token) {
    return false
  }

  const payload = decodeJwtPayload(token)
  if (!payload?.exp) {
    return true
  }

  return payload.exp * 1000 > Date.now()
}

function useAuthState() {
  return useSelector((state: RootState) => selectAuthState(state))
}

export function ProtectedRoute() {
  const auth = useAuthState()
  const location = useLocation()
  const isAuthenticated = import.meta.env.DEV || isJwtValid(auth.accessToken)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export function AdminRoute() {
  const auth = useAuthState()
  const location = useLocation()
  const isAuthenticated = import.meta.env.DEV || isJwtValid(auth.accessToken)
  const isAdmin = import.meta.env.DEV || auth.user?.role === 'admin'

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

function NotFoundRoute() {
  return <Navigate to="/" replace />
}

export const router = createBrowserRouter([
  {
    path: '/',
    lazy: lazyPage(() => import('../features/dashboard/LandingPage')),
  },
  {
    path: '/login',
    lazy: lazyPage(() => import('../features/auth/LoginPage')),
  },
  {
    path: '/register',
    lazy: lazyPage(() => import('../features/auth/RegisterPage')),
  },
  {
    path: '/register/phone-otp',
    lazy: lazyPage(() => import('../features/auth/RegisterOtpPage')),
  },
  {
    path: '/forgot-password',
    lazy: lazyPage(() => import('../features/auth/ForgotPasswordPage')),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: '/dashboard',
            lazy: lazyPage(() => import('../features/dashboard/DashboardPage')),
          },
          {
            path: '/accounts',
            lazy: lazyPage(() => import('../features/accounts/AccountsPage')),
          },
          {
            path: '/accounts/:accountId',
            lazy: lazyPage(() => import('../features/accounts/AccountDetailPage')),
          },
          {
            path: '/transactions',
            lazy: lazyPage(() => import('../features/transactions/TransactionsPage')),
          },
          {
            path: '/transactions/recurring',
            lazy: lazyPage(() => import('../features/transactions/RecurringPage')),
          },
          {
            path: '/budgets',
            lazy: lazyPage(() => import('../features/budgets/BudgetsPage')),
          },
          {
            path: '/notifications',
            lazy: lazyPage(() => import('../features/notifications/NotificationsPage')),
          },
          {
            path: '/profile-settings',
            lazy: lazyPage(() => import('../features/auth/ProfileSettingsPage')),
          },
          {
            path: '/reports',
            lazy: lazyPage(() => import('../features/reports/ReportsPage')),
          },
          {
            path: '/reports/preview',
            lazy: lazyPage(() => import('../features/reports/ReportPreviewPage')),
          },
        ],
      },
    ],
  },
  {
    element: <AdminRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: '/admin',
            lazy: lazyPage(() => import('../features/admin/AdminDashboardPage')),
          },
          {
            path: '/admin/users',
            lazy: lazyPage(() => import('../features/admin/AdminUsersPage')),
          },
          {
            path: '/admin/categories',
            lazy: lazyPage(() => import('../features/admin/AdminCategoriesPage')),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundRoute />,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
