
import { DeribitDataSource } from '../data-sources/deribit';
import { filterOptions } from '../core/filters';
import { calculatePriceProbabilities } from '../core/probability';

export async function analyze(symbol: string, expiration: string) {
  const dataSource = new DeribitDataSource();

  console.log(`Analyzing ${symbol} options for expiration: ${expiration}`);

  const [options, currentPrice] = await Promise.all([
    dataSource.getOptionChain(symbol, expiration),
    dataSource.getCurrentPrice(symbol),
  ]);

  console.log(`Current Price: $${currentPrice.toFixed(2)}`);
  console.log(`Total Options: ${options.length}`);

  const filteredOptions = filterOptions(options, currentPrice, {
    minVolume: 0,
    maxBidAskSpread: 0.5,
    minOpenInterest: 0,
    minIv: 0.01,
    maxIv: 5.0,
  });

  console.log(`Filtered Options: ${filteredOptions.length}`);

  const priceProbabilities = calculatePriceProbabilities(
    filteredOptions,
    currentPrice,
    1, // Price step
    1.2 // Price range extension factor
  );

  console.log('\nPrice Probability Distribution:');
  console.log('Price    Probability    Cumulative');

  let cumulative = 0;
  for (const p of priceProbabilities) {
    cumulative += p.probability;
    console.log(
      `${p.price.toFixed(2).padEnd(8)} ${p.probability.toFixed(4).padEnd(14)} ${cumulative.toFixed(4)}`
    );
  }

  const totalProbability = priceProbabilities.reduce(
    (sum, p) => sum + p.probability,
    0
  );

  console.log(`\nTotal Probability: ${totalProbability.toFixed(4)}`);
}
