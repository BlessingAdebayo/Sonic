// Default minimal dataset for build time when API fails
export const DEFAULT_BUILD_ASSETS = [
  { symbol: 'eth', route: '/eth' },
  { symbol: 'btc', route: '/btc' },
  { symbol: 'matic', route: '/matic' },
  { symbol: 'avax', route: '/avax' },
  { symbol: 'sol', route: '/sol' }
]

export function getDefaultBuildPaths() {
  return DEFAULT_BUILD_ASSETS.map(x => ({
    params: { symbol: x.symbol.toLowerCase() }
  }))
}

export const DEFAULT_REVALIDATE_TIME = 5 * 60 // 5 minutes in seconds

// Fallback responses for failed API calls
export const FALLBACK_RESPONSE = {
  availability: {},
  time: Date.now() / 1000
}