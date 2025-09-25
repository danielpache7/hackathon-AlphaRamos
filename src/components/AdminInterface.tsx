import { useState } from 'react'
import { User } from '@/lib/auth'
import { useRealTimeVotes } from '@/hooks/useRealtime'
import { ExcelExportService } from '@/lib/excel-export'
import { DatabaseService } from '@/lib/database'
import { useToast } from '@/contexts/ToastContext'
import { useForceRefresh, useForceRefreshListener } from '@/hooks/useForceRefresh'
import RealTimeResults from './RealTimeResults'
import VotingControls from './VotingControls'
import SystemDiagnostics from './SystemDiagnostics'
import ConnectionStatus from './ConnectionStatus'
import ConfirmModal from './ConfirmModal'

interface AdminInterfaceProps {
  user: User
}

export default function AdminInterface({ user }: AdminInterfaceProps) {
  const { votes, loading, refreshVotes, lastRefresh } = useRealTimeVotes()
  const { success, error, warning } = useToast()
  const { forceRefresh } = useForceRefresh()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Listen for force refresh events
  useForceRefreshListener(refreshVotes)

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

  const handleDeleteAllVotes = async () => {
    setShowDeleteConfirm(false)
    setIsDeleting(true)

    try {
      const result = await DatabaseService.deleteAllVotes()
      if (result) {
        success('Todos los votos han sido eliminados exitosamente.', 'Votación Reiniciada')
        
        // Force refresh after a short delay and trigger global refresh
        setTimeout(() => {
          refreshVotes()
          forceRefresh()
        }, 1000)
      } else {
        error('Error al eliminar los votos.', 'Eliminación Fallida')
      }
    } catch (err) {
      console.error('Error deleting all votes:', err)
      error('Error al eliminar los votos.', 'Eliminación Fallida')
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 rounded w-64 mb-2 animate-pulse" style={{ backgroundColor: '#F2F2F2' }}></div>
            <div className="h-4 rounded w-96 animate-pulse" style={{ backgroundColor: '#F2F2F2' }}></div>
          </div>
          <div className="h-10 rounded w-32 animate-pulse" style={{ backgroundColor: '#F2F2F2' }}></div>
        </div>
        <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#009FE3' }}>
          <div className="animate-pulse space-y-4">
            <div className="h-6 rounded w-48" style={{ backgroundColor: '#F2F2F2' }}></div>
            <div className="flex space-x-4">
              <div className="h-10 rounded flex-1" style={{ backgroundColor: '#F2F2F2' }}></div>
              <div className="h-10 rounded flex-1" style={{ backgroundColor: '#F2F2F2' }}></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-4" style={{ borderColor: '#009FE3' }}>
              <div className="animate-pulse">
                <div className="h-8 rounded w-16 mb-2" style={{ backgroundColor: '#F2F2F2' }}></div>
                <div className="h-4 rounded w-24" style={{ backgroundColor: '#F2F2F2' }}></div>
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
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight mb-2" style={{ color: '#003366' }}>
              Panel de Administración
            </h2>
            <p className="mb-3" style={{ color: '#1A1A1A' }}>
              Bienvenido {user.name}, monitorea y gestiona el proceso de votación en tiempo real.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
              <p style={{ color: '#1A1A1A', opacity: 0.7 }}>
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
              className="px-4 sm:px-6 py-2.5 rounded-xl font-medium transition-all duration-200 text-white hover:opacity-90 text-center text-sm sm:text-base whitespace-nowrap"
              style={{ backgroundColor: '#009FE3' }}
            >
              Dashboard en Vivo
            </a>
            <a
              href="/mentions"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 sm:px-6 py-2.5 rounded-xl font-medium transition-all duration-200 hover:opacity-90 text-center text-sm sm:text-base whitespace-nowrap"
              style={{ backgroundColor: '#A7E100', color: '#003366' }}
            >
              🏆 Menciones de Honor
            </a>
            <button
              onClick={refreshVotes}
              disabled={loading}
              className={`px-4 sm:px-6 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base whitespace-nowrap ${
                loading
                  ? 'cursor-not-allowed opacity-50'
                  : 'text-white hover:opacity-90'
              }`}
              style={{ backgroundColor: loading ? '#F2F2F2' : '#009FE3', color: loading ? '#1A1A1A' : 'white' }}
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
                  ? 'cursor-not-allowed opacity-50'
                  : 'text-white hover:opacity-90'
              }`}
              style={{ backgroundColor: votes.length === 0 ? '#F2F2F2' : '#A7E100', color: votes.length === 0 ? '#1A1A1A' : '#003366' }}
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
      <div className="bg-white rounded-2xl border p-8" style={{ borderColor: '#009FE3' }}>
        <h3 className="text-xl font-semibold mb-6" style={{ color: '#003366' }}>Resumen Rápido</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-light mb-1" style={{ color: '#009FE3' }}>{votes.length}</div>
            <div className="text-sm font-medium" style={{ color: '#1A1A1A' }}>Total de Votos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-light mb-1" style={{ color: '#009FE3' }}>
              {new Set(votes.map(v => v.judge_name)).size}
            </div>
            <div className="text-sm font-medium" style={{ color: '#1A1A1A' }}>Jueces Activos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-light mb-1" style={{ color: '#009FE3' }}>
              {new Set(votes.map(v => v.squad_id)).size}
            </div>
            <div className="text-sm font-medium" style={{ color: '#1A1A1A' }}>Equipos con Votos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-light mb-1" style={{ color: '#009FE3' }}>
              {votes.length > 0 ? new Date(Math.max(...votes.map(v => new Date(v.created_at).getTime()))).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
            </div>
            <div className="text-sm font-medium" style={{ color: '#1A1A1A' }}>Último Voto</div>
          </div>
        </div>
      </div>

      {/* System Diagnostics */}
      <SystemDiagnostics />

      {/* Danger Zone */}
      <div className="border rounded-2xl p-8 mt-12" style={{ backgroundColor: '#F2F2F2', borderColor: '#009FE3' }}>
        <h3 className="text-xl font-semibold mb-4" style={{ color: '#003366' }}>Zona de Peligro</h3>
        <p className="mb-6" style={{ color: '#1A1A1A' }}>
          Esta acción eliminará permanentemente todos los votos y reiniciará la votación. Esta acción no se puede deshacer.
        </p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isDeleting || votes.length === 0}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
            isDeleting || votes.length === 0
              ? 'cursor-not-allowed opacity-50'
              : 'text-white hover:opacity-90 hover:shadow-lg'
          }`}
          style={{ backgroundColor: isDeleting || votes.length === 0 ? '#F2F2F2' : '#dc2626', color: isDeleting || votes.length === 0 ? '#1A1A1A' : 'white' }}
        >
          {isDeleting ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Eliminando...</span>
            </div>
          ) : (
            'Eliminar Toda la Votación'
          )}
        </button>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Eliminar Toda la Votación"
        message={`¿Estás completamente seguro de que quieres eliminar TODOS los votos (${votes.length} votos)? Esta acción no se puede deshacer y reiniciará completamente la votación.`}
        confirmText="Sí, Eliminar Todo"
        onConfirm={handleDeleteAllVotes}
        onCancel={() => setShowDeleteConfirm(false)}
        type="danger"
      />
    </div>
  )
}