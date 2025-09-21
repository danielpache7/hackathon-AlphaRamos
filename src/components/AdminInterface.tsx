import { User } from '@/lib/auth'
import { useRealTimeVotes } from '@/hooks/useRealtime'
import { ExcelExportService } from '@/lib/excel-export'
import RealTimeResults from './RealTimeResults'
import VotingControls from './VotingControls'
import SystemDiagnostics from './SystemDiagnostics'
import ConnectionStatus from './ConnectionStatus'

interface AdminInterfaceProps {
  user: User
}

export default function AdminInterface({ user }: AdminInterfaceProps) {
  const { votes, loading, refreshVotes, lastRefresh } = useRealTimeVotes()

  const handleExportExcel = () => {
    if (votes.length === 0) {
      alert('No hay votos para exportar.')
      return
    }

    try {
      ExcelExportService.generateReport(votes)
      alert('Reporte Excel generado exitosamente.')
    } catch (error) {
      console.error('Error generating Excel report:', error)
      alert('Error al generar el reporte Excel.')
    }
  }

  const handleExportDetailedReport = () => {
    if (votes.length === 0) {
      alert('No hay votos para exportar.')
      return
    }

    try {
      ExcelExportService.generateDetailedReport(votes)
      alert('Reporte detallado generado exitosamente.')
    } catch (error) {
      console.error('Error generating detailed report:', error)
      alert('Error al generar el reporte detallado.')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
            <div className="flex space-x-4">
              <div className="h-10 bg-gray-200 rounded flex-1"></div>
              <div className="h-10 bg-gray-200 rounded flex-1"></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Panel de Administrador</h2>
          <p className="text-sm sm:text-base text-gray-600">Hola {user.name}, monitorea y gestiona la votación en tiempo real.</p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2">
            <p className="text-xs text-gray-500">
              Última actualización: {lastRefresh.toLocaleTimeString('es-ES')} • Auto-refresh cada minuto
            </p>
            <ConnectionStatus />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <button
            onClick={refreshVotes}
            disabled={loading}
            className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium transition-colors ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Actualizando...</span>
              </div>
            ) : (
              <>🔄 Refrescar</>
            )}
          </button>
          <button
            onClick={handleExportDetailedReport}
            disabled={votes.length === 0}
            className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium transition-colors ${
              votes.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            📈 Reporte Detallado
          </button>
        </div>
      </div>

      {/* Voting Controls */}
      <VotingControls onExportExcel={handleExportExcel} />

      {/* Real-time Results */}
      <RealTimeResults />

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Rápido</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{votes.length}</div>
            <div className="text-sm text-gray-600">Votos Totales</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {new Set(votes.map(v => v.judge_name)).size}
            </div>
            <div className="text-sm text-gray-600">Jueces Activos</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {new Set(votes.map(v => v.squad_id)).size}
            </div>
            <div className="text-sm text-gray-600">Equipos con Votos</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {votes.length > 0 ? new Date(Math.max(...votes.map(v => new Date(v.created_at).getTime()))).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
            </div>
            <div className="text-sm text-gray-600">Último Voto</div>
          </div>
        </div>
      </div>

      {/* System Diagnostics */}
      <SystemDiagnostics />
    </div>
  )
}