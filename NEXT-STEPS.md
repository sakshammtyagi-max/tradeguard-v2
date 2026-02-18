# TradeGuard V2 - Next Steps

## Phase 1 Complete ✅

You've successfully built the MVP foundation with:
- Clean layered architecture
- Risk calculation engine
- Trade CRUD operations
- Basic UI dashboard

**What works:**
- Analyze trades before execution
- Open paper trades
- Close trades manually
- View open positions with real-time PnL

**What's missing (by design):**
- Auto SL/TP execution
- Real exchange integration
- Commission & slippage
- Advanced analytics

---

## Phase 2: Position Monitor & Auto-Execution

**Goal:** Automatically close trades when they hit SL or TP

### 2.1 Position Monitor Service

**New Files:**
- `src/domain/engines/position-monitor.ts`
- `src/application/use-cases/monitor-positions.ts`
- `src/infrastructure/services/monitor-service.ts`

**Domain Layer:**
```typescript
class PositionMonitor {
  shouldTriggerStopLoss(currentPrice: number, stopLoss: number, side: TradeSide): boolean {
    if (side === "LONG") {
      return currentPrice <= stopLoss;
    } else {
      return currentPrice >= stopLoss;
    }
  }

  shouldTriggerTakeProfit(currentPrice: number, takeProfit: number, side: TradeSide): boolean {
    if (side === "LONG") {
      return currentPrice >= takeProfit;
    } else {
      return currentPrice <= takeProfit;
    }
  }
}
```

**Application Layer:**
```typescript
class MonitorPositionsUseCase {
  async execute() {
    const openTrades = await tradeRepository.findOpenTrades();
    
    for (const trade of openTrades) {
      const currentPrice = await priceService.getCurrentPrice(trade.symbol);
      
      if (positionMonitor.shouldTriggerStopLoss(currentPrice, trade.stopLoss, trade.side)) {
        await this.closeAtStopLoss(trade, currentPrice);
      }
      
      if (positionMonitor.shouldTriggerTakeProfit(currentPrice, trade.takeProfit, trade.side)) {
        await this.closeAtTakeProfit(trade, currentPrice);
      }
    }
  }
}
```

**Infrastructure Layer:**
```typescript
// Cron job or polling service
class MonitorService {
  async start() {
    setInterval(async () => {
      await monitorPositionsUseCase.execute();
    }, 5000); // Every 5 seconds
  }
}
```

### 2.2 Real Exchange API Integration

**New Files:**
- `src/infrastructure/services/binance-service.ts`
- `src/infrastructure/services/bybit-service.ts`

**Replace Mock Price Service:**
```typescript
class BinanceService {
  async getCurrentPrice(symbol: string): Promise<number> {
    const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
    const data = await response.json();
    return parseFloat(data.price);
  }
  
  async getMultiplePrices(symbols: string[]): Promise<Record<string, number>> {
    // Batch request to reduce API calls
    const response = await fetch('https://api.binance.com/api/v3/ticker/price');
    const data = await response.json();
    
    return symbols.reduce((acc, symbol) => {
      const ticker = data.find(t => t.symbol === symbol);
      if (ticker) acc[symbol] = parseFloat(ticker.price);
      return acc;
    }, {});
  }
}
```

**WebSocket for Real-Time Prices:**
```typescript
class BinanceWebSocketService {
  private ws: WebSocket;
  private priceCache: Map<string, number>;
  
  connect(symbols: string[]) {
    const streams = symbols.map(s => `${s.toLowerCase()}@ticker`).join('/');
    this.ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
    
    this.ws.on('message', (data) => {
      const { s, c } = JSON.parse(data); // symbol, current price
      this.priceCache.set(s, parseFloat(c));
    });
  }
  
  getCurrentPrice(symbol: string): number {
    return this.priceCache.get(symbol) || 0;
  }
}
```

### 2.3 Trade Status Updates

