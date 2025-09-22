import { useState } from 'react'
import { useRealTimeVotingStatus, useRealTimeVotes } from '@/hooks/useRealtime'
import { DatabaseService } from '@/lib/database'
import { ScoringService } from '@/lib/scoring'
import { squads } from '@/config/squads'
import { useToast } from '@/contexts/ToastContext'

interface VotingControlsProps {
  onExportExcel: () => void
}

export default function VotingControls({ onExportExcel }: VotingControlsProps) {
  const { votingStatus, loading: statusLoading } = useRealTimeVotingStatus()
  const { votes, loading: votesLoading } = useRealTimeVotes()
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedVote, setSelectedVote] = useState<{judgeName: string, squadId: string} | null>(null)
  const { success, error } = useToast()

  const handleToggleVoting = async () => {
    const newStatus = votingStatus === 'OPEN' ? 'CLOSED' : 'OPEN'
    
    const confirmMessage = newStatus === 'CLOSED' 
      ? '¿Estás seguro de que quieres CERRAR la votación? Esto congelará todos los resultados.'
      : '¿Estás seguro de que quieres ABRIR la votación? Los jueces podrán votar nuevamente.'
    
    if (!confirm(confirmMessage)) return

    setIsUpdatingStatus(true)
    
    try {
      const result = await DatabaseService.setVotingStatus(newStatus)
      if (result) {
        success(`Votación ${newStatus === 'CLOSED' ? 'cerrada' : 'abierta'} exitosamente.`, 'Estado Actualizado')
      } else {
        error('Error al cambiar el estado de la votación.', 'Actualización Fallida')
      }
    } catch (err) {
      console.error('Error updating voting status:', err)
      error('Error al cambiar el estado de la votación.', 'Actualización Fallida')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleDeleteVote = async (judgeName: string, squadId: string) => {
    setSelectedVote({ judgeName, squadId })
    setShowDeleteModal(true)
  }

  const confirmDeleteVote = async () => {
    if (!selectedVote) return

    try {
      const result = await DatabaseService.deleteVote(selectedVote.judgeName, selectedVote.squadId)
      if (result) {
        success('Voto eliminado exitosamente. El juez podrá votar nuevamente.', 'Voto Eliminado')
      } else {
        error('Error al eliminar el voto.', 'Eliminación Fallida')
      }
    } catch (err) {
      console.error('Error deleting vote:', err)
      error('Error al eliminar el voto.', 'Eliminación Fallida')
    } finally {
      setShowDeleteModal(false)
      setSelectedVote(null)
    }
  }

  const getWinners = () => {
    if (votingStatus !== 'CLOSED' || votes.length === 0) return []
    
    const squadScores = ScoringService.calculateSquadScores(votes)
    return squadScores.slice(0, 3) // Top 3
  }

  const winners = getWinners()

  if (statusLoading || votesLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">Cargando controles...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Main Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Controles de Votación</h3>
            <div className="flex items-center space-x-3">
              <span className="text-slate-600">Estado actual:</span>
              <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium ${
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
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleToggleVoting}
              disabled={isUpdatingStatus}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                votingStatus === 'OPEN'
                  ? 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg'
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
              onClick={onExportExcel}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all duration-200 font-medium hover:shadow-lg"
            >
              Exportar Excel
            </button>
          </div>
        </div>
      </div>

      {/* Winners Display (only when voting is closed) */}
      {votingStatus === 'CLOSED' && winners.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-3xl p-8">
          <h3 className="text-2xl font-light text-slate-900 mb-8 text-center tracking-tight">
            🏆 Ganadores del Hackathon 🏆
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {winners.map((winner, index) => (
              <div
                key={winner.squadId}
                className={`text-center p-6 rounded-2xl transition-all duration-200 ${
                  index === 0 ? 'bg-gradient-to-br from-amber-100 to-yellow-100 border-2 border-amber-300 shadow-lg' :
                  index === 1 ? 'bg-gradient-to-br from-slate-100 to-gray-100 border-2 border-slate-300 shadow-md' :
                  'bg-gradient-to-br from-orange-100 to-red-100 border-2 border-orange-300 shadow-md'
                }`}
              >
                <div className="text-5xl mb-4">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </div>
                <div className="font-semibold text-lg text-slate-900 mb-2">{winner.squadName}</div>
                <div className="text-slate-600 font-medium">
                  {Math.round(winner.totalScore)} puntos
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  {winner.voteCount} votos
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vote Management */}
      <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
        <div className="p-6 border-b border-slate-200/60">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Gestión de Votos</h3>
          <p className="text-slate-600">Elimina votos individuales para permitir re-votación</p>
        </div>
        <div className="p-6">
          {votes.length === 0 ? (
            <div className="text-center text-slate-500 py-12">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-lg font-medium mb-2">Aún no hay votos</p>
              <p className="text-sm">Los votos aparecerán aquí una vez que los jueces empiecen a votar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Juez
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Equipo
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Puntaje
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {votes.slice(0, 10).map((vote) => {
                    const squadName = squads.find((s) => s.id === vote.squad_id)?.name || vote.squad_id
                    const totalScore = ScoringService.calculateWeightedScore(vote.scores)
                    
                    return (
                      <tr key={`${vote.judge_name}-${vote.squad_id}`} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                          {vote.judge_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {squadName}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                          {Math.round(totalScore)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(vote.created_at).toLocaleString('es-ES')}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDeleteVote(vote.judge_name, vote.squad_id)}
                            className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {votes.length > 10 && (
                <div className="text-center text-sm text-slate-500 mt-6 pt-4 border-t border-slate-100">
                  Mostrando los primeros 10 votos de {votes.length} en total
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedVote && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Confirmar Eliminación</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              ¿Estás seguro de que quieres eliminar el voto de <strong>{selectedVote.judgeName}</strong> para el equipo <strong>{selectedVote.squadId}</strong>?
            </p>
            <p className="text-sm text-slate-500 mb-8">
              Esto permitirá que el juez vote nuevamente por este equipo.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-2.5 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteVote}
                className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
              >
                Eliminar Voto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}