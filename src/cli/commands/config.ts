import { Command } from 'commander';
import { config } from '@/config';
import * as fs from 'fs';
import * as path from 'path';

const configFilePath = path.resolve(process.cwd(), '.env');

export const configCommand = new Command('config')
  .description('Manages application configuration');

configCommand.command('show')
  .description('Displays the current configuration')
  .action(() => {
    console.log('Current Configuration:');
    console.log(config);
  });

configCommand.command('set <key> <value>')
  .description('Sets a configuration value')
  .action((key, value) => {
    try {
      let envContent = '';
      if (fs.existsSync(configFilePath)) {
        envContent = fs.readFileSync(configFilePath, 'utf8');
      }

      const lines = envContent.split('\n');
      let updated = false;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith(`${key}=`)) {
          lines[i] = `${key}=${value}`;
          updated = true;
          break;
        }
      }

      if (!updated) {
        lines.push(`${key}=${value}`);
      }

      fs.writeFileSync(configFilePath, lines.join('\n'));
      console.log(`Configuration key '${key}' set to '${value}'`);
    } catch (error) {
      console.error(`Failed to set configuration: ${error.message}`);
    }
  });