import axios from 'axios'
import { store, setSession, clearSession } from '../store'

// Create Axios instance pointing to the Express backend port
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Crucial for cookies or CORS credentials
})

// Request Interceptor: Attach bearer token if available in the Redux store
api.interceptors.request.use(
  (config) => {
    const state = store.getState()
    const token = state.auth.accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: In case of 401, attempt silent refresh
let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Check if the error is 401 Unauthorized and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const state = store.getState()
        const refreshToken = state.auth.refreshToken

        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        // Call token refresh endpoint
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refreshToken },
          { withCredentials: true }
        )

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data

        // Update Redux state
        store.dispatch(
          setSession({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken || refreshToken,
            user: state.auth.user, // Preserve user profile info
          })
        )

        processQueue(null, newAccessToken)
        isRefreshing = false

        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        isRefreshing = false

        // Clear session and redirect to login if refresh fails
        store.dispatch(clearSession())
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)
