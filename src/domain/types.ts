/**
 * Domain Types
 * Domain Layer
 * 
 * Purpose: Core domain types and interfaces
 * 
 * Why: Defines the business entities and their contracts
 * 
 * Layer Rules:
 * - Pure TypeScript types (no dependencies)
 * - Used across all layers
 * - Represents business concepts
 */

export type TradeSide = "LONG" | "SHORT";
export type TradeStatus = "OPEN" | "CLOSED_TP" | "CLOSED_SL" | "CLOSED_MANUAL";
export type ExecutionMode = "PAPER" | "LIVE";

export interface Trade {
  id: string;
  symbol: string;
  side: TradeSide;
  
  // Entry details
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  positionSize: number;
  leverage: number;
  
  // Risk metrics
  riskAmount: number;
  rewardAmount: number;
  riskRewardRatio: number;
  liquidationPrice: number | null;
  
  // Status tracking
  status: TradeStatus;
  
  // PnL
  grossPnL: number | null;
  netPnL: number | null;
  
  // Execution
  executionMode: ExecutionMode;
  
  // Timestamps
  createdAt: Date;
  closedAt: Date | null;
}

export interface RiskCalculation {
  positionSize: number;
  riskAmount: number;
  rewardAmount: number;
  riskRewardRatio: number;
  liquidationPrice: number | null;
}

export interface TradeAnalysis extends RiskCalculation {
  isValid: boolean;
  warnings: string[];
}
