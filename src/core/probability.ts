import { OptionData, PriceProbability } from '@/types/global';
import { norm_cdf } from '@/utils/math'; // Import norm_cdf

export function calculatePriceProbabilities(
  options: OptionData[],
  currentPrice: number,
  priceStep: number,
  priceRangeExtensionFactor: number
): PriceProbability[] {
  const probabilities: PriceProbability[] = [];

  // Handle case where no options are filtered
  if (options.length === 0) {
    return [];
  }

  // Assuming all options have the same expiration for a given chain
  const expirationTimestamp = new Date(options[0].expiration).getTime();
  const currentTimestamp = Date.now();

  let T = (expirationTimestamp - currentTimestamp) / (1000 * 60 * 60 * 24 * 365);
  if (T <= 0) {
    T = 0.000001; // Small positive number to avoid division by zero or negative sqrt
  }

  const minStrike = Math.min(...options.map((o) => o.strike));
  const maxStrike = Math.max(...options.map((o) => o.strike));

  const minPrice = minStrike / priceRangeExtensionFactor;
  const maxPrice = maxStrike * priceRangeExtensionFactor;

  const callOptions = options.filter((o) => o.type === 'call');
  const putOptions = options.filter((o) => o.type === 'put');

  // Sort options for efficient closest option finding
  callOptions.sort((a, b) => a.strike - b.strike); // Ascending for easier filtering
  putOptions.sort((a, b) => a.strike - b.strike); // Ascending for easier filtering

  let previousCdf = 0; // Initialize for step probability calculation

  for (let price = minPrice; price <= maxPrice; price += priceStep) {
    let iv: number;
    let ivSource: number;

    // IV Mapping based on spec.md
    if (price > currentPrice) {
      // For calls: use the closest strike below the target price
      const relevantCalls = callOptions.filter((o) => o.strike <= price);
      if (relevantCalls.length === 0) {
        // If no relevant calls, skip this price point
        continue;
      }
      const closestCall = relevantCalls[relevantCalls.length - 1]; // Last one is closest below
      iv = closestCall.impliedVolatility / 100; // Divide by 100 for percentage
      ivSource = closestCall.strike;
    } else { // price <= currentPrice
      // For puts: use the closest strike above the target price
      const relevantPuts = putOptions.filter((o) => o.strike >= price);
      if (relevantPuts.length === 0) {
        // If no relevant puts, skip this price point
        continue;
      }
      const closestPut = relevantPuts[0]; // First one is closest above
      iv = closestPut.impliedVolatility / 100; // Divide by 100 for percentage
      ivSource = closestPut.strike;
    }

    // Calculate Z-score for P(Price <= P)
    const sigma_T = iv * Math.sqrt(T);
    const Z = Math.log(price / currentPrice) / sigma_T;

    // Calculate P(Price <= P) (CDF value)
    const cdf_value = norm_cdf(Z);

    // Calculate step probability: P(Price <= P) - P(Price <= P - 1)
    const step_probability = cdf_value - previousCdf;

    probabilities.push({
      price: price,
      probability: step_probability, // This is the step probability
      cdfValue: cdf_value, // This is P(Price <= P)
      ivSource: ivSource,
    });

    previousCdf = cdf_value; // Update for next iteration
  }

  // No normalization as per user's explicit instruction

  return probabilities;
}