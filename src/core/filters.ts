import { OptionData } from '@/types/global';

export interface QualityFilters {
  minVolume: number;
  maxBidAskSpread: number;
  minOpenInterest: number;
  minIv: number;
  maxIv: number;
}

function passesQualityFilters(option: OptionData, qualityFilters: QualityFilters): boolean {
  // Bid and ask must be positive
  if (option.bidPrice <= 0 || option.askPrice <= 0) {
    return false;
  }
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
  currentPrice: number,
  qualityFilters: QualityFilters
): OptionData[] {
  // Step 1: Initial Filtering based on strike price relative to currentPrice
  const callOptions = options.filter(o => o.type === 'call' && o.strike > currentPrice);
  const putOptions = options.filter(o => o.type === 'put' && o.strike < currentPrice);

  const filteredCallOptions: OptionData[] = [];
  const filteredPutOptions: OptionData[] = [];

  // Sort calls by strike descending for tail filtering
  callOptions.sort((a, b) => b.strike - a.strike);
  // Sort puts by strike ascending for tail filtering
  putOptions.sort((a, b) => a.strike - b.strike);

  // Step 2: Tail Filtering for Calls
  let callTailPassed = false;
  for (const option of callOptions) {
    if (passesQualityFilters(option, qualityFilters)) {
      callTailPassed = true;
    }
    if (callTailPassed) {
      filteredCallOptions.push(option);
    }
  }

  // Step 2: Tail Filtering for Puts
  let putTailPassed = false;
  for (const option of putOptions) {
    if (passesQualityFilters(option, qualityFilters)) {
      putTailPassed = true;
    }
    if (putTailPassed) {
      filteredPutOptions.push(option);
    }
  }

  // Step 3: Merge and sort by strike price ascending
  const combinedOptions = [...filteredCallOptions, ...filteredPutOptions];
  combinedOptions.sort((a, b) => a.strike - b.strike);

  return combinedOptions;
}