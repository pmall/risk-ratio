# Options Risk Analytics - Probabilistic Price Distribution

This project provides a TypeScript library and CLI tool designed to compute probabilistic risk ratios for options positions. It achieves this by analyzing implied volatility across option chains and transforming this market data into accurate probability distributions of underlying asset prices at expiration.

## 🎯 Core Concept

Traditional options risk analysis often relies on simplified models. This tool leverages the collective wisdom embedded in implied volatility to provide more accurate, probabilistic assessments of price movements and position risks.

### The Algorithm Flow

1.  **Data Acquisition**: Fetches complete options chain for a given expiration date from Deribit (SOL/USDC).
2.  **Option Filtering**: Keeps only relevant options based on quality metrics (volume, bid-ask spread, IV sanity checks).
3.  **IV Mapping**: Assigns implied volatility to discrete price points using actual market data.
4.  **Probability Computation**: Converts IV to probability distributions using log-normal assumptions.
5.  **Output Generation**: Produces a discrete probability distribution for all possible prices.

### Key Principle: No IV Interpolation

This project strictly avoids interpolating implied volatility between strikes. Instead, it uses the actual market-derived IV from the closest available option:

*   **For calls**: Uses the IV from the closest strike *below* the target price.
*   **For puts**: Uses the IV from the closest strike *above* the target price.

This conservative approach ensures that the probabilities reflect real market data, not artificial smoothing.

## ✨ Features

This CLI tool provides the following commands:

*   `list-expirations`: Lists available expiration dates for a given instrument.
*   `snapshot`: Fetches and displays the raw options chain data for a specific instrument and expiration.
*   `analyze`: Computes and displays the probabilistic price distribution for an underlying asset at a given expiration.

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

## 💡 Usage Examples

All commands are run using `npm run cli -- <command> <arguments>`.

1.  **List available expirations for SOL:**
    ```bash
    npm run cli -- list-expirations SOL
    ```
    Example Output:
    ```
    Available expirations for SOL:
    2025-09-02
    2025-09-03
    2025-09-05
    ...
    ```

2.  **Get a snapshot of the options chain for SOL on a specific expiration date (e.g., 2025-09-02):**
    ```bash
    npm run cli -- snapshot SOL 2025-09-02
    ```
    Example Output (truncated):
    ```
    Option chain for SOL on 2025-09-02:
    {
      strike: 176,
      type: 'call',
      impliedVolatility: 117.19,
      volume: 0,
      openInterest: 0,
      bidPrice: 0,
      askPrice: 0,
      lastPrice: 0,
      expiration: '2025-09-02T08:00:00.000Z',
      instrument_name: 'SOL_USDC-2SEP25-176-C'
    }
    ...
    ```

3.  **Analyze and list prices and their probabilities for SOL on a specific expiration date (e.g., 2025-09-02):**
    ```bash
    npm run cli -- analyze SOL 2025-09-02
    ```
    Example Output (truncated):
    ```
    Analyzing SOL options for expiration: 2025-09-02
    Current Price: 198.76
    Total Options: 104
    Filtered Options: 104

    Price Probability Distribution:
    Price    Probability    Cumulative (Asc)    Cumulative (Desc)
    100.00   0.0055         0.0055            1.0000
    101.00   0.0055         0.0110            0.9945
    ...
    408.00   0.0014         1.0000            0.0014

    Total Probability: 1.0000
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

This specification provides a comprehensive overview of the project, its core principles, and its current capabilities.
