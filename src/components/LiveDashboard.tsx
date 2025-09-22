import { useRealTimeVotes, useRealTimeVotingStatus } from '@/hooks/useRealtime'
import { ScoringService, CategoryRanking } from '@/lib/scoring'
import { DatabaseService } from '@/lib/database'
import { useState, useEffect } from 'react'
import { useToast } from '@/contexts/ToastContext'
import WinnersDisplay from './WinnersDisplay'

export default function LiveDashboard() {
  const { votes, loading, lastRefresh, refreshVotes } = useRealTimeVotes()
  const { votingStatus, loading: statusLoading } = useRealTimeVotingStatus()
  const [categoryRankings, setCategoryRankings] = useState<CategoryRanking[]>([])
  const [overallStats, setOverallStats] = useState<{
    totalVotes: number;
    completionPercentage: number;
    completedJudges: number;
    totalSquads: number;
  } | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const { success, error } = useToast()

  useEffect(() => {
    if (votes.length >= 0) {
      const categories = ScoringService.calculateCategoryRankings(votes)
      const stats = ScoringService.getOverallStats(votes)
      
      setCategoryRankings(categories)
      setOverallStats(stats)
    }
  }, [votes])

  useEffect(() => {
    const interval = setInterval(() => {
      refreshVotes()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [refreshVotes])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const handleToggleVoting = async () => {
    const newStatus = votingStatus === 'OPEN' ? 'CLOSED' : 'OPEN'
    
    if (!confirm(`¿Cambiar votación a ${newStatus === 'CLOSED' ? 'CERRADA' : 'ABIERTA'}?`)) return

    setIsUpdatingStatus(true)
    
    try {
      const result = await DatabaseService.setVotingStatus(newStatus)
      if (result) {
        success(`Votación ${newStatus === 'CLOSED' ? 'cerrada' : 'abierta'} exitosamente.`)
      } else {
        error('Error al cambiar el estado de la votación.')
      }
    } catch (err) {
      error('Error al cambiar el estado de la votación.')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  if (loading || statusLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-xl sm:text-2xl text-slate-600">Cargando dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-2 sm:p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-slate-900 tracking-tight">
              Dashboard en Vivo
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-2 text-sm sm:text-base">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-slate-600">
                  Actualizado: {lastRefresh?.toLocaleTimeString('es-ES')}
                </span>
              </div>
              <span className="hidden sm:inline text-slate-400">•</span>
              <span className="text-slate-500">Auto-refresh cada 30 segundos</span>
              <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                votingStatus === 'OPEN' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  votingStatus === 'OPEN' ? 'bg-emerald-500' : 'bg-red-500'
                }`}></div>
                <span>{votingStatus === 'OPEN' ? 'Abierta' : 'Cerrada'}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={() => window.close() || (window.location.href = '/')}
            className="px-3 sm:px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm sm:text-base"
          >
            ✕ Cerrar
          </button>
          <button
            onClick={handleToggleVoting}
            disabled={isUpdatingStatus}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              votingStatus === 'OPEN'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            } ${isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isUpdatingStatus 
              ? 'Actualizando...' 
              : votingStatus === 'OPEN' 
                ? 'Cerrar Votación' 
                : 'Abrir Votación'
            }
          </button>
          <button
            onClick={refreshVotes}
            disabled={loading}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              loading
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button
            onClick={toggleFullscreen}
            className="px-3 sm:px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm sm:text-base"
          >
            {isFullscreen ? 'Salir Pantalla Completa' : 'Pantalla Completa'}
          </button>
        </div>
      </div>

      {/* Winners Display (only when voting is closed) */}
      {votingStatus === 'CLOSED' && categoryRankings.length > 0 && (
        <WinnersDisplay categoryRankings={categoryRankings} />
      )}

      {/* Stats Overview */}
      {overallStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/60 p-3 sm:p-6 text-center">
            <div className="text-2xl sm:text-4xl font-light text-slate-900 mb-1 sm:mb-2">{overallStats.totalVotes}</div>
            <div className="text-xs sm:text-sm text-slate-500 font-medium">Total Votos</div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/60 p-3 sm:p-6 text-center">
            <div className="text-2xl sm:text-4xl font-light text-slate-900 mb-1 sm:mb-2">{overallStats.completionPercentage}%</div>
            <div className="text-xs sm:text-sm text-slate-500 font-medium">Progreso</div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/60 p-3 sm:p-6 text-center">
            <div className="text-2xl sm:text-4xl font-light text-slate-900 mb-1 sm:mb-2">{overallStats.completedJudges}</div>
            <div className="text-xs sm:text-sm text-slate-500 font-medium">Jueces Completados</div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/60 p-3 sm:p-6 text-center">
            <div className="text-2xl sm:text-4xl font-light text-slate-900 mb-1 sm:mb-2">{overallStats.totalSquads}</div>
            <div className="text-xs sm:text-sm text-slate-500 font-medium">Total Equipos</div>
          </div>
        </div>
      )}

      {/* Category Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        {categoryRankings.map((category) => (
          <div key={category.category} className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/60 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-200/60">
              <div className="flex items-center space-x-3">
                <span className="text-2xl sm:text-3xl">{category.icon}</span>
                <h2 className="text-lg sm:text-2xl font-semibold text-slate-900">{category.categoryName}</h2>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {category.topThree.map((squad, index) => (
                  <div key={squad.squadId} className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-xl">
                    <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                      <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center text-sm sm:text-lg font-bold flex-shrink-0 ${
                        index === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-lg' :
                        index === 1 ? 'bg-gradient-to-br from-slate-400 to-gray-500 text-white shadow-md' :
                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-md' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm sm:text-lg font-semibold text-slate-900 truncate">{squad.squadName}</div>
                        <div className="text-xs sm:text-sm text-slate-500">
                          {squad.voteCount} votos • Promedio: {squad.averageScore.toFixed(1)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg sm:text-2xl font-light text-slate-900">
                        {Math.round(squad.totalScore)}
                      </div>
                      <div className="text-xs sm:text-sm text-slate-500">puntos</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}