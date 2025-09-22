import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(true)
  const [, setLastPing] = useState<Date>(new Date())

  useEffect(() => {
    // Test connection every 30 seconds
    const testConnection = async () => {
      try {
        const { error } = await supabase.from('settings').select('id').limit(1)
        setIsConnected(!error)
        setLastPing(new Date())
      } catch {
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
    <div className="flex items-center space-x-2 text-xs">
      <div className={`w-2 h-2 rounded-full ${
        isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
      }`}></div>
      <span className="text-slate-400 font-medium">
        {isConnected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  )
}