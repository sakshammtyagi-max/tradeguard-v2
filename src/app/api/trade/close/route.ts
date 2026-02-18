/**
 * POST /api/trade/close
 * API Layer
 * 
 * Purpose: Manually close an open trade
 * 
 * Why: Exit positions before hitting SL/TP
 * 
 * Layer Rules:
 * - Thin controller (validation + call use case)
 * - No business logic
 * - Handle errors gracefully
 */

import { NextRequest, NextResponse } from "next/server";
import { closeTradeUseCase } from "@/application/use-cases/close-trade";
import { closeTradeSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    // Parse and validate input
    const body = await request.json();
    const validatedData = closeTradeSchema.parse(body);

    // Execute use case
    const trade = await closeTradeUseCase.execute(validatedData.tradeId);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          id: trade.id,
          status: trade.status,
          netPnL: trade.netPnL,
          closedAt: trade.closedAt,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[API /trade/close] Error:", error);

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
        error: error.message || "Failed to close trade",
      },
      { status: 500 }
    );
  }
}
