import { getAvailableExpirationsList } from '@/services/analysis';

export async function listExpirations(source: string, instrument: string) {
  const expirations = await getAvailableExpirationsList(source, instrument);

  console.log(`Available expirations for ${instrument} from ${source}:`);
  for (const expiration of expirations) {
    console.log(expiration);
  }
}