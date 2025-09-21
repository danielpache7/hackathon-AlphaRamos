interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export default function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin`}></div>
      {text && (
        <p className={`mt-2 text-gray-600 ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'}`}>
          {text}
        </p>
      )}
    </div>
  )
}

export function LoadingCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 ${className}`}>
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  )
}

export function LoadingTable({ rows = 5, cols = 4 }: { rows?: number, cols?: number }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="animate-pulse">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-3 border-b">
          <div className="flex space-x-4">
            {Array.from({ length: cols }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded flex-1"></div>
            ))}
          </div>
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4 border-b border-gray-200">
            <div className="flex space-x-4">
              {Array.from({ length: cols }).map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-gray-200 rounded flex-1"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}