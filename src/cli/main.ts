
import { analyze } from './commands/analyze';
import { listExpirations } from './commands/list-expirations';


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
  } else {
    console.error(`Unknown command: ${command}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('An error occurred:', error);
  process.exit(1);
});
