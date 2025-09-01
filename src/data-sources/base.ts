
import { OptionData } from '../types/global';

export interface DataSource {
  getOptionChain(symbol: string, expiration: string): Promise<OptionData[]>;
  getAvailableExpirations(symbol: string): Promise<string[]>;
  getCurrentPrice(symbol: string): Promise<number>;
}
