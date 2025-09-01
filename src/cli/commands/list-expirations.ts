
import { getDataSource } from '@/data-sources';

export async function listExpirations(source: string, instrument: string) {
  const dataSource = getDataSource(source, instrument);
  const expirations = await dataSource.getAvailableExpirations(instrument);

  console.log(`Available expirations for ${instrument} from ${source}:`);
  for (const expiration of expirations) {
    console.log(expiration);
  }
}
