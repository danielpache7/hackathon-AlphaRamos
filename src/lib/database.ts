import { supabase, Vote, VotingSettings } from './supabase'

export class DatabaseService {
  // Vote operations
  static async submitVote(judgeName: string, squadId: string, scores: Record<string, number>): Promise<Vote | null> {
    try {
      const { data, error } = await supabase
        .from('votes')
        .insert({
          judge_name: judgeName,
          squad_id: squadId,
          scores: scores
        })
        .select()
        .single()

      if (error) {
        console.error('Error submitting vote:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error submitting vote:', error)
      return null
    }
  }

  static async getVotesByJudge(judgeName: string): Promise<Vote[]> {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('judge_name', judgeName)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching votes by judge:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching votes by judge:', error)
      return []
    }
  }

  static async getVotesBySquad(squadId: string): Promise<Vote[]> {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('squad_id', squadId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching votes by squad:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching votes by squad:', error)
      return []
    }
  }

  static async getAllVotes(): Promise<Vote[]> {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching all votes:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching all votes:', error)
      return []
    }
  }

  static async deleteVote(judgeId: string, squadId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('judge_name', judgeId)
        .eq('squad_id', squadId)

      if (error) {
        console.error('Error deleting vote:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting vote:', error)
      return false
    }
  }

  static async hasJudgeVoted(judgeName: string, squadId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('id')
        .eq('judge_name', judgeName)
        .eq('squad_id', squadId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error checking if judge voted:', error)
        return false
      }

      return !!data
    } catch (error) {
      console.error('Error checking if judge voted:', error)
      return false
    }
  }

  // Settings operations
  static async getVotingStatus(): Promise<'OPEN' | 'CLOSED'> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('voting_status')
        .single()

      if (error) {
        console.error('Error fetching voting status:', error)
        return 'OPEN' // Default to open if error
      }

      return data.voting_status as 'OPEN' | 'CLOSED'
    } catch (error) {
      console.error('Error fetching voting status:', error)
      return 'OPEN'
    }
  }

  static async setVotingStatus(status: 'OPEN' | 'CLOSED'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('settings')
        .update({ 
          voting_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', (await supabase.from('settings').select('id').single()).data?.id)

      if (error) {
        console.error('Error updating voting status:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating voting status:', error)
      return false
    }
  }

  static async getVotingSettings(): Promise<VotingSettings | null> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single()

      if (error) {
        console.error('Error fetching voting settings:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching voting settings:', error)
      return null
    }
  }
}