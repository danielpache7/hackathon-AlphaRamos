import { Squad, CATEGORIES } from '@/config/squads'
import { Vote } from '@/lib/supabase'
import { evaluationCriteria } from '@/config/criteria'

interface SquadCardProps {
  squad: Squad
  hasVoted: boolean
  vote?: Vote
  onVote: (squad: Squad) => void
  onViewVote?: (squad: Squad, vote: Vote) => void
  onRevote?: (squad: Squad) => void
  disabled?: boolean
}

export default function SquadCard({ squad, hasVoted, vote, onVote, onViewVote, onRevote, disabled }: SquadCardProps) {
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
    <div className="rounded-2xl border p-6 transition-all duration-200 hover:shadow-sm"
      style={{
        backgroundColor: hasVoted ? '#A7E100' : 'white',
        borderColor: hasVoted ? '#A7E100' : '#009FE3',
        opacity: hasVoted ? 1 : 1
      }}>
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-3">
            <h3 className="text-lg sm:text-xl font-semibold tracking-tight" style={{ color: '#003366' }}>{squad.name}</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit"
              style={{
                backgroundColor: squad.category === 'innovation' ? '#009FE3' : '#A7E100',
                color: squad.category === 'innovation' ? 'white' : '#003366'
              }}>
              {CATEGORIES[squad.category].icon} {CATEGORIES[squad.category].name}
            </span>
          </div>
          <div className="space-y-2">
            <p className="text-sm" style={{ color: '#1A1A1A' }}>
              <span style={{ color: '#1A1A1A', opacity: 0.6 }}>Mentor:</span> <span className="font-medium">{squad.mentor}</span>
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#1A1A1A' }}>
              <span style={{ color: '#1A1A1A', opacity: 0.6 }}>Challenge:</span> {squad.challenge}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          {hasVoted ? (
            <div className="flex flex-col space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#003366' }}></div>
                  <span className="text-sm font-medium" style={{ color: '#003366' }}>✓ Votado</span>
                </div>
                {vote && (
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="text-lg font-semibold" style={{ color: '#003366' }}>{getVotedScore()}</div>
                      <div className="text-xs" style={{ color: '#1A1A1A', opacity: 0.6 }}>
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
              {onRevote && !disabled && (
                <div className="flex justify-end">
                  <button
                    onClick={() => onRevote(squad)}
                    className="inline-flex items-center space-x-1 px-4 py-2 text-sm font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-lg transition-all duration-200 hover:shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Volver a Votar</span>
                  </button>
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
                    ? 'cursor-not-allowed opacity-50'
                    : 'text-white hover:opacity-90 hover:shadow-sm'
                }`}
                style={{ backgroundColor: disabled ? '#F2F2F2' : '#009FE3', color: disabled ? '#1A1A1A' : 'white' }}
              >
                Votar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 mt-4">
        <p className="text-sm mb-3" style={{ color: '#1A1A1A', opacity: 0.6 }}>Miembros del Equipo</p>
        <div className="flex flex-wrap gap-2">
          {squad.members.map((member, index) => (
            <span
              key={index}
              className="px-2.5 py-1 rounded-lg text-xs sm:text-sm font-medium break-words"
              style={{ backgroundColor: '#F2F2F2', color: '#1A1A1A' }}
            >
              {member}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}