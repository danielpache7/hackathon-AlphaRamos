import { useState, useEffect } from 'react'
import { SystemCheck } from '@/lib/system-check'

export default function SystemDiagnostics() {
  const [healthCheck, setHealthCheck] = useState<any>(null)
  const [systemStats, setSystemStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const runChecks = async () => {
      setIsLoading(true)
      try {
        const [health, stats] = await Promise.all([
          SystemCheck.runHealthCheck(),
          SystemCheck.getSystemStats()
        ])
        setHealthCheck(health)
        setSystemStats(stats)
      } catch (error) {
        console.error('Error running system checks:', error)
      } finally {
        setIsLoading(false)
      }
    }

    runChecks()
  }, [])

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Diagnóstico del Sistema</h3>
        <p className="text-sm text-gray-600">Estado de salud y configuración</p>
      </div>
      
      <div className="p-4 space-y-6">
        {/* Health Status */}
        {healthCheck && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className={`w-3 h-3 rounded-full ${
                healthCheck.success ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <h4 className="font-medium text-gray-900">
                Estado General: {healthCheck.success ? 'Saludable' : 'Con Problemas'}
              </h4>
            </div>

            {healthCheck.issues.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-red-800 mb-2">Problemas Críticos:</h5>
                <ul className="space-y-1">
                  {healthCheck.issues.map((issue, index) => (
                    <li key={index} className="text-sm text-red-700 flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {healthCheck.warnings.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-yellow-800 mb-2">Advertencias:</h5>
                <ul className="space-y-1">
                  {healthCheck.warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-yellow-700 flex items-start">
                      <span className="text-yellow-500 mr-2">•</span>
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* System Stats */}
        {systemStats && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Estadísticas del Sistema</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-lg font-bold text-blue-600">{systemStats.totalSquads}</div>
                <div className="text-xs text-gray-600">Equipos</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-lg font-bold text-green-600">{systemStats.totalJudges}</div>
                <div className="text-xs text-gray-600">Jueces</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-lg font-bold text-purple-600">{systemStats.totalCriteria}</div>
                <div className="text-xs text-gray-600">Criterios</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-lg font-bold text-orange-600">{systemStats.totalVotes}</div>
                <div className="text-xs text-gray-600">Votos</div>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Estado de Votación:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  systemStats.votingStatus === 'OPEN' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {systemStats.votingStatus}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Códigos de Acceso:</span>
                <span className="ml-2 text-gray-600">{systemStats.totalAccessCodes}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Peso Total Criterios:</span>
                <span className={`ml-2 ${
                  systemStats.criteriaWeightTotal === 100 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {systemStats.criteriaWeightTotal}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}