import { useCallback } from 'react'

// Custom hook to force refresh across components
export function useForceRefresh() {
  const forceRefresh = useCallback(() => {
    // Dispatch a custom event to trigger refresh in all listening components
    window.dispatchEvent(new CustomEvent('forceRefresh', {
      detail: { timestamp: Date.now() }
    }))
  }, [])

  return { forceRefresh }
}

// Hook to listen for force refresh events
export function useForceRefreshListener(callback: () => void) {
  const handleForceRefresh = useCallback(() => {
    callback()
  }, [callback])

  // Set up event listener
  if (typeof window !== 'undefined') {
    window.addEventListener('forceRefresh', handleForceRefresh)
    
    // Cleanup
    return () => {
      window.removeEventListener('forceRefresh', handleForceRefresh)
    }
  }
}