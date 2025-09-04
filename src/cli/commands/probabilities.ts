import { getProbabilisticPriceDistribution } from '@/services/probabilities.service';

export async function probabilities(source: string, instrument: string, expiration: string) {
  const result = await getProbabilisticPriceDistribution(source, instrument, expiration);

  console.log(`Analyzing ${instrument} options for expiration: ${expiration} from ${source}`);
  console.log(`Current Price: ${result.currentPrice.toFixed(2)}`);
  console.log(`Total Options: ${result.totalOptions}`);
  console.log(`Filtered Options: ${result.filteredOptionsCount}`);

  console.log('\nPrice Probability Distribution:');
  console.log('Strike   P(<=K)    1-P(<=K)');

  for (let i = 0; i < result.priceProbabilities.length; i++) {
    const p = result.priceProbabilities[i];
    console.log(
      `${p.price.toFixed(2).padEnd(8)} ${p.cdfValue.toFixed(4).padEnd(10)} ${(1 - p.cdfValue).toFixed(4)}`
    );
  }

  
}