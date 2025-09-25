import { useState, useEffect } from 'react'
import { Squad } from '@/config/squads'
import { evaluationCriteria } from '@/config/criteria'
import { DatabaseService } from '@/lib/database'
import { useToast } from '@/contexts/ToastContext'
import { Vote } from '@/lib/supabase'
import { useForceRefresh } from '@/hooks/useForceRefresh'
import ConfirmModal from './ConfirmModal'

interface VotingModalProps {
  squad: Squad
  judgeName: string
  onClose: () => void
  onVoteSubmitted: () => void
  isRevoting?: boolean
  existingVote?: Vote
}

export default function VotingModal({ squad, judgeName, onClose, onVoteSubmitted, isRevoting = false, existingVote }: VotingModalProps) {
  const [scores, setScores] = useState<Record<string, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { success, error, warning } = useToast()
  const { forceRefresh } = useForceRefresh()

  // Pre-fill scores if revoting
  useEffect(() => {
    if (isRevoting && existingVote?.scores) {
      setScores(existingVote.scores)
    }
  }, [isRevoting, existingVote])

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

  const handleSubmitClick = () => {
    if (!isFormValid()) {
      warning('Por favor califica todos los criterios con puntajes del 1 al 10.', 'Evaluación Incompleta')
      return
    }
    setShowConfirm(true)
  }

  const handleConfirmSubmit = async () => {
    setShowConfirm(false)
    setIsSubmitting(true)

    try {
      let result
      
      if (isRevoting) {
        // Delete existing vote first, then submit new one
        const deleteSuccess = await DatabaseService.deleteVote(judgeName, squad.id)
        if (!deleteSuccess) {
          error('Error al eliminar el voto anterior.', 'Error de Re-votación')
          return
        }
        result = await DatabaseService.submitVote(judgeName, squad.id, scores)
      } else {
        // Check if judge has already voted for this squad
        const hasAlreadyVoted = await DatabaseService.hasJudgeVoted(judgeName, squad.id)
        if (hasAlreadyVoted) {
          warning('Ya has votado por este equipo. No puedes votar de nuevo.', 'Ya Votado')
          onClose()
          return
        }
        result = await DatabaseService.submitVote(judgeName, squad.id, scores)
      }
      
      if (result) {
        const actionText = isRevoting ? 'actualizado' : 'enviado'
        success(`¡Voto ${actionText} exitosamente para ${squad.name}! Puntaje Total: ${getTotalScore().toFixed(1)}`, `Voto ${isRevoting ? 'Actualizado' : 'Enviado'}`)
        
        // Force a small delay to ensure database consistency and trigger global refresh
        setTimeout(() => {
          forceRefresh()
          onVoteSubmitted()
        }, 500)
      } else {
        error(`Error al ${isRevoting ? 'actualizar' : 'enviar'} el voto.`, 'Envío Fallido')
      }
    } catch (err) {
      console.error('Error submitting vote:', err)
      error(`Error al ${isRevoting ? 'actualizar' : 'enviar'} el voto. Por favor intenta de nuevo.`, 'Envío Fallido')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6 sm:mb-8">
            <div className="flex-1 pr-6">
              <h2 className="text-2xl sm:text-3xl font-light text-slate-900 tracking-tight mb-2">
                {isRevoting ? 'Actualizar Voto para' : 'Votar por'} {squad.name}
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {squad.challenge}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-2"
              disabled={isSubmitting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Squad Info */}
          <div className="bg-slate-50 rounded-2xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-400 mb-2">Mentor</p>
                <p className="text-slate-700 font-medium">{squad.mentor}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-3">Miembros del Equipo</p>
                <div className="flex flex-wrap gap-2">
                  {squad.members.map((member, index) => (
                    <span
                      key={index}
                      className="bg-white text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200"
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
            <h3 className="text-xl font-semibold text-slate-900 mb-6">Criterios de Evaluación</h3>
            
            {evaluationCriteria.map((criterion) => (
              <div key={criterion.id} className="bg-white border border-slate-200/60 rounded-2xl p-6 hover:border-slate-300/60 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-2">{criterion.name}</h4>
                    <p className="text-slate-600 leading-relaxed">{criterion.description}</p>
                  </div>
                  <div className="ml-6 text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
                      {criterion.weight}%
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 font-medium">Tu Puntaje</span>
                    {scores[criterion.id] && (
                      <span className="text-sm text-slate-600">
                        Ponderado: <span className="font-semibold text-slate-900">{calculateWeightedScore(criterion.id, scores[criterion.id]).toFixed(1)}</span>
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <button
                        key={score}
                        onClick={() => handleScoreChange(criterion.id, score)}
                        className={`aspect-square rounded-xl text-sm font-semibold transition-all duration-200 ${
                          scores[criterion.id] === score
                            ? 'bg-slate-900 text-white shadow-lg scale-105'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:scale-105'
                        }`}
                        disabled={isSubmitting}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total Score */}
          {Object.keys(scores).length > 0 && (
            <div className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-lg font-semibold text-slate-900">Puntaje Total Ponderado</span>
                  <p className="text-sm text-slate-500 mt-1">Suma de todos los criterios con pesos aplicados</p>
                </div>
                <span className="text-3xl font-light text-slate-900">{getTotalScore()}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmitClick}
              disabled={!isFormValid() || isSubmitting}
              className={`px-8 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                isFormValid() && !isSubmitting
                  ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-xl'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Enviando...</span>
                </div>
              ) : (
                isRevoting ? 'Actualizar Voto' : 'Enviar Voto'
              )}
            </button>
          </div>
        </div>
      </div>
      
      <ConfirmModal
        isOpen={showConfirm}
        title={isRevoting ? "Confirmar Actualización" : "Confirmar Envío"}
        message={`¿Estás seguro de que quieres ${isRevoting ? 'actualizar tu voto' : 'enviar este voto'} para ${squad.name}? Puntaje total: ${getTotalScore().toFixed(1)}`}
        confirmText={isRevoting ? "Sí, Actualizar" : "Sí, Enviar"}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setShowConfirm(false)}
        type="warning"
      />
    </div>
  )
}