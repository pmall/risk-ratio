import { DeribitDataSource } from '../../data-sources/deribit';

export async function snapshot(symbol: string, expiration: string) {
  const dataSource = new DeribitDataSource();
  try {
    const optionChain = await dataSource.getOptionChain(symbol, expiration);
    console.log(`Option chain for ${symbol} on ${expiration}:`);
    if (optionChain.length === 0) {
      console.log('No options found for this instrument and expiration.');
      return;
    }
    for (const option of optionChain) {
      console.log(option);
    }
  } catch (error: any) {
    console.error(`Error fetching option chain: ${error.message}`);
  }
}