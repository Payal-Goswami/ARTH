import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { authApi } from '@/lib/api'

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { email: string; full_name: string; password: string; monthly_income?: number }) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const data = await authApi.login(email, password)
          localStorage.setItem('arth_access_token', data.access_token)
          set({ user: data.user, accessToken: data.access_token, isAuthenticated: true })
        } finally {
          set({ isLoading: false })
        }
      },

      register: async (formData) => {
        set({ isLoading: true })
        try {
          const data = await authApi.register(formData)
          localStorage.setItem('arth_access_token', data.access_token)
          set({ user: data.user, accessToken: data.access_token, isAuthenticated: true })
        } finally {
          set({ isLoading: false })
        }
      },

      logout: () => {
        localStorage.removeItem('arth_access_token')
        set({ user: null, accessToken: null, isAuthenticated: false })
      },

      fetchMe: async () => {
        try {
          const user = await authApi.me()
          set({ user, isAuthenticated: true })
        } catch {
          get().logout()
        }
      },
    }),
    {
      name: 'arth-auth',
      partialize: (state) => ({ accessToken: state.accessToken, user: state.user }),
    }
  )
)
