// Default asset list to use during build when API fails or rate limits
export const DEFAULT_ASSETS_LIST = [
  { name: 'Ethereum', symbol: 'eth', route: '/eth' },
  { name: 'Bitcoin', symbol: 'btc', route: '/btc' },
  { name: 'Polygon', symbol: 'matic', route: '/matic' },
  { name: 'Avalanche', symbol: 'avax', route: '/avax' },
  { name: 'Solana', symbol: 'sol', route: '/sol' }
]

export const DEFAULT_CHART_DATA = {
  name: '',
  symbol: '',
  currentPrice: 0,
  badDebts: 0,
  dangerousPositionsAmount: 0, 
  dangerousPositionsAmounts: { chains: {}, protocols: {} },
  totalLiquidable: 0,
  totalLiquidables: { chains: {}, protocols: {} },
  totalBins: 100,
  chartDataBins: { chains: {}, protocols: {} },
  binSize: 0,
  availability: { protocols: [], chains: [] },
  time: Date.now() / 1000,
  topPositions: [],
  totalPositions: 0
}

export const FALLBACK_AVAILABILITY = {
  eth: true,
  btc: true,
  matic: true,
  avax: true,
  sol: true
}