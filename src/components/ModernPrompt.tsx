import { useState, useEffect, useRef } from 'react'

interface PromptProps {
  isOpen: boolean
  title?: string
  message: string
  placeholder?: string
  onClose: () => void
  onSubmit: (value: string) => void
  onCancel?: () => void
}

export default function ModernPrompt({
  isOpen,
  title = 'Entrada Requerida',
  message,
  placeholder = '',
  onClose,
  onSubmit,
  onCancel
}: PromptProps) {
  const [value, setValue] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setValue('')
      // Focus input after animation
      setTimeout(() => {
        inputRef.current?.focus()
      }, 200)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onSubmit(value.trim())
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (!isVisible) return null

  return (
    <div 
      className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCancel()
        }
      }}
    >
      <div className={`bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl transform transition-all duration-200 ${
        isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      }`}>
        <div className="text-center mb-6">
          {/* Icon */}
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-900 placeholder-slate-400"
              autoComplete="off"
            />
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!value.trim()}
              className={`px-8 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                value.trim()
                  ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Hook para usar prompts modernos
export function useModernPrompt() {
  const [prompt, setPrompt] = useState<{
    isOpen: boolean
    title?: string
    message: string
    placeholder?: string
    resolve?: (value: string | null) => void
  }>({
    isOpen: false,
    message: ''
  })

  const showPrompt = (
    message: string,
    options?: {
      title?: string
      placeholder?: string
    }
  ): Promise<string | null> => {
    return new Promise((resolve) => {
      setPrompt({
        isOpen: true,
        message,
        title: options?.title,
        placeholder: options?.placeholder,
        resolve
      })
    })
  }

  const hidePrompt = (value: string | null = null) => {
    if (prompt.resolve) {
      prompt.resolve(value)
    }
    setPrompt(prev => ({ ...prev, isOpen: false, resolve: undefined }))
  }

  const PromptComponent = () => (
    <ModernPrompt
      isOpen={prompt.isOpen}
      title={prompt.title}
      message={prompt.message}
      placeholder={prompt.placeholder}
      onClose={() => hidePrompt(null)}
      onSubmit={(value) => hidePrompt(value)}
      onCancel={() => hidePrompt(null)}
    />
  )

  return {
    showPrompt,
    PromptComponent
  }
}