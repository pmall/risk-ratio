import { getDataSource } from '@/data-sources';
import { getVolatilityModel, VolatilityModel } from '@/core/probability';
import {
  calculateNetPremium,
  calculateMaxProfitLoss,
  calculateProbabilisticPayoff,
  calculateProbabilityOfProfit,
  calculateBreakEvenPrice,
  getSpreadType,
} from '@/core/spreadCalculations';
import { SpreadDefinition, SpreadAnalysisResult } from '@/types/global';

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

  const spreadDefinition: SpreadDefinition = {
    type: spreadType,
    strikes: strikes,
    side: side,
  };

  const netPremium = calculateNetPremium(spreadDefinition, optionChain, side);
  const { maxProfit, maxLoss } = calculateMaxProfitLoss(spreadDefinition, netPremium);

  const expectedPayoff = calculateProbabilisticPayoff(spreadDefinition, volatilityModel, optionChain, currentPrice);
  const breakEvenPrice = calculateBreakEvenPrice(spreadDefinition, netPremium);
  const probabilityOfProfit = calculateProbabilityOfProfit(spreadDefinition, volatilityModel, currentPrice, breakEvenPrice);
  const spreadTypeName = getSpreadType(spreadDefinition);

  let riskRewardRatio: number;
    if (side === 'debit') {
      riskRewardRatio = expectedPayoff / netPremium;
    } else { // credit
      riskRewardRatio = netPremium / expectedPayoff;
    }

  let expectedPnL: number;
  if (side === 'debit') {
    expectedPnL = expectedPayoff - netPremium;
  } else { // credit
    expectedPnL = netPremium + expectedPayoff;
  }

  return {
    netPremium: parseFloat(netPremium.toFixed(2)),
    maxRisk: parseFloat(maxLoss.toFixed(2)),
    maxReward: parseFloat(maxProfit.toFixed(2)),
    expectedPayoff: parseFloat(expectedPayoff.toFixed(2)),
    riskRewardRatio: parseFloat(riskRewardRatio.toFixed(2)),
    probabilityOfProfit: parseFloat(probabilityOfProfit.toFixed(4)),
    breakEvenPrice: parseFloat(breakEvenPrice.toFixed(2)),
    spreadType: spreadTypeName,
    type: spreadType,
    side: side,
    strikes: strikes,
    expectedPnL: parseFloat(expectedPnL.toFixed(2)),
  };
}