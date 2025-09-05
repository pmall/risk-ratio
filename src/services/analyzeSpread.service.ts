import { getDataSource } from '@/data-sources';
import { getVolatilityModel } from '@/core/probability';
import {
  calculateNetPremium,
  calculateMaxProfitLoss,
  calculateProbabilisticPayoff,
  calculateProbabilityOfProfit,
  calculateBreakEvenPrice,
  getSpreadType,
} from '@/core/spreadCalculations';
import { SpreadDefinition, SpreadAnalysisResult } from '@/types/global';

export function spreadDefinitionFactory(type: 'call' | 'put', side: 'debit' | 'credit', strikes: [number, number]): SpreadDefinition {
  const [s1, s2] = strikes;

  let longStrike: number;
  let shortStrike: number;

  if (type === 'call') {
    if (side === 'debit') { // Bull Call Spread
      longStrike = Math.min(s1, s2);
      shortStrike = Math.max(s1, s2);
    } else { // Bear Call Spread
      longStrike = Math.max(s1, s2);
      shortStrike = Math.min(s1, s2);
    }
  } else { // put spread
    if (side === 'debit') { // Bear Put Spread
      longStrike = Math.max(s1, s2);
      shortStrike = Math.min(s1, s2);
    } else { // Bull Put Spread
      longStrike = Math.min(s1, s2);
      shortStrike = Math.max(s1, s2);
    }
  }
  return { type, side, longStrike, shortStrike };
}

export async function analyzeSpread(
  source: string,
  instrument: string,
  expiration: string,
  spreadType: 'call' | 'put',
  strikes: [number, number],
  side: 'debit' | 'credit'
): Promise<SpreadAnalysisResult> {
  const dataSource = getDataSource(source, instrument);

  const [optionChain, currentPrice] = await Promise.all([
    dataSource.getOptionChain(instrument, expiration),
    dataSource.getCurrentPrice(instrument),
  ]);

  const volatilityModel = getVolatilityModel(optionChain, currentPrice);
  
  const spreadDefinition = spreadDefinitionFactory(spreadType, side, strikes);

  const netPremium = calculateNetPremium(spreadDefinition, optionChain);
  const { maxProfit, maxLoss } = calculateMaxProfitLoss(spreadDefinition, netPremium);

  const expectedPayoff = calculateProbabilisticPayoff(spreadDefinition, volatilityModel, optionChain, currentPrice);
  const breakEvenPrice = calculateBreakEvenPrice(spreadDefinition, netPremium);
  const probabilityOfProfit = calculateProbabilityOfProfit(spreadDefinition, volatilityModel, currentPrice, breakEvenPrice);
  const spreadTypeName = getSpreadType(spreadDefinition);

  let riskRewardRatio: number;
    if (side === 'debit') {
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
    spreadType: spreadTypeName,
    type: spreadDefinition.type,
    side: spreadDefinition.side,
    longStrike: spreadDefinition.longStrike,
    shortStrike: spreadDefinition.shortStrike,
    expectedPnL: parseFloat(expectedPnL.toFixed(2)),
  };
}