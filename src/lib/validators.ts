/**
 * Input Validation Schemas
 * Library Layer
 * 
 * Purpose: Zod schemas for API input validation
 * 
 * Why: Type-safe validation at API boundaries
 * 
 * What it does:
 * - Validates incoming API requests
 * - Provides type inference
 * - Error messages for invalid input
 */

import { z } from "zod";

export const tradeSideSchema = z.enum(["LONG", "SHORT"]);

export const analyzeTradeSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").toUpperCase(),
  side: tradeSideSchema,
  entryPrice: z.number().positive("Entry price must be positive"),
  stopLoss: z.number().positive("Stop loss must be positive"),
  takeProfit: z.number().positive("Take profit must be positive"),
  accountBalance: z.number().positive("Account balance must be positive"),
  riskPercent: z.number().min(0.1, "Risk percent must be at least 0.1").max(100, "Risk percent cannot exceed 100"),
  leverage: z.number().int().min(1, "Leverage must be at least 1").max(125, "Leverage cannot exceed 125"),
});

export const openTradeSchema = analyzeTradeSchema;

export const closeTradeSchema = z.object({
  tradeId: z.string().min(1, "Trade ID is required"),
});

export type AnalyzeTradeInput = z.infer<typeof analyzeTradeSchema>;
export type OpenTradeInput = z.infer<typeof openTradeSchema>;
export type CloseTradeInput = z.infer<typeof closeTradeSchema>;
