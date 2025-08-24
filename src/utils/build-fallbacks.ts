// Default minimal set of assets to use during build when API fails
export const DEFAULT_ASSETS = [
  { symbol: 'eth', route: '/eth' },
  { symbol: 'btc', route: '/btc' },
  { symbol: 'matic', route: '/matic' },
  { symbol: 'avax', route: '/avax' },
  { symbol: 'sol', route: '/sol' }
]

export const getDefaultPaths = () => {
  return DEFAULT_ASSETS.map(x => ({
    params: { symbol: x.symbol.toLowerCase() }
  }))
}

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