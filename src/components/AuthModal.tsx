import { useState, useEffect, useRef } from 'react'

interface AuthModalProps {
  isOpen: boolean
  onSubmit: (code: string) => void
  onClose: () => void
}

export default function AuthModal({ isOpen, onSubmit, onClose }: AuthModalProps) {
  const [code, setCode] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setCode('')
      // Focus input after animation
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isVisible) return null

  const handleSubmit = () => {
    if (code.trim()) {
      onSubmit(code.trim().toUpperCase())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
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
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-light text-slate-900 mb-3 tracking-tight">
            Código de Acceso Requerido
          </h2>
          
          <p className="text-slate-600 leading-relaxed mb-8">
            Por favor ingresa tu código de acceso para continuar al sistema de votación.
          </p>
        </div>
        
        <div className="mb-8">
          <input
            ref={inputRef}
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ingresa tu código..."
            className="w-full px-4 py-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200 text-slate-900 placeholder-slate-400 text-center text-lg font-medium tracking-wider"
          />
        </div>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-3 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!code.trim()}
            className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 ${
              code.trim()
                ? 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Ingresar
          </button>
        </div>
      </div>
    </div>
  )
}