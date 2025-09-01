import { getProbabilisticPriceDistribution } from '@/services/analysis';

export async function probabilities(source: string, instrument: string, expiration: string) {
  const result = await getProbabilisticPriceDistribution(source, instrument, expiration);

  console.log(`Analyzing ${instrument} options for expiration: ${expiration} from ${source}`);
  console.log(`Current Price: ${result.currentPrice.toFixed(2)}`);
  console.log(`Total Options: ${result.totalOptions}`);
  console.log(`Filtered Options: ${result.filteredOptionsCount}`);

  console.log('\nPrice Probability Distribution:');
  console.log('Price    Probability    Cumulative (Asc)    Cumulative (Desc)');

  let cumulativeAsc = 0;
  for (let i = 0; i < result.priceProbabilities.length; i++) {
    const p = result.priceProbabilities[i];
    cumulativeAsc += p.probability;
    const cumulativeDesc = result.priceProbabilities.slice(i).reduce((sum, prob) => sum + prob.probability, 0);
    console.log(
      `${p.price.toFixed(2).padEnd(8)} ${p.probability.toFixed(4).padEnd(14)} ${cumulativeAsc.toFixed(4).padEnd(17)} ${cumulativeDesc.toFixed(4)}`
    );
  }

  console.log(`\nTotal Probability: ${result.totalProbability.toFixed(4)}`);
}