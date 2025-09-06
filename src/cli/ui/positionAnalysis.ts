import { PositionAnalysisResult } from '@/types/global';

export function displayPositionAnalysis(
  result: PositionAnalysisResult,
  instrument: string,
  expiration: string,
  options: { raw: boolean; strike?: number; strikes?: [number, number] }
) {
  const displayValue = (value: number) => (options.raw ? value : Math.abs(value));

  console.log(`--- Position Analysis for ${result.spreadType} ---`);
  console.log(`Instrument: ${instrument}, Expiration: ${expiration}`);

  if (result.side === 'debit') {
    if (options.strike) { // Single option
      console.log(`Type: ${result.type}, Side: debit, Strike: ${options.strike}`);
    } else { // Spread
      console.log(`Type: ${result.type}, Side: debit, Long: ${result.longStrike}, Short: ${result.shortStrike}`);
    }
    console.log(`Net Premium: ${displayValue(result.netPremium)}`);
    console.log(`Max Profit: ${result.maxReward === Infinity ? 'Unlimited' : displayValue(result.maxReward)}`);
    console.log(`Max Loss: ${displayValue(result.maxRisk)}`);
    console.log(`Expected Payoff at Expiration: ${displayValue(result.expectedPayoff)}`);
  } else { // credit
    if (options.strike) { // Single option
      console.log(`Type: ${result.type}, Side: credit, Strike: ${options.strike}`);
    } else { // Spread
      console.log(`Type: ${result.type}, Side: credit, Short: ${result.shortStrike}, Long: ${result.longStrike}`);
    }
    console.log(`Net Premium: ${displayValue(result.netPremium)}`);
    console.log(`Max Profit: ${displayValue(result.maxReward)}`);
    console.log(`Max Loss: ${result.maxRisk === Infinity ? 'Unlimited' : displayValue(result.maxRisk)}`);
    console.log(`Expected Loss at Expiration: ${displayValue(result.expectedPayoff)}`);
  }

  console.log(`Expected PnL: ${result.expectedPnL}`);
  console.log(`Risk/Reward Ratio: ${result.riskRewardRatio}`);
  console.log(`Probability of Profit: ${(result.probabilityOfProfit * 100).toFixed(2)}%`);
  console.log(`Break-Even Price: ${result.breakEvenPrice}`);
  console.log(`--------------------------------------`);
}
