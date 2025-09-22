import { useState, useEffect, useRef, useCallback } from 'react'

interface PromptProps {
  isOpen: boolean
  title: string
  message: string
  placeholder?: string
  defaultValue?: string
  onClose: () => void
  onConfirm: (value: string) => void
  confirmText?: string
  cancelText?: string
}

export default function CustomPrompt({
  isOpen,
  title,
  message,
  placeholder = '',
  defaultValue = '',
  onClose,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel'
}: PromptProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [value, setValue] = useState(defaultValue)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setValue(defaultValue)
      // Focus input after animation
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 100)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200)
      return () => clearTimeout(timer)
    }
  }, [isOpen, defaultValue])

  if (!isVisible) return null

  const handleConfirm = () => {
    onConfirm(value.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm()
    } else if (e.key === 'Escape') {
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
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-semibold text-slate-900 mb-3 tracking-tight">
            {title}
          </h3>
          
          <p className="text-slate-600 leading-relaxed mb-6">
            {message}
          </p>
        </div>
        
        <div className="mb-8">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200 text-slate-900 placeholder-slate-400"
          />
        </div>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!value.trim()}
            className={`px-8 py-2.5 rounded-xl font-medium transition-all duration-200 ${
              value.trim()
                ? 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

// Hook para usar prompts de manera más fácil
export function useCustomPrompt() {
  const [prompt, setPrompt] = useState<{
    isOpen: boolean
    title: string
    message: string
    placeholder?: string
    defaultValue?: string
    onConfirm?: (value: string) => void
    confirmText?: string
    cancelText?: string
  }>({
    isOpen: false,
    title: '',
    message: ''
  })

  const resolveRef = useRef<((value: string | null) => void) | null>(null)

  const showPrompt = useCallback((
    title: string,
    message: string,
    options?: {
      placeholder?: string
      defaultValue?: string
      confirmText?: string
      cancelText?: string
    }
  ): Promise<string | null> => {
    console.log('CustomPrompt showPrompt called:', { title, message })
    return new Promise((resolve) => {
      resolveRef.current = resolve
      setPrompt({
        isOpen: true,
        title,
        message,
        ...options
      })
      console.log('CustomPrompt state set to open')
    })
  }, [])

  const hidePrompt = useCallback(() => {
    setPrompt(prev => ({ ...prev, isOpen: false }))
    if (resolveRef.current) {
      resolveRef.current(null)
      resolveRef.current = null
    }
  }, [])

  const handleConfirm = useCallback((value: string) => {
    setPrompt(prev => ({ ...prev, isOpen: false }))
    if (resolveRef.current) {
      resolveRef.current(value)
      resolveRef.current = null
    }
  }, [])

  const PromptComponent = useCallback(() => (
    <CustomPrompt
      {...prompt}
      onClose={hidePrompt}
      onConfirm={handleConfirm}
    />
  ), [prompt, hidePrompt, handleConfirm])

  return {
    showPrompt,
    hidePrompt,
    PromptComponent
  }
}