interface VotingProgressProps {
  totalSquads: number
  votedSquads: number
  lastRefresh?: Date
}

export default function VotingProgress({ totalSquads, votedSquads, lastRefresh }: VotingProgressProps) {
  const percentage = Math.round((votedSquads / totalSquads) * 100)
  
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-slate-900">Tu Progreso</h3>
          {lastRefresh && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-400 font-medium">En Vivo</span>
            </div>
          )}
        </div>
        <span className="text-sm text-slate-600 font-medium">
          {votedSquads} de {totalSquads} equipos
        </span>
      </div>
      
      <div className="w-full bg-slate-100 rounded-full h-3 mb-3">
        <div 
          className="bg-gradient-to-r from-slate-900 to-slate-700 h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-sm text-slate-500">
          {percentage}% completado
        </span>
        {votedSquads === totalSquads && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-sm text-emerald-700 font-medium">
              ¡Todo listo!
            </span>
          </div>
        )}
      </div>
    </div>
  )
}