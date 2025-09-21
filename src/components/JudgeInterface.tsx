import { useState, useEffect } from 'react'
import { User } from '@/lib/auth'
import { squads, Squad } from '@/config/squads'
import { useRealTimeJudgeVotes, useRealTimeVotingStatus } from '@/hooks/useRealtime'
import { DatabaseService } from '@/lib/database'
import SquadCard from './SquadCard'
import VotingModal from './VotingModal'
import VotingProgress from './VotingProgress'
import ConnectionStatus from './ConnectionStatus'

interface JudgeInterfaceProps {
  user: User
}

export default function JudgeInterface({ user }: JudgeInterfaceProps) {
  const [selectedSquad, setSelectedSquad] = useState<Squad | null>(null)
  const [votedSquads, setVotedSquads] = useState<Set<string>>(new Set())
  
  const { votes: judgeVotes, loading: votesLoading, refreshJudgeVotes, lastRefresh } = useRealTimeJudgeVotes(user.name)
  const { votingStatus, loading: statusLoading } = useRealTimeVotingStatus()

  // Update voted squads when votes change
  useEffect(() => {
    const votedSquadIds = new Set(judgeVotes.map(vote => vote.squad_id))
    setVotedSquads(votedSquadIds)
  }, [judgeVotes])

  const handleVoteClick = (squad: Squad) => {
    if (votingStatus === 'CLOSED') {
      alert('La votación está cerrada.')
      return
    }
    setSelectedSquad(squad)
  }

  const handleVoteSubmitted = () => {
    setSelectedSquad(null)
    // The real-time hook will automatically update the votes
  }

  const getVoteForSquad = (squadId: string) => {
    return judgeVotes.find(vote => vote.squad_id === squadId)
  }

  if (votesLoading || statusLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Panel de Juez</h2>
          <p className="text-sm sm:text-base text-gray-600">Hola {user.name}, aquí puedes votar por los equipos.</p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1">
            <p className="text-xs text-gray-500">
              Última actualización: {lastRefresh?.toLocaleTimeString('es-ES')}
            </p>
            <div className="mt-1 sm:mt-0">
              <ConnectionStatus />
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={refreshJudgeVotes}
            disabled={votesLoading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
              votesLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {votesLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Actualizando...</span>
              </div>
            ) : (
              <>🔄 Refrescar</>
            )}
          </button>
          
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              votingStatus === 'OPEN' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {votingStatus === 'OPEN' ? '🟢 Votación Abierta' : '🔴 Votación Cerrada'}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Has votado por {votedSquads.size} de {squads.length} equipos
            </p>
          </div>
        </div>
      </div>

      {votingStatus === 'CLOSED' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-yellow-600 mr-3">⚠️</div>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Votación Cerrada</h3>
              <p className="text-sm text-yellow-700">
                La votación ha sido cerrada por el administrador. Ya no puedes enviar nuevos votos.
              </p>
            </div>
          </div>
        </div>
      )}

      <VotingProgress 
        totalSquads={squads.length}
        votedSquads={votedSquads.size}
        lastRefresh={lastRefresh}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {squads.map((squad) => (
          <SquadCard
            key={squad.id}
            squad={squad}
            hasVoted={votedSquads.has(squad.id)}
            vote={getVoteForSquad(squad.id)}
            onVote={handleVoteClick}
            disabled={votingStatus === 'CLOSED'}
          />
        ))}
      </div>

      {selectedSquad && (
        <VotingModal
          squad={selectedSquad}
          judgeName={user.name}
          onClose={() => setSelectedSquad(null)}
          onVoteSubmitted={handleVoteSubmitted}
        />
      )}
    </div>
  )
}