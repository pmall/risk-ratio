import { Command } from 'commander';
import { probabilitiesCommand } from '@/cli/commands/probabilities';
import { listExpirationsCommand } from '@/cli/commands/list-expirations';
import { snapshotCommand } from '@/cli/commands/snapshot';
import { configCommand } from '@/cli/commands/config';

const program = new Command();

program
  .name('risk-analyzer')
  .description('CLI for analyzing options risk and reward')
  .version('1.0.0');

program.addCommand(probabilitiesCommand);
program.addCommand(listExpirationsCommand);
program.addCommand(snapshotCommand);
program.addCommand(configCommand);

program.parse(process.argv);
