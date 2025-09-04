import { OptionData, PriceProbability } from '@/types/global';
import { norm_cdf } from '@/utils/math';
import { polynomialFit } from '@/utils/regression';

export interface VolatilityModel {
  vol_model: { a: number; b: number; c: number };
  T: number;
}

export function getVolatilityModel(options: OptionData[], currentPrice: number): VolatilityModel {
  if (options.length === 0) {
    throw new Error("Options data cannot be empty for volatility model calculation.");
  }

  const expirationTimestamp = new Date(options[0].expiration).getTime();
  const currentTimestamp = Date.now();
  let T = (expirationTimestamp - currentTimestamp) / (1000 * 60 * 60 * 24 * 365);
  if (T <= 0) {
    T = 0.000001; // Avoid division by zero or negative sqrt
  }

  const fitPoints = options.map((option) => ({
    x: Math.log(option.strike / currentPrice), // Log-moneyness
    y: option.impliedVolatility / 100, // IV
  }));

  const vol_model = polynomialFit(fitPoints);

  return { vol_model, T };
}

export function getProbabilityForPrice(
  price: number,
  currentPrice: number,
  volatilityModel: VolatilityModel
): number {
  const { vol_model, T } = volatilityModel;

  const k = Math.log(price / currentPrice);
  const iv = vol_model.a * k * k + vol_model.b * k + vol_model.c;

  // Ensure IV is not negative or too small for sqrt
  const safeIv = Math.max(0.0001, iv); // Ensure IV is positive and not too small

  const sigma_T = safeIv * Math.sqrt(T);
  const Z = Math.log(price / currentPrice) / sigma_T;
  const cdf_value = norm_cdf(Z);

  return cdf_value;
}


