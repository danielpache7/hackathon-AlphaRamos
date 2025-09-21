import { useEffect, useState } from 'react'
import { supabase, Vote } from '@/lib/supabase'
import { DatabaseService } from '@/lib/database'

// Hook for real-time votes updates
export function useRealTimeVotes() {
  const [votes, setVotes] = useState<Vote[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const refreshVotes = async () => {
    setLoading(true)
    const updatedVotes = await DatabaseService.getAllVotes()
    setVotes(updatedVotes)
    setLastRefresh(new Date())
    setLoading(false)
  }

  useEffect(() => {
    // Initial fetch
    const fetchVotes = async () => {
      const initialVotes = await DatabaseService.getAllVotes()
      setVotes(initialVotes)
      setLoading(false)
    }

    fetchVotes()

    // Set up real-time subscription
    const subscription = supabase
      .channel('votes-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes'
        },
        async (payload) => {
          console.log('Real-time vote update:', payload)
          
          // Refresh all votes when any change occurs
          const updatedVotes = await DatabaseService.getAllVotes()
          setVotes(updatedVotes)
          setLastRefresh(new Date())
        }
      )
      .subscribe()

    // Auto-refresh every minute
    const autoRefreshInterval = setInterval(refreshVotes, 60000) // 60 seconds

    // Cleanup subscription and interval
    return () => {
      subscription.unsubscribe()
      clearInterval(autoRefreshInterval)
    }
  }, [])

  return { votes, loading, refreshVotes, lastRefresh }
}

// Hook for real-time voting status updates
export function useRealTimeVotingStatus() {
  const [votingStatus, setVotingStatus] = useState<'OPEN' | 'CLOSED'>('OPEN')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initial fetch
    const fetchStatus = async () => {
      const status = await DatabaseService.getVotingStatus()
      setVotingStatus(status)
      setLoading(false)
    }

    fetchStatus()

    // Set up real-time subscription
    const subscription = supabase
      .channel('settings-channel')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'settings'
        },
        async (payload) => {
          console.log('Real-time settings update:', payload)
          
          if (payload.new && 'voting_status' in payload.new) {
            setVotingStatus(payload.new.voting_status as 'OPEN' | 'CLOSED')
          }
        }
      )
      .subscribe()

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { votingStatus, loading }
}

// Hook for real-time votes by specific judge
export function useRealTimeJudgeVotes(judgeName: string) {
  const [votes, setVotes] = useState<Vote[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const refreshJudgeVotes = async () => {
    if (!judgeName) return
    setLoading(true)
    const judgeVotes = await DatabaseService.getVotesByJudge(judgeName)
    setVotes(judgeVotes)
    setLastRefresh(new Date())
    setLoading(false)
  }

  useEffect(() => {
    if (!judgeName) return

    // Initial fetch
    const fetchVotes = async () => {
      const judgeVotes = await DatabaseService.getVotesByJudge(judgeName)
      setVotes(judgeVotes)
      setLoading(false)
    }

    fetchVotes()

    // Set up real-time subscription
    const subscription = supabase
      .channel(`judge-votes-${judgeName}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
          filter: `judge_name=eq.${judgeName}`
        },
        async (payload) => {
          console.log('Real-time judge vote update:', payload)
          
          // Refresh judge votes
          const updatedVotes = await DatabaseService.getVotesByJudge(judgeName)
          setVotes(updatedVotes)
          setLastRefresh(new Date())
        }
      )
      .subscribe()

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [judgeName])

  return { votes, loading, refreshJudgeVotes, lastRefresh }
}

// Hook for real-time votes by specific squad
export function useRealTimeSquadVotes(squadId: string) {
  const [votes, setVotes] = useState<Vote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!squadId) return

    // Initial fetch
    const fetchVotes = async () => {
      const squadVotes = await DatabaseService.getVotesBySquad(squadId)
      setVotes(squadVotes)
      setLoading(false)
    }

    fetchVotes()

    // Set up real-time subscription
    const subscription = supabase
      .channel(`squad-votes-${squadId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
          filter: `squad_id=eq.${squadId}`
        },
        async (payload) => {
          console.log('Real-time squad vote update:', payload)
          
          // Refresh squad votes
          const updatedVotes = await DatabaseService.getVotesBySquad(squadId)
          setVotes(updatedVotes)
        }
      )
      .subscribe()

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [squadId])

  return { votes, loading }
}