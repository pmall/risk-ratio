# Spread Scanner

This is a CLI tool designed to help analyze options spreads, calculate probabilities, and provide snapshots of market data.

## 🎯 Core Concept

This tool leverages the collective wisdom embedded in implied volatility to provide more accurate, probabilistic assessments of price movements and position risks. It uses a polynomial regression model to fit a smooth curve to the market's implied volatility smile, ensuring a robust and continuous probability distribution.

## ✨ Features

This CLI tool provides the following commands:

- `list-expirations`: Lists available expiration dates for a given instrument.
- `snapshot`: Fetches and displays the raw options chain data for a specific instrument and expiration.
- `probabilities`: Computes and displays the probabilistic price distribution for an underlying asset at a given expiration.

## 🔬 Methodology

To ensure a smooth and consistent probability curve, the tool implements the following process:

1.  **Fetch Data**: It retrieves the full option chain (strikes, and implied volatilities) for a given asset and expiration.
2.  **Fit Volatility Smile**: It performs a 2nd-degree polynomial regression on the implied volatilities as a function of their log-moneyness (`log(strike/current_price)`). This fits a smooth curve to the raw market data, accounting for the volatility smile/skew.
3.  **Calculate Probabilities**: It uses this smoothed volatility model to calculate the cumulative probability (`P(price <= strike)`) for each strike price, resulting in a robust and monotonically increasing probability distribution.

This method allows for the accurate pricing of any strike price, not just those actively traded, and forms a solid basis for calculating expected returns and losses for any options position.

## 🚀 Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd spread-scanner
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
    apiUrl: process.env.DERIBIT_API_URL || "https://www.deribit.com/api/v2",
  },
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
    Current Price: 175.20
    Total Options: 104
    Filtered Options: 104

    Price Probability Distribution:
    Strike   P(<=K)    1-P(<=K)
    140.00   0.1898    0.8102
    150.00   0.2933    0.7067
    160.00   0.4015    0.5985
    170.00   0.5089    0.4911
    180.00   0.6123    0.3877
    190.00   0.7088    0.2912
    200.00   0.7939    0.2061
    ...
    ```

## 💻 Technology Stack

- **Language**: TypeScript (strict type checking)
- **Runtime**: Node.js (for CLI)
- **Package Manager**: npm

## 🔮 Future Extensions

This project is designed with extensibility in mind. Future phases include:

- **Position Risk Calculation**: Implement expected P&L, max loss, and profit probability for specific options positions.
- **Web Interface Integration**: Develop a Next.js-based web interface with interactive charts and dashboards.
- **Additional Data Sources**: Integrate with other exchanges like Binance, Interactive Brokers, etc.
