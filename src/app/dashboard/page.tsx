'use client'

import dynamic from 'next/dynamic'
import { ToastProvider } from '@/contexts/ToastContext'

const LiveDashboard = dynamic(() => import('@/components/LiveDashboard'), { ssr: false })

export default function DashboardPage() {
  return (
    <ToastProvider>
      <LiveDashboard />
    </ToastProvider>
  )
}