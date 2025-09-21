'use client'

import { useEffect, useState } from 'react'
import { AuthService, User } from '@/lib/auth'
import JudgeInterface from '@/components/JudgeInterface'
import AdminInterface from '@/components/AdminInterface'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    const currentUser = AuthService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    } else {
      // Prompt for authentication
      const authenticatedUser = AuthService.authenticate()
      if (authenticatedUser) {
        setUser(authenticatedUser)
      }
    }
    setIsLoading(false)
  }, [])

  const handleLogout = () => {
    AuthService.logout()
    setUser(null)
    // Re-authenticate
    const authenticatedUser = AuthService.authenticate()
    if (authenticatedUser) {
      setUser(authenticatedUser)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sistema de Votación Hackathon</h1>
          <p className="text-gray-600 mb-4">Acceso denegado</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 space-y-2 sm:space-y-0">
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Sistema de Votación Hackathon</h1>
              <p className="text-xs sm:text-sm text-gray-600">
                Bienvenido, <span className="font-medium">{user.name}</span> ({user.role === 'admin' ? 'Administrador' : 'Juez'})
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-2 sm:px-4 rounded hover:bg-red-600 text-xs sm:text-sm whitespace-nowrap"
            >
              Cambiar Usuario
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <ErrorBoundary>
          {user.role === 'admin' ? (
            <AdminInterface user={user} />
          ) : (
            <JudgeInterface user={user} />
          )}
        </ErrorBoundary>
      </main>
    </div>
  )
}