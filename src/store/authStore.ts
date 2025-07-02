import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { authenticateUser } from '@/lib/firebase'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  checkAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (username: string, password: string) => {
        set({ isLoading: true })
        try {
          const user = await authenticateUser(username, password)
          if (user) {
            set({ user, isAuthenticated: true, isLoading: false })
            return true
          } else {
            set({ isLoading: false })
            return false
          }
        } catch (error) {
          console.error('Login error:', error)
          set({ isLoading: false })
          return false
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },

      checkAuth: () => {
        const { user } = get()
        set({ isAuthenticated: !!user })
      }
    }),
    {
      name: 'mwenezi-auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
)