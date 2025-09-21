interface VotingProgressProps {
  totalSquads: number
  votedSquads: number
  lastRefresh?: Date
}

export default function VotingProgress({ totalSquads, votedSquads, lastRefresh }: VotingProgressProps) {
  const percentage = Math.round((votedSquads / totalSquads) * 100)
  
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-700">Progreso de Votación</h3>
          {lastRefresh && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">En vivo</span>
            </div>
          )}
        </div>
        <span className="text-sm text-gray-600">
          {votedSquads} de {totalSquads} equipos
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-500">
          {percentage}% completado
        </span>
        {votedSquads === totalSquads && (
          <span className="text-xs text-green-600 font-medium">
            ✓ Votación completa
          </span>
        )}
      </div>
    </div>
  )
}