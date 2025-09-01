
import { DeribitDataSource } from '../../data-sources/deribit';

export async function listExpirations(symbol: string) {
  const dataSource = new DeribitDataSource();
  const expirations = await dataSource.getAvailableExpirations(symbol);

  console.log(`Available expirations for ${symbol}:`);
  for (const expiration of expirations) {
    console.log(expiration);
  }
}
