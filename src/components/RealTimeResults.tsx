import { useRealTimeVotes } from '@/hooks/useRealtime'
import { ScoringService, SquadScore, JudgeProgress } from '@/lib/scoring'
import { useState, useEffect } from 'react'

export default function RealTimeResults() {
  const { votes, loading, lastRefresh } = useRealTimeVotes()
  const [squadScores, setSquadScores] = useState<SquadScore[]>([])
  const [judgeProgress, setJudgeProgress] = useState<JudgeProgress[]>([])
  const [overallStats, setOverallStats] = useState<any>(null)

  useEffect(() => {
    if (votes.length >= 0) {
      const scores = ScoringService.calculateSquadScores(votes)
      const progress = ScoringService.calculateJudgeProgress(votes)
      const stats = ScoringService.getOverallStats(votes)
      
      setSquadScores(scores)
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
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">
            Datos en tiempo real • Actualizado: {lastRefresh?.toLocaleTimeString('es-ES')}
          </span>
        </div>
      </div>

      {/* Overall Stats */}
      {overallStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">{overallStats.totalVotes}</div>
            <div className="text-sm text-gray-600">Votos Totales</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">{overallStats.completionPercentage}%</div>
            <div className="text-sm text-gray-600">Progreso General</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-purple-600">{overallStats.completedJudges}</div>
            <div className="text-sm text-gray-600">Jueces Completos</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-orange-600">{overallStats.totalSquads}</div>
            <div className="text-sm text-gray-600">Equipos Totales</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Squad Rankings */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Ranking de Equipos</h3>
            <p className="text-sm text-gray-600">Ordenados por puntaje total</p>
          </div>
          <div className="p-4">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {squadScores.map((squad, index) => (
                <div key={squad.squadId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{squad.squadName}</div>
                      <div className="text-sm text-gray-600">
                        {squad.voteCount} votos • Promedio: {squad.averageScore.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {Math.round(squad.totalScore)}
                    </div>
                    <div className="text-xs text-gray-500">puntos</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Judge Progress */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Progreso de Jueces</h3>
            <p className="text-sm text-gray-600">Estado de votación por juez</p>
          </div>
          <div className="p-4">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {judgeProgress.map((judge) => (
                <div key={judge.judgeName} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium text-gray-900">{judge.judgeName}</div>
                    <div className="text-sm text-gray-600">
                      {judge.votedSquads}/{judge.totalSquads}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        judge.percentage === 100 ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${judge.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{judge.percentage}% completado</span>
                    {judge.lastVoteTime && (
                      <span className="text-xs text-gray-500">
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

      {/* Detailed Results Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Resultados Detallados</h3>
          <p className="text-sm text-gray-600">Puntajes y votos por equipo</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posición
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Equipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Puntaje Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Votos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Promedio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jueces que Votaron
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {squadScores.map((squad, index) => (
                <tr key={squad.squadId} className={index < 3 ? 'bg-yellow-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{squad.squadName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{Math.round(squad.totalScore)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{squad.voteCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{squad.averageScore.toFixed(1)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {squad.judgeVotes.map((vote, voteIndex) => (
                        <span
                          key={voteIndex}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
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