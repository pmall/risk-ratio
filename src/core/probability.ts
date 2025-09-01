
import { OptionData, PriceProbability } from '@/types/global';
import { logNormalPdf } from '@/utils/math';

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

  const probabilities: PriceProbability[] = [];

  for (let price = minPrice; price <= maxPrice; price += priceStep) {
    let iv: number;
    let ivSource: number;

    if (price > currentPrice) {
      // Use closest call strike below the target price
      const closestCall = callOptions
        .filter((o) => o.strike <= price)
        .reduce((prev, curr) =>
          Math.abs(curr.strike - price) < Math.abs(prev.strike - price)
            ? curr
            : prev
        );
      iv = closestCall.impliedVolatility;
      ivSource = closestCall.strike;
    } else {
      // Use closest put strike above the target price
      const closestPut = putOptions
        .filter((o) => o.strike >= price)
        .reduce((prev, curr) =>
          Math.abs(curr.strike - price) < Math.abs(prev.strike - price)
            ? curr
            : prev
        );
      iv = closestPut.impliedVolatility;
      ivSource = closestPut.strike;
    }

    const probability = logNormalPdf(price, Math.log(currentPrice), iv);
    probabilities.push({ price, probability, ivSource });
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
