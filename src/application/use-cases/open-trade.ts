/**
 * Open Trade Use Case
 * Application Layer
 * 
 * Purpose: Execute and persist a trade
 * 
 * Why: Saves validated trade to database
 * 
 * Layer Rules:
 * - Orchestrates domain + infrastructure
 * - Uses repositories for persistence
 * - Uses services for external data
 * 
 * Flow:
 * 1. Run analysis (validate trade)
 * 2. Fetch current price
 * 3. Save to database
 * 4. Return saved trade
 * 
 * What it does:
 * - Validate trade setup
 * - Persist trade to database
 * - Return confirmation
 * 
 * What it should NOT do:
 * - Skip validation
 * - Execute on real exchange (Phase 1 is paper only)
 */

import { Trade } from "@/domain/types";
import { tradeRepository } from "@/infrastructure/repositories/trade-repository";
import { priceService } from "@/infrastructure/services/price-service";
import { analyzeTradeUseCase, AnalyzeTradeParams } from "./analyze-trade";

export class OpenTradeUseCase {
  async execute(params: AnalyzeTradeParams): Promise<Trade> {
    // Step 1: Analyze the trade
    const analysis = await analyzeTradeUseCase.execute(params);

    if (!analysis.isValid) {
      throw new Error(
        `Trade validation failed: ${analysis.warnings.join(", ")}`
      );
    }

    // Step 2: Fetch current price (for logging/verification)
    const currentPrice = await priceService.getCurrentPrice(params.symbol);
    
    console.log(
      `[OpenTrade] Opening ${params.side} position on ${params.symbol} at $${params.entryPrice} (current: $${currentPrice})`
    );

    // Step 3: Save trade to database
    const trade = await tradeRepository.create({
      symbol: params.symbol,
      side: params.side,
      entryPrice: params.entryPrice,
      stopLoss: params.stopLoss,
      takeProfit: params.takeProfit,
      positionSize: analysis.positionSize,
      leverage: params.leverage,
      riskAmount: analysis.riskAmount,
      rewardAmount: analysis.rewardAmount,
      riskRewardRatio: analysis.riskRewardRatio,
      liquidationPrice: analysis.liquidationPrice,
      executionMode: "PAPER", // Phase 1 is paper trading only
    });

    console.log(
      `[OpenTrade] Trade ${trade.id} created successfully`
    );

    return trade;
  }
}

// Export singleton instance
export const openTradeUseCase = new OpenTradeUseCase();
