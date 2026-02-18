/**
 * Close Trade Use Case
 * Application Layer
 * 
 * Purpose: Manually close an open trade
 * 
 * Why: Allow users to exit positions before SL/TP
 * 
 * Layer Rules:
 * - Orchestrates domain + infrastructure
 * - Uses repositories for data access
 * - Uses services for current prices
 * - Uses domain engine for PnL calculation
 * 
 * Flow:
 * 1. Fetch trade from database
 * 2. Verify trade is OPEN
 * 3. Fetch current price
 * 4. Calculate PnL
 * 5. Update trade status and PnL
 * 
 * What it does:
 * - Close open positions
 * - Calculate realized PnL
 * - Update database
 * 
 * What it should NOT do:
 * - Close already closed trades
 * - Skip PnL calculation
 */

import { Trade } from "@/domain/types";
import { riskEngine } from "@/domain/engines/risk-engine";
import { tradeRepository } from "@/infrastructure/repositories/trade-repository";
import { priceService } from "@/infrastructure/services/price-service";

export class CloseTradeUseCase {
  async execute(tradeId: string): Promise<Trade> {
    // Step 1: Fetch the trade
    const trade = await tradeRepository.findById(tradeId);

    if (!trade) {
      throw new Error(`Trade ${tradeId} not found`);
    }

    // Step 2: Verify trade is OPEN
    if (trade.status !== "OPEN") {
      throw new Error(
        `Trade ${tradeId} is already closed with status: ${trade.status}`
      );
    }

    // Step 3: Fetch current price
    const exitPrice = await priceService.getCurrentPrice(trade.symbol);

    console.log(
      `[CloseTrade] Closing ${trade.side} position on ${trade.symbol} at $${exitPrice} (entry: $${trade.entryPrice})`
    );

    // Step 4: Calculate PnL
    const grossPnL = riskEngine.calculatePnL({
      entryPrice: trade.entryPrice,
      exitPrice,
      positionSize: trade.positionSize,
      side: trade.side,
    });

    // For Phase 1, net PnL = gross PnL (no commission yet)
    // In Phase 3, we'll subtract commission and slippage
    const netPnL = grossPnL;

    console.log(
      `[CloseTrade] PnL: $${netPnL.toFixed(2)} (${netPnL >= 0 ? "profit" : "loss"})`
    );

    // Step 5: Update trade in database
    const closedTrade = await tradeRepository.updateTrade(tradeId, {
      status: "CLOSED_MANUAL",
      grossPnL,
      netPnL,
      closedAt: new Date(),
    });

    return closedTrade;
  }
}

// Export singleton instance
export const closeTradeUseCase = new CloseTradeUseCase();
