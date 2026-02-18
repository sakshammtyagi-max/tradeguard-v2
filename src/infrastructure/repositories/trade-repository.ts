/**
 * Trade Repository
 * Infrastructure Layer
 * 
 * Purpose: All database operations for trades
 * 
 * Why: Isolates data access from business logic
 * 
 * Layer Rules:
 * - Only place where Prisma is imported (except db client)
 * - Used by application layer only
 * - Never imported in domain layer
 * - Handles all database errors gracefully
 * 
 * What it does:
 * - CRUD operations for trades
 * - Query filtering and sorting
 * - Transaction management
 * 
 * What it should NOT do:
 * - Business logic (risk calculations, validations)
 * - Price fetching
 * - Decision making
 */

import { prisma } from "../db/client";
import { Trade, TradeSide, TradeStatus } from "@/domain/types";

export interface CreateTradeDTO {
  symbol: string;
  side: TradeSide;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  positionSize: number;
  leverage: number;
  riskAmount: number;
  rewardAmount: number;
  riskRewardRatio: number;
  liquidationPrice: number | null;
  executionMode: "PAPER" | "LIVE";
}

export interface UpdateTradeDTO {
  status?: TradeStatus;
  grossPnL?: number;
  netPnL?: number;
  closedAt?: Date;
}

export interface TradeFilters {
  status?: TradeStatus;
  symbol?: string;
  side?: TradeSide;
  executionMode?: "PAPER" | "LIVE";
}

export class TradeRepository {
  /**
   * Create a new trade
   */
  async create(dto: CreateTradeDTO): Promise<Trade> {
    try {
      const trade = await prisma.trade.create({
        data: {
          symbol: dto.symbol,
          side: dto.side,
          entryPrice: dto.entryPrice,
          stopLoss: dto.stopLoss,
          takeProfit: dto.takeProfit,
          positionSize: dto.positionSize,
          leverage: dto.leverage,
          riskAmount: dto.riskAmount,
          rewardAmount: dto.rewardAmount,
          riskRewardRatio: dto.riskRewardRatio,
          liquidationPrice: dto.liquidationPrice,
          status: "OPEN",
          executionMode: dto.executionMode,
        },
      });

      return this.mapToTradeEntity(trade);
    } catch (error) {
      console.error("[TradeRepository] Error creating trade:", error);
      throw new Error("Failed to create trade");
    }
  }

  /**
   * Find trade by ID
   */
  async findById(id: string): Promise<Trade | null> {
    try {
      const trade = await prisma.trade.findUnique({
        where: { id },
      });

      return trade ? this.mapToTradeEntity(trade) : null;
    } catch (error) {
      console.error("[TradeRepository] Error finding trade:", error);
      throw new Error("Failed to find trade");
    }
  }

  /**
   * Find all open trades
   */
  async findOpenTrades(): Promise<Trade[]> {
    try {
      const trades = await prisma.trade.findMany({
        where: { status: "OPEN" },
        orderBy: { createdAt: "desc" },
      });

      return trades.map((t) => this.mapToTradeEntity(t));
    } catch (error) {
      console.error("[TradeRepository] Error finding open trades:", error);
      throw new Error("Failed to find open trades");
    }
  }

  /**
   * Update trade
   */
  async updateTrade(id: string, updates: UpdateTradeDTO): Promise<Trade> {
    try {
      const trade = await prisma.trade.update({
        where: { id },
        data: updates,
      });

      return this.mapToTradeEntity(trade);
    } catch (error) {
      console.error("[TradeRepository] Error updating trade:", error);
      throw new Error("Failed to update trade");
    }
  }

  /**
   * Find all trades with optional filters
   */
  async findAll(filters?: TradeFilters): Promise<Trade[]> {
    try {
      const trades = await prisma.trade.findMany({
        where: filters,
        orderBy: { createdAt: "desc" },
      });

      return trades.map((t) => this.mapToTradeEntity(t));
    } catch (error) {
      console.error("[TradeRepository] Error finding trades:", error);
      throw new Error("Failed to find trades");
    }
  }

  /**
   * Map Prisma model to domain entity
   * 
   * Why: Keeps domain layer independent of Prisma types
   */
  private mapToTradeEntity(prismaModel: any): Trade {
    return {
      id: prismaModel.id,
      symbol: prismaModel.symbol,
      side: prismaModel.side as TradeSide,
      entryPrice: prismaModel.entryPrice,
      stopLoss: prismaModel.stopLoss,
      takeProfit: prismaModel.takeProfit,
      positionSize: prismaModel.positionSize,
      leverage: prismaModel.leverage,
      riskAmount: prismaModel.riskAmount,
      rewardAmount: prismaModel.rewardAmount,
      riskRewardRatio: prismaModel.riskRewardRatio,
      liquidationPrice: prismaModel.liquidationPrice,
      status: prismaModel.status as TradeStatus,
      grossPnL: prismaModel.grossPnL,
      netPnL: prismaModel.netPnL,
      executionMode: prismaModel.executionMode,
      createdAt: prismaModel.createdAt,
      closedAt: prismaModel.closedAt,
    };
  }
}

// Export singleton instance
export const tradeRepository = new TradeRepository();
