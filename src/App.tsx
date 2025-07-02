import React, { useEffect, useState } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { LoginForm } from './components/LoginForm'
import { Layout } from './components/Layout'
import { SettingsModal } from './components/SettingsModal'
import { useAuthStore } from './store/authStore'
import { useDataStore } from './store/dataStore'
import { seedInitialData } from './lib/firebase'

// Import page components
import { AdminDashboard } from './components/pages/admin/AdminDashboard'
import { StudentDashboard } from './components/pages/student/StudentDashboard'
import { PaymentStatus } from './components/pages/student/PaymentStatus'
import { BursarPayments } from './components/pages/bursar/BursarPayments'

// Placeholder components for other routes
const AdminStudents = () => <div className="text-white">Manage Students - Coming Soon</div>
const AdminFinancialActivity = () => <div className="text-white">Financial Activity - Coming Soon</div>
const AdminConfig = () => <div className="text-white">Fee/Term Config - Coming Soon</div>
const AdminNotifications = () => <div className="text-white">Admin Notifications - Coming Soon</div>

const BursarAdjustments = () => <div className="text-white">Fee Adjustments - Coming Soon</div>
const BursarReconciliation = () => <div className="text-white">Daily Reconciliation - Coming Soon</div>

const StudentPayments = () => <div className="text-white">Payment History - Coming Soon</div>

function App() {
  const { isAuthenticated, user, checkAuth } = useAuthStore()
  const { subscribeToStudents, subscribeToTransactions, subscribeToConfig, subscribeToNotifications } = useDataStore()
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    checkAuth()
    seedInitialData()
  }, [checkAuth])

  useEffect(() => {
    if (isAuthenticated && user) {
      // Subscribe to real-time data
      const unsubscribeStudents = subscribeToStudents()
      const unsubscribeTransactions = subscribeToTransactions()
      const unsubscribeConfig = subscribeToConfig()
      const unsubscribeNotifications = subscribeToNotifications(user.id)

      return () => {
        unsubscribeStudents()
        unsubscribeTransactions()
        unsubscribeConfig()
        unsubscribeNotifications()
      }
    }
  }, [isAuthenticated, user, subscribeToStudents, subscribeToTransactions, subscribeToConfig, subscribeToNotifications])

  if (!isAuthenticated) {
    return (
      <>
        <LoginForm />
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#e2e8f0',
              border: '1px solid #475569'
            }
          }}
        />
      </>
    )
  }

  const getDefaultRoute = () => {
    switch (user?.role) {
      case 'admin':
        return '/admin/dashboard'
      case 'bursar':
        return '/bursar/payments'
      case 'student':
        return '/student/dashboard'
      default:
        return '/login'
    }
  }

  return (
    <Router>
      <Layout onSettingsClick={() => setSettingsOpen(true)}>
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
          
          {/* Admin routes */}
          {user?.role === 'admin' && (
            <>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/students" element={<AdminStudents />} />
              <Route path="/admin/financial-activity" element={<AdminFinancialActivity />} />
              <Route path="/admin/config" element={<AdminConfig />} />
              <Route path="/admin/notifications" element={<AdminNotifications />} />
            </>
          )}
          
          {/* Bursar routes */}
          {user?.role === 'bursar' && (
            <>
              <Route path="/bursar/payments" element={<BursarPayments />} />
              <Route path="/bursar/adjustments" element={<BursarAdjustments />} />
              <Route path="/bursar/reconciliation" element={<BursarReconciliation />} />
            </>
          )}
          
          {/* Student routes */}
          {user?.role === 'student' && (
            <>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/payments" element={<StudentPayments />} />
              <Route path="/student/payment-status" element={<PaymentStatus />} />
            </>
          )}
          
          {/* Catch all - redirect to role-based home */}
          <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
        </Routes>
      </Layout>
      
      <SettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
      
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#e2e8f0',
            border: '1px solid #475569'
          }
        }}
      />
    </Router>
  )
}

export default App