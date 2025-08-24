export const AVAILABLE_CHAINS = ['sonic'];

export const CHAIN_METADATA = {
  sonic: {
    name: 'Sonic',
    symbol: 'S',
    coingeckoId: 'sonic-3',
    type: 'L1',
  }
};

// Ensure only Sonic chain is available throughout the application
export const ENABLED_CHAINS = ['sonic'];
export const DEFAULT_CHAIN = 'sonic';