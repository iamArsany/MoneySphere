import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import appReducer, { persistAppState } from './appSlice'

export interface AuthUser {
  id: string
  name: string
  role: string
  email?: string
  avatarUrl?: string
  initials?: string
  preferredCurrency?: string
  preferredLanguage?: string
  fullName?: string
  phone?: string
}

export interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
}

const AUTH_STORAGE_KEY = 'pft.auth'

function loadAuthState(): AuthState {
  if (typeof window === 'undefined') {
    return {
      accessToken: null,
      refreshToken: null,
      user: null,
    }
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) {
      return {
        accessToken: null,
        refreshToken: null,
        user: null,
      }
    }

    const parsed = JSON.parse(raw) as Partial<AuthState>
    return {
      accessToken: parsed.accessToken ?? null,
      refreshToken: parsed.refreshToken ?? null,
      user: parsed.user ?? null,
    }
  } catch {
    return {
      accessToken: null,
      refreshToken: null,
      user: null,
    }
  }
}

const initialAuthState: AuthState = loadAuthState()

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    setSession(_state, action: PayloadAction<AuthState>) {
      return action.payload
    },
    updateUser(state, action: PayloadAction<Partial<AuthUser> | null>) {
      if (!action.payload) {
        state.user = null
        return
      }

      state.user = {
        id: state.user?.id ?? '',
        name: state.user?.name ?? '',
        role: state.user?.role ?? 'user',
        email: state.user?.email,
        avatarUrl: state.user?.avatarUrl,
        initials: state.user?.initials,
        ...action.payload,
      }
    },
    clearSession() {
      return {
        accessToken: null,
        refreshToken: null,
        user: null,
      }
    },
  },
})

export const { setSession, updateUser, clearSession } = authSlice.actions

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    app: appReducer,
  },
})

if (typeof window !== 'undefined') {
  store.subscribe(() => {
    const state = store.getState()
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state.auth))
    persistAppState(state.app)
  })
}

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const selectAuthState = (state: RootState) => state.auth
export const selectLanguage = (state: RootState) => state.app.language
export { setLanguage } from './appSlice'

