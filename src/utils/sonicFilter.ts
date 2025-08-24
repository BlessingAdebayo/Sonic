// Utility functions for filtering Sonic-only data
export const filterSonicOnly = (data: any[]) => {
  if (!Array.isArray(data)) return []
  return data.filter(item => 
    item.chain === 'Sonic' || 
    item.chains?.includes('Sonic') ||
    item.chainName === 'Sonic'
  )
}

export const isSonicProtocol = (protocol: any) => {
  return protocol.chain === 'Sonic' || protocol.chains?.includes('Sonic')
}

export const isSonicChain = (chain: string) => {
  return chain.toLowerCase() === 'sonic'
}