**Update Trade Repository:**
```typescript
async updateTradeStatus(
  id: string, 
  status: 'CLOSED_TP' | 'CLOSED_SL', 
  exitPrice: number
): Promise<Trade> {
  const pnl = calculatePnL(...);
  
  return await prisma.trade.update({
    where: { id },
    data: {
      status,
      grossPnL: pnl,
      netPnL: pnl,
      closedAt: new Date(),
    }
  });
}
```

### 2.4 UI Enhancements

**Add Real-Time Price Chart:**
- Use Chart.js or Recharts
- Show entry, SL, TP lines
- Update in real-time

**Add Notifications:**
- Toast when SL/TP hit
- Sound alerts
- Browser notifications

### 2.5 Testing Phase 2

**Test Scenarios:**
1. Open trade, wait for price to hit TP → Auto close
2. Open trade, wait for price to hit SL → Auto close
3. Open multiple trades → Monitor all simultaneously
4. Kill monitor service → Trades remain in DB
5. Restart monitor → Picks up existing trades

---

## Phase 3: Commission, Slippage & Realistic PnL

**Goal:** Account for real trading costs

### 3.1 Commission Calculation

**Update Domain Types:**
```typescript
interface TradeFees {
  commission: number;      // Exchange fee (e.g., 0.1%)
  slippage: number;       // Price slippage (e.g., 0.05%)
  totalCost: number;      // commission + slippage
}
```

**New Engine Method:**
```typescript
class RiskEngine {
  calculateNetPnL(params: {
    grossPnL: number;
    positionSize: number;
    entryPrice: number;
    exitPrice: number;
    commissionRate: number; // e.g., 0.001 for 0.1%
  }): { netPnL: number; totalFees: number } {
    const entryFee = positionSize * entryPrice * commissionRate;
    const exitFee = positionSize * exitPrice * commissionRate;
    const totalFees = entryFee + exitFee;
    
    return {
      netPnL: grossPnL - totalFees,
      totalFees
    };
  }
}
```

### 3.2 Slippage Simulation

**For Paper Trading:**
```typescript
class SlippageSimulator {
  calculateSlippage(price: number, side: TradeSide, volumeUSD: number): number {
    // Simulate worse execution price based on order size
    const slippagePercent = Math.min(volumeUSD / 1000000 * 0.1, 0.5); // Max 0.5%
    
    if (side === "LONG") {
      return price * (1 + slippagePercent / 100); // Buy higher
    } else {
      return price * (1 - slippagePercent / 100); // Sell lower
    }
  }
}
```

### 3.3 Update Database Schema

```prisma
model Trade {
  // ... existing fields
  
  // Fee tracking
  entryFee      Float?
  exitFee       Float?
  totalFees     Float?
  slippageEntry Float?
  slippageExit  Float?
}
```

### 3.4 UI Updates

**Show Fee Breakdown:**
```
Gross PnL:     $100.00
Entry Fee:     -$5.00
Exit Fee:      -$5.00
Slippage:      -$2.50
───────────────────────
Net PnL:       $87.50
```

---

## Phase 4: Behavior Guard & Analytics

**Goal:** Prevent emotional trading, provide insights

### 4.1 Trading Behavior Rules

**New Files:**
- `src/domain/engines/behavior-guard.ts`
- `src/application/use-cases/validate-trading-behavior.ts`

**Behavior Rules:**
```typescript
class BehaviorGuard {
  // Prevent revenge trading
  canOpenTrade(recentTrades: Trade[]): { allowed: boolean; reason?: string } {
    const recentLosses = recentTrades.filter(t => 
      t.closedAt && 
      Date.now() - t.closedAt.getTime() < 3600000 && // Last hour
      t.netPnL < 0
    );
    
    if (recentLosses.length >= 3) {
      return {
        allowed: false,
        reason: "You've had 3 losses in the last hour. Take a break."
      };
    }
    
    return { allowed: true };
  }
  
  // Prevent over-leveraging after wins
  shouldReduceLeverage(winStreak: number, currentLeverage: number): boolean {
    if (winStreak >= 5 && currentLeverage > 10) {
      return true; // Euphoria guard
    }
    return false;
  }
  
  // Warn about daily loss limit
  isDailyLossLimitExceeded(dailyPnL: number, accountBalance: number): boolean {
    const maxDailyLoss = accountBalance * 0.05; // 5% max daily loss
    return dailyPnL < -maxDailyLoss;
  }
}
```

