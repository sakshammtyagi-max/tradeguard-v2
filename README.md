# TradeGuard V2 🛡️

Professional trading risk management system with real-time market simulation.

## 🎯 What is TradeGuard?

TradeGuard V2 is a **production-quality trading risk management platform** that helps traders:
- ✅ **Analyze trades** before execution with precise risk calculations
- ✅ **Manage positions** with automated SL/TP monitoring (coming in Phase 2)
- ✅ **Track performance** with detailed analytics
- ✅ **Prevent emotional trading** with behavioral guards (coming in Phase 4)

**Built with:** Clean Architecture, Domain-Driven Design, and educational mindset.

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/sakshammtyagi-max/tradeguard-v2.git
cd tradeguard-v2

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env

# 4. Initialize database
npx prisma generate
npx prisma db push

# 5. Start the app
npm run dev
```

Open **http://localhost:3000** to see the trading dashboard.

## 📸 Screenshots

### Trading Dashboard
![Dashboard](https://github.com/user-attachments/assets/453da221-cc62-4f25-a161-4b5e1da6ecd5)

### Trade Analysis
![Analysis](https://github.com/user-attachments/assets/a5a4eb44-b87d-4760-b9f2-4c29a69e5018)

### Open Positions
![Open Positions](https://github.com/user-attachments/assets/47d344d8-1bd6-4e31-a14b-e800bf256ed1)

## ✨ Features (Phase 1)

### ✅ Risk Analysis
- **Position sizing** based on account balance and risk percentage
- **Risk/Reward ratio** calculation
- **Liquidation price** estimation for leveraged positions
- **Trade validation** with configurable rules (max risk %, min R:R)

### ✅ Trade Management
- **Open paper trades** with full risk metrics
- **Close trades manually** with PnL calculation
- **View open positions** with real-time price updates
- **Unrealized PnL** tracking

### ✅ Architecture
- **Domain Layer**: Pure business logic (no dependencies)
- **Application Layer**: Use cases and workflows
- **Infrastructure Layer**: Database and external services
- **API Layer**: RESTful endpoints
- **UI Layer**: Next.js dashboard

## 🏗️ Architecture

TradeGuard follows **Clean Architecture** principles:

```
┌─────────────────────────────────┐
│      UI Layer (Next.js)         │  ← User Interface
├─────────────────────────────────┤
│    API Layer (HTTP Routes)      │  ← HTTP Controllers
├─────────────────────────────────┤
│  Application Layer (Use Cases)  │  ← Business Workflows
├─────────────────────────────────┤
│   Domain Layer (Pure Logic)     │  ← Business Rules
├─────────────────────────────────┤
│ Infrastructure Layer (DB/APIs)  │  ← External Services
└─────────────────────────────────┘
```

**Key Principles:**
- Domain layer has **zero dependencies** (pure TypeScript)
- Each layer has a **single responsibility**
- Dependencies point **inward** (UI → API → Application → Domain)

📚 **Read more:** [ARCHITECTURE.md](./ARCHITECTURE.md)

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5 (strict mode)
- **Database**: Prisma + SQLite (dev) / PostgreSQL (prod)
- **Styling**: TailwindCSS 3
- **Validation**: Zod 3
- **Package Manager**: npm

## 📂 Project Structure

```
src/
├── domain/              # Pure business logic
│   ├── engines/        # RiskEngine, etc.
│   ├── value-objects/  # Money
│   └── types.ts        # Domain types
│
├── application/        # Business workflows
│   └── use-cases/     # Analyze, Open, Close, List trades
│
├── infrastructure/     # External systems
│   ├── db/            # Prisma client
│   ├── repositories/  # TradeRepository
│   └── services/      # PriceService (mock)
│
├── app/               # UI + API
│   ├── api/          # REST endpoints
│   └── page.tsx      # Trading dashboard
│
├── config/           # Environment config
└── lib/             # Utilities & validation
```

## 🧪 Testing

### Run Manual Tests

Follow the step-by-step guide in [TESTING.md](./TESTING.md).

Quick test scenarios:
1. **Analyze a valid trade** → See risk metrics
2. **Analyze invalid trade** → See warnings
3. **Open a trade** → Appears in database
4. **Close a trade** → PnL calculated
5. **View positions** → Real-time price updates

### Build & Lint

```bash
npm run build  # Build production bundle
npm run lint   # Check code quality
```

## 📖 Documentation

- **[SETUP.md](./SETUP.md)** - Installation and configuration
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design and patterns
- **[TESTING.md](./TESTING.md)** - Manual testing guide
- **[NEXT-STEPS.md](./NEXT-STEPS.md)** - Roadmap and future phases

## 🗺️ Roadmap

### ✅ Phase 1: Core Trading Loop (COMPLETE)
- Risk calculation engine
- Trade CRUD operations
- Basic UI dashboard

### 🔄 Phase 2: Position Monitor (Q1 2026)
- Auto SL/TP execution
- Real exchange API integration
- WebSocket price feeds

### 📋 Phase 3: Commission & Slippage (Q2 2026)
- Realistic PnL calculations
- Fee tracking
- Slippage simulation

### 🎯 Phase 4: Behavior Guard (Q3 2026)
- Emotional trading prevention
- Analytics dashboard
- Trade journal

### 🚀 Phase 5: Production (Q4 2026)
- User authentication
- Multi-exchange support
- Mobile app

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the architecture patterns in [ARCHITECTURE.md](./ARCHITECTURE.md)
4. Add tests
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

ISC

## 🙏 Acknowledgments

Built with clean code principles and educational intent. Inspired by:
- Robert C. Martin's Clean Architecture
- Eric Evans' Domain-Driven Design
- Martin Fowler's Patterns of Enterprise Application Architecture

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/sakshammtyagi-max/tradeguard-v2/issues)
- **Discussions**: [GitHub Discussions](https://github.com/sakshammtyagi-max/tradeguard-v2/discussions)

## ⚠️ Disclaimer

This is a **learning project** and **paper trading system**. Do not use for live trading without proper testing and risk management. Trading involves substantial risk of loss.

---

**Built with ❤️ and TypeScript**

**Status:** 🚧 Phase 1 Complete - Foundation Ready
