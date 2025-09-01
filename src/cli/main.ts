
import { probabilities } from './commands/probabilities';
import { listExpirations } from './commands/list-expirations';
import { snapshot } from './commands/snapshot';
import { showConfig, setConfig } from './commands/config';


async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'probabilities') {
    const [source, instrument, expiration] = args.slice(1);
    if (!source || !instrument || !expiration) {
      console.error('Usage: risk-analyzer probabilities <source> <instrument> <expiration>');
      process.exit(1);
    }
    await probabilities(source, instrument, expiration);
  } else if (command === 'list-expirations') {
    const [source, instrument] = args.slice(1);
    if (!source || !instrument) {
      console.error('Usage: risk-analyzer list-expirations <source> <instrument>');
      process.exit(1);
    }
    await listExpirations(source, instrument);
  } else if (command === 'snapshot') {
    const [source, instrument, expiration] = args.slice(1);
    if (!source || !instrument || !expiration) {
      console.error('Usage: risk-analyzer snapshot <source> <instrument> <expiration>');
      process.exit(1);
    }
    await snapshot(source, instrument, expiration);
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
