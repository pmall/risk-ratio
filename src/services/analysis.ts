import { getDataSource } from '@/data-sources';
import { filterOptions } from '@/core/filters';
import { calculatePriceProbabilities } from '@/core/probability';
import { config } from '@/config';
import { PriceProbability, OptionData } from '@/types/global';

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

  const filteredOptions = filterOptions(options, currentPrice, {
    minVolume: 0,
    maxBidAskSpread: config.maxBidAskSpread,
    minOpenInterest: 0,
    minIv: 0.01,
    maxIv: config.maxIv,
  });

  const filteredOptionsCount = filteredOptions.length;

  const priceProbabilities = calculatePriceProbabilities(
    filteredOptions,
    currentPrice,
    config.priceStep,
    config.priceRangeExtensionFactor
  );

  

  return {
    currentPrice,
    totalOptions,
    filteredOptionsCount,
    priceProbabilities,
  };
}

export async function getOptionChainSnapshot(
  source: string,
  instrument: string,
  expiration: string
): Promise<OptionData[]> {
  const dataSource = getDataSource(source, instrument);
  // Fetch current price to use in filtering
  const currentPrice = await dataSource.getCurrentPrice(instrument);
  const optionChain = await dataSource.getOptionChain(instrument, expiration);

  const filteredOptionChain = filterOptions(optionChain, currentPrice, {
    minVolume: 0,
    maxBidAskSpread: config.maxBidAskSpread,
    minOpenInterest: 0,
    minIv: 0.01,
    maxIv: config.maxIv,
  });

  return filteredOptionChain;
}

export async function getAvailableExpirationsList(
  source: string,
  instrument: string
): Promise<string[]> {
  const dataSource = getDataSource(source, instrument);
  const expirations = await dataSource.getAvailableExpirations(instrument);
  return expirations;
}