import { create } from 'zustand'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
}

export interface ModalConfig {
  title: string
  content: React.ReactNode
  actions?: {
    label: string
    variant?: 'primary' | 'secondary' | 'danger'
    onClick: () => void
  }[]
}

interface UIState {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  modal: ModalConfig | null
  openModal: (config: ModalConfig) => void
  closeModal: () => void
}

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  modal: null,
  
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(7)
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }))
    
    // 3秒后自动消失
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }))
    }, 3000)
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },
  
  openModal: (config) => {
    set({ modal: config })
  },
  
  closeModal: () => {
    set({ modal: null })
  },
}))
