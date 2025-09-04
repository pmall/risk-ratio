import { getDataSource } from '@/data-sources';
import { filterOptions } from '@/core/filters';
import { calculatePriceProbabilities } from '@/core/probability';
import { PriceProbability } from '@/types/global';

export interface ProbabilisticAnalysisResult {
  currentPrice: number;
  totalOptions: number;
  filteredOptionsCount: number;
  priceProbabilities: PriceProbability[];
}

export async function getProbabilisticPriceDistribution(
  source: string,
  instrument: string,
  expiration: string
): Promise<ProbabilisticAnalysisResult> {
  const dataSource = getDataSource(source, instrument);

  const [options, currentPrice] = await Promise.all([
    dataSource.getOptionChain(instrument, expiration),
    dataSource.getCurrentPrice(instrument),
  ]);

  const totalOptions = options.length;

  const filteredOptions = filterOptions(options, currentPrice);

  const filteredOptionsCount = filteredOptions.length;

  const priceProbabilities = calculatePriceProbabilities(
    filteredOptions,
    currentPrice
  );

  return {
    currentPrice,
    totalOptions,
    filteredOptionsCount,
    priceProbabilities,
  };
}
