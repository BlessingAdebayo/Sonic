export interface DefiLlamaResponse<T> {
  data: T;
  status: number;
}

export interface AvailabilityResponse {
  availability: { [key: string]: boolean };
  time: number;
}

export interface LiquidationsData {
  symbol: string;
  currentPrice: number;
  positions: Array<{
    liqPrice: number;
    collateralAmount: number;
    collateralValue: number;
    protocol: string;
    chain: string;
    url?: string;
    displayName?: string;
  }>;
  time: number;
}