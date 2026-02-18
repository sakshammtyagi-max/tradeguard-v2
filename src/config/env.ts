/**
 * Environment Configuration
 * Config Layer
 * 
 * Purpose: Load and validate environment variables
 * 
 * Why: Fail fast if configuration is invalid
 * 
 * What it does:
 * - Validates required env vars on boot
 * - Provides type-safe config access
 * - Sets sensible defaults
 * 
 * What it should NOT do:
 * - Make API calls
 * - Access database
 */

import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1),

  // Application
  APP_TIMEZONE: z.string().default("UTC"),
  DEFAULT_ACCOUNT_BALANCE: z.string().transform(Number).default("10000"),
  MAX_RISK_PERCENT: z.string().transform(Number).default("5"),
  MIN_RISK_REWARD_RATIO: z.string().transform(Number).default("1.5"),

  // Trading
  PRICE_POLL_INTERVAL: z.string().transform(Number).default("5000"),

  // Next.js (optional)
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

function loadConfig() {
  try {
    const config = envSchema.parse({
      DATABASE_URL: process.env.DATABASE_URL,
      APP_TIMEZONE: process.env.APP_TIMEZONE,
      DEFAULT_ACCOUNT_BALANCE: process.env.DEFAULT_ACCOUNT_BALANCE,
      MAX_RISK_PERCENT: process.env.MAX_RISK_PERCENT,
      MIN_RISK_REWARD_RATIO: process.env.MIN_RISK_REWARD_RATIO,
      PRICE_POLL_INTERVAL: process.env.PRICE_POLL_INTERVAL,
      NODE_ENV: process.env.NODE_ENV,
    });

    return config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid environment configuration:");
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

export const config = loadConfig();

// Export typed config values
export const appConfig = {
  timezone: config.APP_TIMEZONE,
  defaultAccountBalance: config.DEFAULT_ACCOUNT_BALANCE,
  maxRiskPercent: config.MAX_RISK_PERCENT,
  minRiskRewardRatio: config.MIN_RISK_REWARD_RATIO,
  pricePollInterval: config.PRICE_POLL_INTERVAL,
  isDevelopment: config.NODE_ENV === "development",
  isProduction: config.NODE_ENV === "production",
};
