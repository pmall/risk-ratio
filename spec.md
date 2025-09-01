# Options Risk Analytics - Probabilistic Price Distribution

## Project Overview

This project creates a TypeScript library and CLI tool that computes probabilistic risk ratios for options positions by analyzing implied volatility across option chains. The core innovation is transforming market-derived implied volatility data into accurate probability distributions of underlying asset prices at expiration.

## Problem Statement

Traditional options risk analysis often relies on simplified models or single-point estimates. This project leverages the collective wisdom of the options market (embedded in implied volatility) to create more accurate probabilistic assessments of price movements and position risks.

## Core Concept

### The Algorithm Flow

1. **Data Acquisition**: Fetch complete options chain for a given expiration date
2. **Option Filtering**: Keep only relevant options based on moneyness and quality metrics
3. **IV Mapping**: Assign implied volatility to discrete price points using market data
4. **Probability Computation**: Convert IV to probability distributions using log-normal assumptions
5. **Output Generation**: Produce discrete probability distribution for all possible prices

### Key Principle: No IV Interpolation

We **never interpolate** implied volatility between strikes. Instead, we use the actual market-derived IV from the closest available option:
- For any price mark, use IV from the closest option
- For calls: use the closest strike below the target price
- For puts: use the closest strike above the target price
- This conservative approach ensures we use real market data, not artificial smoothing

## Mathematical Foundation

### Assumptions
- Log-normal distribution of underlying prices at expiration
- Black-Scholes framework assumptions (constant risk-free rate, no dividends, European exercise)
- Market efficiency: implied volatility reflects collective market expectations

### Probability Computation
For each price point P at expiration time T:
1. Obtain IV from closest option strike (using the conservative approach: closest below for calls, closest above for puts)
2. Generate a log-normal probability distribution curve using that specific IV
3. Extract the probability density at price P from that distribution curve

**Important**: Each price point has its own probability distribution curve based on its assigned IV. We do NOT use a single global curve for all prices - this ensures each price reflects the market's implied volatility expectations at that level.

## Data Source Architecture

### Abstract Interface Design
```typescript
interface DataSource {
  getOptionChain(symbol: string, expiration: string): Promise<OptionData[]>
  getAvailableExpirations(symbol: string): Promise<string[]>
  getCurrentPrice(symbol: string): Promise<number>
}
```

### Deribit SOL/USDC Implementation
- **Primary Data Source**: Deribit exchange SOL/USDC options
- **API Endpoint**: Deribit REST API v2
- **Update Model**: Manual snapshot (no real-time streaming)
- **Data Refresh**: User-initiated via CLI commands

### Future Data Sources
The abstract interface enables easy addition of:
- Other cryptocurrency exchanges
- Traditional equity options (CBOE, etc.)
- Commodity options
- Custom data feeds

## Option Filtering Logic

### Moneyness-Based Filtering
- **Above Current Price**: Keep only call options
- **Below Current Price**: Keep only put options
- **At-The-Money**: Keep both put and call options
- **Rationale**: Eliminates deep out-of-the-money options that may have stale or unreliable pricing

### Quality Filters (Configurable)
- **Minimum Volume**: Filter out options with zero or very low trading volume
- **Maximum Bid-Ask Spread**: Remove options with excessive spreads (indicates poor liquidity)
- **IV Sanity Checks**: Exclude options with obviously erroneous implied volatility
- **Open Interest Threshold**: Minimum open interest requirements

## Price Range and Granularity

### Price Step Configuration
- **Default**: $1 intervals for SOL/USDC
- **Configurable**: Adjustable based on underlying asset price level
- **Examples**: 
  - SOL: $1 steps
  - BTC: $100 steps
  - High-priced stocks: $5-10 steps

### Range Determination
- **Minimum Bound**: Extend below lowest put strike
- **Maximum Bound**: Extend above highest call strike
- **Extension Rules**: Simple initial rules, designed to be flexible
- **Probability Cutoff**: Stop extending when probability falls below threshold (e.g., 0.1%)

## Technical Architecture

### Technology Stack
- **Language**: TypeScript with strict type checking
- **Runtime**: Node.js for CLI
- **Dependencies**: Minimal approach
  - `dotenv` for environment configuration
  - `zod` for data validation
  - Built-in `fetch` for HTTP requests
  - No external math libraries initially
- **Package Manager**: npm

### Project Structure
```
src/
├── data-sources/
│   ├── base.ts          # Abstract DataSource interface
│   ├── deribit.ts       # Deribit SOL/USDC implementation
│   └── types.ts         # Data source type definitions
├── core/
│   ├── probability.ts   # Price probability computation engine
│   ├── filters.ts       # Option filtering logic
│   └── types.ts         # Core type definitions
├── cli/
│   ├── main.ts          # CLI entry point and command handling
│   └── commands/        # Individual CLI commands
├── utils/
│   ├── math.ts          # Probability distribution utilities
│   └── config.ts        # Configuration management
└── types/
    └── global.ts        # Global type definitions
```

### Configuration Management
Environment variables stored in `.env` file:
```env
# Deribit API Configuration
DERIBIT_API_URL=https://www.deribit.com/api/v2
```

**Data Source Specific Configuration**: Each data source implementation has its own default configuration parameters that can be optionally overridden:

