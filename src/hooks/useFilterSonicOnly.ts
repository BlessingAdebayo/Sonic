import { useMemo } from 'react'

// Helper hook to filter data to only show Sonic-related items
export const useFilterSonicOnly = (data: any[]) => {
  return useMemo(() => {
    if (!Array.isArray(data)) return []
    return data.filter(item => 
      item.chain === 'Sonic' || 
      item.chains?.includes('Sonic') ||
      item.chainName === 'Sonic' ||
      item.category === 'Sonic' ||
      item.protocol === 'Sonic'
    )
  }, [data])
}