import { CategoryRanking } from '@/lib/scoring'
import { CATEGORIES } from '@/config/squads'

interface WinnersDisplayProps {
  categoryRankings: CategoryRanking[]
}

export default function WinnersDisplay({ categoryRankings }: WinnersDisplayProps) {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-4 sm:p-8 mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-amber-900 mb-2">🏆 ¡Ganadores del Hackathon! 🏆</h2>
        <p className="text-amber-700">Felicitaciones a los equipos ganadores de cada categoría</p>
      </div>
      
      <div className="space-y-8">
        {categoryRankings.map((category) => {
          const topThree = category.squads.slice(0, 3)
          if (topThree.length === 0) return null
          
          return (
            <div key={category.category} className="bg-white rounded-xl border border-amber-200 p-4 sm:p-6">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <span className="text-3xl sm:text-4xl">{category.icon}</span>
                <h3 className="text-xl sm:text-2xl font-semibold text-slate-900">{category.categoryName}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topThree.map((squad, index) => (
                  <div key={squad.squadId} className={`text-center p-4 rounded-xl ${
                    index === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-lg' :
                    index === 1 ? 'bg-gradient-to-br from-slate-400 to-gray-500 text-white shadow-md' :
                    'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-md'
                  }`}>
                    <div className="text-3xl sm:text-4xl mb-2">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </div>
                    <h4 className="text-lg sm:text-xl font-bold mb-2">{squad.squadName}</h4>
                    <div className="text-base sm:text-lg font-semibold mb-1">{Math.round(squad.totalScore)} puntos</div>
                    <div className="text-sm opacity-90">{squad.voteCount} votos • Promedio: {squad.averageScore.toFixed(1)}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}