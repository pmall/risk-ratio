import { getDataSource } from '@/data-sources';
import { filterOptions } from '@/core/filters';
import { getVolatilityModel, getProbabilityForPrice } from '@/core/probability';
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

  const volatilityModel = getVolatilityModel(filteredOptions, currentPrice);

  const priceProbabilities = filteredOptions
    .map((option) => {
      const cdf_value = getProbabilityForPrice(option.strike, currentPrice, volatilityModel);

      return {
        price: option.strike,
        cdfValue: cdf_value,
        ivSource: option.strike,
      };
    })
    .sort((a, b) => a.price - b.price);

  return {
    currentPrice,
    totalOptions,
    filteredOptionsCount,
    priceProbabilities,
  };
}
