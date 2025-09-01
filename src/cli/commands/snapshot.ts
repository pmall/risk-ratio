import { getDataSource } from '../../data-sources';

export async function snapshot(source: string, instrument: string, expiration: string) {
  const dataSource = getDataSource(source, instrument);
  try {
    const optionChain = await dataSource.getOptionChain(instrument, expiration);
    console.log(`Option chain for ${instrument} on ${expiration} from ${source}:`);
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