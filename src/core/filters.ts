
import { OptionData } from '@/types/global';

export interface QualityFilters {
  minVolume: number;
  maxBidAskSpread: number;
  minOpenInterest: number;
  minIv: number;
  maxIv: number;
}

export function filterOptions(
  options: OptionData[],
  currentPrice: number,
  qualityFilters: QualityFilters
): OptionData[] {
  return options.filter((option) => {
    // Quality filters
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
  });
}
