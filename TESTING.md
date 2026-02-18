# TradeGuard V2 - Testing Guide

## Manual Testing Scenarios

This guide walks through manual testing of Phase 1 functionality.

## Prerequisites

1. Application is running (`npm run dev`)
2. Database is initialized (`npx prisma db push`)
3. Browser is open at **http://localhost:3000**

---

## Test Scenario 1: Analyze a Valid LONG Trade

### Steps

1. Open http://localhost:3000
2. Fill in the form:
   - **Symbol**: BTCUSDT
   - **Side**: LONG
   - **Entry Price**: 50000
   - **Stop Loss**: 49000
   - **Take Profit**: 52000
   - **Balance**: 10000
   - **Risk %**: 2
   - **Leverage**: 10

3. Click **"Analyze"**

### Expected Results

✅ Analysis panel shows:
- **Status**: ✓ Valid Trade (green background)
- **Position Size**: 2.0000
- **Risk Amount**: $2000.00 (red)
- **Reward Amount**: $4000.00 (green)
- **R:R Ratio**: 2.00
- **Liquidation Price**: $45000.00 (yellow box)
- **Warnings**: None

✅ "Open Trade" button is **enabled** (green)

### Why This Works

- SL (49000) is below entry (50000) ✓ Correct for LONG
- TP (52000) is above entry (50000) ✓ Correct for LONG
- Risk % (2%) is within limit (≤5%) ✓
- R:R ratio (2.0) is above minimum (≥1.5) ✓
- Position size = ($10,000 × 2%) / ($50,000 - $49,000) × 10 = 2.0 ✓

---

## Test Scenario 2: Analyze an Invalid Trade (Bad R:R)

### Steps

1. Modify the form:
   - **Take Profit**: 50500 (instead of 52000)
2. Click **"Analyze"**

### Expected Results

❌ Analysis panel shows:
- **Status**: ✗ Invalid Trade (red background)
- **Position Size**: 2.0000
- **Risk Amount**: $2000.00
- **Reward Amount**: $1000.00
- **R:R Ratio**: 0.50
- **Warnings**:
  - "Risk/Reward ratio (0.5) is below minimum (1.5)"

❌ "Open Trade" button is **disabled** (gray)

### Why This Fails

- Risk = $50,000 - $49,000 = $1,000
- Reward = $50,500 - $50,000 = $500
- R:R = $500 / $1,000 = 0.5 (below 1.5 minimum) ✗

---

## Test Scenario 3: Analyze Invalid Trade (Wrong SL Position)

### Steps

1. Modify the form:
   - **Side**: LONG
   - **Entry Price**: 50000
   - **Stop Loss**: 51000 (above entry!)
   - **Take Profit**: 52000
2. Click **"Analyze"**

### Expected Results

❌ Analysis panel shows:
- **Status**: ✗ Invalid Trade
- **Warnings**:
  - "Stop loss must be below entry price for LONG positions"

❌ "Open Trade" button is **disabled**

### Why This Fails

- For LONG, SL must be BELOW entry (to limit downside loss)
- SL at 51000 is ABOVE entry at 50000 ✗

---

## Test Scenario 4: Analyze a Valid SHORT Trade

### Steps

1. Modify the form:
   - **Side**: SHORT
   - **Entry Price**: 50000
   - **Stop Loss**: 51000 (above entry, correct for SHORT)
   - **Take Profit**: 48000 (below entry, correct for SHORT)
   - **Risk %**: 2
   - **Leverage**: 10
2. Click **"Analyze"**

### Expected Results

✅ Analysis panel shows:
- **Status**: ✓ Valid Trade
- **Position Size**: 2.0000
- **Risk Amount**: $2000.00
- **Reward Amount**: $4000.00
- **R:R Ratio**: 2.00
- **Liquidation Price**: $55000.00

✅ "Open Trade" button is **enabled**

### Why This Works

- For SHORT: SL (51000) is ABOVE entry (50000) ✓
- For SHORT: TP (48000) is BELOW entry (50000) ✓
- Risk = $51,000 - $50,000 = $1,000
- Reward = $50,000 - $48,000 = $2,000
- R:R = 2.0 ✓

---

## Test Scenario 5: Open a Trade

### Steps

1. Use the valid LONG trade from Scenario 1
2. Click **"Analyze"** (if not already analyzed)
3. Click **"Open Trade"**

### Expected Results

✅ Alert appears: "Trade opened successfully! ID: clx..."
✅ Click OK on alert
✅ Analysis panel resets to: "Click 'Analyze' to calculate risk metrics"
✅ "Open Positions" table shows **1 trade**:
   - Symbol: BTCUSDT
   - Side: LONG (green badge)
   - Entry: $50000.00
   - Current: ~$50000.00 (varies due to mock price)
   - SL / TP: $49000.00 / $52000.00
   - PnL: ~$0.00 (will vary slightly)
   - Actions: Close button

### Verify in Database

```bash
npx prisma studio
```

Navigate to **Trade** table. You should see:
- 1 record with status "OPEN"
- All fields populated correctly

---

## Test Scenario 6: Close a Trade

### Steps

1. Ensure you have an open trade (from Scenario 5)
2. In the "Open Positions" table, click **"Close"** button
3. Confirm the dialog: "Are you sure you want to close this trade?"

