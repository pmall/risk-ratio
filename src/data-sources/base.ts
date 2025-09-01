
import { OptionData } from '../types/global';

export interface DataSource {
  getOptionChain(instrument: string, expiration: string): Promise<OptionData[]>;
  getAvailableExpirations(instrument: string): Promise<string[]>;
  getCurrentPrice(instrument: string): Promise<number>;
}
