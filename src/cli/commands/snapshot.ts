import { Command } from 'commander';
import { getOptionChainSnapshot } from '@/services/snapshot.service';

export const snapshotCommand = new Command('snapshot')
  .description('Fetches and displays a snapshot of the option chain for a given instrument and expiration')
  .argument('<source>', 'Data source (e.g., deribit)')
  .argument('<instrument>', 'Instrument name (e.g., BTC-PERPETUAL)')
  .argument('<expiration>', 'Expiration date in DDMMMYY format (e.g., 26DEC25)')
  .action(async (source, instrument, expiration) => {
    const optionChain = await getOptionChainSnapshot(source, instrument, expiration);
    console.log(`Option chain for ${instrument} on ${expiration} from ${source}:`);
    if (optionChain.length === 0) {
      console.log('No options found for this instrument and expiration.');
      return;
    }
    for (const option of optionChain) {
      console.log(option);
    }
  });