### Expected Results

✅ Confirmation dialog appears
✅ Click OK
✅ Alert appears: "Trade closed! PnL: $XXX.XX" (positive or negative)
✅ Click OK
✅ "Open Positions" table now shows **0 trades**
✅ Message: "No open trades"

### Verify in Database

```bash
npx prisma studio
```

Navigate to **Trade** table. The trade should have:
- status: "CLOSED_MANUAL"
- grossPnL: (calculated value)
- netPnL: (same as grossPnL in Phase 1)
- closedAt: (timestamp)

---

## Test Scenario 7: View Multiple Open Trades

### Steps

1. Open 3 trades with different symbols:
   - BTCUSDT LONG
   - ETHUSDT SHORT
   - BNBUSDT LONG

2. Observe the "Open Positions" table

### Expected Results

✅ Table shows **3 trades**
✅ Each trade has:
   - Different current prices
   - Different unrealized PnL
   - Live updates every 10 seconds

### Verify Price Updates

1. Note the current price of a trade
2. Wait 10 seconds
3. Price should update slightly (mock variance)
4. PnL should recalculate

---

## Test Scenario 8: High Leverage Warning

### Steps

1. Fill in the form:
   - **Leverage**: 50 (high)
2. Click **"Analyze"**

### Expected Results

✅ Trade may be valid, but warnings include:
- "High leverage (50x) increases liquidation risk"

✅ Yellow warning box appears
✅ Liquidation price is very close to entry price

### Why This Warns

- High leverage = easier to get liquidated
- Formula: Liq = Entry × (1 - 1/Leverage)
- At 50x: Liq = $50,000 × (1 - 0.02) = $49,000
- Only 2% move against you = liquidation!

---

## Test Scenario 9: Excessive Risk Percentage

### Steps

1. Fill in the form:
   - **Risk %**: 10 (exceeds 5% limit)
2. Click **"Analyze"**

### Expected Results

❌ Analysis shows:
- **Status**: ✗ Invalid Trade
- **Warnings**:
  - "Risk percent (10%) exceeds maximum (5%)"

❌ "Open Trade" button is **disabled**

---

## API Testing with cURL

### Test Analyze Endpoint

```bash
curl -X POST http://localhost:3000/api/trade/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "side": "LONG",
    "entryPrice": 50000,
    "stopLoss": 49000,
    "takeProfit": 52000,
    "accountBalance": 10000,
    "riskPercent": 2,
    "leverage": 10
  }'
```

**Expected:** JSON with success: true, valid analysis data

### Test Open Trade Endpoint

```bash
curl -X POST http://localhost:3000/api/trade/open \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "ETHUSDT",
    "side": "SHORT",
    "entryPrice": 3000,
    "stopLoss": 3100,
    "takeProfit": 2800,
    "accountBalance": 10000,
    "riskPercent": 2,
    "leverage": 5
  }'
```

**Expected:** JSON with success: true, trade ID

### Test List Trades Endpoint

```bash
curl http://localhost:3000/api/trade/list
```

**Expected:** JSON array of open trades

### Test Close Trade Endpoint

```bash
# Replace {TRADE_ID} with actual ID from previous test
curl -X POST http://localhost:3000/api/trade/close \
  -H "Content-Type: application/json" \
  -d '{
    "tradeId": "{TRADE_ID}"
  }'
```

**Expected:** JSON with success: true, PnL data

---

## Edge Cases to Test

### 1. Zero Risk Distance
- Entry: 50000
- SL: 50000 (same as entry)
- **Expected:** Error - "Stop loss cannot equal entry price"

### 2. Negative Values
- Entry: -50000
- **Expected:** Validation error from Zod

### 3. Empty Symbol
- Symbol: ""
- **Expected:** Validation error - "Symbol is required"

### 4. Unknown Symbol
- Symbol: "INVALIDCOIN"
- **Expected:** Works! (mock service returns default price)

### 5. Very High Leverage
- Leverage: 125 (max)
- **Expected:** Works but with warnings

- Leverage: 126 (exceeds max)
- **Expected:** Validation error

---

## Performance Testing

### Auto-Refresh Test

1. Open 5+ trades
2. Observe browser network tab
3. Every 10 seconds, should see:
   - GET request to `/api/trade/list`
   - Prices update
   - PnL recalculates

### Build Test

```bash
npm run build
```

**Expected:** No errors, successful build

### Lint Test

```bash
npm run lint
```

**Expected:** ✔ No ESLint warnings or errors

---

## Success Criteria

Phase 1 is complete when:

- ✅ All 9 test scenarios pass
- ✅ API endpoints return correct data
- ✅ Edge cases are handled gracefully
- ✅ Build succeeds without errors
- ✅ Linting passes
- ✅ Database persists trades correctly
- ✅ UI updates in real-time

---

## Troubleshooting

### Trade Not Appearing in Table

- Check browser console for errors
- Verify API response in Network tab
- Check database with Prisma Studio

### PnL Not Updating

- Verify 10-second auto-refresh is working
- Check Price Service logs in terminal

### Build Errors

- Run `npm run lint` first
- Check TypeScript errors
- Verify all imports are correct

---

**All tests passing? Phase 1 is complete! 🎉**
