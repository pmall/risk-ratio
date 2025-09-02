import { OptionData, PriceProbability } from '@/types/global';
import { norm_cdf } from '@/utils/math';
import { polynomialFit } from '@/utils/regression';

export function calculatePriceProbabilities(
  options: OptionData[],
  currentPrice: number
): PriceProbability[] {
  if (options.length === 0) {
    return [];
  }

  const expirationTimestamp = new Date(options[0].expiration).getTime();
  const currentTimestamp = Date.now();
  let T = (expirationTimestamp - currentTimestamp) / (1000 * 60 * 60 * 24 * 365);
  if (T <= 0) {
    T = 0.000001; // Avoid division by zero or negative sqrt
  }

  // Prepare data for volatility smile fitting
  const fitPoints = options.map((option) => ({
    x: Math.log(option.strike / currentPrice), // Log-moneyness
    y: option.impliedVolatility / 100, // IV
  }));

  // Get the coefficients for the smoothed volatility curve
  const vol_model = polynomialFit(fitPoints);

  const probabilities = options
    .map((option) => {
      const k = Math.log(option.strike / currentPrice);
      // Use the smoothed IV from our model
      const iv = vol_model.a * k * k + vol_model.b * k + vol_model.c;

      const sigma_T = iv * Math.sqrt(T);
      const Z = Math.log(option.strike / currentPrice) / sigma_T;
      const cdf_value = norm_cdf(Z);

      return {
        price: option.strike,
        cdfValue: cdf_value,
        ivSource: option.strike,
      };
    })
    .sort((a, b) => a.price - b.price);

  return probabilities;
}
