import { OptionData, Position } from '@/types/global';
import { VolatilityModel, getProbabilityForPrice } from '@/core/probability';

export function calculateMaxProfitLoss(position: Position): { maxProfit: number; maxLoss: number } {
  const { type, side, longStrike, shortStrike, netPremium } = position;

  if (type === 'call') {
    if (side === 'debit') {
      // Bull Call Spread
      const strikeDifference = shortStrike - longStrike;
      return {
        maxProfit: strikeDifference + netPremium,
        maxLoss: netPremium,
      };
    } else {
      // Bear Call Spread
      const strikeDifference = longStrike - shortStrike;
      return {
        maxProfit: netPremium,
        maxLoss: netPremium - strikeDifference,
      };
    }
  } else {
    // put
    if (side === 'debit') {
      // Bear Put Spread
      const strikeDifference = longStrike - shortStrike;
      return {
        maxProfit: strikeDifference + netPremium,
        maxLoss: netPremium,
      };
    } else {
      // Bull Put Spread
      const strikeDifference = shortStrike - longStrike;
      return {
        maxProfit: netPremium,
        maxLoss: netPremium - strikeDifference,
      };
    }
  }
}

export function getPositionType(position: Position): string {
  if (position.type === 'call') {
    if (position.side === 'debit') {
      return 'Bull Call Spread';
    } else {
      return 'Bear Call Spread';
    }
  } else {
    // put spread
    if (position.side === 'debit') {
      return 'Bear Put Spread';
    } else {
      return 'Bull Put Spread';
    }
  }
}

export function calculateProbabilisticPayoff(
  position: Position,
  volatilityModel: VolatilityModel,
  optionChain: OptionData[],
  currentPrice: number
): number {
  let expectedPayoff = 0;

  const longLeg = optionChain.find((opt) => opt.strike === position.longStrike && opt.type === position.type);
  const shortLeg = optionChain.find((opt) => opt.strike === position.shortStrike && opt.type === position.type);

  if (!longLeg || !shortLeg) {
    throw new Error(
      'Could not find one or both legs of the spread in the option chain for probabilistic payoff calculation.'
    );
  }

  // Determine price range for dense grid
  const allStrikes = optionChain.map((opt) => opt.strike);
  const minStrike = Math.min(...allStrikes);
  const maxStrike = Math.max(...allStrikes);

  const stepSize = 0.5; // Define granularity of the price grid

  let previousCdfValue = 0;

  for (let price = minStrike; price <= maxStrike; price += stepSize) {
    const cdf_value = getProbabilityForPrice(price, currentPrice, volatilityModel);

    let payoff = 0;

    if (position.type === 'call') {
      payoff = Math.max(0, price - position.longStrike) - Math.max(0, price - position.shortStrike);
    } else {
      // put spread
      payoff = Math.max(0, position.longStrike - price) - Math.max(0, position.shortStrike - price);
    }

    // The probability of this specific price occurring is the difference between its CDF and the previous one
    const probOfPrice = cdf_value - previousCdfValue;
    expectedPayoff += payoff * probOfPrice;
    previousCdfValue = cdf_value;
  }
  return expectedPayoff;
}

export function calculateProbabilityOfProfit(
  position: Position,
  volatilityModel: VolatilityModel,
  currentPrice: number,
  breakEvenPrice: number
): number {
  const probAtBreakEven = getProbabilityForPrice(breakEvenPrice, currentPrice, volatilityModel);

  if (position.side === 'debit') {
    // For debit spreads, profit when price is beyond break-even in the direction of the spread
    if (position.type === 'call') {
      // Bull Call
      return 1 - probAtBreakEven;
    } else {
      // Bear Put
      return probAtBreakEven;
    }
  } else {
    // credit spread
    // For credit spreads, profit when price is within the profitable range (usually between strikes or outside)
    if (position.type === 'call') {
      // Bear Call
      return probAtBreakEven;
    } else {
      // Bull Put
      return 1 - probAtBreakEven;
    }
  }
}

export function calculateBreakEvenPrice(position: Position): number {
  const { type, side, longStrike, shortStrike, netPremium } = position;
  if (type === 'call') {
    if (side === 'debit') {
      // Bull Call Spread
      return longStrike - netPremium;
    } else {
      // Bear Call Spread
      return shortStrike + netPremium;
    }
  } else {
    // put spread
    if (side === 'debit') {
      // Bear Put Spread
      return longStrike + netPremium;
    } else {
      // Bull Put Spread
      return shortStrike - netPremium;
    }
  }
}
