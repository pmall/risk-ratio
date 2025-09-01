import { getOptionChainSnapshot } from '@/services/analysis';

export async function snapshot(source: string, instrument: string, expiration: string) {
  const optionChain = await getOptionChainSnapshot(source, instrument, expiration);
  console.log(`Option chain for ${instrument} on ${expiration} from ${source}:`);
  if (optionChain.length === 0) {
    console.log('No options found for this instrument and expiration.');
    return;
  }
  for (const option of optionChain) {
    console.log(option);
  }
}