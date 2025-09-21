import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(true)
  const [lastPing, setLastPing] = useState<Date>(new Date())

  useEffect(() => {
    // Test connection every 30 seconds
    const testConnection = async () => {
      try {
        const { error } = await supabase.from('settings').select('id').limit(1)
        setIsConnected(!error)
        setLastPing(new Date())
      } catch (error) {
        setIsConnected(false)
      }
    }

    // Initial test
    testConnection()

    // Set up interval
    const interval = setInterval(testConnection, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
      isConnected 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    }`}>
      <div className={`w-2 h-2 rounded-full ${
        isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
      }`}></div>
      <span>
        {isConnected ? 'Conectado' : 'Desconectado'} • {lastPing.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        })}
      </span>
    </div>
  )
}