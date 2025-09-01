
export interface OptionData {
  strike: number;
  type: 'call' | 'put';
  impliedVolatility: number;
  volume: number;
  openInterest: number;
  bidPrice: number;
  askPrice: number;
  lastPrice: number;
  expiration: string;
  instrument_name: string;
}

export type OptionSide = 'buy' | 'sell';

export interface PriceProbability {
  price: number;
  probability: number;
  ivSource: number;  // Strike price used for IV
}

export interface AnalysisResult {
  symbol: string;
  currentPrice: number;
  expiration: string;
  priceDistribution: PriceProbability[];
  metadata: {
    totalOptions: number;
    filteredOptions: number;
    priceRange: [number, number];
    totalProbability: number;
  };
}
