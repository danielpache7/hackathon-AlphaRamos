import React, { createContext, useContext, useCallback, useState, useEffect } from 'react'

interface ToastContextType {
  showToast: (message: string, options?: {
    title?: string
    type?: 'info' | 'success' | 'warning' | 'error'
    duration?: number
  }) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  warning: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

interface ToastData {
  id: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  duration?: number
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const showToast = useCallback((
    message: string,
    options?: {
      title?: string
      type?: 'info' | 'success' | 'warning' | 'error'
      duration?: number
    }
  ) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastData = {
      id,
      message,
      type: options?.type || 'info',
      title: options?.title,
      duration: options?.duration || 4000
    }

    setToasts(prev => [...prev, newToast])

    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, newToast.duration)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const success = useCallback((message: string, title?: string) => {
    showToast(message, { type: 'success', title })
  }, [showToast])

  const error = useCallback((message: string, title?: string) => {
    showToast(message, { type: 'error', title })
  }, [showToast])

  const warning = useCallback((message: string, title?: string) => {
    showToast(message, { type: 'warning', title })
  }, [showToast])

  const info = useCallback((message: string, title?: string) => {
    showToast(message, { type: 'info', title })
  }, [showToast])

  const value = {
    showToast,
    success,
    error,
    warning,
    info
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      {isMounted && (
        <ToastContainer toasts={toasts} onClose={removeToast} />
      )}
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, onClose }: { toasts: ToastData[], onClose: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={onClose}
        />
      ))}
    </div>
  )
}

function Toast({ id, message, type = 'info', title, onClose }: ToastData & { onClose: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onClose(id)
    }, 300)
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      case 'warning':
        return (
          <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01" />
            </svg>
          </div>
        )
      case 'error':
        return (
          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01" />
            </svg>
          </div>
        )
    }
  }

  const getBorderColor = () => {
    switch (type) {
      case 'success': return 'border-l-emerald-500'
      case 'warning': return 'border-l-amber-500'
      case 'error': return 'border-l-red-500'
      default: return 'border-l-blue-500'
    }
  }

  return (
    <div className={`
      transform transition-all duration-300 ease-out mb-3 pointer-events-auto
      ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <div className={`
        bg-white rounded-xl shadow-lg border-l-4 ${getBorderColor()}
        p-4 max-w-sm w-full backdrop-blur-sm
        hover:shadow-xl transition-shadow duration-200
      `}>
        <div className="flex items-start space-x-3">
          {getIcon()}
          
          <div className="flex-1 min-w-0">
            {title && (
              <p className="text-sm font-semibold text-slate-900 mb-1">
                {title}
              </p>
            )}
            <p className="text-sm text-slate-700 leading-relaxed">
              {message}
            </p>
          </div>
          
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}