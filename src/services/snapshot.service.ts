import { getDataSource } from '@/data-sources';
import { filterOptions } from '@/core/filters';
import { OptionData } from '@/types/global';

export async function getOptionChainSnapshot(
  source: string,
  instrument: string,
  expiration: string
): Promise<OptionData[]> {
  const dataSource = getDataSource(source, instrument);
  
  const [currentPrice, optionChain] = await Promise.all([
    dataSource.getCurrentPrice(instrument),
    dataSource.getOptionChain(instrument, expiration),
  ]);

  const filteredOptionChain = filterOptions(optionChain, currentPrice);

  return filteredOptionChain;
}