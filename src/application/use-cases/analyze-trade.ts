/**
 * Analyze Trade Use Case
 * Application Layer
 * 
 * Purpose: Calculate risk metrics WITHOUT executing trade
 * 
 * Why: Let users preview risk before committing
 * 
 * Layer Rules:
 * - Orchestrates domain + infrastructure
 * - No direct database access (use repositories)
 * - No business logic (use domain engines)
 * 
 * Flow:
 * 1. Validate input (business rules)
 * 2. Call risk engine for calculations
 * 3. Return analysis with warnings
 * 
 * What it does:
 * - Calculate position size
 * - Calculate risk/reward amounts
 * - Calculate liquidation price
 * - Validate risk parameters
 * - Generate warnings for risky setups
 * 
 * What it should NOT do:
 * - Save to database
 * - Execute trades
 * - Fetch prices (that's open trade)
 */

import { riskEngine } from "@/domain/engines/risk-engine";
import { TradeAnalysis, TradeSide } from "@/domain/types";
import { appConfig } from "@/config/env";

export interface AnalyzeTradeParams {
  symbol: string;
  side: TradeSide;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  accountBalance: number;
  riskPercent: number;
  leverage: number;
}

export class AnalyzeTradeUseCase {
  async execute(params: AnalyzeTradeParams): Promise<TradeAnalysis> {
    const warnings: string[] = [];
    let isValid = true;

    // Validate risk percent
    if (params.riskPercent > appConfig.maxRiskPercent) {
      warnings.push(
        `Risk percent (${params.riskPercent}%) exceeds maximum (${appConfig.maxRiskPercent}%)`
      );
      isValid = false;
    }

    // Validate stop loss position
    if (params.side === "LONG" && params.stopLoss >= params.entryPrice) {
      warnings.push("Stop loss must be below entry price for LONG positions");
      isValid = false;
    }

    if (params.side === "SHORT" && params.stopLoss <= params.entryPrice) {
      warnings.push("Stop loss must be above entry price for SHORT positions");
      isValid = false;
    }

    // Validate take profit position
    if (params.side === "LONG" && params.takeProfit <= params.entryPrice) {
      warnings.push("Take profit must be above entry price for LONG positions");
      isValid = false;
    }

    if (params.side === "SHORT" && params.takeProfit >= params.entryPrice) {
      warnings.push("Take profit must be below entry price for SHORT positions");
      isValid = false;
    }

    // If basic validations fail, return early
    if (!isValid) {
      return {
        positionSize: 0,
        riskAmount: 0,
        rewardAmount: 0,
        riskRewardRatio: 0,
        liquidationPrice: null,
        isValid,
        warnings,
      };
    }

    // Calculate position size
    const positionSize = riskEngine.calculatePositionSize({
      accountBalance: params.accountBalance,
      entryPrice: params.entryPrice,
      stopLoss: params.stopLoss,
      riskPercent: params.riskPercent,
      leverage: params.leverage,
    });

    // Calculate risk/reward amounts
    const { riskAmount, rewardAmount } = riskEngine.calculateRiskRewardAmounts({
      entryPrice: params.entryPrice,
      stopLoss: params.stopLoss,
      takeProfit: params.takeProfit,
      positionSize,
      side: params.side,
    });

    // Calculate risk/reward ratio
    const riskRewardRatio = riskEngine.calculateRiskReward({
      entryPrice: params.entryPrice,
      stopLoss: params.stopLoss,
      takeProfit: params.takeProfit,
      side: params.side,
    });

    // Validate risk/reward ratio
    if (riskRewardRatio < appConfig.minRiskRewardRatio) {
      warnings.push(
        `Risk/Reward ratio (${riskRewardRatio}) is below minimum (${appConfig.minRiskRewardRatio})`
      );
      isValid = false;
    }

    // Calculate liquidation price
    const liquidationPrice = riskEngine.calculateLiquidationPrice({
      entryPrice: params.entryPrice,
      leverage: params.leverage,
      side: params.side,
    });

    // Warn about high leverage
    if (params.leverage > 10) {
      warnings.push(`High leverage (${params.leverage}x) increases liquidation risk`);
    }

    // Warn if liquidation is close to stop loss
    if (liquidationPrice) {
      const distanceToLiq = Math.abs(params.stopLoss - liquidationPrice);
      const distanceToEntry = Math.abs(params.stopLoss - params.entryPrice);

      if (distanceToLiq < distanceToEntry * 0.2) {
        warnings.push("Liquidation price is very close to stop loss");
      }
    }

    return {
      positionSize,
      riskAmount,
      rewardAmount,
      riskRewardRatio,
      liquidationPrice,
      isValid,
      warnings,
    };
  }
}

// Export singleton instance
export const analyzeTradeUseCase = new AnalyzeTradeUseCase();
