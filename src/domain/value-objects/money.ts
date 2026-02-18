/**
 * Money Value Object
 * Domain Layer
 * 
 * Purpose: Type-safe money representation
 * 
 * Why: Prevents common money calculation errors
 * 
 * Layer Rules:
 * - Immutable value object
 * - Pure methods only
 * - No external dependencies
 */

export class Money {
  private readonly amount: number;
  private readonly currency: string;

  constructor(amount: number, currency: string = "USD") {
    if (amount < 0) {
      throw new Error("Money amount cannot be negative");
    }
    this.amount = Number(amount.toFixed(2));
    this.currency = currency;
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error("Cannot add money with different currencies");
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error("Cannot subtract money with different currencies");
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  toString(): string {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }
}
