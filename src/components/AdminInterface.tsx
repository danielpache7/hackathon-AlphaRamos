import { User } from '@/lib/auth'
import { useRealTimeVotes } from '@/hooks/useRealtime'
import { ExcelExportService } from '@/lib/excel-export'
import { useToast } from '@/contexts/ToastContext'
import RealTimeResults from './RealTimeResults'
import VotingControls from './VotingControls'
import SystemDiagnostics from './SystemDiagnostics'
import ConnectionStatus from './ConnectionStatus'

interface AdminInterfaceProps {
  user: User
}

export default function AdminInterface({ user }: AdminInterfaceProps) {
  const { votes, loading, refreshVotes, lastRefresh } = useRealTimeVotes()
  const { success, error, warning } = useToast()

  const handleExportExcel = () => {
    if (votes.length === 0) {
      warning('No hay votos para exportar.', 'Exportación Fallida')
      return
    }

    try {
      ExcelExportService.generateReport(votes)
      success('Reporte Excel generado exitosamente.', 'Exportación Completa')
    } catch (err) {
      console.error('Error generating Excel report:', err)
      error('Error al generar el reporte Excel.', 'Exportación Fallida')
    }
  }

  const handleExportDetailedReport = () => {
    if (votes.length === 0) {
      warning('No hay votos para exportar.', 'Exportación Fallida')
      return
    }

    try {
      ExcelExportService.generateDetailedReport(votes)
      success('Reporte detallado generado exitosamente.', 'Exportación Completa')
    } catch (err) {
      console.error('Error generating detailed report:', err)
      error('Error al generar el reporte detallado.', 'Exportación Fallida')
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
      <div className="space-y-6 mb-8">
        <div className="flex flex-col space-y-4">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-light text-slate-900 tracking-tight mb-2">
              Panel de Administración
            </h2>
            <p className="text-slate-600 mb-3">
              Bienvenido {user.name}, monitorea y gestiona el proceso de votación en tiempo real.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
              <p className="text-slate-400">
                Última actualización: {lastRefresh.toLocaleTimeString('es-ES')} • Auto-actualización cada minuto
              </p>
              <div>
                <ConnectionStatus />
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <a
              href="/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 sm:px-6 py-2.5 rounded-xl font-medium transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 text-center text-sm sm:text-base whitespace-nowrap"
            >
              Dashboard en Vivo
            </a>
            <button
              onClick={refreshVotes}
              disabled={loading}
              className={`px-4 sm:px-6 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base whitespace-nowrap ${
                loading
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Actualizando...</span>
                </div>
              ) : (
                <>Actualizar</>
              )}
            </button>
            <button
              onClick={handleExportDetailedReport}
              disabled={votes.length === 0}
              className={`px-4 sm:px-6 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base whitespace-nowrap ${
                votes.length === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              Exportar Reporte
            </button>
          </div>
        </div>
      </div>

      {/* Voting Controls */}
      <VotingControls onExportExcel={handleExportExcel} />

      {/* Real-time Results */}
      <RealTimeResults />

      {/* Quick Stats */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-8">
        <h3 className="text-xl font-semibold text-slate-900 mb-6">Resumen Rápido</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-light text-slate-900 mb-1">{votes.length}</div>
            <div className="text-sm text-slate-500 font-medium">Total de Votos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-light text-slate-900 mb-1">
              {new Set(votes.map(v => v.judge_name)).size}
            </div>
            <div className="text-sm text-slate-500 font-medium">Jueces Activos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-light text-slate-900 mb-1">
              {new Set(votes.map(v => v.squad_id)).size}
            </div>
            <div className="text-sm text-slate-500 font-medium">Equipos con Votos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-light text-slate-900 mb-1">
              {votes.length > 0 ? new Date(Math.max(...votes.map(v => new Date(v.created_at).getTime()))).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
            </div>
            <div className="text-sm text-slate-500 font-medium">Último Voto</div>
          </div>
        </div>
      </div>

      {/* System Diagnostics */}
      <SystemDiagnostics />
    </div>
  )
}