**Deribit SOL/USDC Defaults**:
- Price step: $1
- Price range extension factor: 1.2x beyond min/max strikes  
- Minimum volume filter: 0
- Minimum open interest: 0
- Maximum bid-ask spread: 50%
- IV range: 0.01 to 5.0
- Probability threshold: 0.001

These defaults are embedded in the Deribit data source implementation and can be customized per analysis request rather than globally configured.

## CLI Interface Design

### Core Commands
```bash
# Analyze specific expiration
risk-analyzer analyze SOL 2024-12-29

# List available expirations
risk-analyzer list-expirations SOL

# Show current market data
risk-analyzer snapshot SOL

# Configuration commands
risk-analyzer config show
risk-analyzer config set PRICE_STEP 0.5
```

### Output Format
```
SOL Options Analysis - Expiration: 2024-12-29
Current Price: $125.50
Filtered Options: 45 (25 calls, 20 puts)

Price Probability Distribution:
Price    Probability    Cumulative
$120     0.0234        0.0234
$121     0.0251        0.0485
$122     0.0268        0.0753
...
$130     0.0195        0.8234
...

Total Probability: 1.0000
Price Range: $95 - $165
IV Sources: 45 unique strikes
```

## Future Extensions

### Position Risk Calculation
Once price probability distribution is established, implement position risk analysis:

#### Expected P&L Calculation
For any options position, compute probabilistic expected outcomes:
```
Expected P&L = Σ(P&L_at_price_i × Probability_i)
```

#### Risk Metrics
- **Expected Loss**: Probability-weighted downside scenarios
- **Maximum Loss**: Worst-case scenario analysis
- **Profit Probability**: Chance of positive outcome
- **Break-even Analysis**: Price levels where position breaks even

#### Position Input Methods
- **Individual Legs**: Specify each option separately
- **Strategy Templates**: Pre-defined spreads, straddles, etc.
- **Complex Positions**: Multiple expirations, underlying combinations

### Web Interface Integration
The TypeScript library is designed for seamless Next.js integration:

#### Next.js API Routes
```typescript
// pages/api/analyze.ts
import { analyzeProbabilities } from '../../../src/core/probability'
import { DeribitDataSource } from '../../../src/data-sources/deribit'

export default async function handler(req, res) {
  const dataSource = new DeribitDataSource()
  const results = await analyzeProbabilities(dataSource, req.body.symbol, req.body.expiration)
  res.json(results)
}
```

#### React Components
- Interactive probability charts
- Real-time options chain display
- Position builder interface
- Risk visualization dashboards

### Additional Data Sources
Planned implementations:
- **Binance Options**: Crypto options
- **Interactive Brokers**: Traditional equities
- **CBOE**: Index options
- **Custom Feeds**: Proprietary data sources

## Implementation Phases

### Phase 1: Core Foundation (Current)
- [ ] Abstract data source interface
- [ ] Deribit SOL/USDC implementation
- [ ] Option filtering logic
- [ ] Probability computation engine
- [ ] Basic CLI interface

### Phase 2: Enhanced Analysis
- [ ] Position risk calculation
- [ ] Advanced filtering options
- [ ] Multiple probability models
- [ ] Comprehensive CLI features

### Phase 3: Web Interface
- [ ] Next.js integration
- [ ] Interactive dashboard
- [ ] Real-time data updates
- [ ] Position management interface

### Phase 4: Advanced Features
- [ ] Multiple data source support
- [ ] Historical analysis
- [ ] Strategy optimization
- [ ] API for third-party integration

## Data Models

### Core Types
```typescript
interface OptionData {
  strike: number
  type: 'call' | 'put'
  impliedVolatility: number
  volume: number
  openInterest: number
  bidPrice: number
  askPrice: number
  lastPrice: number
  expiration: string
}

interface PriceProbability {
  price: number
  probability: number
  ivSource: number  // Strike price used for IV
}

interface AnalysisResult {
  symbol: string
  currentPrice: number
  expiration: string
  priceDistribution: PriceProbability[]
  metadata: {
    totalOptions: number
    filteredOptions: number
    priceRange: [number, number]
    totalProbability: number
  }
}
```

## Error Handling and Validation

### Data Validation
- Zod schemas for all external data
- Runtime type checking
- API response validation
- Configuration parameter validation

### Error Recovery
- Graceful handling of API failures
- Fallback mechanisms for missing data
- User-friendly error messages
- Detailed logging for debugging

### Edge Cases
- No options available for expiration
- All options filtered out
- API rate limiting
- Invalid IV data

## Performance Considerations

### Optimization Strategies
- Minimal external dependencies
- Efficient filtering algorithms
- Caching for repeated calculations
- Async processing for API calls

### Scalability
- Memory-efficient data structures
- Streaming for large datasets
- Configurable batch sizes
- Rate limiting compliance

## Testing Strategy

### Unit Tests
- Individual function testing
- Mock data source implementations
- Edge case validation
- Mathematical accuracy verification

### Integration Tests
- End-to-end CLI workflows
- API integration testing
- Configuration validation
- Error handling verification

## Deployment and Distribution

### CLI Distribution
- npm package publication
- Cross-platform compatibility
- Docker containerization option
- Standalone executable builds

### Library Integration
- npm package for Next.js projects
- TypeScript declaration files
- Comprehensive documentation
- Example implementations

This specification provides complete context for implementing a sophisticated options risk analysis tool that leverages market-derived implied volatility to generate accurate probability distributions for underlying asset prices at expiration.