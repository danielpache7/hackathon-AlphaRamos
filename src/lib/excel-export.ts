import * as XLSX from 'xlsx'
import { Vote } from './supabase'
import { ScoringService } from './scoring'
import { evaluationCriteria } from '@/config/criteria'
import { squads, CATEGORIES } from '@/config/squads'

export class ExcelExportService {
  static generateReport(votes: Vote[]): void {
    const workbook = XLSX.utils.book_new()

    // Sheet 1: Individual Votes
    const individualVotesData = this.generateIndividualVotesSheet(votes)
    const individualVotesSheet = XLSX.utils.aoa_to_sheet(individualVotesData)
    XLSX.utils.book_append_sheet(workbook, individualVotesSheet, 'Votos Individuales')

    // Sheet 2: Final Rankings
    const rankingsData = this.generateRankingsSheet(votes)
    const rankingsSheet = XLSX.utils.aoa_to_sheet(rankingsData)
    XLSX.utils.book_append_sheet(workbook, rankingsSheet, 'Ranking Final')

    // Sheet 2.1: Category Rankings
    const categoryRankingsData = this.generateCategoryRankingsSheet(votes)
    const categoryRankingsSheet = XLSX.utils.aoa_to_sheet(categoryRankingsData)
    XLSX.utils.book_append_sheet(workbook, categoryRankingsSheet, 'Rankings por Categoría')

    // Sheet 3: Summary by Judge
    const judgeSummaryData = this.generateJudgeSummarySheet(votes)
    const judgeSummarySheet = XLSX.utils.aoa_to_sheet(judgeSummaryData)
    XLSX.utils.book_append_sheet(workbook, judgeSummarySheet, 'Resumen por Juez')

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const filename = `Resultados_Hackathon_${timestamp}.xlsx`

    // Download file
    XLSX.writeFile(workbook, filename)
  }

  private static generateIndividualVotesSheet(votes: Vote[]): (string | number)[][] {
    const headers = [
      'Juez',
      'Equipo',
      'Categoría',
      'Fecha y Hora',
      ...evaluationCriteria.map(c => `${c.name} (${c.weight}%)`),
      'Puntaje Total Ponderado'
    ]

    const rows = votes.map(vote => {
      const squad = squads.find(s => s.id === vote.squad_id)
      const squadName = squad ? squad.name : vote.squad_id
      const categoryName = squad ? CATEGORIES[squad.category].name : ''
      
      const criteriaScores = evaluationCriteria.map(criterion => 
        vote.scores[criterion.id] || 0
      )
      
      const totalScore = ScoringService.calculateWeightedScore(vote.scores)
      
      return [
        vote.judge_name,
        squadName,
        categoryName,
        new Date(vote.created_at).toLocaleString('es-ES'),
        ...criteriaScores,
        Math.round(totalScore)
      ]
    })

    return [headers, ...rows]
  }

  private static generateRankingsSheet(votes: Vote[]): (string | number)[][] {
    const squadScores = ScoringService.calculateSquadScores(votes)
    
    const headers = [
      'Posición',
      'Equipo',
      'Categoría',
      'Puntaje Total',
      'Número de Votos',
      'Puntaje Promedio',
      'Mentor',
      'Reto',
      'Integrantes'
    ]

    const rows = squadScores.map((squad, index) => {
      const squadInfo = squads.find(s => s.id === squad.squadId)
      const categoryName = squadInfo ? CATEGORIES[squadInfo.category].name : ''
      
      return [
        index + 1,
        squad.squadName,
        categoryName,
        Math.round(squad.totalScore),
        squad.voteCount,
        Math.round(squad.averageScore * 100) / 100,
        squadInfo?.mentor || '',
        squadInfo?.challenge || '',
        squadInfo?.members.join(', ') || ''
      ]
    })

    return [headers, ...rows]
  }

  private static generateJudgeSummarySheet(votes: Vote[]): (string | number)[][] {
    const judgeProgress = ScoringService.calculateJudgeProgress(votes)
    
    const headers = [
      'Juez',
      'Equipos Votados',
      'Total Equipos',
      'Porcentaje Completado',
      'Último Voto'
    ]

    const rows = judgeProgress.map(judge => [
      judge.judgeName,
      judge.votedSquads,
      judge.totalSquads,
      `${judge.percentage}%`,
      judge.lastVoteTime ? new Date(judge.lastVoteTime).toLocaleString('es-ES') : 'Sin votos'
    ])

    return [headers, ...rows]
  }

