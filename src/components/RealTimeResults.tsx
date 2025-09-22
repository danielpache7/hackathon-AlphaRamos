import { useRealTimeVotes } from '@/hooks/useRealtime'
import { ScoringService, SquadScore, JudgeProgress, CategoryRanking } from '@/lib/scoring'
import { useState, useEffect } from 'react'

export default function RealTimeResults() {
  const { votes, loading, lastRefresh } = useRealTimeVotes()
  const [squadScores, setSquadScores] = useState<SquadScore[]>([])
  const [categoryRankings, setCategoryRankings] = useState<CategoryRanking[]>([])
  const [judgeProgress, setJudgeProgress] = useState<JudgeProgress[]>([])
  const [overallStats, setOverallStats] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'categories' | 'overall'>('categories')

  useEffect(() => {
    if (votes.length >= 0) {
      const scores = ScoringService.calculateSquadScores(votes)
      const categories = ScoringService.calculateCategoryRankings(votes)
      const progress = ScoringService.calculateJudgeProgress(votes)
      const stats = ScoringService.getOverallStats(votes)
      
      setSquadScores(scores)
      setCategoryRankings(categories)
      setJudgeProgress(progress)
      setOverallStats(stats)
    }
  }, [votes])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-gray-600">Cargando resultados...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Refresh Indicator */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-slate-600 font-medium">
            Datos en tiempo real • Actualizado: {lastRefresh?.toLocaleTimeString('es-ES')}
          </span>
        </div>
      </div>

      {/* Overall Stats */}
      {overallStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 text-center">
            <div className="text-3xl font-light text-slate-900 mb-2">{overallStats.totalVotes}</div>
            <div className="text-sm text-slate-500 font-medium">Total Votos</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 text-center">
            <div className="text-3xl font-light text-slate-900 mb-2">{overallStats.completionPercentage}%</div>
            <div className="text-sm text-slate-500 font-medium">Progreso General</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 text-center">
            <div className="text-3xl font-light text-slate-900 mb-2">{overallStats.completedJudges}</div>
            <div className="text-sm text-slate-500 font-medium">Jueces Completados</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 text-center">
            <div className="text-3xl font-light text-slate-900 mb-2">{overallStats.totalSquads}</div>
            <div className="text-sm text-slate-500 font-medium">Total Equipos</div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'categories'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Por Categorías
        </button>
        <button
          onClick={() => setActiveTab('overall')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'overall'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Ranking General
        </button>
      </div>

      {activeTab === 'categories' ? (
        /* Category Rankings */
        <div className="space-y-8">
          {categoryRankings.map((category) => (
            <div key={category.category} className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
              <div className="p-6 border-b border-slate-200/60">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{category.icon}</span>
                  <h3 className="text-xl font-semibold text-slate-900">{category.categoryName}</h3>
                </div>
                <p className="text-slate-600">Top equipos en esta categoría</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {category.squads.slice(0, 5).map((squad, index) => (
                    <div key={squad.squadId} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-lg' :
                          index === 1 ? 'bg-gradient-to-br from-slate-400 to-gray-500 text-white shadow-md' :
                          index === 2 ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-md' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{squad.squadName}</div>
                          <div className="text-sm text-slate-500">
                            {squad.voteCount} votos • Promedio: {squad.averageScore.toFixed(1)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-light text-slate-900">
                          {Math.round(squad.totalScore)}
                        </div>
                        <div className="text-xs text-slate-500">puntos</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Overall Squad Rankings */}
          <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
            <div className="p-6 border-b border-slate-200/60">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Ranking General</h3>
              <p className="text-slate-600">Todos los equipos ordenados por puntuación total</p>
            </div>
            <div className="p-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {squadScores.map((squad, index) => (
                  <div key={squad.squadId} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-lg' :
                        index === 1 ? 'bg-gradient-to-br from-slate-400 to-gray-500 text-white shadow-md' :
                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-md' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{squad.squadName}</div>
                        <div className="text-sm text-slate-500">
                          {squad.voteCount} votos • Promedio: {squad.averageScore.toFixed(1)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-light text-slate-900">
                        {Math.round(squad.totalScore)}
                      </div>
                      <div className="text-xs text-slate-500">puntos</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Judge Progress */}
          <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
            <div className="p-6 border-b border-slate-200/60">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Progreso de Jueces</h3>
              <p className="text-slate-600">Estado de votación por juez</p>
            </div>
            <div className="p-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {judgeProgress.map((judge) => (
                  <div key={judge.judgeName} className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex justify-between items-center mb-3">
                      <div className="font-semibold text-slate-900">{judge.judgeName}</div>
                      <div className="text-sm text-slate-600 font-medium">
                        {judge.votedSquads}/{judge.totalSquads}
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          judge.percentage === 100 
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
                            : 'bg-gradient-to-r from-slate-900 to-slate-700'
                        }`}
                        style={{ width: `${judge.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 font-medium">{judge.percentage}% completado</span>
                      {judge.lastVoteTime && (
                        <span className="text-xs text-slate-500">
                          Último voto: {new Date(judge.lastVoteTime).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
        <div className="p-6 border-b border-slate-200/60">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Resultados Detallados</h3>
          <p className="text-slate-600">Puntuaciones y votos por equipo</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Posición
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Equipo
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Categoría
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Puntuación Total
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Votos
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Promedio
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Jueces que Votaron
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {squadScores.map((squad, index) => (
                <tr key={squad.squadId} className={`hover:bg-slate-50 transition-colors ${index < 3 ? 'bg-amber-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-lg' :
                      index === 1 ? 'bg-gradient-to-br from-slate-400 to-gray-500 text-white shadow-md' :
                      index === 2 ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-md' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-slate-900">{squad.squadName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      squad.category === 'innovation' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {squad.category === 'innovation' ? '💡 Innovación' : '📣 Comercial'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-900">{Math.round(squad.totalScore)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700">{squad.voteCount}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700">{squad.averageScore.toFixed(1)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {squad.judgeVotes.map((vote, voteIndex) => (
                        <span
                          key={voteIndex}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-slate-100 text-slate-700 font-medium"
                          title={`${vote.judgeName}: ${Math.round(vote.score)} puntos`}
                        >
                          {vote.judgeName.split(' ')[0]}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}