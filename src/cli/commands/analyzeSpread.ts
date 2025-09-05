import { Command } from 'commander';
import { analyzeSpread } from '@/services/analyzeSpread.service';

export const analyzeSpreadCommand = new Command();

analyzeSpreadCommand
  .name('analyze-spread')
  .description('Analyzes a single, user-defined vertical spread.')
  .argument('<source>', 'Data source (e.g., deribit)')
  .argument('<instrument>', 'Instrument to analyze (e.g., SOL-USDC)')
  .argument('<expiration>', 'Expiration date (YYYY-MM-DD)')
  .option('--type <type>', 'Type of spread (call or put)', (value) => {
    if (value !== 'call' && value !== 'put') {
      throw new Error('Invalid --type. Must be "call" or "put".');
    }
    return value;
  })
  .option('--strikes <strikes>', 'Comma-separated strike prices (e.g., 100,110)', (value) => {
    const parts = value.split(',').map(Number);
    if (parts.length !== 2 || parts.some(isNaN)) {
      throw new Error('Invalid --strikes. Must be two comma-separated numbers (e.g., 100,110).');
    }
    return parts as [number, number];
  })
  .option('--side <side>', 'Side of the spread (debit or credit)', (value) => {
    if (value !== 'debit' && value !== 'credit') {
      throw new Error('Invalid --side. Must be "debit" or "credit".');
    }
    return value;
  })
  .option('--raw', 'Display raw values for debugging')
  .action(async (source, instrument, expiration, options) => {
    try {
      if (!options.type || !options.strikes || !options.side) {
        console.error('Error: --type, --strikes, and --side are required options.');
        analyzeSpreadCommand.help();
        return;
      }
      const strikes = options.strikes as [number, number];
      const spreadType = options.type as 'call' | 'put';
      const side = options.side as 'debit' | 'credit';

      const result = await analyzeSpread(
        source,
        instrument,
        expiration,
        spreadType,
        strikes,
        side
      );

      if (!result) {
        console.error('Error: Could not analyze spread. Check your inputs or if options exist for the given expiration.');
        return;
      }

      const displayValue = (value: number) => options.raw ? value : Math.abs(value);

      console.log(`--- Spread Analysis for ${result.spreadType} ---`);
      console.log(`Instrument: ${instrument}, Expiration: ${expiration}`);
      
      if (result.side === 'debit') {
        console.log(`Type: ${result.type}, Side: debit, Long: ${result.longStrike}, Short: ${result.shortStrike}`);
        console.log(`Net Premium: ${displayValue(result.netPremium)}`);
        console.log(`Max Profit: ${displayValue(result.maxReward)}`);
        console.log(`Max Loss: ${displayValue(result.maxRisk)}`);
        console.log(`Expected Payoff at Expiration: ${displayValue(result.expectedPayoff)}`);
      } else { // credit
          console.log(`Type: ${result.type}, Side: credit, Short: ${result.shortStrike}, Long: ${result.longStrike}`);
        console.log(`Net Premium: ${displayValue(result.netPremium)}`);
        console.log(`Max Profit: ${displayValue(result.maxReward)}`);
        console.log(`Max Loss: ${displayValue(result.maxRisk)}`);
        console.log(`Expected Loss at Expiration: ${displayValue(result.expectedPayoff)}`);
      }

      console.log(`Expected PnL: ${result.expectedPnL}`);
      console.log(`Risk/Reward Ratio: ${result.riskRewardRatio}`);
      console.log(`Probability of Profit: ${(result.probabilityOfProfit * 100).toFixed(2)}%`);
      console.log(`Break-Even Price: ${result.breakEvenPrice}`);
      console.log(`--------------------------------------`);

    } catch (error: any) {
      console.error(`Error analyzing spread: ${error.message}`);
    }
  });
