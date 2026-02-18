/**
 * Price Service
 * Infrastructure Layer
 * 
 * Purpose: Fetch current market prices (mock for Phase 1)
 * 
 * Why: Simulates real exchange API for development
 * 
 * Layer Rules:
 * - External service interface
 * - Used by application layer only
 * - In Phase 2, will connect to real exchange API
 * 
 * What it does:
 * - Returns mock prices for testing
 * - Adds random variance to simulate market movement
 * - Logs all price fetches for debugging
 * 
 * What it should NOT do:
 * - Contain business logic
 * - Make decisions about trades
 */

interface PriceData {
  symbol: string;
  basePrice: number;
}

const MOCK_PRICES: Record<string, number> = {
  BTCUSDT: 50000,
  ETHUSDT: 3000,
  BNBUSDT: 400,
  SOLUSDT: 100,
  ADAUSDT: 0.5,
  DOGEUSDT: 0.08,
};

export class PriceService {
  /**
   * Get current price for a symbol
   * 
   * Mock implementation:
   * - Returns base price + random variance (-0.5% to +0.5%)
   * - Simulates real-time price movement
   * 
   * In Phase 2:
   * - Will call Binance/Bybit API
   * - Will handle rate limits
   * - Will cache prices
   */
  async getCurrentPrice(symbol: string): Promise<number> {
    const basePrice = MOCK_PRICES[symbol];

    if (!basePrice) {
      // Default to base price for unknown symbols
      console.warn(`Unknown symbol ${symbol}, using default price 100`);
      return 100;
    }

    // Add random variance (-0.5% to +0.5%)
    const variance = (Math.random() - 0.5) * 0.01; // -0.5% to +0.5%
    const currentPrice = basePrice * (1 + variance);

    console.log(
      `[PriceService] ${symbol}: $${currentPrice.toFixed(2)} (base: $${basePrice}, variance: ${(variance * 100).toFixed(2)}%)`
    );

    return Number(currentPrice.toFixed(2));
  }

  /**
   * Get multiple prices at once
   * 
   * Useful for batch operations
   */
  async getCurrentPrices(symbols: string[]): Promise<Record<string, number>> {
    const prices: Record<string, number> = {};

    for (const symbol of symbols) {
      prices[symbol] = await this.getCurrentPrice(symbol);
    }

    return prices;
  }
}

// Export singleton instance
export const priceService = new PriceService();
