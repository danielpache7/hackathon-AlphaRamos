interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  onConfirm: () => void
  onCancel: () => void
  type?: 'warning' | 'danger'
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText,
  onConfirm,
  onCancel,
  type = 'warning'
}: ConfirmModalProps) {
  if (!isOpen) return null

  const iconColor = type === 'danger' ? 'text-red-600' : 'text-yellow-600'
  const bgColor = type === 'danger' ? 'bg-red-100' : 'bg-yellow-100'
  const buttonColor = type === 'danger' 
    ? 'bg-red-600 hover:bg-red-700' 
    : 'bg-yellow-600 hover:bg-yellow-700'

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className={`w-12 h-12 ${bgColor} rounded-full flex items-center justify-center mb-4 mx-auto`}>
            <svg className={`w-6 h-6 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-semibold text-slate-900 mb-3 tracking-tight">
            {title}
          </h3>
          
          <p className="text-slate-600 leading-relaxed mb-6">
            {message}
          </p>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`px-8 py-2.5 rounded-xl font-medium transition-all duration-200 text-white ${buttonColor} hover:shadow-lg`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}