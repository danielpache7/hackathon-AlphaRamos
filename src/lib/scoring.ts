import { Vote } from './supabase'
import { evaluationCriteria } from '@/config/criteria'
import { squads } from '@/config/squads'
import { judges } from '@/config/access-codes'

export interface SquadScore {
  squadId: string
  squadName: string
  totalScore: number
  voteCount: number
  averageScore: number
  judgeVotes: {
    judgeName: string
    score: number
    criteriaScores: Record<string, number>
    timestamp: string
  }[]
}

export interface JudgeProgress {
  judgeName: string
  votedSquads: number
  totalSquads: number
  percentage: number
  lastVoteTime?: string
}

export class ScoringService {
  static calculateWeightedScore(scores: Record<string, number>): number {
    return Object.entries(scores).reduce((total, [criterionId, score]) => {
      const criterion = evaluationCriteria.find(c => c.id === criterionId)
      const weightedScore = criterion ? score * criterion.weight : 0
      return total + weightedScore
    }, 0)
  }

  static calculateSquadScores(votes: Vote[]): SquadScore[] {
    const squadScores: Record<string, SquadScore> = {}

    // Initialize all squads
    squads.forEach(squad => {
      squadScores[squad.id] = {
        squadId: squad.id,
        squadName: squad.name,
        totalScore: 0,
        voteCount: 0,
        averageScore: 0,
        judgeVotes: []
      }
    })

    // Process votes
    votes.forEach(vote => {
      const weightedScore = this.calculateWeightedScore(vote.scores)
      
      if (squadScores[vote.squad_id]) {
        squadScores[vote.squad_id].totalScore += weightedScore
        squadScores[vote.squad_id].voteCount += 1
        squadScores[vote.squad_id].judgeVotes.push({
          judgeName: vote.judge_name,
          score: weightedScore,
          criteriaScores: vote.scores,
          timestamp: vote.created_at
        })
      }
    })

    // Calculate averages and sort
    const results = Object.values(squadScores).map(squad => ({
      ...squad,
      averageScore: squad.voteCount > 0 ? squad.totalScore / squad.voteCount : 0
    }))

    // Sort by total score descending
    return results.sort((a, b) => b.totalScore - a.totalScore)
  }

  static calculateJudgeProgress(votes: Vote[]): JudgeProgress[] {
    const judgeProgress: Record<string, JudgeProgress> = {}

    // Initialize all judges
    judges.forEach(judge => {
      judgeProgress[judge.name] = {
        judgeName: judge.name,
        votedSquads: 0,
        totalSquads: squads.length,
        percentage: 0
      }
    })

    // Count votes per judge
    const judgeVotes: Record<string, Vote[]> = {}
    votes.forEach(vote => {
      if (!judgeVotes[vote.judge_name]) {
        judgeVotes[vote.judge_name] = []
      }
      judgeVotes[vote.judge_name].push(vote)
    })

    // Calculate progress
    Object.entries(judgeVotes).forEach(([judgeName, judgeVoteList]) => {
      if (judgeProgress[judgeName]) {
        const uniqueSquads = new Set(judgeVoteList.map(v => v.squad_id))
        judgeProgress[judgeName].votedSquads = uniqueSquads.size
        judgeProgress[judgeName].percentage = Math.round((uniqueSquads.size / squads.length) * 100)
        
        // Find last vote time
        const sortedVotes = judgeVoteList.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        if (sortedVotes.length > 0) {
          judgeProgress[judgeName].lastVoteTime = sortedVotes[0].created_at
        }
      }
    })

    return Object.values(judgeProgress).sort((a, b) => b.percentage - a.percentage)
  }

  static getOverallStats(votes: Vote[]) {
    const totalPossibleVotes = judges.length * squads.length
    const totalVotes = votes.length
    const completionPercentage = Math.round((totalVotes / totalPossibleVotes) * 100)
    
    const judgeProgress = this.calculateJudgeProgress(votes)
    const completedJudges = judgeProgress.filter(j => j.percentage === 100).length
    
    return {
      totalVotes,
      totalPossibleVotes,
      completionPercentage,
      completedJudges,
      totalJudges: judges.length,
      totalSquads: squads.length
    }
  }
}