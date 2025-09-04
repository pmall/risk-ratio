import { Command } from 'commander';
import { probabilitiesCommand } from '@/cli/commands/probabilities';
import { listExpirationsCommand } from '@/cli/commands/list-expirations';
import { snapshotCommand } from '@/cli/commands/snapshot';
import { configCommand } from '@/cli/commands/config';
import { analyzeSpreadCommand } from '@/cli/commands/analyze-spread';

const program = new Command();

program
  .name('spread-scanner')
  .description('CLI tool for analyzing options spreads, calculating probabilities, and providing market data snapshots')
  .version('1.0.0');

program.addCommand(probabilitiesCommand);
program.addCommand(listExpirationsCommand);
program.addCommand(snapshotCommand);
program.addCommand(configCommand);

program.addCommand(analyzeSpreadCommand);

program.parse(process.argv);
