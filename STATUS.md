# TradeGuard V2 — Project Status

**Last Updated:** March 2026  
**Current Phase:** Phase 1 Complete ✅

---

## Summary

Phase 1 (Core Trading Loop) is fully implemented and merged. The application provides a paper trading dashboard with real-time risk analysis, trade management, and unrealized PnL tracking. The codebase follows a strict Clean Architecture (Domain → Application → Infrastructure → API → UI).

---

## ✅ Phase 1: Core Trading Loop (COMPLETE)

### Implemented Features

| Feature | Status | Location |
|---|---|---|
| Risk calculation engine | ✅ Done | `src/domain/engines/risk-engine.ts` |
| Domain types & interfaces | ✅ Done | `src/domain/types.ts` |
| Money value object | ✅ Done | `src/domain/value-objects/money.ts` |
| Analyze trade use case | ✅ Done | `src/application/use-cases/analyze-trade.ts` |
| Open trade use case | ✅ Done | `src/application/use-cases/open-trade.ts` |
| Close trade use case | ✅ Done | `src/application/use-cases/close-trade.ts` |
| List trades use case | ✅ Done | `src/application/use-cases/list-trades.ts` |
| Trade repository (SQLite) | ✅ Done | `src/infrastructure/repositories/trade-repository.ts` |
| Mock price service | ✅ Done | `src/infrastructure/services/price-service.ts` |
| Prisma database schema | ✅ Done | `prisma/schema.prisma` |
| API: POST /api/trade/analyze | ✅ Done | `src/app/api/trade/analyze/route.ts` |
| API: POST /api/trade/open | ✅ Done | `src/app/api/trade/open/route.ts` |
| API: POST /api/trade/close | ✅ Done | `src/app/api/trade/close/route.ts` |
| API: GET /api/trade/list | ✅ Done | `src/app/api/trade/list/route.ts` |
| Trading dashboard UI | ✅ Done | `src/app/page.tsx` |
| Input validation (Zod) | ✅ Done | `src/lib/validators.ts` |
| Environment config | ✅ Done | `src/config/env.ts` |

### What Works Right Now

- **Analyze trades** — Enter symbol, side, entry/SL/TP, balance, risk %, leverage → get position size, R:R ratio, liquidation price, and validation warnings (no database write)
- **Open paper trades** — Persist validated trades to SQLite database with full risk metrics
- **Close trades manually** — Calculate realized PnL (gross = net, no fees yet) and update status to `CLOSED_MANUAL`
- **View open positions** — Dashboard auto-refreshes every 10 seconds with mock current prices and unrealized PnL
- **Trade validation rules** — Max 5% risk per trade, minimum 1.5 R:R ratio, LONG/SHORT directional checks

### Risk Engine Capabilities

- `calculatePositionSize` — Account balance × risk % ÷ price distance × leverage
- `calculateRiskReward` — Reward ÷ risk (directional, handles LONG & SHORT)
- `calculateLiquidationPrice` — Simplified margin formula (null for 1× leverage)
- `calculateRiskRewardAmounts` — Dollar risk/reward amounts
- `calculatePnL` — Realized PnL for a closed position

### Tech Stack (Phase 1)

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5 (strict mode)
- **Database:** Prisma 5 + SQLite (development)
- **Validation:** Zod 3
- **Styling:** TailwindCSS 3

---

## 🔄 Phase 2: Position Monitor & Auto-Execution (Planned — Q1 2026)

**Goal:** Automatically close trades when they hit SL or TP

- [ ] `PositionMonitor` domain engine — `shouldTriggerStopLoss`, `shouldTriggerTakeProfit`
- [ ] `MonitorPositionsUseCase` — poll open trades, check prices, auto-close
- [ ] Background monitor service (polling interval: 5 s)
- [ ] Real exchange API integration (Binance REST)
- [ ] WebSocket price feeds for live updates

---

## 📋 Phase 3: Commission & Slippage (Planned — Q2 2026)

**Goal:** Realistic PnL by accounting for trading costs

- [ ] `calculateNetPnL` in `RiskEngine` (entry + exit commission)
- [ ] `SlippageSimulator` — volume-based price impact
- [ ] Fee fields added to `Trade` schema (`entryFee`, `exitFee`, `totalFees`, `slippageEntry`, `slippageExit`)
- [ ] UI fee breakdown panel (gross PnL → net PnL after fees)

---

## 🎯 Phase 4: Behavior Guard & Analytics (Planned — Q3 2026)

**Goal:** Prevent emotional trading and surface performance insights

- [ ] `BehaviorGuard` engine — revenge-trade detection, euphoria guard, daily loss limit
- [ ] Analytics dashboard page — win rate, profit factor, max drawdown, time-of-day performance
- [ ] Trade journal — notes, mood tags, strategy tags per trade
- [ ] `TradeNote` Prisma model

---

## 🚀 Phase 5: Production & Multi-User (Planned — Q4 2026)

- [ ] User authentication (NextAuth.js)
- [ ] PostgreSQL migration
- [ ] Multi-exchange support
- [ ] Mobile app (React Native)
- [ ] Telegram/Discord notifications

---

## Known Limitations (Phase 1)

| Limitation | Impact | Fix In |
|---|---|---|
| Mock price service (random walk) | Unrealistic PnL simulation | Phase 2 |
| No auto SL/TP execution | Manual close only | Phase 2 |
| No commission or slippage | Overstated PnL | Phase 3 |
| SQLite (not production-safe) | Single-user only | Phase 5 |
| No authentication | Public access | Phase 5 |
| No automated tests | Regression risk | Ongoing |

---

## Technical Debt

- [ ] Unit tests (Jest) for `RiskEngine` and use cases
- [ ] Integration tests for API routes
- [ ] E2E tests (Playwright) for dashboard
- [ ] Global error boundary in UI
- [ ] Skeleton loading screens / optimistic UI
- [ ] Rate limiting on API routes
- [ ] Redis caching for price service

---

## Documentation

| File | Purpose |
|---|---|
| `README.md` | Quick start, feature overview, architecture diagram |
| `ARCHITECTURE.md` | Layer responsibilities, import rules, extension guide |
| `SETUP.md` | Installation, database initialization, verification steps |
| `TESTING.md` | Manual test scenarios with expected outcomes |
| `NEXT-STEPS.md` | Detailed Phase 2–5 implementation plan with code samples |
| `STATUS.md` | This file — current project status snapshot |
