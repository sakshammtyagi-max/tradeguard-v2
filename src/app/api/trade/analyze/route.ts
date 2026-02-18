/**
 * POST /api/trade/analyze
 * API Layer
 * 
 * Purpose: Analyze trade without executing
 * 
 * Why: Preview risk metrics before committing
 * 
 * Layer Rules:
 * - Thin controller (validation + call use case)
 * - No business logic
 * - Handle errors gracefully
 * - Return consistent response format
 */

import { NextRequest, NextResponse } from "next/server";
import { analyzeTradeUseCase } from "@/application/use-cases/analyze-trade";
import { analyzeTradeSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    // Parse and validate input
    const body = await request.json();
    const validatedData = analyzeTradeSchema.parse(body);

    // Execute use case
    const analysis = await analyzeTradeUseCase.execute(validatedData);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: analysis,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[API /trade/analyze] Error:", error);

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
        error: error.message || "Failed to analyze trade",
      },
      { status: 500 }
    );
  }
}
