/**
 * Utility Functions
 * Library Layer
 * 
 * Purpose: Helper functions used across the application
 * 
 * Why: DRY principle, reusable utilities
 */

/**
 * Format number as currency
 */
export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Format number with decimal places
 */
export function formatNumber(num: number, decimals: number = 2): string {
  return num.toFixed(decimals);
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(initial: number, current: number): number {
  if (initial === 0) return 0;
  return ((current - initial) / initial) * 100;
}

/**
 * Safe JSON parse
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Delay execution
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