### 4.2 Analytics Dashboard

**New Page:** `src/app/analytics/page.tsx`

**Metrics to Track:**
- Win rate (%)
- Average R:R ratio
- Profit factor
- Max drawdown
- Best/worst trades
- Time of day performance
- Symbol performance

**Database Queries:**
```typescript
class AnalyticsRepository {
  async getWinRate(userId: string): Promise<number> {
    const trades = await prisma.trade.findMany({
      where: { status: { in: ['CLOSED_TP', 'CLOSED_SL', 'CLOSED_MANUAL'] } }
    });
    
    const wins = trades.filter(t => t.netPnL > 0).length;
    return (wins / trades.length) * 100;
  }
  
  async getProfitFactor(userId: string): Promise<number> {
    const trades = await prisma.trade.findMany({...});
    const totalWins = trades.filter(t => t.netPnL > 0).reduce((sum, t) => sum + t.netPnL, 0);
    const totalLosses = Math.abs(trades.filter(t => t.netPnL < 0).reduce((sum, t) => sum + t.netPnL, 0));
    
    return totalWins / totalLosses;
  }
}
```

### 4.3 Trade Journal

**New Model:**
```prisma
model TradeNote {
  id        String   @id @default(cuid())
  tradeId   String
  note      String
  mood      String?  // "confident", "uncertain", "fearful"
  tags      String[] // ["breakout", "support", "fomo"]
  createdAt DateTime @default(now())
  
  trade     Trade    @relation(fields: [tradeId], references: [id])
}
```

**UI Feature:**
- Add notes before/after trades
- Tag trades by strategy
- Review notes for losing trades
- Pattern recognition

---

## Phase 5: Multi-User & Authentication

**Future Phases:**
- User accounts (NextAuth.js)
- Portfolio tracking
- Multi-exchange support
- Mobile app (React Native)
- Telegram/Discord notifications
- Backtesting engine
- Social features (copy trading)

---

## Technical Debt to Address

### 1. Error Handling
- Add global error boundary
- Better error messages
- Retry logic for API calls

### 2. Loading States
- Skeleton screens
- Optimistic UI updates
- Better spinners

### 3. Validation
- More edge cases
- Better error messages
- Input sanitization

### 4. Performance
- Memoization in React
- Database query optimization
- Caching layer (Redis)

### 5. Testing
- Unit tests (Jest)
- Integration tests
- E2E tests (Playwright)

### 6. Security
- Rate limiting
- Input validation
- SQL injection prevention (Prisma handles this)
- XSS prevention

---

## Recommended Tech Additions

### For Phase 2+
- **WebSockets**: Socket.io for real-time updates
- **Caching**: Redis for price caching
- **Queue**: Bull for background jobs
- **Monitoring**: Sentry for error tracking
- **Logging**: Winston or Pino

### For Analytics
- **Charting**: Chart.js or Recharts
- **Tables**: TanStack Table
- **Date Handling**: date-fns or dayjs

### For Production
- **Database**: PostgreSQL (migrate from SQLite)
- **Hosting**: Vercel or Railway
- **CDN**: Cloudflare
- **Monitoring**: Datadog or New Relic

---

## Learning Resources

### Architecture
- Clean Architecture (Robert C. Martin)
- Domain-Driven Design (Eric Evans)
- Hexagonal Architecture

### Trading
- Technical Analysis of Financial Markets
- Risk Management principles
- Psychology of Trading

### TypeScript
- TypeScript Deep Dive
- Effective TypeScript

---

## Community & Support

### Contributing
1. Fork the repo
2. Create feature branch
3. Follow architecture patterns
4. Add tests
5. Submit PR

### Roadmap Voting
Create issues for feature requests and vote with 👍

---

**Phase 1 is done. The foundation is solid. Build on it! 🚀**
