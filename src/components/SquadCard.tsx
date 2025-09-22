import { Squad, CATEGORIES } from '@/config/squads'
import { Vote } from '@/lib/supabase'
import { evaluationCriteria } from '@/config/criteria'

interface SquadCardProps {
  squad: Squad
  hasVoted: boolean
  vote?: Vote
  onVote: (squad: Squad) => void
  onViewVote?: (squad: Squad, vote: Vote) => void
  disabled?: boolean
}

export default function SquadCard({ squad, hasVoted, vote, onVote, onViewVote, disabled }: SquadCardProps) {
  const getVotedScore = () => {
    if (!vote || !vote.scores) return null
    
    // Calculate total weighted score using criteria weights
    const totalScore = Object.entries(vote.scores).reduce((sum, [criterionId, score]) => {
      const criterion = evaluationCriteria.find((c) => c.id === criterionId)
      const weightedScore = criterion ? score * criterion.weight : 0
      return sum + weightedScore
    }, 0)
    
    return Math.round(totalScore)
  }

  return (
    <div className={`rounded-2xl border p-6 transition-all duration-200 ${
      hasVoted 
        ? 'bg-emerald-50/50 border-emerald-200/60 hover:border-emerald-300/60 hover:shadow-sm hover:bg-emerald-50/70'
        : 'bg-white border-slate-200/60 hover:border-slate-300/60 hover:shadow-sm'
    }`}>
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-3">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">{squad.name}</h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${
              squad.category === 'innovation' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {CATEGORIES[squad.category].icon} {CATEGORIES[squad.category].name}
            </span>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              <span className="text-slate-400">Mentor:</span> <span className="font-medium">{squad.mentor}</span>
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              <span className="text-slate-400">Challenge:</span> {squad.challenge}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          {hasVoted ? (
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-emerald-700">✓ Votado</span>
              </div>
              {vote && (
                <div className="flex items-center space-x-3">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{getVotedScore()}</div>
                    <div className="text-xs text-slate-400">
                      {new Date(vote.created_at).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  {onViewVote && (
                    <button
                      onClick={() => onViewVote(squad, vote)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-all duration-200 hover:shadow-sm whitespace-nowrap"
                    >
                      <span>Ver Detalles</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                onClick={() => onVote(squad)}
                disabled={disabled}
                className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  disabled
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-sm'
                }`}
              >
                Votar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 mt-4">
        <p className="text-sm text-slate-400 mb-3">Miembros del Equipo</p>
        <div className="flex flex-wrap gap-2">
          {squad.members.map((member, index) => (
            <span
              key={index}
              className="bg-slate-50 text-slate-700 px-2.5 py-1 rounded-lg text-xs sm:text-sm font-medium break-words"
            >
              {member}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}