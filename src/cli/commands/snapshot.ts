
import { DeribitDataSource } from '../../data-sources/deribit';

export async function snapshot(symbol: string) {
  const dataSource = new DeribitDataSource();

  console.log(`Fetching snapshot for ${symbol}...`);

  try {
    const currentPrice = await dataSource.getCurrentPrice(symbol);
    console.log(`Current Price for ${symbol}: $${currentPrice.toFixed(2)}`);
  } catch (error) {
    console.error(`Failed to fetch snapshot for ${symbol}:`, error);
  }
}
