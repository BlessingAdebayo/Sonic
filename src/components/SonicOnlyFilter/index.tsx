import * as React from 'react'
import { useFilterSonicOnly } from '~/hooks/useFilterSonicOnly'

interface Props {
  data: any[]
  children: (filteredData: any[]) => React.ReactNode
}

export function SonicOnlyFilter({ data, children }: Props) {
  // Always filter for Sonic only
  const filteredData = React.useMemo(() => 
    data.filter(item => 
      item.chain === 'Sonic' || 
      item.chains?.includes('Sonic') ||
      item.chainName === 'Sonic' ||
      item.category === 'Sonic' ||
      item.protocol === 'Sonic'
    )
  , [data])

  return <>{children(filteredData)}</>
}