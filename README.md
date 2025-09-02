# Options Risk Analytics - Probabilistic Price Distribution

This project provides a TypeScript library and CLI tool designed to compute probabilistic risk ratios for options positions. It achieves this by analyzing implied volatility across option chains and transforming this market data into accurate probability distributions of underlying asset prices at expiration.

## 🎯 Core Concept

This tool leverages the collective wisdom embedded in implied volatility to provide more accurate, probabilistic assessments of price movements and position risks.

## ✨ Features

This CLI tool provides the following commands:

*   `list-expirations`: Lists available expiration dates for a given instrument.
*   `snapshot`: Fetches and displays the raw options chain data for a specific instrument and expiration.
*   `probabilities`: Computes and displays the probabilistic price distribution for an underlying asset at a given expiration.

## 🚀 Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd risk-ratio
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure environment variables:**
    Create a `.env` file in the project root based on `.env.example`:
    ```
    # .env.example
    DERIBIT_API_URL=https://www.deribit.com/api/v2
    ```
    Copy this content to a new file named `.env`.

## ⚙️ Configuration

Application-wide configuration values are defined in `src/config.ts`. This file centralizes settings for API endpoints and filtering options.

```typescript
export const config = {
  deribit: {
    apiUrl: process.env.DERIBIT_API_URL || 'https://www.deribit.com/api/v2',
  },
  maxBidAskSpread: 1,             // Maximum allowed bid-ask spread for options to be considered
  maxIv: 200,                     // Maximum implied volatility for options to be considered
};
```

You can modify these values directly in `src/config.ts` to adjust the behavior of the CLI tool.

## 💡 Usage Examples

All commands are run using `npm run cli -- <command> <arguments>`.

1.  **List available expirations for SOL/USDC on Deribit:**
    ```bash
    npm run cli -- list-expirations deribit SOL-USDC
    ```
    Example Output:
    ```
    Available expirations for SOL-USDC from deribit:
    2025-09-03
    2025-09-04
    2025-09-05
    ...
    ```

2.  **Get a snapshot of the options chain for SOL/USDC on Deribit for a specific expiration date (e.g., 2025-09-03):**
    ```bash
    npm run cli -- snapshot deribit SOL-USDC 2025-09-03
    ```
    Example Output (truncated):
    ```
    Option chain for SOL-USDC on 2025-09-03 from deribit:
    {
      strike: 176,
      type: 'call',
      impliedVolatility: 117.19,
      volume: 0,
      openInterest: 0,
      bidPrice: 0,
      askPrice: 0,
      lastPrice: 0,
      expiration: '2025-09-03T08:00:00.000Z',
      instrument_name: 'SOL_USDC-3SEP25-176-C'
    }
    ...
    ```

3.  **Analyze and list prices and their probabilities for SOL/USDC on Deribit for a specific expiration date (e.g., 2025-09-03):**
    ```bash
    npm run cli -- probabilities deribit SOL-USDC 2025-09-03
    ```
    Example Output (truncated):
    ```
    Analyzing SOL-USDC options for expiration: 2025-09-03 from deribit:
    Current Price: 198.76
    Total Options: 104
    Filtered Options: 104

    Price Probability Distribution:
    Strike   P(<=K)    1-P(<=K)
    100.00   0.0055    0.9945
    101.00   0.0055    0.9945
    ...
    408.00   0.9986    0.0014
    ```

## 💻 Technology Stack

*   **Language**: TypeScript (strict type checking)
*   **Runtime**: Node.js (for CLI)
*   **Dependencies**: `dotenv`, `zod`, built-in `fetch`
*   **Package Manager**: npm

## 🔮 Future Extensions

This project is designed with extensibility in mind. Future phases include:

*   **Position Risk Calculation**: Implement expected P&L, max loss, and profit probability for specific options positions.
*   **Web Interface Integration**: Develop a Next.js-based web interface with interactive charts and dashboards.
*   **Additional Data Sources**: Integrate with other exchanges like Binance, Interactive Brokers, etc.
