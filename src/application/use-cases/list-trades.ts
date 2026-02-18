/**
 * List Trades Use Case
 * Application Layer
 * 
 * Purpose: Get open trades with current prices and unrealized PnL
 * 
 * Why: Display active positions to user
 * 
 * Layer Rules:
 * - Orchestrates domain + infrastructure
 * - Enriches data with current prices
 * - Calculates unrealized PnL
 * 
 * Flow:
 * 1. Fetch open trades from database
 * 2. For each trade, fetch current price
 * 3. Calculate unrealized PnL
 * 4. Return enriched trade list
 * 
 * What it does:
 * - Retrieve open positions
 * - Add current price data
 * - Calculate floating PnL
 * 
 * What it should NOT do:
 * - Modify trades
 * - Close positions
 */

import { Trade } from "@/domain/types";
import { riskEngine } from "@/domain/engines/risk-engine";
import { tradeRepository } from "@/infrastructure/repositories/trade-repository";
import { priceService } from "@/infrastructure/services/price-service";

export interface EnrichedTrade extends Trade {
  currentPrice?: number;
  unrealizedPnL?: number;
}

export class ListTradesUseCase {
  async execute(): Promise<EnrichedTrade[]> {
    // Step 1: Fetch all open trades
    const trades = await tradeRepository.findOpenTrades();

    if (trades.length === 0) {
      return [];
    }

    // Step 2: Get unique symbols
    const symbols = [...new Set(trades.map((t) => t.symbol))];

    // Step 3: Fetch current prices for all symbols
    const prices = await priceService.getCurrentPrices(symbols);

    // Step 4: Enrich each trade with current price and unrealized PnL
    const enrichedTrades: EnrichedTrade[] = trades.map((trade) => {
      const currentPrice = prices[trade.symbol];

      // Calculate unrealized PnL
      const unrealizedPnL = currentPrice
        ? riskEngine.calculatePnL({
            entryPrice: trade.entryPrice,
            exitPrice: currentPrice,
            positionSize: trade.positionSize,
            side: trade.side,
          })
        : undefined;

      return {
        ...trade,
        currentPrice,
        unrealizedPnL,
      };
    });

    console.log(
      `[ListTrades] Returning ${enrichedTrades.length} open trades`
    );

    return enrichedTrades;
  }
}

// Export singleton instance
export const listTradesUseCase = new ListTradesUseCase();