  static generateDetailedReport(votes: Vote[]): void {
    const workbook = XLSX.utils.book_new()

    // Main sheets
    const individualVotesData = this.generateIndividualVotesSheet(votes)
    const individualVotesSheet = XLSX.utils.aoa_to_sheet(individualVotesData)
    XLSX.utils.book_append_sheet(workbook, individualVotesSheet, 'Votos Individuales')

    const rankingsData = this.generateRankingsSheet(votes)
    const rankingsSheet = XLSX.utils.aoa_to_sheet(rankingsData)
    XLSX.utils.book_append_sheet(workbook, rankingsSheet, 'Ranking Final')

    const judgeSummaryData = this.generateJudgeSummarySheet(votes)
    const judgeSummarySheet = XLSX.utils.aoa_to_sheet(judgeSummaryData)
    XLSX.utils.book_append_sheet(workbook, judgeSummarySheet, 'Resumen por Juez')

    // Detailed breakdown by criteria
    const criteriaBreakdownData = this.generateCriteriaBreakdownSheet(votes)
    const criteriaBreakdownSheet = XLSX.utils.aoa_to_sheet(criteriaBreakdownData)
    XLSX.utils.book_append_sheet(workbook, criteriaBreakdownSheet, 'Análisis por Criterio')

    // Statistics sheet
    const statisticsData = this.generateStatisticsSheet(votes)
    const statisticsSheet = XLSX.utils.aoa_to_sheet(statisticsData)
    XLSX.utils.book_append_sheet(workbook, statisticsSheet, 'Estadísticas')

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const filename = `Reporte_Detallado_Hackathon_${timestamp}.xlsx`

    XLSX.writeFile(workbook, filename)
  }

  private static generateCriteriaBreakdownSheet(votes: Vote[]): (string | number)[][] {
    const squadScores = ScoringService.calculateSquadScores(votes)
    
    const headers = [
      'Equipo',
      ...evaluationCriteria.map(c => `${c.name} - Promedio`),
      ...evaluationCriteria.map(c => `${c.name} - Total Ponderado`),
      'Puntaje Final'
    ]

    const rows = squadScores.map(squad => {
      const criteriaAverages = evaluationCriteria.map(criterion => {
        const criterionVotes = squad.judgeVotes.map(vote => vote.criteriaScores[criterion.id] || 0)
        const average = criterionVotes.length > 0 
          ? criterionVotes.reduce((sum, score) => sum + score, 0) / criterionVotes.length 
          : 0
        return Math.round(average * 100) / 100
      })

      const criteriaTotals = evaluationCriteria.map(criterion => {
        const criterionVotes = squad.judgeVotes.map(vote => vote.criteriaScores[criterion.id] || 0)
        const total = criterionVotes.reduce((sum, score) => sum + (score * criterion.weight), 0)
        return Math.round(total)
      })

      return [
        squad.squadName,
        ...criteriaAverages,
        ...criteriaTotals,
        Math.round(squad.totalScore)
      ]
    })

    return [headers, ...rows]
  }

  private static generateStatisticsSheet(votes: Vote[]): (string | number)[][] {
    const stats = ScoringService.getOverallStats(votes)
    const squadScores = ScoringService.calculateSquadScores(votes)
    
    const data = [
      ['ESTADÍSTICAS GENERALES'],
      [''],
      ['Total de votos registrados', stats.totalVotes],
      ['Total de votos posibles', stats.totalPossibleVotes],
      ['Porcentaje de completitud', `${stats.completionPercentage}%`],
      ['Jueces que completaron votación', stats.completedJudges],
      ['Total de jueces', stats.totalJudges],
      ['Total de equipos', stats.totalSquads],
      [''],
      ['ESTADÍSTICAS DE PUNTAJES'],
      [''],
      ['Puntaje más alto', Math.round(Math.max(...squadScores.map(s => s.totalScore)))],
      ['Puntaje más bajo', Math.round(Math.min(...squadScores.map(s => s.totalScore)))],
      ['Puntaje promedio', Math.round(squadScores.reduce((sum, s) => sum + s.totalScore, 0) / squadScores.length)],
      [''],
      ['CRITERIOS DE EVALUACIÓN'],
      [''],
      ...evaluationCriteria.map(criterion => [criterion.name, `${criterion.weight}%`, criterion.description])
    ]

    return data
  }

  private static generateCategoryRankingsSheet(votes: Vote[]): (string | number)[][] {
    const categoryRankings = ScoringService.calculateCategoryRankings(votes)
    
    const data: (string | number)[][] = []
    
    categoryRankings.forEach(category => {
      data.push([`${category.icon} ${category.categoryName.toUpperCase()}`])
      data.push([])
      data.push(['Posición', 'Equipo', 'Puntaje Total', 'Número de Votos', 'Puntaje Promedio'])
      
      category.squads.forEach((squad, index) => {
        data.push([
          index + 1,
          squad.squadName,
          Math.round(squad.totalScore),
          squad.voteCount,
          Math.round(squad.averageScore * 100) / 100
        ])
      })
      
      data.push([])
      data.push([])
    })
    
    return data
  }
}