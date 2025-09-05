import { OptionData, SpreadDefinition } from '@/types/global';
import { VolatilityModel, getProbabilityForPrice } from '@/core/probability';

export function calculateNetPremium(
  spreadDefinition: SpreadDefinition,
  optionChain: OptionData[]
): number {
  const longLeg = optionChain.find(
    (opt) => opt.strike === spreadDefinition.longStrike && opt.type === spreadDefinition.type
  );
  const shortLeg = optionChain.find(
    (opt) => opt.strike === spreadDefinition.shortStrike && opt.type === spreadDefinition.type
  );

  if (!longLeg || !shortLeg) {
    throw new Error('Could not find one or both legs of the spread in the option chain for net premium calculation.');
  }

  return shortLeg.bidPrice - longLeg.askPrice;
}

export function calculateMaxProfitLoss(
  spreadDefinition: SpreadDefinition,
  netPremium: number
): { maxProfit: number; maxLoss: number } {
  if (spreadDefinition.type === 'call') {
    if (spreadDefinition.side === 'debit') { // Bull Call Spread
      const strikeDifference = spreadDefinition.shortStrike - spreadDefinition.longStrike;
      return {
        maxProfit: strikeDifference + netPremium,
        maxLoss: netPremium,
      };
    } else { // Bear Call Spread
      const strikeDifference = spreadDefinition.longStrike - spreadDefinition.shortStrike;
      return {
        maxProfit: netPremium,
        maxLoss: netPremium - strikeDifference,
      };
    }
  } else { // put
    if (spreadDefinition.side === 'debit') { // Bear Put Spread
      const strikeDifference = spreadDefinition.longStrike - spreadDefinition.shortStrike;
      return {
        maxProfit: strikeDifference + netPremium,
        maxLoss: netPremium,
      };
    } else { // Bull Put Spread
      const strikeDifference = spreadDefinition.shortStrike - spreadDefinition.longStrike;
      return {
        maxProfit: netPremium,
        maxLoss: netPremium - strikeDifference,
      };
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

export function calculateProbabilisticPayoff(
  spreadDefinition: SpreadDefinition,
  volatilityModel: VolatilityModel,
  optionChain: OptionData[],
  currentPrice: number
): number {
  let expectedPayoff = 0;

  const longLeg = optionChain.find(
    (opt) => opt.strike === spreadDefinition.longStrike && opt.type === spreadDefinition.type
  );
  const shortLeg = optionChain.find(
    (opt) => opt.strike === spreadDefinition.shortStrike && opt.type === spreadDefinition.type
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
      payoff = Math.max(0, price - spreadDefinition.longStrike) - Math.max(0, price - spreadDefinition.shortStrike);
    } else { // put spread
      payoff = Math.max(0, spreadDefinition.longStrike - price) - Math.max(0, spreadDefinition.shortStrike - price);
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
  if (spreadDefinition.type === 'call') {
    if (spreadDefinition.side === 'debit') { // Bull Call Spread
      return spreadDefinition.longStrike - netPremium;
    } else { // Bear Call Spread
      return spreadDefinition.shortStrike + netPremium;
    }
  } else { // put spread
    if (spreadDefinition.side === 'debit') { // Bear Put Spread
      return spreadDefinition.longStrike + netPremium;
    } else { // Bull Put Spread
      return spreadDefinition.shortStrike - netPremium;
    }
  }
}