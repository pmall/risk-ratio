import { OptionData } from '@/types/global';

export interface QualityFilters {
  minVolume: number;
  maxBidAskSpread: number;
  minOpenInterest: number;
  minIv: number;
  maxIv: number;
}

function passesQualityFilters(option: OptionData, qualityFilters: QualityFilters): boolean {
  if (option.volume < qualityFilters.minVolume) {
    return false;
  }
  if (option.openInterest < qualityFilters.minOpenInterest) {
    return false;
  }
  const bidAskSpread = (option.askPrice - option.bidPrice) / option.askPrice;
  if (option.askPrice > 0 && bidAskSpread > qualityFilters.maxBidAskSpread) {
    return false;
  }
  if (
    option.impliedVolatility < qualityFilters.minIv ||
    option.impliedVolatility > qualityFilters.maxIv
  ) {
    return false;
  }
  return true;
}

export function filterOptions(
  options: OptionData[],
  currentPrice: number, // currentPrice is not directly used in this filtering logic, but kept for interface consistency
  qualityFilters: QualityFilters
): OptionData[] {
  const callOptions = options.filter(o => o.type === 'call');
  const putOptions = options.filter(o => o.type === 'put');

  const filteredCallOptions: OptionData[] = [];
  const filteredPutOptions: OptionData[] = [];

  // Sort calls by strike descending for filtering high strikes and including lower
  callOptions.sort((a, b) => b.strike - a.strike);
  // Sort puts by strike ascending for filtering low strikes and including higher
  putOptions.sort((a, b) => a.strike - b.strike);

  // Filter Calls (from high strike to low strike)
  let callTailPassed = false;
  for (const option of callOptions) {
    if (passesQualityFilters(option, qualityFilters)) {
      callTailPassed = true;
    }
    if (callTailPassed || passesQualityFilters(option, qualityFilters)) {
      filteredCallOptions.push(option);
    }
  }

  // Filter Puts (from low strike to high strike)
  let putTailPassed = false;
  for (const option of putOptions) {
    if (passesQualityFilters(option, qualityFilters)) {
      putTailPassed = true;
    }
    if (putTailPassed || passesQualityFilters(option, qualityFilters)) {
      filteredPutOptions.push(option);
    }
  }

  return [...filteredCallOptions, ...filteredPutOptions];
}