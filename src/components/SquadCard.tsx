import { Squad } from '@/config/squads'
import { Vote } from '@/lib/supabase'

interface SquadCardProps {
  squad: Squad
  hasVoted: boolean
  vote?: Vote
  onVote: (squad: Squad) => void
  disabled?: boolean
}

export default function SquadCard({ squad, hasVoted, vote, onVote, disabled }: SquadCardProps) {
  const getVotedScore = () => {
    if (!vote || !vote.scores) return null
    
    // Calculate total weighted score using criteria weights
    const { evaluationCriteria } = require('@/config/criteria')
    const totalScore = Object.entries(vote.scores).reduce((sum, [criterionId, score]) => {
      const criterion = evaluationCriteria.find((c: any) => c.id === criterionId)
      const weightedScore = criterion ? score * criterion.weight : 0
      return sum + weightedScore
    }, 0)
    
    return Math.round(totalScore)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-4 space-y-3 sm:space-y-0">
        <div className="flex-1 w-full sm:w-auto">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{squad.name}</h3>
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Mentor:</span> {squad.mentor}
          </p>
          <p className="text-sm text-gray-700 mb-3">
            <span className="font-medium">Reto:</span> {squad.challenge}
          </p>
        </div>
        
        <div className="sm:ml-4 w-full sm:w-auto">
          {hasVoted ? (
            <div className="text-center sm:text-right">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-2 inline-block">
                ✓ Votado
              </div>
              {vote && (
                <div className="text-sm text-gray-600">
                  <div className="font-medium">Puntaje Total: {getVotedScore()}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(vote.created_at).toLocaleString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onVote(squad)}
              disabled={disabled}
              className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium transition-colors ${
                disabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Votar
            </button>
          )}
        </div>
      </div>

      <div className="border-t pt-3">
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-medium">Integrantes:</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {squad.members.map((member, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
            >
              {member}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}