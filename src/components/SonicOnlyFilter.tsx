import { FC, ReactNode } from 'react'
import { useFilterSonicOnly } from '~/hooks/useFilterSonicOnly'

interface Props {
  data: any[]
  children: (filteredData: any[]) => ReactNode
}

export const SonicOnlyFilter: FC<Props> = ({ data, children }) => {
  const filteredData = useFilterSonicOnly(data)
  return <>{children(filteredData)}</>
}