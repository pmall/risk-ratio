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

  let description = `Type: ${result.type}, Side: ${result.side}`;
  if (result.isSpread) {
    if (result.side === 'debit') {
        description += `, Long: ${result.longStrike}, Short: ${result.shortStrike}`;
    } else {
        description += `, Short: ${result.shortStrike}, Long: ${result.longStrike}`;
    }
  } else {
    const strike = result.side === 'debit' ? result.longStrike : result.shortStrike;
    description += `, Strike: ${strike}`;
  }
  console.log(description);

  console.log(`Net Premium: ${displayValue(result.netPremium)}`);
  if (result.side === 'debit') {
    console.log(`Max Profit: ${result.maxReward === Infinity ? 'Unlimited' : displayValue(result.maxReward)}`);
    console.log(`Max Loss: ${displayValue(result.maxRisk)}`);
    console.log(`Expected Payoff at Expiration: ${displayValue(result.expectedPayoff)}`);
  } else { // credit
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
