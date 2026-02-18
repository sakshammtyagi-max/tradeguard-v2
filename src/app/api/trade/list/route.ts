/**
 * GET /api/trade/list
 * API Layer
 * 
 * Purpose: Get all open trades with current prices
 * 
 * Why: Display active positions in UI
 * 
 * Layer Rules:
 * - Thin controller (call use case)
 * - No business logic
 * - Handle errors gracefully
 */

import { NextRequest, NextResponse } from "next/server";
import { listTradesUseCase } from "@/application/use-cases/list-trades";

export async function GET(request: NextRequest) {
  try {
    // Execute use case
    const trades = await listTradesUseCase.execute();

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: trades.map((trade) => ({
          id: trade.id,
          symbol: trade.symbol,
          side: trade.side,
          entryPrice: trade.entryPrice,
          stopLoss: trade.stopLoss,
          takeProfit: trade.takeProfit,
          positionSize: trade.positionSize,
          currentPrice: trade.currentPrice,
          unrealizedPnL: trade.unrealizedPnL,
          riskAmount: trade.riskAmount,
          rewardAmount: trade.rewardAmount,
          status: trade.status,
          createdAt: trade.createdAt,
        })),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[API /trade/list] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to list trades",
      },
      { status: 500 }
    );
  }
}
