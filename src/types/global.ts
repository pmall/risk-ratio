
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

export interface PriceProbability {
  price: number;
  cdfValue: number; // This will be P(Price <= K)
  ivSource: number;  // Strike price used for IV
}

export interface SpreadDefinition {
  type: 'call' | 'put';
  strikes: [number, number];
  side: 'debit' | 'credit';
}

export interface SpreadAnalysisResult {
  netPremium: number;
  maxRisk: number;
  maxReward: number;
  expectedPayoff: number;
  riskRewardRatio: number;
  probabilityOfProfit: number;
  breakEvenPrice: number;
  spreadType: string; // e.g., "Bull Call Spread"
  type: 'call' | 'put';
  side: 'debit' | 'credit';
  strikes: [number, number];
  expectedPnL: number;
}

export interface ScanFilters {
  maxSpreadWidth?: number;
  maxDebit?: number;
  minCredit?: number;
}

export interface RankedSpread extends SpreadAnalysisResult {
  longStrike: number;
  shortStrike: number;
}

export interface RankedSpreadsResult {
  bullCallSpreads: RankedSpread[];
  bearCallSpreads: RankedSpread[];
  bullPutSpreads: RankedSpread[];
  bearPutSpreads: RankedSpread[];
}
