// Chain filtering utilities
import { ENABLED_CHAINS } from '~/constants/chains'

export const filterForSonicChain = (data: any[]) => {
  if (!Array.isArray(data)) return []
  return data.filter(item => 
    item.chain?.toLowerCase() === 'sonic' || 
    item.chains?.includes('sonic') ||
    item.chainName?.toLowerCase() === 'sonic'
  )
}

export const isSonicEnabled = () => {
  return ENABLED_CHAINS.includes('sonic')
}

export const getSupportedChains = () => {
  return ENABLED_CHAINS
}

export const validateChain = (chain: string) => {
  return chain?.toLowerCase() === 'sonic'
}