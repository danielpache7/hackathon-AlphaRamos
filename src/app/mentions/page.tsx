'use client'

import { useEffect, useState } from 'react'
import { DatabaseService } from '@/lib/database'
import { Vote } from '@/lib/supabase'
import HonorableMentions from '@/components/HonorableMentions'

export default function MentionsPage() {
  const [votes, setVotes] = useState<Vote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const allVotes = await DatabaseService.getAllVotes()
        setVotes(allVotes)
      } catch (error) {
        console.error('Error fetching votes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVotes()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchVotes, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="text-6xl mb-4">🏆</div>
            <div className="h-8 rounded w-64 mx-auto mb-4 animate-pulse" style={{ backgroundColor: '#F2F2F2' }}></div>
            <div className="h-4 rounded w-96 mx-auto animate-pulse" style={{ backgroundColor: '#F2F2F2' }}></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-12">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border p-6" style={{ borderColor: '#009FE3' }}>
                <div className="animate-pulse text-center">
                  <div className="h-12 w-12 rounded-full mx-auto mb-4" style={{ backgroundColor: '#F2F2F2' }}></div>
                  <div className="h-4 rounded w-24 mx-auto mb-2" style={{ backgroundColor: '#F2F2F2' }}></div>
                  <div className="h-8 rounded w-16 mx-auto mb-4" style={{ backgroundColor: '#F2F2F2' }}></div>
                  <div className="h-6 rounded w-32 mx-auto" style={{ backgroundColor: '#F2F2F2' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-8">
      <div className="max-w-7xl mx-auto">
        <HonorableMentions votes={votes} />
        
        <div className="text-center mt-12">
          <p className="text-sm" style={{ color: '#1A1A1A', opacity: 0.5 }}>
            Actualización automática cada 30 segundos • {new Date().toLocaleTimeString('es-ES')}
          </p>
        </div>
      </div>
    </div>
  )
}