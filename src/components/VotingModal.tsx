import { useState } from 'react'
import { Squad } from '@/config/squads'
import { evaluationCriteria } from '@/config/criteria'
import { DatabaseService } from '@/lib/database'

interface VotingModalProps {
  squad: Squad
  judgeName: string
  onClose: () => void
  onVoteSubmitted: () => void
}

export default function VotingModal({ squad, judgeName, onClose, onVoteSubmitted }: VotingModalProps) {
  const [scores, setScores] = useState<Record<string, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleScoreChange = (criterionId: string, score: number) => {
    setScores(prev => ({
      ...prev,
      [criterionId]: score
    }))
  }

  const calculateWeightedScore = (criterionId: string, score: number) => {
    const criterion = evaluationCriteria.find(c => c.id === criterionId)
    return criterion ? score * criterion.weight : 0
  }

  const getTotalScore = () => {
    return Object.entries(scores).reduce((total, [criterionId, score]) => {
      return total + calculateWeightedScore(criterionId, score)
    }, 0)
  }

  const isFormValid = () => {
    return evaluationCriteria.every(criterion => 
      scores[criterion.id] && scores[criterion.id] >= 1 && scores[criterion.id] <= 10
    )
  }

  const handleSubmit = async () => {
    if (!isFormValid()) {
      alert('Por favor califica todos los criterios con puntajes del 1 al 10.')
      return
    }

    // Check if judge has already voted for this squad
    const hasAlreadyVoted = await DatabaseService.hasJudgeVoted(judgeName, squad.id)
    if (hasAlreadyVoted) {
      alert('Ya has votado por este equipo. No puedes votar nuevamente.')
      onClose()
      return
    }

    setIsSubmitting(true)

    try {
      const result = await DatabaseService.submitVote(judgeName, squad.id, scores)
      
      if (result) {
        alert(`¡Voto enviado exitosamente!\n\nEquipo: ${squad.name}\nPuntaje Total: ${getTotalScore()}`)
        onVoteSubmitted()
      } else {
        alert('Error al enviar el voto. Es posible que ya hayas votado por este equipo.')
      }
    } catch (error) {
      console.error('Error submitting vote:', error)
      alert('Error al enviar el voto. Por favor intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4 sm:mb-6">
            <div className="flex-1 pr-4">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Votar por {squad.name}</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Reto: {squad.challenge}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
              disabled={isSubmitting}
            >
              ×
            </button>
          </div>

          {/* Squad Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Mentor:</p>
                <p className="text-sm text-gray-600">{squad.mentor}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Integrantes:</p>
                <div className="flex flex-wrap gap-1">
                  {squad.members.map((member, index) => (
                    <span
                      key={index}
                      className="bg-white text-gray-700 px-2 py-1 rounded text-xs"
                    >
                      {member}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Scoring Form */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Criterios de Evaluación</h3>
            
            {evaluationCriteria.map((criterion) => (
              <div key={criterion.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{criterion.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{criterion.description}</p>
                  </div>
                  <div className="ml-4 text-right">
                    <span className="text-sm font-medium text-blue-600">
                      Peso: {criterion.weight}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <span className="text-sm text-gray-500 whitespace-nowrap">Puntaje:</span>
                    <div className="flex flex-wrap gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                        <button
                          key={score}
                          onClick={() => handleScoreChange(criterion.id, score)}
                          className={`w-8 h-8 sm:w-8 sm:h-8 rounded text-sm font-medium transition-colors ${
                            scores[criterion.id] === score
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          disabled={isSubmitting}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {scores[criterion.id] && (
                    <div className="text-sm text-gray-600">
                      Puntaje ponderado: {calculateWeightedScore(criterion.id, scores[criterion.id])}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Total Score */}
          {Object.keys(scores).length > 0 && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-blue-900">Puntaje Total:</span>
                <span className="text-xl font-bold text-blue-900">{getTotalScore()}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isFormValid() || isSubmitting}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isFormValid() && !isSubmitting
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Enviando...</span>
                </div>
              ) : (
                'Enviar Voto'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}