
import { OptionData, PriceProbability } from '../types/global';
import { logNormalPdf } from '../utils/math';

export function calculatePriceProbabilities(
  options: OptionData[],
  currentPrice: number,
  priceStep: number,
  priceRangeExtensionFactor: number
): PriceProbability[] {
  const minStrike = Math.min(...options.map((o) => o.strike));
  const maxStrike = Math.max(...options.map((o) => o.strike));

  const minPrice = minStrike / priceRangeExtensionFactor;
  const maxPrice = maxStrike * priceRangeExtensionFactor;

  const callOptions = options.filter((o) => o.type === 'call');
  const putOptions = options.filter((o) => o.type === 'put');

  // Find the ATM implied volatility
  let atmIv: number;
  const atmOption = options.reduce((prev, curr) =>
    Math.abs(curr.strike - currentPrice) < Math.abs(prev.strike - currentPrice)
      ? curr
      : prev
  );
  atmIv = atmOption.impliedVolatility;

  const probabilities: PriceProbability[] = [];

  for (let price = minPrice; price <= maxPrice; price += priceStep) {
    const probability = logNormalPdf(price, Math.log(currentPrice), atmIv);
    probabilities.push({ price, probability, ivSource: atmOption.strike });
  }

  // Normalize probabilities
  const totalProbability = probabilities.reduce(
    (sum, p) => sum + p.probability,
    0
  );
  return probabilities.map((p) => ({
    ...p,
    probability: p.probability / totalProbability,
  }));
}
