// Failsafe data for special types when API fails
// Comprehensive fallback data for all special types
export const FALLBACK_DATA = {
  aggregators: {
    props: {
      protocols: [
        { name: 'cowswap', total24h: 1000000 },
        { name: '1inch', total24h: 900000 }
      ]
    }
  },
  options: {
    props: {
      protocols: [
        { name: 'lyra', total24h: 1000000 },
        { name: 'dopex', total24h: 900000 }
      ]
    }
  },
  forks: {
    props: {
      protocols: [
        { name: 'uniswap', total24h: 1000000 },
        { name: 'pancakeswap', total24h: 900000 }
      ]
    }
  },
  bridges: {
    props: {
      protocols: [
        { name: 'portal', total24h: 1000000 },
        { name: 'stargate', total24h: 900000 }
      ]
    }
  },
  chains: {
    props: {
      protocols: [
        { name: 'ethereum', total24h: 1000000 },
        { name: 'bsc', total24h: 900000 }
      ]
    }
  }
}

export const isSpecialType = (type: string) => {
  return type === 'aggregators' || type === 'options' || type === 'forks'
}