import { useState, useEffect } from 'react'
import { User } from '@/lib/auth'
import { squads, Squad, CATEGORIES } from '@/config/squads'
import { useRealTimeJudgeVotes, useRealTimeVotingStatus } from '@/hooks/useRealtime'
import { Vote } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'

import SquadCard from './SquadCard'
import VotingModal from './VotingModal'
import VotingProgress from './VotingProgress'
import ConnectionStatus from './ConnectionStatus'
import VoteDetailModal from './VoteDetailModal'

interface JudgeInterfaceProps {
  user: User
}

export default function JudgeInterface({ user }: JudgeInterfaceProps) {
  const [selectedSquad, setSelectedSquad] = useState<Squad | null>(null)
  const [votedSquads, setVotedSquads] = useState<Set<string>>(new Set())
  const [viewingVote, setViewingVote] = useState<{ squad: Squad; vote: Vote } | null>(null)
  const { warning } = useToast()
  
  const { votes: judgeVotes, loading: votesLoading, refreshJudgeVotes, lastRefresh } = useRealTimeJudgeVotes(user.name)
  const { votingStatus, loading: statusLoading } = useRealTimeVotingStatus()

  // Update voted squads when votes change
  useEffect(() => {
    const votedSquadIds = new Set(judgeVotes.map(vote => vote.squad_id))
    setVotedSquads(votedSquadIds)
  }, [judgeVotes])

  const handleVoteClick = (squad: Squad) => {
    if (votingStatus === 'CLOSED') {
      warning('La votación está actualmente cerrada. Por favor espera a que el administrador la reabra.', 'Votación Cerrada')
      return
    }
    setSelectedSquad(squad)
  }

  const handleVoteSubmitted = () => {
    setSelectedSquad(null)
    // The real-time hook will automatically update the votes
  }

  const handleViewVote = (squad: Squad, vote: Vote) => {
    setViewingVote({ squad, vote })
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-6 lg:space-y-0">
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl font-light text-slate-900 tracking-tight mb-2">
            Panel de Juez
          </h2>
          <p className="text-slate-600 mb-3">
            Bienvenido {user.name}, evalúa los equipos a continuación.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 text-sm">
            <p className="text-slate-400">
              Última actualización: {lastRefresh?.toLocaleTimeString('es-ES')}
            </p>
            <div className="mt-2 sm:mt-0">
              <ConnectionStatus />
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-auto flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={refreshJudgeVotes}
              disabled={votesLoading}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 text-sm whitespace-nowrap ${
                votesLoading
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {votesLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Actualizando...</span>
                </div>
              ) : (
                <>Actualizar</>
              )}
            </button>
            
            <div className={`inline-flex items-center justify-center space-x-2 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              votingStatus === 'OPEN' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                votingStatus === 'OPEN' ? 'bg-emerald-500' : 'bg-red-500'
              }`}></div>
              <span>{votingStatus === 'OPEN' ? 'Votación Abierta' : 'Votación Cerrada'}</span>
            </div>
          </div>
          
          <div className="text-center lg:text-right">
            <p className="text-sm text-slate-500">
              {votedSquads.size} de {squads.length} equipos votados
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

      <div className="space-y-12">
        {Object.values(CATEGORIES).map(category => {
          const categorySquads = squads.filter(squad => squad.category === category.id)
          return (
            <div key={category.id} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{category.icon}</span>
                  <h3 className="text-xl font-semibold text-slate-900">{category.name}</h3>
                </div>
                <div className="hidden sm:block flex-1 h-px bg-slate-200 mx-4"></div>
                <span className="text-sm text-slate-500 sm:whitespace-nowrap">
                  {categorySquads.filter(squad => votedSquads.has(squad.id)).length} de {categorySquads.length} votados
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {categorySquads.map((squad) => (
                  <SquadCard
                    key={squad.id}
                    squad={squad}
                    hasVoted={votedSquads.has(squad.id)}
                    vote={getVoteForSquad(squad.id)}
                    onVote={handleVoteClick}
                    onViewVote={handleViewVote}
                    disabled={votingStatus === 'CLOSED'}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {selectedSquad && (
        <VotingModal
          squad={selectedSquad}
          judgeName={user.name}
          onClose={() => setSelectedSquad(null)}
          onVoteSubmitted={handleVoteSubmitted}
        />
      )}

      {viewingVote && (
        <VoteDetailModal
          squad={viewingVote.squad}
          vote={viewingVote.vote}
          onClose={() => setViewingVote(null)}
        />
      )}
      

    </div>
  )
}