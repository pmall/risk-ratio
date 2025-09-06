import { getDataSource } from '@/data-sources';
import { getVolatilityModel } from '@/core/probability';
import {
  calculateMaxProfitLoss,
  calculateProbabilisticPayoff,
  calculateProbabilityOfProfit,
  calculateBreakEvenPrice,
  getPositionType,
} from '@/core/spreadCalculations';
import { Position, PositionAnalysisResult, OptionData } from '@/types/global';

function calculateNetPremium(longStrike: number, shortStrike: number, type: 'call' | 'put', optionChain: OptionData[]): number {
  const longLeg = optionChain.find((opt) => opt.strike === longStrike && opt.type === type);
  const shortLeg = optionChain.find((opt) => opt.strike === shortStrike && opt.type === type);

  if (!longLeg || !shortLeg) {
    throw new Error('Could not find one or both legs of the spread in the option chain for net premium calculation.');
  }

  return shortLeg.bidPrice - longLeg.askPrice;
}

function spreadPositionFactory(
  type: 'call' | 'put',
  side: 'debit' | 'credit',
  strikes: [number, number],
  optionChain: OptionData[]
): Position {
  const [s1, s2] = strikes;

  let longStrike: number;
  let shortStrike: number;

  if (type === 'call') {
    if (side === 'debit') {
      // Bull Call Spread
      longStrike = Math.min(s1, s2);
      shortStrike = Math.max(s1, s2);
    } else {
      // Bear Call Spread
      longStrike = Math.max(s1, s2);
      shortStrike = Math.min(s1, s2);
    }
  } else {
    // put spread
    if (side === 'debit') {
      // Bear Put Spread
      longStrike = Math.max(s1, s2);
      shortStrike = Math.min(s1, s2);
    } else {
      // Bull Put Spread
      longStrike = Math.min(s1, s2);
      shortStrike = Math.max(s1, s2);
    }
  }

  const netPremium = calculateNetPremium(longStrike, shortStrike, type, optionChain);

  return { type, side, longStrike, shortStrike, netPremium };
}

export async function analyzeSpread(
  source: string,
  instrument: string,
  expiration: string,
  spreadType: 'call' | 'put',
  strikes: [number, number],
  side: 'debit' | 'credit'
): Promise<PositionAnalysisResult> {
  const dataSource = getDataSource(source, instrument);

  const [optionChain, currentPrice] = await Promise.all([
    dataSource.getOptionChain(instrument, expiration),
    dataSource.getCurrentPrice(instrument),
  ]);

  const volatilityModel = getVolatilityModel(optionChain, currentPrice);

  const position = spreadPositionFactory(spreadType, side, strikes, optionChain);

  const { maxProfit, maxLoss } = calculateMaxProfitLoss(position);
  const { netPremium } = position;

  const expectedPayoff = calculateProbabilisticPayoff(position, volatilityModel, optionChain, currentPrice);
  const breakEvenPrice = calculateBreakEvenPrice(position);
  const probabilityOfProfit = calculateProbabilityOfProfit(position, volatilityModel, currentPrice, breakEvenPrice);
  const positionTypeName = getPositionType(position);

  let riskRewardRatio: number;
  if (side === 'debit') {
    riskRewardRatio = expectedPayoff / -netPremium;
  } else {
    // credit
    riskRewardRatio = netPremium / -expectedPayoff;
  }

  const expectedPnL = expectedPayoff + netPremium;

  return {
    netPremium: parseFloat(netPremium.toFixed(2)),
    maxRisk: parseFloat(maxLoss.toFixed(2)),
    maxReward: parseFloat(maxProfit.toFixed(2)),
    expectedPayoff: parseFloat(expectedPayoff.toFixed(2)),
    riskRewardRatio: parseFloat(riskRewardRatio.toFixed(2)),
    probabilityOfProfit: parseFloat(probabilityOfProfit.toFixed(4)),
    breakEvenPrice: parseFloat(breakEvenPrice.toFixed(2)),
    spreadType: positionTypeName,
    type: position.type,
    side: position.side,
    longStrike: position.longStrike,
    shortStrike: position.shortStrike,
    expectedPnL: parseFloat(expectedPnL.toFixed(2)),
  };
}
