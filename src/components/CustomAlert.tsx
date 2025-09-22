import { useState, useEffect, useCallback } from 'react'

interface AlertProps {
  isOpen: boolean
  title?: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  onClose: () => void
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
}

export default function CustomAlert({
  isOpen,
  title,
  message,
  type = 'info',
  onClose,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel'
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isVisible) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      case 'warning':
        return (
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        )
      case 'error':
        return (
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
    }
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    } else {
      onClose()
    }
  }

  return (
    <div className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200 ${
      isOpen ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className={`bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl transform transition-all duration-200 ${
        isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      }`}>
        <div className="text-center">
          {getIcon()}
          
          {title && (
            <h3 className="text-xl font-semibold text-slate-900 mb-3 tracking-tight">
              {title}
            </h3>
          )}
          
          <p className="text-slate-600 leading-relaxed mb-8">
            {message}
          </p>
          
          <div className="flex justify-center space-x-4">
            {onConfirm && (
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors font-medium"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={handleConfirm}
              className={`px-8 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                type === 'error' 
                  ? 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg'
                  : type === 'warning'
                  ? 'bg-amber-600 text-white hover:bg-amber-700 hover:shadow-lg'
                  : type === 'success'
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg'
                  : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook para usar alerts de manera más fácil
export function useCustomAlert() {
  const [alert, setAlert] = useState<{
    isOpen: boolean
    title?: string
    message: string
    type?: 'info' | 'success' | 'warning' | 'error'
    onConfirm?: () => void
    confirmText?: string
    cancelText?: string
  }>({
    isOpen: false,
    message: ''
  })

  const showAlert = useCallback((
    message: string,
    options?: {
      title?: string
      type?: 'info' | 'success' | 'warning' | 'error'
      onConfirm?: () => void
      confirmText?: string
      cancelText?: string
    }
  ) => {
    setAlert({
      isOpen: true,
      message,
      ...options
    })
  }, [])

  const hideAlert = useCallback(() => {
    setAlert(prev => ({ ...prev, isOpen: false }))
  }, [])

  const AlertComponent = useCallback(() => (
    <CustomAlert
      {...alert}
      onClose={hideAlert}
    />
  ), [alert, hideAlert])

  return {
    showAlert,
    hideAlert,
    AlertComponent
  }
}