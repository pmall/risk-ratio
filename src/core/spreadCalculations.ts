import { OptionData, SpreadDefinition } from '@/types/global';
import { VolatilityModel, getProbabilityForPrice } from '@/core/probability';

export function calculateNetPremium(
  spreadDefinition: SpreadDefinition,
  optionChain: OptionData[],
  side: 'debit' | 'credit'
): number {
  const { longStrike, shortStrike } = getLegStrikes(spreadDefinition);

  const longLeg = optionChain.find(
    (opt) => opt.strike === longStrike && opt.type === spreadDefinition.type
  );
  const shortLeg = optionChain.find(
    (opt) => opt.strike === shortStrike && opt.type === spreadDefinition.type
  );

  if (!longLeg || !shortLeg) {
    throw new Error('Could not find one or both legs of the spread in the option chain for net premium calculation.');
  }

  if (side === 'debit') {
    // For a debit spread, premium = ask(long leg) - bid(short leg)
    return (longLeg.askPrice ?? 0) - (shortLeg.bidPrice ?? 0);
  } else {
    // For a credit spread, premium = bid(short leg) - ask(long leg)
    return (shortLeg.bidPrice ?? 0) - (longLeg.askPrice ?? 0);
  }
}

export function calculateMaxProfitLoss(
  spreadDefinition: SpreadDefinition,
  netPremium: number
): { maxProfit: number; maxLoss: number } {
  const [k1, k2] = spreadDefinition.strikes;
  const strikeDifference = Math.abs(k2 - k1);

  if (spreadDefinition.side === 'debit') {
    return {
      maxProfit: strikeDifference - netPremium,
      maxLoss: netPremium,
    };
  } else { // credit spread
    return {
      maxProfit: netPremium,
      maxLoss: strikeDifference - netPremium,
    };
  }
}

export function getLegStrikes(
  spreadDefinition: SpreadDefinition
): { longStrike: number; shortStrike: number } {
  const [s1, s2] = spreadDefinition.strikes;

  let longStrike: number;
  let shortStrike: number;

  if (spreadDefinition.type === 'call') {
    if (spreadDefinition.side === 'debit') { // Bull Call Spread
      longStrike = Math.min(s1, s2);
      shortStrike = Math.max(s1, s2);
    } else { // Bear Call Spread
      longStrike = Math.max(s1, s2);
      shortStrike = Math.min(s1, s2);
    }
  } else { // put spread
    if (spreadDefinition.side === 'debit') { // Bear Put Spread
      longStrike = Math.max(s1, s2);
      shortStrike = Math.min(s1, s2);
    } else { // Bull Put Spread
      longStrike = Math.min(s1, s2);
      shortStrike = Math.max(s1, s2);
    }
  }
  return { longStrike, shortStrike };
}

export function calculateProbabilisticPayoff(
  spreadDefinition: SpreadDefinition,
  volatilityModel: VolatilityModel,
  optionChain: OptionData[],
  currentPrice: number
): number {
  let expectedPayoff = 0;
  const { longStrike, shortStrike } = getLegStrikes(spreadDefinition);

  const longLeg = optionChain.find(
    (opt) => opt.strike === longStrike && opt.type === spreadDefinition.type
  );
  const shortLeg = optionChain.find(
    (opt) => opt.strike === shortStrike && opt.type === spreadDefinition.type
  );

  if (!longLeg || !shortLeg) {
    throw new Error('Could not find one or both legs of the spread in the option chain for probabilistic payoff calculation.');
  }

  // Determine price range for dense grid
  const allStrikes = optionChain.map(opt => opt.strike);
  const minStrike = Math.min(...allStrikes);
  const maxStrike = Math.max(...allStrikes);

  const stepSize = 0.5; // Define granularity of the price grid

  let previousCdfValue = 0;

  for (let price = minStrike; price <= maxStrike; price += stepSize) {
    const cdf_value = getProbabilityForPrice(price, currentPrice, volatilityModel);

    let payoff = 0;

    if (spreadDefinition.type === 'call') {
      payoff = Math.max(0, price - longStrike) - Math.max(0, price - shortStrike);
    } else { // put spread
      payoff = Math.max(0, longStrike - price) - Math.max(0, shortStrike - price);
    }

    // The probability of this specific price occurring is the difference between its CDF and the previous one
    const probOfPrice = cdf_value - previousCdfValue;
    expectedPayoff += payoff * probOfPrice;
    previousCdfValue = cdf_value;
  }
  return expectedPayoff;
}

export function calculateProbabilityOfProfit(
  spreadDefinition: SpreadDefinition,
  volatilityModel: VolatilityModel,
  currentPrice: number,
  breakEvenPrice: number
): number {
  const probAtBreakEven = getProbabilityForPrice(breakEvenPrice, currentPrice, volatilityModel);

  if (spreadDefinition.side === 'debit') {
    // For debit spreads, profit when price is beyond break-even in the direction of the spread
    if (spreadDefinition.type === 'call') { // Bull Call
      return 1 - probAtBreakEven;
    } else { // Bear Put
      return probAtBreakEven;
    }
  } else { // credit spread
    // For credit spreads, profit when price is within the profitable range (usually between strikes or outside)
    if (spreadDefinition.type === 'call') { // Bear Call
      return probAtBreakEven;
    } else { // Bull Put
      return 1 - probAtBreakEven;
    }
  }
}

export function calculateBreakEvenPrice(
  spreadDefinition: SpreadDefinition,
  netPremium: number
): number {
  const { longStrike, shortStrike } = getLegStrikes(spreadDefinition);

  if (spreadDefinition.type === 'call') {
    if (spreadDefinition.side === 'debit') { // Bull Call Spread
      return longStrike + netPremium;
    } else { // Bear Call Spread
      return shortStrike + netPremium;
    }
  } else { // put spread
    if (spreadDefinition.side === 'debit') { // Bear Put Spread
      return longStrike - netPremium;
    } else { // Bull Put Spread
      return shortStrike - netPremium;
    }
  }
}

export function getSpreadType(spreadDefinition: SpreadDefinition): string {
  if (spreadDefinition.type === 'call') {
    if (spreadDefinition.side === 'debit') {
      return 'Bull Call Spread';
    } else {
      return 'Bear Call Spread';
    }
  } else { // put spread
    if (spreadDefinition.side === 'debit') {
      return 'Bear Put Spread';
    } else {
      return 'Bull Put Spread';
    }
  }
}
