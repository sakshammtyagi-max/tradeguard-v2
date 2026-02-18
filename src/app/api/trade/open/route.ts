/**
 * POST /api/trade/open
 * API Layer
 * 
 * Purpose: Execute and persist a trade
 * 
 * Why: Create new trading positions
 * 
 * Layer Rules:
 * - Thin controller (validation + call use case)
 * - No business logic
 * - Handle errors gracefully
 */

import { NextRequest, NextResponse } from "next/server";
import { openTradeUseCase } from "@/application/use-cases/open-trade";
import { openTradeSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    // Parse and validate input
    const body = await request.json();
    const validatedData = openTradeSchema.parse(body);

    // Execute use case
    const trade = await openTradeUseCase.execute(validatedData);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          id: trade.id,
          status: trade.status,
          symbol: trade.symbol,
          side: trade.side,
          entryPrice: trade.entryPrice,
          positionSize: trade.positionSize,
          riskAmount: trade.riskAmount,
          rewardAmount: trade.rewardAmount,
          riskRewardRatio: trade.riskRewardRatio,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[API /trade/open] Error:", error);

    // Validation error
    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Business logic error
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to open trade",
      },
      { status: 500 }
    );
  }
}
