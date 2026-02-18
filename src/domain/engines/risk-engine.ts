/**
 * Risk Engine
 * Domain Layer - Pure Business Logic
 * 
 * Purpose: All risk and position sizing calculations
 * 
 * Why: Centralizes trading math in one testable, reusable place
 * 
 * Layer Rules:
 * - PURE functions only (no side effects)
 * - No database access
 * - No API calls
 * - No framework dependencies
 * - Same input = same output (deterministic)
 * 
 * What it should do:
 * - Calculate position sizes
 * - Calculate risk/reward ratios
 * - Calculate liquidation prices
 * - Calculate PnL
 * 
 * What it should NOT do:
 * - Save to database
 * - Fetch prices
 * - Validate business rules (that's application layer)
 */

import { TradeSide } from "../types";

export class RiskEngine {
  /**
   * Calculate position size based on account balance and risk percentage
   * 
   * Formula:
   * - Risk Amount = Account Balance * Risk Percent
   * - Price Distance = |Entry - Stop Loss|
   * - Position Size = (Risk Amount / Price Distance) * Leverage
   * 
   * Example:
   * - Account: $10,000, Risk: 2%, Entry: $50,000, SL: $49,000, Leverage: 10x
   * - Risk Amount = $200
   * - Distance = $1,000
   * - Position Size = ($200 / $1,000) * 10 = 2.0 contracts
   */
  calculatePositionSize(params: {
    accountBalance: number;
    entryPrice: number;
    stopLoss: number;
    riskPercent: number;
    leverage: number;
  }): number {
    const { accountBalance, entryPrice, stopLoss, riskPercent, leverage } = params;

    // Input validation
    if (accountBalance <= 0) throw new Error("Account balance must be positive");
    if (entryPrice <= 0) throw new Error("Entry price must be positive");
    if (stopLoss <= 0) throw new Error("Stop loss must be positive");
    if (riskPercent <= 0 || riskPercent > 100) throw new Error("Risk percent must be between 0 and 100");
    if (leverage < 1) throw new Error("Leverage must be at least 1");

    const riskAmount = accountBalance * (riskPercent / 100);
    const priceDistance = Math.abs(entryPrice - stopLoss);

    if (priceDistance === 0) {
      throw new Error("Stop loss cannot equal entry price");
    }

    const positionSize = (riskAmount / priceDistance) * leverage;
    
    return Number(positionSize.toFixed(8));
  }

  /**
   * Calculate risk-to-reward ratio
   * 
   * Formula:
   * - Risk = |Entry - Stop Loss|
   * - Reward = |Take Profit - Entry|
   * - R:R = Reward / Risk
   * 
   * Example:
   * - LONG: Entry $50k, SL $49k, TP $52k
   * - Risk = $1k, Reward = $2k, R:R = 2.0
   */
  calculateRiskReward(params: {
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
    side: TradeSide;
  }): number {
    const { entryPrice, stopLoss, takeProfit, side } = params;

    // Input validation
    if (entryPrice <= 0) throw new Error("Entry price must be positive");
    if (stopLoss <= 0) throw new Error("Stop loss must be positive");
    if (takeProfit <= 0) throw new Error("Take profit must be positive");

    let risk: number;
    let reward: number;

    if (side === "LONG") {
      // For LONG: SL should be below entry, TP should be above
      risk = entryPrice - stopLoss;
      reward = takeProfit - entryPrice;
    } else {
      // For SHORT: SL should be above entry, TP should be below
      risk = stopLoss - entryPrice;
      reward = entryPrice - takeProfit;
    }

    if (risk <= 0) {
      throw new Error(`Invalid stop loss for ${side} position`);
    }

    if (reward <= 0) {
      throw new Error(`Invalid take profit for ${side} position`);
    }

    const ratio = reward / risk;
    return Number(ratio.toFixed(2));
  }

  /**
   * Calculate liquidation price for leveraged position
   * 
   * Simplified Formula (assumes 100% margin usage):
   * - LONG: Liquidation = Entry * (1 - 1/Leverage)
   * - SHORT: Liquidation = Entry * (1 + 1/Leverage)
   * 
   * Example:
   * - LONG at $50k with 10x leverage
   * - Liquidation = $50k * (1 - 0.1) = $45k
   * 
   * Note: This is a simplified calculation. Real exchanges use more complex formulas
   * that account for maintenance margin, fees, etc.
   */
  calculateLiquidationPrice(params: {
    entryPrice: number;
    leverage: number;
    side: TradeSide;
  }): number | null {
    const { entryPrice, leverage, side } = params;

    // Input validation
    if (entryPrice <= 0) throw new Error("Entry price must be positive");
    if (leverage < 1) throw new Error("Leverage must be at least 1");

    // No liquidation for 1x leverage (spot trading)
    if (leverage === 1) {
      return null;
    }

    let liquidationPrice: number;

    if (side === "LONG") {
      liquidationPrice = entryPrice * (1 - 1 / leverage);
    } else {
      liquidationPrice = entryPrice * (1 + 1 / leverage);
    }

    return Number(liquidationPrice.toFixed(2));
  }

  /**
   * Calculate dollar amounts at risk and reward
   * 
   * Formula:
   * - LONG Risk = (Entry - SL) * Position Size
   * - LONG Reward = (TP - Entry) * Position Size
   * - SHORT Risk = (SL - Entry) * Position Size
   * - SHORT Reward = (Entry - TP) * Position Size
   */
  calculateRiskRewardAmounts(params: {
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
    positionSize: number;
    side: TradeSide;
  }): { riskAmount: number; rewardAmount: number } {
    const { entryPrice, stopLoss, takeProfit, positionSize, side } = params;

    // Input validation
    if (entryPrice <= 0) throw new Error("Entry price must be positive");
    if (stopLoss <= 0) throw new Error("Stop loss must be positive");
    if (takeProfit <= 0) throw new Error("Take profit must be positive");
    if (positionSize <= 0) throw new Error("Position size must be positive");

    let riskAmount: number;
    let rewardAmount: number;

    if (side === "LONG") {
      riskAmount = (entryPrice - stopLoss) * positionSize;
      rewardAmount = (takeProfit - entryPrice) * positionSize;
    } else {
      riskAmount = (stopLoss - entryPrice) * positionSize;
      rewardAmount = (entryPrice - takeProfit) * positionSize;
    }

    return {
      riskAmount: Number(riskAmount.toFixed(2)),
      rewardAmount: Number(rewardAmount.toFixed(2)),
    };
  }

  /**
   * Calculate PnL for a position
   * 
   * Formula:
   * - LONG: (Exit - Entry) * Position Size
   * - SHORT: (Entry - Exit) * Position Size
   * 
   * Positive = profit, Negative = loss
   */
  calculatePnL(params: {
    entryPrice: number;
    exitPrice: number;
    positionSize: number;
    side: TradeSide;
  }): number {
    const { entryPrice, exitPrice, positionSize, side } = params;

    // Input validation
    if (entryPrice <= 0) throw new Error("Entry price must be positive");
    if (exitPrice <= 0) throw new Error("Exit price must be positive");
    if (positionSize <= 0) throw new Error("Position size must be positive");

    let pnl: number;

    if (side === "LONG") {
      pnl = (exitPrice - entryPrice) * positionSize;
    } else {
      pnl = (entryPrice - exitPrice) * positionSize;
    }

    return Number(pnl.toFixed(2));
  }
}

// Export singleton instance
export const riskEngine = new RiskEngine();
