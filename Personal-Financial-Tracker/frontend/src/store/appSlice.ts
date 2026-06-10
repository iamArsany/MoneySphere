import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type AppLanguage = 'en' | 'ar'

export interface AppState {
  language: AppLanguage
}

const APP_STORAGE_KEY = 'pft.app'

function loadAppState(): AppState {
  if (typeof window === 'undefined') {
    return { language: 'en' }
  }

  try {
    const raw = window.localStorage.getItem(APP_STORAGE_KEY)
    if (!raw) return { language: 'en' }

    const parsed = JSON.parse(raw) as Partial<AppState>
    return {
      language: parsed.language === 'ar' ? 'ar' : 'en',
    }
  } catch {
    return { language: 'en' }
  }
}

const initialAppState: AppState = loadAppState()

const appSlice = createSlice({
  name: 'app',
  initialState: initialAppState,
  reducers: {
    setLanguage(state, action: PayloadAction<AppLanguage>) {
      state.language = action.payload
    },
  },
})

export const { setLanguage } = appSlice.actions
export default appSlice.reducer

export function persistAppState(state: AppState) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(state))
  }
}
