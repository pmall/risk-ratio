
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
