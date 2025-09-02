
import { config } from '@/config';

export function showConfig() {
  console.log('Current Configuration:');
  console.log(`Deribit API URL: ${config.deribit.apiUrl}`);
  // Add other configurable parameters here as they are implemented
}

export function setConfig(key: string, value: string) {
  // This is a simplified example. In a real application, you would want
  // to persist this configuration (e.g., to a file) and handle different
  // types of values (numbers, booleans, etc.).
  console.log(`Setting ${key} to ${value}`);
  switch (key.toLowerCase()) {
    default:
      console.warn(`Unknown configuration key: ${key}`);
  }
}
