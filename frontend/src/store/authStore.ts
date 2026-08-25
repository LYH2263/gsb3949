import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../services/api'

export interface User {
  id: number
  username: string
  email: string
  full_name?: string
  is_active: boolean
  created_at: string
}

interface AuthState {
  // State
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  setUser: (user: User | null) => void
  setTokens: (token: string, refreshToken: string) => void
  login: (username: string, password: string) => Promise<void>
  register: (data: { username: string; email: string; password: string; full_name?: string }) => Promise<void>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      // Actions
      setUser: (user) => set({ user }),
      
      setTokens: (token, refreshToken) => set({ 
        token, 
        refreshToken,
        isAuthenticated: true 
      }),
      
      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authApi.login({ username, password })
          set({
            token: response.access_token,
            refreshToken: response.refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed'
          set({ 
            isLoading: false, 
            error: message,
            isAuthenticated: false,
            token: null,
            refreshToken: null,
          })
          throw error
        }
      },
      
      register: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authApi.register(data)
          // Auto-login after registration
          const loginResponse = await authApi.login({
            username: data.username,
            password: data.password,
          })
          set({
            user: response,
            token: loginResponse.access_token,
            refreshToken: loginResponse.refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Registration failed'
          set({ 
            isLoading: false, 
            error: message,
          })
          throw error
        }
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        })
      },
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token, 
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
