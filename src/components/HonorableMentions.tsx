import { useState, useEffect } from 'react'
import { Vote } from '@/lib/supabase'
import { squads, Squad } from '@/config/squads'
import { evaluationCriteria } from '@/config/criteria'

interface HonorableMentionsProps {
  votes: Vote[]
}

interface CriterionWinner {
  criterion: string
  criterionName: string
  squad: Squad
  score: number
  totalVotes: number
}

export default function HonorableMentions({ votes }: HonorableMentionsProps) {
  const [winners, setWinners] = useState<CriterionWinner[]>([])

  useEffect(() => {
    if (votes.length === 0) return

    const criterionWinners: CriterionWinner[] = []

    evaluationCriteria.forEach(criterion => {
      const squadScores: { [squadId: string]: { total: number, count: number } } = {}

      // Calculate average score per squad for this criterion
      votes.forEach(vote => {
        if (vote.scores && vote.scores[criterion.id] !== undefined) {
          if (!squadScores[vote.squad_id]) {
            squadScores[vote.squad_id] = { total: 0, count: 0 }
          }
          squadScores[vote.squad_id].total += vote.scores[criterion.id]
          squadScores[vote.squad_id].count += 1
        }
      })

      // Find the squad with highest average score for this criterion
      let bestSquadId = ''
      let bestScore = 0
      let bestCount = 0

      Object.entries(squadScores).forEach(([squadId, data]) => {
        const average = data.total / data.count
        if (average > bestScore) {
          bestScore = average
          bestSquadId = squadId
          bestCount = data.count
        }
      })

      if (bestSquadId) {
        const squad = squads.find(s => s.id === bestSquadId)
        if (squad) {
          criterionWinners.push({
            criterion: criterion.id,
            criterionName: criterion.name,
            squad,
            score: Math.round(bestScore * 10) / 10,
            totalVotes: bestCount
          })
        }
      }
    })

    setWinners(criterionWinners)
  }, [votes])

  const getCriterionIcon = (criterionId: string) => {
    const icons: { [key: string]: string } = {
      solution: '🎯',
      creativity: '💡',
      functionality: '⚙️',
      viability: '📈',
      ux: '🎨',
      impact: '🚀',
      communication: '📢',
      teamwork: '🤝'
    }
    return icons[criterionId] || '🏆'
  }

  const getCriterionColor = (index: number) => {
    const colors = [
      '#009FE3', '#A7E100', '#FF6B6B', '#4ECDC4', 
      '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'
    ]
    return colors[index % colors.length]
  }

  if (votes.length === 0) {
    return (
      <div className="bg-white rounded-2xl border p-8 text-center" style={{ borderColor: '#009FE3' }}>
        <div className="text-6xl mb-4">🏆</div>
        <h3 className="text-xl font-semibold mb-2" style={{ color: '#003366' }}>Menciones de Honor</h3>
        <p style={{ color: '#1A1A1A', opacity: 0.7 }}>
          Las menciones de honor aparecerán cuando haya votos registrados
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-2xl sm:text-3xl font-light tracking-tight mb-2" style={{ color: '#003366' }}>
          Menciones de Honor
        </h2>
        <p style={{ color: '#1A1A1A', opacity: 0.7 }}>
          Equipos más destacados por criterio de evaluación
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {winners.map((winner, index) => (
          <div
            key={winner.criterion}
            className="bg-white rounded-2xl border p-6 transition-all duration-200 hover:shadow-lg hover:scale-105"
            style={{ borderColor: getCriterionColor(index) }}
          >
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{getCriterionIcon(winner.criterion)}</div>
              <div
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold mb-2 shadow-sm"
                style={{
                  backgroundColor: '#003366',
                  color: 'white'
                }}
              >
                MENCIÓN DE HONOR
              </div>
            </div>

            <div className="text-center mb-4">
              <h3 className="text-sm font-medium mb-1" style={{ color: '#003366' }}>
                {winner.criterionName}
              </h3>
              <div className="text-2xl font-light mb-1" style={{ color: getCriterionColor(index) }}>
                {winner.score}/10
              </div>
              <div className="text-xs" style={{ color: '#1A1A1A', opacity: 0.6 }}>
                Promedio de {winner.totalVotes} votos
              </div>
            </div>

            <div className="border-t pt-4" style={{ borderColor: getCriterionColor(index), opacity: 0.2 }}>
              <div className="text-center">
                <h4 className="font-bold text-xl mb-2" style={{ color: '#003366' }}>
                  {winner.squad.name}
                </h4>
                <p className="text-base mb-3 font-medium" style={{ color: '#1A1A1A' }}>
                  {winner.squad.mentor}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {winner.squad.members.slice(0, 2).map((member, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium"
                      style={{ backgroundColor: getCriterionColor(index), color: 'white' }}
                    >
                      {member}
                    </span>
                  ))}
                  {winner.squad.members.length > 2 && (
                    <span
                      className="px-3 py-1.5 rounded-lg text-sm font-medium"
                      style={{ backgroundColor: getCriterionColor(index), color: 'white' }}
                    >
                      +{winner.squad.members.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <p className="text-sm" style={{ color: '#1A1A1A', opacity: 0.6 }}>
          * Basado en el promedio de puntuaciones por criterio • Actualizado en tiempo real
        </p>
      </div>
    </div>
  )
}