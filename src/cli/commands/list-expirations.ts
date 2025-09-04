import { Command } from 'commander';
import { getAvailableExpirationsList } from '@/services/listExpirations.service';

export const listExpirationsCommand = new Command('list-expirations')
  .description('Lists available expiration dates for a given instrument')
  .argument('<source>', 'Data source (e.g., deribit)')
  .argument('<instrument>', 'Instrument name (e.g., BTC-PERPETUAL)')
  .action(async (source, instrument) => {
    const expirations = await getAvailableExpirationsList(source, instrument);

    console.log(`Available expirations for ${instrument} from ${source}:`);
    for (const expiration of expirations) {
      console.log(expiration);
    }
  });
