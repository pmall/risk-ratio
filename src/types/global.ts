
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

export type SpreadDefinition = {
  type: 'call' | 'put';
  side: 'debit' | 'credit';
  longStrike: number;
  shortStrike: number;
};

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
  longStrike: number;
  shortStrike: number;
  expectedPnL: number;
}