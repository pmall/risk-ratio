import { Command } from 'commander';
import { analyzeOption } from '@/services/analyzeOption.service';
import { displayPositionAnalysis } from '@/cli/ui/positionAnalysis';

export const analyzeOptionCommand = new Command();

analyzeOptionCommand
  .name('analyze-option')
  .description('Analyzes a single option position.')
  .argument('<source>', 'Data source (e.g., deribit)')
  .argument('<instrument>', 'Instrument to analyze (e.g., SOL-USDC)')
  .argument('<expiration>', 'Expiration date (YYYY-MM-DD)')
  .option('--type <type>', 'Type of option (call or put)', (value) => {
    if (value !== 'call' && value !== 'put') {
      throw new Error('Invalid --type. Must be "call" or "put".');
    }
    return value;
  })
  .option('--strike <strike>', 'Strike price', (value) => {
    const strike = Number(value);
    if (isNaN(strike)) {
      throw new Error('Invalid --strike. Must be a number.');
    }
    return strike;
  })
  .option('--side <side>', 'Side of the position (debit or credit)', (value) => {
    if (value !== 'debit' && value !== 'credit') {
      throw new Error('Invalid --side. Must be "debit" or "credit".');
    }
    return value;
  })
  .option('--virtual-strike-offset <offset>', 'Virtual strike offset percentage', (value) => {
    const offset = Number(value);
    if (isNaN(offset)) {
      throw new Error('Invalid --virtual-strike-offset. Must be a number.');
    }
    return offset;
  }, 90)
  .option('--raw', 'Display raw values for debugging')
  .action(async (source, instrument, expiration, options) => {
    try {
      if (!options.type || !options.strike || !options.side) {
        console.error('Error: --type, --strike, and --side are required options.');
        analyzeOptionCommand.help();
        return;
      }

      const result = await analyzeOption(
        source,
        instrument,
        expiration,
        options.type,
        options.strike,
        options.side,
        options.virtualStrikeOffset
      );

      if (!result) {
        console.error('Error: Could not analyze option. Check your inputs or if the option exists.');
        return;
      }

      displayPositionAnalysis(result, instrument, expiration, options);
    } catch (error: any) {
      console.error(`Error analyzing option: ${error.message}`);
    }
  });
