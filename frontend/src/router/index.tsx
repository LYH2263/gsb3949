import { createBrowserRouter, Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import AppLayout from '../components/layout/AppLayout'
import HomePage from '../pages/HomePage'
import LabWorkbenchPage from '../pages/LabWorkbenchPage'
import RecordsPage from '../pages/RecordsPage'
import KnowledgePage from '../pages/KnowledgePage'
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// Wrapper component to combine layout with Outlet
function LayoutWrapper() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LayoutWrapper />,
    children: [
      { index: true, element: <HomePage /> },
      { 
        path: 'lab/:experimentId', 
        element: (
          <ProtectedRoute>
            <LabWorkbenchPage />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'records', 
        element: (
          <ProtectedRoute>
            <RecordsPage />
          </ProtectedRoute>
        ) 
      },
      { path: 'knowledge/:experimentId?', element: <KnowledgePage /> },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
])
