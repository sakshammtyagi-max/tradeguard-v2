# TradeGuard V2 - Setup Guide

## Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **Git**: Latest version

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/sakshammtyagi-max/tradeguard-v2.git
cd tradeguard-v2
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:
- Next.js 14
- React 18
- Prisma 5
- TypeScript 5
- TailwindCSS 3
- Zod 3

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

The `.env` file contains:
```env
# Database
DATABASE_URL="file:./dev.db"

# Application
APP_TIMEZONE="UTC"
DEFAULT_ACCOUNT_BALANCE=10000
MAX_RISK_PERCENT=5
MIN_RISK_REWARD_RATIO=1.5

# Trading (Phase 1 - Mocks)
PRICE_POLL_INTERVAL=5000
```

You can modify these values if needed, but the defaults work for development.

### 4. Initialize the Database

Generate Prisma client:
```bash
npx prisma generate
```

Push the schema to create the database:
```bash
npx prisma db push
```

This creates a SQLite database file (`dev.db`) with the Trade table.

### 5. Start the Development Server

```bash
npm run dev
```

The application will start at **http://localhost:3000**

You should see:
```
✓ Ready in 1200ms
- Local:        http://localhost:3000
```

### 6. Open in Browser

Navigate to **http://localhost:3000** to see the trading dashboard.

## Available Scripts

### Development

```bash
npm run dev
```
Starts the Next.js development server with hot reload.

### Production Build

```bash
npm run build
```
Creates an optimized production build.

```bash
npm start
```
Runs the production build.

### Linting

```bash
npm run lint
```
Runs ESLint to check code quality.

### Database

```bash
npm run prisma:generate
```
Generates Prisma client types.

```bash
npm run prisma:push
```
Pushes schema changes to database (development only).

## Project Structure

After setup, your project structure will look like:

```
tradeguard-v2/
├── node_modules/          # Dependencies
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/         # API routes
│   │   ├── page.tsx     # Dashboard UI
│   │   └── layout.tsx   # Root layout
│   ├── domain/          # Business logic
│   ├── application/     # Use cases
│   ├── infrastructure/  # Database & services
│   ├── config/          # Configuration
│   └── lib/            # Utilities
├── .env                 # Environment variables
├── .gitignore          # Git ignore rules
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript config
└── tailwind.config.ts  # TailwindCSS config
```

## Verifying the Setup

### 1. Check Database

View the database with Prisma Studio:
```bash
npx prisma studio
```

This opens a web interface at **http://localhost:5555** where you can view tables and data.

### 2. Test API Endpoints

#### Analyze Trade
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

Expected response:
```json
{
  "success": true,
  "data": {
    "positionSize": 2.0,
    "riskAmount": 200,
    "rewardAmount": 400,
    "riskRewardRatio": 2.0,
    "liquidationPrice": 45000,
    "isValid": true,
    "warnings": []
  }
}
```

#### List Trades
```bash
curl http://localhost:3000/api/trade/list
```

### 3. Test UI

1. Open **http://localhost:3000**
2. Fill in the trade form with default values
3. Click **"Analyze"** to see risk metrics
4. Click **"Open Trade"** to create a position
5. See the trade appear in "Open Positions"
6. Click **"Close"** to close the trade

## Troubleshooting

### Port 3000 Already in Use

If port 3000 is busy, specify a different port:
```bash
PORT=3001 npm run dev
```

### Database Locked Error

If you get "database is locked" error:
1. Stop all running dev servers
2. Delete `dev.db` file
3. Run `npx prisma db push` again

### Module Not Found Errors

Clear Next.js cache and reinstall:
```bash
rm -rf .next node_modules
npm install
npm run dev
```

### TypeScript Errors

Regenerate types:
```bash
npx prisma generate
npm run build
```

## Development Workflow

### 1. Making Changes to Database Schema

Edit `prisma/schema.prisma`, then:
```bash
npx prisma generate
npx prisma db push
```

### 2. Making Changes to Code

The dev server has hot reload enabled. Just save your files and the browser will refresh automatically.

### 3. Adding New Dependencies

```bash
npm install <package-name>
```

For dev dependencies:
```bash
npm install --save-dev <package-name>
```

## Production Deployment

### Environment Variables

Set these in your production environment:
- `DATABASE_URL`: PostgreSQL connection string (not SQLite)
- `NODE_ENV`: "production"

### Build and Deploy

```bash
npm run build
npm start
```

For Vercel deployment:
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

## Next Steps

1. Read **ARCHITECTURE.md** to understand the codebase structure
2. Read **TESTING.md** for manual testing scenarios
3. Read **NEXT-STEPS.md** for upcoming features
4. Start building!

## Getting Help

- **Issues**: https://github.com/sakshammtyagi-max/tradeguard-v2/issues
- **Docs**: Check ARCHITECTURE.md and code comments

## Tips

- Use **Prisma Studio** (`npx prisma studio`) to inspect database
- Check browser console for frontend errors
- Check terminal for backend errors
- Use ESLint to catch issues early (`npm run lint`)

---

**You're all set! Happy trading! 🚀**
