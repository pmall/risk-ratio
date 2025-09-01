
import { OptionData } from '../types/global';

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
    // Moneyness-based filtering
    if (option.strike > currentPrice && option.type === 'put') {
      return false;
    }
    if (option.strike < currentPrice && option.type === 'call') {
      return false;
    }

    // Quality filters
    if (option.volume < qualityFilters.minVolume) {
      return false;
    }
    if (option.openInterest < qualityFilters.minOpenInterest) {
      return false;
    }
    const bidAskSpread = (option.askPrice - option.bidPrice) / option.askPrice;
    if (bidAskSpread > qualityFilters.maxBidAskSpread) {
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
