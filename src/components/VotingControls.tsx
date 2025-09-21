import { useState } from 'react'
import { useRealTimeVotingStatus, useRealTimeVotes } from '@/hooks/useRealtime'
import { DatabaseService } from '@/lib/database'
import { ScoringService } from '@/lib/scoring'

interface VotingControlsProps {
  onExportExcel: () => void
}

export default function VotingControls({ onExportExcel }: VotingControlsProps) {
  const { votingStatus, loading: statusLoading } = useRealTimeVotingStatus()
  const { votes, loading: votesLoading } = useRealTimeVotes()
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedVote, setSelectedVote] = useState<{judgeName: string, squadId: string} | null>(null)

  const handleToggleVoting = async () => {
    const newStatus = votingStatus === 'OPEN' ? 'CLOSED' : 'OPEN'
    
    const confirmMessage = newStatus === 'CLOSED' 
      ? '¿Estás seguro de que quieres CERRAR la votación? Esto congelará todos los resultados.'
      : '¿Estás seguro de que quieres ABRIR la votación? Los jueces podrán votar nuevamente.'
    
    if (!confirm(confirmMessage)) return

    setIsUpdatingStatus(true)
    
    try {
      const success = await DatabaseService.setVotingStatus(newStatus)
      if (success) {
        alert(`Votación ${newStatus === 'CLOSED' ? 'cerrada' : 'abierta'} exitosamente.`)
      } else {
        alert('Error al cambiar el estado de la votación.')
      }
    } catch (error) {
      console.error('Error updating voting status:', error)
      alert('Error al cambiar el estado de la votación.')
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
      const success = await DatabaseService.deleteVote(selectedVote.judgeName, selectedVote.squadId)
      if (success) {
        alert('Voto eliminado exitosamente. El juez podrá votar nuevamente.')
      } else {
        alert('Error al eliminar el voto.')
      }
    } catch (error) {
      console.error('Error deleting vote:', error)
      alert('Error al eliminar el voto.')
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
    <div className="space-y-6">
      {/* Main Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Controles de Votación</h3>
            <p className="text-sm text-gray-600">
              Estado actual: 
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                votingStatus === 'OPEN' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {votingStatus === 'OPEN' ? '🟢 Abierta' : '🔴 Cerrada'}
              </span>
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleToggleVoting}
              disabled={isUpdatingStatus}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                votingStatus === 'OPEN'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              📊 Exportar Excel
            </button>
          </div>
        </div>
      </div>

      {/* Winners Display (only when voting is closed) */}
      {votingStatus === 'CLOSED' && winners.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            🏆 Ganadores del Hackathon 🏆
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {winners.map((winner, index) => (
              <div
                key={winner.squadId}
                className={`text-center p-4 rounded-lg ${
                  index === 0 ? 'bg-yellow-100 border-2 border-yellow-400' :
                  index === 1 ? 'bg-gray-100 border-2 border-gray-400' :
                  'bg-orange-100 border-2 border-orange-400'
                }`}
              >
                <div className={`text-4xl mb-2 ${
                  index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'
                }`}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </div>
                <div className="font-bold text-lg text-gray-900">{winner.squadName}</div>
                <div className="text-sm text-gray-600">
                  {Math.round(winner.totalScore)} puntos
                </div>
                <div className="text-xs text-gray-500">
                  {winner.voteCount} votos
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vote Management */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Gestión de Votos</h3>
          <p className="text-sm text-gray-600">Eliminar votos individuales para permitir re-votación</p>
        </div>
        <div className="p-4">
          {votes.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No hay votos registrados aún.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Juez
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Equipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Puntaje
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {votes.slice(0, 10).map((vote) => {
                    const squadName = require('@/config/squads').squads.find((s: any) => s.id === vote.squad_id)?.name || vote.squad_id
                    const totalScore = ScoringService.calculateWeightedScore(vote.scores)
                    
                    return (
                      <tr key={`${vote.judge_name}-${vote.squad_id}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vote.judge_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {squadName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {Math.round(totalScore)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(vote.created_at).toLocaleString('es-ES')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleDeleteVote(vote.judge_name, vote.squad_id)}
                            className="text-red-600 hover:text-red-900 font-medium"
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
                <div className="text-center text-sm text-gray-500 mt-4">
                  Mostrando los primeros 10 votos de {votes.length} totales
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedVote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar Eliminación</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar el voto de <strong>{selectedVote.judgeName}</strong> para el equipo <strong>{selectedVote.squadId}</strong>?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Esto permitirá que el juez pueda votar nuevamente por este equipo.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteVote}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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