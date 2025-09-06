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

function optionPositionFactory(
  type: 'call' | 'put',
  side: 'debit' | 'credit',
  strike: number,
  optionChain: OptionData[],
  currentPrice: number,
  virtualStrikeOffset: number
): Position {
  const option = optionChain.find((opt) => opt.strike === strike && opt.type === type);
  if (!option) {
    throw new Error(`Option with strike ${strike} not found in the option chain.`);
  }

  let longStrike: number;
  let shortStrike: number;
  let netPremium: number;

  if (side === 'debit') {
    longStrike = strike;
    netPremium = -option.askPrice;
    if (type === 'call') {
      shortStrike = currentPrice * (1 + virtualStrikeOffset / 100);
    } else { // put
      shortStrike = currentPrice * (1 - virtualStrikeOffset / 100);
    }
  } else { // credit
    shortStrike = strike;
    netPremium = option.bidPrice;
    if (type === 'call') {
      longStrike = currentPrice * (1 - virtualStrikeOffset / 100);
    } else { // put
      longStrike = currentPrice * (1 + virtualStrikeOffset / 100);
    }
  }

  return { type, side, longStrike, shortStrike, netPremium };
}

export async function analyzeOption(
  source: string,
  instrument: string,
  expiration: string,
  optionType: 'call' | 'put',
  strike: number,
  side: 'debit' | 'credit',
  virtualStrikeOffset: number
): Promise<PositionAnalysisResult> {
  const dataSource = getDataSource(source, instrument);

  const [optionChain, currentPrice] = await Promise.all([
    dataSource.getOptionChain(instrument, expiration),
    dataSource.getCurrentPrice(instrument),
  ]);

  const volatilityModel = getVolatilityModel(optionChain, currentPrice);

  const position = optionPositionFactory(optionType, side, strike, optionChain, currentPrice, virtualStrikeOffset);

  const { maxProfit, maxLoss } = calculateMaxProfitLoss(position);
  const { netPremium } = position;

  const expectedPayoff = calculateProbabilisticPayoff(position, volatilityModel, optionChain, currentPrice);
  const breakEvenPrice = calculateBreakEvenPrice(position);
  const probabilityOfProfit = calculateProbabilityOfProfit(position, volatilityModel, currentPrice, breakEvenPrice);
  const positionTypeName = getPositionType(position);

  let riskRewardRatio: number;
  if (position.side === 'debit') {
    riskRewardRatio = expectedPayoff / -netPremium;
  } else { // credit
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