import { getDataSource } from '@/data-sources';

export async function getAvailableExpirationsList(
  source: string,
  instrument: string
): Promise<string[]> {
  const dataSource = getDataSource(source, instrument);
  const expirations = await dataSource.getAvailableExpirations(instrument);
  return expirations;
}
