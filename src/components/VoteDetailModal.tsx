import { Squad } from '@/config/squads'
import { evaluationCriteria } from '@/config/criteria'
import { Vote } from '@/lib/supabase'
import { ScoringService } from '@/lib/scoring'

interface VoteDetailModalProps {
  squad: Squad
  vote: Vote
  onClose: () => void
}

export default function VoteDetailModal({ squad, vote, onClose }: VoteDetailModalProps) {
  const totalScore = ScoringService.calculateWeightedScore(vote.scores)

  const getCriterionScore = (criterionId: string) => {
    return vote.scores[criterionId] || 0
  }

  const getCriterionWeightedScore = (criterionId: string) => {
    const criterion = evaluationCriteria.find(c => c.id === criterionId)
    const score = getCriterionScore(criterionId)
    return criterion ? score * criterion.weight : 0
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6 sm:mb-8">
            <div className="flex-1 pr-6">
              <h2 className="text-2xl sm:text-3xl font-light text-slate-900 tracking-tight mb-2">
                Your Vote: {squad.name}
              </h2>
              <p className="text-slate-600 leading-relaxed mb-2">
                {squad.challenge}
              </p>
              <p className="text-sm text-slate-400">
                Voted on {new Date(vote.created_at).toLocaleString('es-ES')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-2"
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
                <p className="text-sm text-slate-400 mb-3">Team Members</p>
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

          {/* Voting Details */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">Your Evaluation</h3>
            
            {evaluationCriteria.map((criterion) => (
              <div key={criterion.id} className="bg-white border border-slate-200/60 rounded-2xl p-6">
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

                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-slate-500 font-medium">Your Score:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center text-lg font-semibold">
                        {getCriterionScore(criterion.id)}
                      </div>
                      <span className="text-slate-400">/ 10</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-sm text-slate-500">Weighted Score</span>
                    <div className="text-lg font-semibold text-slate-900">
                      {getCriterionWeightedScore(criterion.id).toFixed(1)}
                    </div>
                  </div>
                </div>

                {/* Visual score bar */}
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-slate-900 to-slate-700 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(getCriterionScore(criterion.id) / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Total Score */}
          <div className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-lg font-semibold text-slate-900">Total Weighted Score</span>
                <p className="text-sm text-slate-500 mt-1">
                  Sum of all criteria with weights applied
                </p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-light text-slate-900">
                  {Math.round(totalScore)}
                </span>
                <p className="text-sm text-slate-500">points</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end mt-8 pt-6 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-8 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}