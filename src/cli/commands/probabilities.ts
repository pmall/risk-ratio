
import { getDataSource } from '@/data-sources';
import { filterOptions } from '@/core/filters';
import { calculatePriceProbabilities } from '@/core/probability';
import { config } from '@/config';

export async function probabilities(source: string, instrument: string, expiration: string) {
  const dataSource = getDataSource(source, instrument);

  console.log(`Analyzing ${instrument} options for expiration: ${expiration} from ${source}`);

  const [options, currentPrice] = await Promise.all([
    dataSource.getOptionChain(instrument, expiration),
    dataSource.getCurrentPrice(instrument),
  ]);

  console.log(`Current Price: ${currentPrice.toFixed(2)}`);
  console.log(`Total Options: ${options.length}`);

  const filteredOptions = filterOptions(options, currentPrice, {
    minVolume: 0,
    maxBidAskSpread: config.maxBidAskSpread, // Set to a very large number to effectively disable for now
    minOpenInterest: 0,
    minIv: 0.01,
    maxIv: config.maxIv, // Increased maxIv to accommodate percentage values
  });

  console.log(`Filtered Options: ${filteredOptions.length}`);

  const priceProbabilities = calculatePriceProbabilities(
    filteredOptions,
    currentPrice,
    config.priceStep, // Price step
    config.priceRangeExtensionFactor // Price range extension factor
  );

  console.log('\nPrice Probability Distribution:');
  console.log('Price    Probability    Cumulative (Asc)    Cumulative (Desc)');

  let cumulativeAsc = 0;
  for (let i = 0; i < priceProbabilities.length; i++) {
    const p = priceProbabilities[i];
    cumulativeAsc += p.probability;
    const cumulativeDesc = priceProbabilities.slice(i).reduce((sum, prob) => sum + prob.probability, 0);
    console.log(
      `${p.price.toFixed(2).padEnd(8)} ${p.probability.toFixed(4).padEnd(14)} ${cumulativeAsc.toFixed(4).padEnd(17)} ${cumulativeDesc.toFixed(4)}`
    );
  }

  const totalProbability = priceProbabilities.reduce(
    (sum: number, p: { probability: number }) => sum + p.probability,
    0
  );

  console.log(`\nTotal Probability: ${totalProbability.toFixed(4)}`);
}
