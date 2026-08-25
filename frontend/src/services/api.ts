import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '../store/authStore'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = useAuthStore.getState().refreshToken
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          })
          
          const { access_token, refresh_token } = response.data
          useAuthStore.getState().setTokens(access_token, refresh_token)
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`
          }
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  register: async (data: { username: string; email: string; password: string; full_name?: string }) => {
    const response = await apiClient.post('/auth/register', data)
    return response.data
  },
  
  login: async (data: { username: string; password: string }) => {
    const response = await apiClient.post('/auth/login', data)
    return response.data
  },
  
  refresh: async (refreshToken: string) => {
    const response = await apiClient.post('/auth/refresh', { refresh_token: refreshToken })
    return response.data
  },
}

// User API
export const userApi = {
  getMe: async () => {
    const response = await apiClient.get('/users/me')
    return response.data
  },
  
  updateMe: async (data: { full_name?: string; email?: string }) => {
    const response = await apiClient.put('/users/me', data)
    return response.data
  },
  
  deleteMe: async () => {
    await apiClient.delete('/users/me')
  },
}

// Experiment API
export const experimentApi = {
  create: async (data: { experiment_type: string; title: string; total_steps: number }) => {
    const response = await apiClient.post('/experiments/', data)
    return response.data
  },
  
  list: async (params?: { skip?: number; limit?: number; status?: string }) => {
    const response = await apiClient.get('/experiments/', { params })
    return response.data
  },
  
  get: async (id: number) => {
    const response = await apiClient.get(`/experiments/${id}`)
    return response.data
  },
  
  update: async (id: number, data: { status?: string; steps_completed?: number; data?: Record<string, unknown>; notes?: string }) => {
    const response = await apiClient.put(`/experiments/${id}`, data)
    return response.data
  },
  
  delete: async (id: number) => {
    await apiClient.delete(`/experiments/${id}`)
  },
  
  addStep: async (experimentId: number, data: {
    step_number: number
    step_name: string
    description?: string
    instruments_used?: string[]
    reagents_used?: Array<{ name: string; amount?: string }>
    observations?: string
  }) => {
    const response = await apiClient.post(`/experiments/${experimentId}/steps`, data)
    return response.data
  },
}
