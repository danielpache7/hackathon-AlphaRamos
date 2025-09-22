'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { AuthService, User } from '@/lib/auth'
import { validateAccessCode } from '@/config/access-codes'
// Dynamic imports to avoid SSR issues
const JudgeInterface = dynamic(() => import('@/components/JudgeInterface'), { ssr: false })
const AdminInterface = dynamic(() => import('@/components/AdminInterface'), { ssr: false })
import ErrorBoundary from '@/components/ErrorBoundary'
import { ToastProvider, useToast } from '@/contexts/ToastContext'
import AuthModal from '@/components/AuthModal'

function HomeContent() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { success, error } = useToast()

  useEffect(() => {
    // Start authentication immediately
    startAuthentication()
  }, [])

  const startAuthentication = async () => {
    console.log('Starting authentication process...')
    
    // Check if user is already authenticated
    const currentUser = AuthService.getCurrentUser()
    console.log('Current user:', currentUser)
    
    if (currentUser) {
      console.log('User already authenticated, setting user')
      setUser(currentUser)
      setIsLoading(false)
      return
    }

    // Show auth modal
    console.log('No current user, showing auth modal')
    setShowAuthModal(true)
    setIsLoading(false) // Important: stop loading so modal can be rendered
  }

  const handleAuthSubmit = async (code: string) => {
    console.log('Auth submit with code:', code)
    setShowAuthModal(false)
    
    const accessCode = validateAccessCode(code.toUpperCase())
    
    if (!accessCode) {
      error('Código de acceso inválido. Por favor intenta de nuevo.', 'Autenticación Fallida')
      // Show modal again for retry
      setTimeout(() => setShowAuthModal(true), 1000)
      return
    }

    const user = {
      name: accessCode.name,
      role: accessCode.role,
      code: accessCode.code
    }

    AuthService.setCurrentUser(user)
    setUser(user)
    setIsLoading(false)
    success(`¡Bienvenido ${user.name}!`, 'Autenticación Exitosa')
  }

  const handleAuthClose = () => {
    console.log('Auth modal closed')
    setShowAuthModal(false)
    setIsLoading(false)
  }

  const handleLogout = () => {
    AuthService.logout()
    setUser(null)
    setIsLoading(true)
    // Restart authentication
    startAuthentication()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    )
  }

  if (!user && !showAuthModal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sistema de Votación Hackathon</h1>
          <p className="text-gray-600 mb-4">Acceso denegado</p>
          <button 
            onClick={() => startAuthentication()} 
            className="bg-slate-900 text-white px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-colors font-medium"
          >
            Intentar de Nuevo
          </button>
        </div>
      </div>
    )
  }

  if (!user && showAuthModal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <AuthModal
          isOpen={showAuthModal}
          onClose={handleAuthClose}
          onSubmit={handleAuthSubmit}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 space-y-3 sm:space-y-0">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-light text-slate-900 tracking-tight">
                Votación Hackathon
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {user?.name} • {user?.role === 'admin' ? 'Administrador' : 'Juez'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              Cambiar Usuario
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 lg:px-8 py-8 sm:py-12">
        <ErrorBoundary>
          {user && user.role === 'admin' ? (
            <AdminInterface user={user} />
          ) : user ? (
            <JudgeInterface user={user} />
          ) : null}
        </ErrorBoundary>
      </main>
      

    </div>
  )
}

export default function Home() {
  return (
    <ToastProvider>
      <HomeContent />
    </ToastProvider>
  )
}