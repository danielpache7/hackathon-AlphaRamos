import { useEffect, useState, useCallback } from 'react'
import { supabase, Vote } from '@/lib/supabase'
import { DatabaseService } from '@/lib/database'

// Hook for real-time votes updates
export function useRealTimeVotes() {
  const [votes, setVotes] = useState<Vote[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const refreshVotes = useCallback(async () => {
    setLoading(true)
    try {
      const updatedVotes = await DatabaseService.getAllVotes()
      setVotes(updatedVotes)
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Error refreshing votes:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleRealtimeUpdate = useCallback(async (payload: any) => {
    console.log('Real-time vote update:', payload)
    try {
      const updatedVotes = await DatabaseService.getAllVotes()
      setVotes(updatedVotes)
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Error handling realtime update:', error)
    }
  }, [])

  useEffect(() => {
    let subscription: any
    let autoRefreshInterval: NodeJS.Timeout

    const initializeData = async () => {
      try {
        const initialVotes = await DatabaseService.getAllVotes()
        setVotes(initialVotes)
        setLastRefresh(new Date())
      } catch (error) {
        console.error('Error fetching initial votes:', error)
      } finally {
        setLoading(false)
      }
    }

    const setupSubscription = () => {
      subscription = supabase
        .channel('votes-realtime', {
          config: {
            broadcast: { self: true },
            presence: { key: 'votes' }
          }
        })
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'votes'
          },
          handleRealtimeUpdate
        )
        .subscribe((status) => {
          console.log('Votes subscription status:', status)
        })
    }

    initializeData()
    setupSubscription()
    
    // Auto-refresh every 30 seconds as fallback
    autoRefreshInterval = setInterval(refreshVotes, 30000)

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval)
      }
    }
  }, [refreshVotes, handleRealtimeUpdate])

  return { votes, loading, refreshVotes, lastRefresh }
}

// Hook for real-time voting status updates
export function useRealTimeVotingStatus() {
  const [votingStatus, setVotingStatus] = useState<'OPEN' | 'CLOSED'>('OPEN')
  const [loading, setLoading] = useState(true)

  const handleStatusUpdate = useCallback(async (payload: any) => {
    console.log('Real-time settings update:', payload)
    if (payload.new && 'voting_status' in payload.new) {
      setVotingStatus(payload.new.voting_status as 'OPEN' | 'CLOSED')
    } else {
      // Fallback: fetch current status
      try {
        const status = await DatabaseService.getVotingStatus()
        setVotingStatus(status)
      } catch (error) {
        console.error('Error fetching voting status:', error)
      }
    }
  }, [])

  useEffect(() => {
    let subscription: any
    let statusCheckInterval: NodeJS.Timeout

    const initializeStatus = async () => {
      try {
        const status = await DatabaseService.getVotingStatus()
        setVotingStatus(status)
      } catch (error) {
        console.error('Error fetching initial voting status:', error)
      } finally {
        setLoading(false)
      }
    }

    const setupSubscription = () => {
      subscription = supabase
        .channel('settings-realtime', {
          config: {
            broadcast: { self: true },
            presence: { key: 'settings' }
          }
        })
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'settings'
          },
          handleStatusUpdate
        )
        .subscribe((status) => {
          console.log('Settings subscription status:', status)
        })
    }

    initializeStatus()
    setupSubscription()
    
    // Check status every 10 seconds as fallback
    statusCheckInterval = setInterval(async () => {
      try {
        const status = await DatabaseService.getVotingStatus()
        setVotingStatus(status)
      } catch (error) {
        console.error('Error in status check interval:', error)
      }
    }, 10000)

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval)
      }
    }
  }, [handleStatusUpdate])

  return { votingStatus, loading }
}

// Hook for real-time votes by specific judge
export function useRealTimeJudgeVotes(judgeName: string) {
  const [votes, setVotes] = useState<Vote[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const refreshJudgeVotes = useCallback(async () => {
    if (!judgeName) return
    setLoading(true)
    try {
      const judgeVotes = await DatabaseService.getVotesByJudge(judgeName)
      setVotes(judgeVotes)
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Error refreshing judge votes:', error)
    } finally {
      setLoading(false)
    }
  }, [judgeName])

  const handleJudgeRealtimeUpdate = useCallback(async (payload: any) => {
    console.log('Real-time judge vote update:', payload)
    if (!judgeName) return
    try {
      const updatedVotes = await DatabaseService.getVotesByJudge(judgeName)
      setVotes(updatedVotes)
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Error handling judge realtime update:', error)
    }
  }, [judgeName])

  useEffect(() => {
    if (!judgeName) return

    let subscription: any
    let autoRefreshInterval: NodeJS.Timeout

    const initializeData = async () => {
      try {
        const judgeVotes = await DatabaseService.getVotesByJudge(judgeName)
        setVotes(judgeVotes)
        setLastRefresh(new Date())
      } catch (error) {
        console.error('Error fetching initial judge votes:', error)
      } finally {
        setLoading(false)
      }
    }

    const setupSubscription = () => {
      subscription = supabase
        .channel(`judge-votes-${judgeName}`, {
          config: {
            broadcast: { self: true },
            presence: { key: `judge-${judgeName}` }
          }
        })
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'votes'
          },
          handleJudgeRealtimeUpdate
        )
        .subscribe((status) => {
          console.log(`Judge ${judgeName} subscription status:`, status)
        })
    }

    initializeData()
    setupSubscription()
    
    // Removed auto-refresh interval for judge votes

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval)
      }
    }
  }, [judgeName, handleJudgeRealtimeUpdate])

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