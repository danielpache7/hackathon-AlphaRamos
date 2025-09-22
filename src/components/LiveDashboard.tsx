import { useRealTimeVotes } from '@/hooks/useRealtime'
import { ScoringService, CategoryRanking } from '@/lib/scoring'
import { useState, useEffect } from 'react'

export default function LiveDashboard() {
  const { votes, loading, lastRefresh, refreshVotes } = useRealTimeVotes()
  const [categoryRankings, setCategoryRankings] = useState<CategoryRanking[]>([])
  const [overallStats, setOverallStats] = useState<{
    totalVotes: number;
    completionPercentage: number;
    completedJudges: number;
    totalSquads: number;
  } | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-2xl text-slate-600">Cargando dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-light text-slate-900 tracking-tight">
            Dashboard en Vivo
          </h1>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-slate-600">
                Actualizado: {lastRefresh?.toLocaleTimeString('es-ES')}
              </span>
            </div>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">Auto-refresh cada 30 segundos</span>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => window.close() || (window.location.href = '/')}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            ✕ Cerrar
          </button>
          <button
            onClick={refreshVotes}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              loading
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button
            onClick={toggleFullscreen}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            {isFullscreen ? 'Salir Pantalla Completa' : 'Pantalla Completa'}
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {overallStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 text-center">
            <div className="text-4xl font-light text-slate-900 mb-2">{overallStats.totalVotes}</div>
            <div className="text-slate-500 font-medium">Total Votos</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 text-center">
            <div className="text-4xl font-light text-slate-900 mb-2">{overallStats.completionPercentage}%</div>
            <div className="text-slate-500 font-medium">Progreso</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 text-center">
            <div className="text-4xl font-light text-slate-900 mb-2">{overallStats.completedJudges}</div>
            <div className="text-slate-500 font-medium">Jueces Completados</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 text-center">
            <div className="text-4xl font-light text-slate-900 mb-2">{overallStats.totalSquads}</div>
            <div className="text-slate-500 font-medium">Total Equipos</div>
          </div>
        </div>
      )}

      {/* Category Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {categoryRankings.map((category) => (
          <div key={category.category} className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
            <div className="p-6 border-b border-slate-200/60">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{category.icon}</span>
                <h2 className="text-2xl font-semibold text-slate-900">{category.categoryName}</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {category.topThree.map((squad, index) => (
                  <div key={squad.squadId} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                        index === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-lg' :
                        index === 1 ? 'bg-gradient-to-br from-slate-400 to-gray-500 text-white shadow-md' :
                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-md' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-slate-900">{squad.squadName}</div>
                        <div className="text-sm text-slate-500">
                          {squad.voteCount} votos • Promedio: {squad.averageScore.toFixed(1)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-light text-slate-900">
                        {Math.round(squad.totalScore)}
                      </div>
                      <div className="text-sm text-slate-500">puntos</div>
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