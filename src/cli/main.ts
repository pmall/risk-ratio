
import { analyze } from './commands/analyze';
import { listExpirations } from './commands/list-expirations';
import { snapshot } from './commands/snapshot';
import { showConfig, setConfig } from './commands/config';


async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'analyze') {
    const [symbol, expiration] = args.slice(1);
    if (!symbol || !expiration) {
      console.error('Usage: risk-analyzer analyze <symbol> <expiration>');
      process.exit(1);
    }
    await analyze(symbol, expiration);
  } else if (command === 'list-expirations') {
    const [symbol] = args.slice(1);
    if (!symbol) {
      console.error('Usage: risk-analyzer list-expirations <symbol>');
      process.exit(1);
    }
    await listExpirations(symbol);
  } else if (command === 'snapshot') {
    const [symbol, expiration] = args.slice(1);
    if (!symbol || !expiration) {
      console.error('Usage: risk-analyzer snapshot <symbol> <expiration>');
      process.exit(1);
    }
    await snapshot(symbol, expiration);
  } else if (command === 'config') {
    const subCommand = args[1];
    if (subCommand === 'show') {
      showConfig();
    } else if (subCommand === 'set') {
      const [key, value] = args.slice(2);
      if (!key || !value) {
        console.error('Usage: risk-analyzer config set <key> <value>');
        process.exit(1);
      }
      setConfig(key, value);
    } else {
      console.error(`Unknown config command: ${subCommand}`);
      process.exit(1);
    }
  } else {
    console.error(`Unknown command: ${command}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('An error occurred:', error);
  process.exit(1);
});
