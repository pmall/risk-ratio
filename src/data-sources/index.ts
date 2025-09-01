import { DeribitDataSource } from '@/data-sources/deribit';
import { DataSource } from '@/data-sources/base';

export function getDataSource(source: string, instrument: string): DataSource {
  if (source.toLowerCase() === 'deribit') {
    // For Deribit, we need to parse the instrument string (e.g., SOL-USDC)
    const parts = instrument.split('-');
    if (parts.length !== 2) {
      throw new Error(`Invalid instrument format for Deribit: ${instrument}. Expected format: BASE-QUOTE`);
    }
    const [baseCurrency, quoteCurrency] = parts;
    return new DeribitDataSource(baseCurrency.toUpperCase(), quoteCurrency.toUpperCase());
  } else {
    throw new Error(`Unsupported data source: ${source}`);
  }
}
