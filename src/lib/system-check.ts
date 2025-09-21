import { supabase } from './supabase'
import { squads } from '@/config/squads'
import { evaluationCriteria, getTotalWeight } from '@/config/criteria'
import { accessCodes, judges } from '@/config/access-codes'

export class SystemCheck {
  static async runHealthCheck(): Promise<{
    success: boolean
    issues: string[]
    warnings: string[]
  }> {
    const issues: string[] = []
    const warnings: string[] = []

    try {
      // Check Supabase connection
      const { error: connectionError } = await supabase.from('settings').select('id').limit(1)
      if (connectionError) {
        issues.push(`Supabase connection failed: ${connectionError.message}`)
      }

      // Check database tables
      const { error: votesError } = await supabase.from('votes').select('id').limit(1)
      if (votesError) {
        issues.push(`Votes table not accessible: ${votesError.message}`)
      }

      const { error: settingsError } = await supabase.from('settings').select('id').limit(1)
      if (settingsError) {
        issues.push(`Settings table not accessible: ${settingsError.message}`)
      }

      // Check configuration data
      if (squads.length === 0) {
        issues.push('No squads configured')
      }

      if (evaluationCriteria.length === 0) {
        issues.push('No evaluation criteria configured')
      }

      if (accessCodes.length === 0) {
        issues.push('No access codes configured')
      }

      if (judges.length === 0) {
        issues.push('No judges configured')
      }

      // Check criteria weights
      const totalWeight = getTotalWeight()
      if (totalWeight !== 100) {
        warnings.push(`Criteria weights total ${totalWeight}% instead of 100%`)
      }

      // Check for duplicate access codes
      const codes = accessCodes.map(ac => ac.code)
      const uniqueCodes = new Set(codes)
      if (codes.length !== uniqueCodes.size) {
        issues.push('Duplicate access codes found')
      }

      // Check for duplicate squad IDs
      const squadIds = squads.map(s => s.id)
      const uniqueSquadIds = new Set(squadIds)
      if (squadIds.length !== uniqueSquadIds.size) {
        issues.push('Duplicate squad IDs found')
      }

      // Check for duplicate criteria IDs
      const criteriaIds = evaluationCriteria.map(c => c.id)
      const uniqueCriteriaIds = new Set(criteriaIds)
      if (criteriaIds.length !== uniqueCriteriaIds.size) {
        issues.push('Duplicate criteria IDs found')
      }

      return {
        success: issues.length === 0,
        issues,
        warnings
      }

    } catch (error) {
      issues.push(`System check failed: ${error}`)
      return {
        success: false,
        issues,
        warnings
      }
    }
  }

  static async getSystemStats() {
    try {
      const { data: votes } = await supabase.from('votes').select('*')
      const { data: settings } = await supabase.from('settings').select('*')

      return {
        totalSquads: squads.length,
        totalJudges: judges.length,
        totalCriteria: evaluationCriteria.length,
        totalAccessCodes: accessCodes.length,
        totalVotes: votes?.length || 0,
        votingStatus: settings?.[0]?.voting_status || 'UNKNOWN',
        criteriaWeightTotal: getTotalWeight()
      }
    } catch (error) {
      console.error('Error getting system stats:', error)
      return null
    }
  }

  static validateVoteData(scores: Record<string, number>): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // Check if all criteria are present
    evaluationCriteria.forEach(criterion => {
      if (!(criterion.id in scores)) {
        errors.push(`Missing score for criterion: ${criterion.name}`)
      } else {
        const score = scores[criterion.id]
        if (score < 1 || score > 10 || !Number.isInteger(score)) {
          errors.push(`Invalid score for ${criterion.name}: must be integer between 1-10`)
        }
      }
    })

    // Check for extra criteria
    Object.keys(scores).forEach(criterionId => {
      if (!evaluationCriteria.find(c => c.id === criterionId)) {
        errors.push(`Unknown criterion ID: ${criterionId}`)
      }
    })

    return {
      valid: errors.length === 0,
      errors
    }
  }
}